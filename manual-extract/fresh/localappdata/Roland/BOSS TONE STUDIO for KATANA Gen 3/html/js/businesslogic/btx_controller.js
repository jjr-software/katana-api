/* EXPORT系処理の管理 */
const BTX_EXPORT_STATUS = {
    NOT_CHECKED_SIGN_IN: 0,
    READY: 1,
    NOT_READY: 2,

    CHECKING_SIGN_IN: 3,
    LOADING_UPLOAD_PAGE_IN_BTX_VIEW: 4,
    SENDING_TSL_TO_BTX_VIEW: 5,
    UPLOADING_IN_BTX_VIEW: 6,
};

/* IMPORT系処理の管理 */
const BTX_IMPORT_STATUS = {
    READY: 0,
    IMPORTING_TSL_FROM_BTX_VIEW: 1,
};

/* BTX側WebViewの管理 */
const BTX_WEBVIEW_STATUS = {
    UNKNOWN: 0,
    LOADING: 1,
    LOADED: 2,
    FAILED: 3,
};

/* 中国リージョン確認の管理 */
const BTX_CHINA_REGION_CHECK = {
    UNKNOWN: 0,
    CHINA: 1,
    NOT_CHINA: 2,
};

window.btxStatus = {};

/**
 * Global variables: EventTargetFactory, PROGRESS_DIALOG_MAP, FOOTER
 */

// setup
if (!window.FOOTER) {
    window.FOOTER = Object.freeze({
        ID: '#header-group-btn',
        EDITOR: 0,
        LIBRARIAN: 1,
        BTX: 2,
        MENU: 3,
    });
}

if (typeof addPropertyNotifyWhenChanged == 'function') {
    addPropertyNotifyWhenChanged(window.btxStatus, 'exportStatus', EVENT_BTX.exportStatusChanged,
        EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX));
    window.btxStatus.exportStatus = BTX_EXPORT_STATUS.NOT_CHECKED_SIGN_IN;

    addPropertyNotifyWhenChanged(window.btxStatus, 'transmitTslProgress', EVENT_BTX.transmitTslProgressChanged,
        EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX));
    window.btxStatus.transmitTslProgress = -1;   /* -1: indeterminate */

    addPropertyNotifyWhenChanged(window.btxStatus, 'importStatus', EVENT_BTX.importStatusChanged,
        EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX));
    window.btxStatus.importStatus = BTX_IMPORT_STATUS.READY;

    addPropertyNotifyWhenChanged(window.btxStatus, 'webViewStatus', EVENT_BTX.webViewStatusChanged,
        EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX));
    window.btxStatus.webViewStatus = BTX_WEBVIEW_STATUS.UNKNOWN;

    addPropertyNotifyWhenChanged(window.btxStatus, 'chinaRegionCheck', EVENT_BTX.chinaRegionCheckChanged,
        EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX));
    window.btxStatus.chinaRegionCheck = BTX_CHINA_REGION_CHECK.UNKNOWN;
}

window.btxCommands = {
    checkChinaRegionTimerID: '',
    checkSignInTimerID: '',
    moveToUploadPageTimerID: '',
    getDownloadedTslFileDataTimerID: '',

    setViewPosition: function () {
        // const btxRect = {
        //     x: 0,
        //     y: 0,
        //     width: window.innerWidth,
        //     height: window.innerHeight - $(FOOTER.ID).height(),
        // };
        // const btxRectStr = JSON.stringify(btxRect);
        // $native.btx.viewPositionConfig(btxRectStr);
        /* view position config test */
        try {
            const xOffset = 0;
            const yOffset = $('#top-header').height();
            const btxRect = {
                x: xOffset,
                y: yOffset,
                width: window.innerWidth - xOffset,
                height: window.innerHeight - yOffset,
            };
            const btxRectStr = JSON.stringify(btxRect);
            $native.btx.viewPositionConfig(btxRectStr);
        } catch {
            // console.log('viewPositionConfig failed.');
        }
    },
    loadBtx: function () {
        try {
            window.btxStatus.webViewStatus = BTX_WEBVIEW_STATUS.LOADING;

            $native.btx.openPage(ProductSetting.btx.info().url);
        } catch {
            // console.log('loadBtx failed.');
        }
    },
    sendJsonMsg: function (jsonMsg) {
        const msg = JSON.stringify(jsonMsg);
        $native.btx.sendMsgToBTX(msg);
    },
    moveToUploadPage: function () {
        const jsonMsg = {
            cmd: 'requestMoveToUploadPage',
        }
        window.btxStatus.exportStatus = BTX_EXPORT_STATUS.LOADING_UPLOAD_PAGE_IN_BTX_VIEW;

        const timeoutHnd = () => {
            btxCommands.moveToUploadPageTimerID = '';
            window.btxStatus.exportStatus = BTX_EXPORT_STATUS.NOT_READY;
        };
        btxCommands.moveToUploadPageTimerID = setTimeout(timeoutHnd, 7000)

        btxCommands.sendJsonMsg(jsonMsg);
    },
    checkChinaRegion: function () {
        window.btxStatus.chinaRegionCheck = BTX_CHINA_REGION_CHECK.UNKNOWN;
        if (window.btxStatus.webViewStatus != BTX_WEBVIEW_STATUS.LOADED) return;   /* 読み込み済みでないと何もできない */
        const jsonMsg = {
            cmd: 'requestCheckRegionIsChina',
        }
        const timeoutHnd = () => {
            btxCommands.checkChinaRegionTimerID = '';
            btxCommands.checkChinaRegion(); /* リトライ */
        };
        btxCommands.checkChinaRegionTimerID = setTimeout(timeoutHnd, 1000);

        btxCommands.sendJsonMsg(jsonMsg);
    },
    checkSignIn: function () {
        if (window.btxStatus.webViewStatus != BTX_WEBVIEW_STATUS.LOADED) return;   /* 読み込み済みでないと何もできない */
        const jsonMsg = {
            cmd: 'requestEvaluateSignInSession',
        }
        window.btxStatus.exportStatus = BTX_EXPORT_STATUS.CHECKING_SIGN_IN;

        const timeoutHnd = () => {
            btxCommands.checkSignInTimerID = '';
            window.btxStatus.exportStatus = BTX_EXPORT_STATUS.NOT_READY;
        };
        btxCommands.checkSignInTimerID = setTimeout(timeoutHnd, 7000)

        btxCommands.sendJsonMsg(jsonMsg);
    },
    sendResponseGetTslFileInfo: (arg) => {
        const jsonMsg = {
            cmd: 'responseGetTslFileInfo',
            arg: arg
        }
        btxCommands.sendJsonMsg(jsonMsg);
    },
    sendResponseGetTslFileData: (arg) => {
        const jsonMsg = {
            cmd: 'responseGetTslFileData',
            arg: arg
        }
        btxCommands.sendJsonMsg(jsonMsg);
    },
    sendRequestGetDownloadedTslFileData: (arg) => {
        const jsonMsg = {
            cmd: 'requestGetDownloadedTslFileData',
            arg: arg
        }

        const timeoutHnd = () => {
            btxCommands.getDownloadedTslFileDataTimerID = '';
            window.btxStatus.importStatus = BTX_IMPORT_STATUS.READY;
            const arg = { result: "Failed", detail: "Import failed." };
            btxCommands.sendResultImportToLibrarian(arg);
        };
        btxCommands.getDownloadedTslFileDataTimerID = setTimeout(timeoutHnd, 10000);

        btxCommands.sendJsonMsg(jsonMsg);
    },
    sendResultImportToLibrarian: (arg) => {
        const jsonMsg = {
            cmd: 'resultImportToLibrarian',
            arg: arg
        }
        btxCommands.sendJsonMsg(jsonMsg);
    }
};

$(function () {
    let currentFooterIdVal; /* UI側で値を持っていないので直接取得できない。キャッシュするしかない */

    $(window).resize(function () {
        try {
            if (currentFooterIdVal == FOOTER.BTX) {
                window.btxCommands.setViewPosition();
                $native.btx.show();
            } else {
                $native.btx.hide();
            }
        } catch {
            // console.log('Error resizing window.');
        }
    });

    window.initializeBtx = function () {
        window.btxCommands.setViewPosition();
        window.btxCommands.loadBtx();
    };

    /* TSL転送表示 */
    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.exportStatusChanged, (e) => {
        let value = e.detail.value;
        if (value === BTX_EXPORT_STATUS.LOADING_UPLOAD_PAGE_IN_BTX_VIEW) {
            PROGRESS_DIALOG_MAP.sendTslToBtx.open();
        }
        else if (value === BTX_EXPORT_STATUS.SENDING_TSL_TO_BTX_VIEW) { }/* 処理中 */
        else if (value === BTX_EXPORT_STATUS.UPLOADING_IN_BTX_VIEW) {
            PROGRESS_DIALOG_MAP.sendTslToBtx.close();
        }
    });
    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.transmitTslProgressChanged, (e) => {
        let value = e.detail.value;
        if (value > 1.0) value = 1.0;
        if (value < 0.0) value = 0.0;

        PROGRESS_DIALOG_MAP.sendTslToBtx.update(value * 100);   /* 引数は100%表現 */
    });

    const changeFooterSelect = (index) => {
        $(FOOTER.ID).trigger('elf-change', index);
        $(FOOTER.ID).trigger('elf-update', index);
    }
    const footerDisable = () => {
        // PC is parent; SP: footerId
        // $(FOOTER.ID).append(
        //     '<div id="footer-mask-frame" class="item-frame-style" style="left: 0px; top: 0px; width: 321px; height: 48px; background-color: rgb(0, 0, 0); opacity: 0.5;"></div>'
        // );
        $(FOOTER.ID).parent().append(
            '<div id="footer-mask-frame" class="item-frame-style" style="left: 160px; top: 0px; width: 256px; height: 48px; background-color: rgb(0, 0, 0); opacity: 0.5;"></div>'
        );
    }
    const footerEnable = () => { $("#footer-mask-frame").remove(); }

    /* タブバー */
    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.exportStatusChanged, (e) => {
        const from = (val) => { return (val === e.detail.beforeValue); }
        const to = (val) => { return (val === e.detail.value); }

        if (from(BTX_EXPORT_STATUS.SENDING_TSL_TO_BTX_VIEW) && to(BTX_EXPORT_STATUS.UPLOADING_IN_BTX_VIEW)) {
            /* BTS -> BTXへ画面切り替え & タブバー操作禁止 */
            changeFooterSelect(FOOTER.BTX);
            footerDisable();
        }
        else if (from(BTX_EXPORT_STATUS.UPLOADING_IN_BTX_VIEW) && to(BTX_EXPORT_STATUS.NOT_CHECKED_SIGN_IN)) {
            /* BTX -> BTSへ画面切り替え & タブバー操作禁止解除 */
            changeFooterSelect(FOOTER.LIBRARIAN);
            footerEnable();
        }
        else { footerEnable(); }
    });

    let interruptBtxAndDisplayDialog = false;
    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.SYSTEM).addEventListener(EVENT_SYSTEM.dialogOpeningCountChanged, (e) => {
        let value = e.detail.value;
        let beforeValue = e.detail.beforeValue;
        if ((beforeValue == 0) && (value == 1) && (currentFooterIdVal == FOOTER.BTX)) {
            /* BTX画面からBTS側画面へ切り替える。Disconnectの時だけcurrentFooterIdValが変更済みで来るので戻せないが、これは仕様とする  */
            changeFooterSelect(FOOTER.EDITOR);
            interruptBtxAndDisplayDialog = true;
        }
        else if ((beforeValue == 1) && (value == 0) && (interruptBtxAndDisplayDialog == true)) {
            /* BTS画面からBTX画面に戻す */
            changeFooterSelect(FOOTER.BTX);
            interruptBtxAndDisplayDialog = false;
        }
    });

    /* BTXView表示コントロール */
    const updateBTXViewVisible = () => {
        try {
            if (currentFooterIdVal != FOOTER.BTX) {
                $('#tone-exchange').hide();
                $native.btx.hide();
                return;
            } else {
                $('#tone-exchange').show();
            }

            /* BTXView表示中 */
            switch (window.btxStatus.webViewStatus) {
                case BTX_WEBVIEW_STATUS.LOADED: {
                    window.btxCommands.setViewPosition();
                    $native.btx.show();
                    break;
                }
                case BTX_WEBVIEW_STATUS.LOADING:
                case BTX_WEBVIEW_STATUS.FAILED:
                default:
                    $native.btx.hide();
                    break;
            }
        } catch {
            // console.log('updateBTXViewVisible failed.');s
        }
    };
    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.webViewStatusChanged, (e) => {
        updateBTXViewVisible(); /* 再評価 */
    });

    $(FOOTER.ID).on('elf-changed', function (e, v) {
        /* フッターが押下されたときの処理 */
        currentFooterIdVal = v;
        if (v == FOOTER.BTX && !window.navigator.onLine) {
            window.btxStatus.webViewStatus = BTX_WEBVIEW_STATUS.FAILED;
            // ERROR_DIALOG_MAP.noInternetAccess.open(() => {
            //     ERROR_DIALOG_MAP.noInternetAccess.visible = false;
            // });
        }
        updateBTXViewVisible();
    });

    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.SYSTEM).addEventListener(EVENT_SYSTEM.gtrBassModeChanged, (e) => {
        btxCommands.loadBtx();
    });

    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.SYSTEM).addEventListener(EVENT_SYSTEM.developModeChanged, (e) => {
        btxCommands.loadBtx();
    });

    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.webViewStatusChanged, (e) => {
        window.btxCommands.checkChinaRegion();
    });
});

$native.btx.event.onSendMsgToBTS = (msg) => {
    const importBtxData = librarianServices.importBtxData;

    const getDownloadedTslFileData = (packetNo) => {
        const arg = { packetNo: packetNo };
        btxCommands.sendRequestGetDownloadedTslFileData(arg);
    };

    const importFinished_failed_common = () => {
        importBtxData.clear();
        const arg = { result: "Failed", detail: "Import failed." };
        btxCommands.sendResultImportToLibrarian(arg);
        window.btxStatus.importStatus = BTX_IMPORT_STATUS.READY;
    };

    const jsonMsg = JSON.parse(msg);
    switch (jsonMsg.cmd) {
        case 'responseEvaluateSignInSession': {
            clearTimeout(btxCommands.checkSignInTimerID);
            btxCommands.checkSignInTimerID = '';

            if (window.btxStatus.exportStatus !== BTX_EXPORT_STATUS.CHECKING_SIGN_IN) {
                return;
            }

            const result = jsonMsg && jsonMsg.arg && jsonMsg.arg.result;
            if (result === 'signedIn') window.btxStatus.exportStatus = BTX_EXPORT_STATUS.READY;
            else if (result === 'signedOut') window.btxStatus.exportStatus = BTX_EXPORT_STATUS.NOT_READY;

            break;
        }
        case 'responseCheckRegionIsChina': {
            clearTimeout(btxCommands.checkChinaRegionTimerID);
            btxCommands.checkChinaRegionTimerID = '';

            const result = jsonMsg && jsonMsg.arg && jsonMsg.arg.result;
            if (result === 'true') window.btxStatus.chinaRegionCheck = BTX_CHINA_REGION_CHECK.CHINA;
            else if (result === 'false') window.btxStatus.chinaRegionCheck = BTX_CHINA_REGION_CHECK.NOT_CHINA;
            else if (result === 'indeterminate') {
                /* 確定するまでリトライ */
                setTimeout(() => { btxCommands.checkChinaRegion(); }, 1000);    /* 1000msec後にリトライ */
            }

            break;
        }
        case 'requestGetTslFileInfo':
            window.btxStatus.transmitTslProgress = 0.0;
            if (window.btxStatus.exportStatus !== BTX_EXPORT_STATUS.LOADING_UPLOAD_PAGE_IN_BTX_VIEW) {
                /* 次に進める状態ではない */
                return;
            }
            window.btxStatus.exportStatus = BTX_EXPORT_STATUS.SENDING_TSL_TO_BTX_VIEW;
            clearTimeout(btxCommands.moveToUploadPageTimerID);
            btxCommands.moveToUploadPageTimerID = '';

            if (librarianServices.exportBtxReadyData.isReady == false) {
                /* 送るデータが利用できない */
                window.btxStatus.exportStatus = BTX_EXPORT_STATUS.NOT_CHECKED_SIGN_IN;
                ERROR_DIALOG_MAP.errExportingToBTXCommon.open();
            }

            window.btxStatus.exportStatus = BTX_EXPORT_STATUS.SENDING_TSL_TO_BTX_VIEW;
            btxCommands.sendResponseGetTslFileInfo(librarianServices.exportBtxReadyData.info);
            break;

        case 'requestGetTslFileData':
            if (librarianServices.exportBtxReadyData.isReady == false) {
                /* 送るデータが利用できない */
                window.btxStatus.exportStatus = BTX_EXPORT_STATUS.NOT_CHECKED_SIGN_IN;
                ERROR_DIALOG_MAP.errExportingToBTXCommon.open();
                break;
            }

            const requestedPacketNo = jsonMsg && jsonMsg.arg && jsonMsg.arg.packetNo;  /* 1オリジン */
            if (requestedPacketNo == undefined) {
                /* 評価不可 */
                window.btxStatus.exportStatus = BTX_EXPORT_STATUS.NOT_CHECKED_SIGN_IN;
                ERROR_DIALOG_MAP.errExportingToBTXCommon.open();
                break;
            }

            window.btxStatus.transmitTslProgress = 1.0 * (requestedPacketNo / librarianServices.exportBtxReadyData.info.packetNum);

            /* 送信データの取り出し */
            const maxPayloadSize = librarianServices.exportBtxTslMaxPayloadSize;
            const seek = maxPayloadSize * (requestedPacketNo - 1);
            const leastSize = librarianServices.exportBtxReadyData.data && librarianServices.exportBtxReadyData.data.length - seek;
            const sendSize = (leastSize > maxPayloadSize) ? maxPayloadSize : leastSize;
            const sendData = librarianServices.exportBtxReadyData.data && librarianServices.exportBtxReadyData.data.substring(seek, seek + sendSize);

            const arg = { packetNo: requestedPacketNo, packetData: sendData };
            btxCommands.sendResponseGetTslFileData(arg);
            break;

        case 'notifyPreparingUploadInBTXView':
            window.btxStatus.exportStatus = BTX_EXPORT_STATUS.UPLOADING_IN_BTX_VIEW;
            break;

        case 'resultExportToBTX':
            librarianServices.exportBtxReadyData.clear();
            window.btxStatus.exportStatus = BTX_EXPORT_STATUS.NOT_CHECKED_SIGN_IN;

            const resultExport = jsonMsg && jsonMsg.arg && jsonMsg.arg.result;
            if (resultExport === 'success') {
                COMPLETE_DIALOG_MAP.export.open();
            }
            else if (resultExport === 'failed') {
                FAILED_DIALOG_MAP.export.open();
            }
            else if (resultExport === 'canceled') {
                CANCELED_DIALOG_MAP.export.open();
            }
            break;

        case 'requestImportToLibrarian':
            if (window.btxStatus.importStatus !== BTX_IMPORT_STATUS.READY) {
                /* 処理中のため受けつけれない */
                const arg = { result: "Failed", detail: "Import process is in progress." };
                btxCommands.sendResultImportToLibrarian(arg);
                return;
            }

            if (librarianCommonInfo.livesetList.length === librarianCommonInfo.maxLivesetNum) {
                /* ライブセットが一杯のためインポートできない */
                const arg = { result: "Failed", detail: "Import failed. The liveset is full." };
                btxCommands.sendResultImportToLibrarian(arg);
                break;
            }

            const requestedPacketNum = jsonMsg && jsonMsg.arg && jsonMsg.arg.packetNum;
            if (requestedPacketNum == undefined) {
                /* 評価不可 */
                importFinished_failed_common();
                break;
            }

            importBtxData.clear();
            importBtxData.packetNum = requestedPacketNum;
            importBtxData.currentPacketNo = 1;

            window.btxStatus.importStatus = BTX_IMPORT_STATUS.IMPORTING_TSL_FROM_BTX_VIEW;

            getDownloadedTslFileData(importBtxData.currentPacketNo);
            break;

        case 'responseGetDownloadedTslFileData':
            clearTimeout(btxCommands.getDownloadedTslFileDataTimerID);
            btxCommands.getDownloadedTslFileData = '';
            if (window.btxStatus.importStatus !== BTX_IMPORT_STATUS.IMPORTING_TSL_FROM_BTX_VIEW) {
                /* BTSとしては処理が中止されているので捨てる */
                return;
            }

            const responsePacketNo = jsonMsg && jsonMsg.arg && jsonMsg.arg.packetNo;
            if (responsePacketNo !== importBtxData.currentPacketNo) {
                /* リクエストしたパケットではない。捨てて再リクエスト */
                getDownloadedTslFileData(importBtxData.currentPacketNo);
                break;
            }

            const responsePacketData = jsonMsg && jsonMsg.arg && jsonMsg.arg.packetData;
            if (responsePacketData === undefined) {
                /* 評価不可 */
                importFinished_failed_common();
                break;
            }

            importBtxData.data += responsePacketData;

            if (importBtxData.currentPacketNo == importBtxData.packetNum) {
                /* 処理終了 */

                /* URLセーフのBASE64からデコード */
                const binStrTsl = atob(importBtxData.data.replace(/-/g, "+").replace(/-/g, "/"));

                /* quattroのwriteDataはHEXのテキストを渡す仕様なので、バイナリ文字列から変換  */
                let binTslHexStr = '';
                for (let seek = 0; seek < binStrTsl.length; seek++) {
                    let byteHexStr =
                        binTslHexStr += binStrTsl.charCodeAt(seek).toString(16).padStart(2, '0');
                }

                const fs = $native.fs;
                const tmpFileName = fs.path('temporary') + "tmpImportBtxTsl" + '.' + ProductSetting.extension.liveset;
                try {
                    /* ファイル書き出し */
                    fs.writeData(tmpFileName, binTslHexStr);

                    /* インポート */
                    let tslJson = fs.readString(tmpFileName);
                    let liveset = new LibrarianModel('', librarianCommonInfo.settingMode);
                    liveset.load(tslJson);
                    if (liveset.cells[0].length > librarianCommonInfo.maxPatchNum) {
                        liveset.cells[0].splice(librarianCommonInfo.maxPatchNum);
                    }
                    liveset.id = librarianServices.createLivesetId();
                    librarianCommonInfo.livesetList.unshift(liveset);
                    librarianServices.saveToStorage2(liveset);
                    librarianServices.saveIdList();
                    librarianDynamicDOMController.updateLivesetTableCell();

                    importBtxData.clear();
                    const arg = { result: "Success", detail: "Import Completed." };
                    btxCommands.sendResultImportToLibrarian(arg);
                    window.btxStatus.importStatus = BTX_IMPORT_STATUS.READY;
                } catch {
                    importFinished_failed_common();
                    break;
                }
            } else {
                /* 処理継続 */
                importBtxData.currentPacketNo++;
                getDownloadedTslFileData(importBtxData.currentPacketNo);
            }
            break;

        default:
            break;
    }
}

const NotifyResult = $native.btx.NotifyResult;

$native.btx.event.onBtxWebViewNotify = (result) => {
    switch (Number(result)) {
        case NotifyResult.PageLoaded:
            window.btxStatus.webViewStatus = BTX_WEBVIEW_STATUS.LOADED;
            break;
        case NotifyResult.ConnectionTimeout:
        case NotifyResult.ConnectionError:
        case NotifyResult.UnknownError:
            window.btxStatus.webViewStatus = BTX_WEBVIEW_STATUS.FAILED;
            break;
    }
}


/* TODO BTXページDOM操作仮置き */
$(function () {
    const RELOAD_BTX_BTN = '#tone-exchange-reload-btn';
    $(RELOAD_BTX_BTN).on('click', function (e) {
        e.preventDefault();
        if (!window.navigator.onLine) {
            window.btxStatus.webViewStatus = BTX_WEBVIEW_STATUS.FAILED;
            // ERROR_DIALOG_MAP.noInternetAccess.open(() => {
            //     ERROR_DIALOG_MAP.noInternetAccess.visible = false;
            // });

            return;
        }
        window.btxCommands.loadBtx();
    });
    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.webViewStatusChanged, (e) => {
        let value = e.detail.value;
        (value == BTX_WEBVIEW_STATUS.FAILED) ? $(RELOAD_BTX_BTN).show() : $(RELOAD_BTX_BTN).hide();
    });


    const BTX_STATE_LABEL = "#tone-exchange-state-label";
    EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.webViewStatusChanged, (e) => {
        let value = e.detail.value;
        switch (value) {
            case BTX_WEBVIEW_STATUS.LOADED:
            case BTX_WEBVIEW_STATUS.UNKNOWN:
                $(BTX_STATE_LABEL).text("");
                break;
            case BTX_WEBVIEW_STATUS.FAILED:
                $(BTX_STATE_LABEL).text("PAGE LOAD FAILED");
                break;
            case BTX_WEBVIEW_STATUS.LOADING:
                $(BTX_STATE_LABEL).text("PAGE LOADING...");
                break;
            default:
                break;
        }
    });
});