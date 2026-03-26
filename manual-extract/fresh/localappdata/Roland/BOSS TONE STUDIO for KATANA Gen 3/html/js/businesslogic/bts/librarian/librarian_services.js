/**
 * [概要]
 * LIVESETなどのデータを取り扱うロジック
 *
 * [使用箇所]
 * LIBRARIAN画面
 *
 * [改善ポイント]
 * ・IDやCLASSを指定する際にLIBRARIANという接頭辞をつけているため、変数名が長くなり、可読性が低くなっている。
 * ・Exportの際にUSER PATCH DATAを読み込んでからExportしているため、SER PATCH DATAの読み込みはなくしたほうが良い。
 *
 */

/* To prevent error on ESLint */
/* global librarianCommonInfo, patchModelController, LibrarianModel, PatchInfo, $native,
          PROGRESS_DIALOG_MAP, ERROR_DIALOG_MAP, COMPLETE_DIALOG_MAP
 */

/**
 * 実機との通信に用いるobserver。LIBRARIANオブジェクトに登録して用いるが、
 * 登録しているobserverは常に一つでなければならない。
 * 各処理の成功時にはcompleteFunc, 処理が中止された場合はerrorFuncが呼ばれる。
 */
 var librarianObserver = {
  temporaryWrite: function (completeFunc, errorFunc) {
    var observer = {
      notify: function (msg, arg) {
        if (msg === 'librarian_cancel') {
          librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(this);
        }
        if (msg === 'librarian_temporaryWrite') {
          if (arg === 'timeout' || arg === 'end') {
            if (arg === 'timeout') {
              librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(this);
              if (typeof errorFunc === 'function' && errorFunc !== undefined) {
                errorFunc();
              }
            } else {
              if (typeof completeFunc === 'function' && completeFunc !== undefined) {
                completeFunc();
              }
            }
          }
        }
      }
    };
    return observer;
  },
  /** 
   * [改善ポイント]
   * まず、readで実機のすべてのUSER PATCH DATAをinstLivesetに読み込んでから、
   * instLivesetを選択されたPatchで更新し、writeを行っている。
   * readは行わず、必要な分だけwriteを行うように処理を変更すれば、処理時間を短縮できる。
   */
   export: function (completeFunc, errorFunc) {
    var observer = {
      notify: function (msg, arg) {
        if (msg === 'librarian_cancel') {
          librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(this);
        } else if (msg === 'librarian_read') {
          if (arg === 'end') {
            var row = librarianCommonInfo.export.getTargetInstPatches(patchModelController.getTotalUserPatch());
            for (var i = 0, len = row.length; i < len; i++) {
              librarianCommonInfo.instLiveset.replace(librarianCommonInfo.settingMode, row[i], [librarianCommonInfo.export.targetPatches[i]]);
            }
            librarianCommonInfo.librarians[librarianCommonInfo.settingMode].write(row);
          } else if (arg === 'timeout') {
            if (typeof errorFunc === 'function' && errorFunc !== undefined) {
              errorFunc(this);
            }
          } else {
            var readArg = (arg + 0) / 2;
            PROGRESS_DIALOG_MAP.export.update(readArg);
          }
        } else if (msg === 'librarian_write') {
          if (arg === 'end') {
            if (typeof errorFunc === 'function' && errorFunc !== undefined) {
              completeFunc(this);
            }
          } else if (arg === 'timeout') {
            if (typeof errorFunc === 'function' && errorFunc !== undefined) {
              errorFunc(this);
            }
          } else {
            var writeArg = ((arg + 0) / 2) + 50;
            PROGRESS_DIALOG_MAP.export.update(writeArg);
          }
        }
      }
    };
    return observer;
  },
  import: function (completeFunc, errorFunc) {
    var observer = {
      notify: function (msg, arg) {
        if (msg === 'librarian_cancel') {
          librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(this);
        } else if (msg === 'librarian_read') {
          if (arg === 'end') {
            if (typeof errorFunc === 'function' && errorFunc !== undefined) {
              completeFunc(this);
            }
          } else if (arg === 'timeout') {
            if (typeof errorFunc === 'function' && errorFunc !== undefined) {
              errorFunc(this);
            }
          } else {
            PROGRESS_DIALOG_MAP.import.update(arg);
          }
        }
      }
    };
    return observer;
  }
};

var librarianServices = {
  /**
   *  @return {Int} livesetに振り分けるID
   *  livesetが一つもない状態のときは0, livesetが上限に達している場合は-1を返す
   */
   createLivesetId: function () {
    function livesetId() {
      var livesetIds = [];
      for (var i = 0; i < librarianCommonInfo.livesetList.length; i++) {
        livesetIds.push(librarianCommonInfo.livesetList[i].id);
      }
      for (var id = 0; id < librarianCommonInfo.maxLivesetNum; id++) {
        if (livesetIds.indexOf(id) < 0) {
          return id;
        }
      }
      return -1;
    }
    var length = librarianCommonInfo.livesetList.length;
    if (length !== 0) {
      return livesetId();
    } else {
      return 0;
    }
  },
  /**
   *  livesetの新規作成、livesetListへの追加、ストレージへの登録
   *  @param {string} name: required
   *  @param {[LibrarianCell]} patches
   */
   createLiveset: function (name, patches) {
    var newLiveset = new LibrarianModel(name, false);
    if (patches !== undefined) {
      var length = patches.length;
      for (var i = 0; i < length; i++) {
        newLiveset.append(librarianCommonInfo.settingMode);
      }
      newLiveset.replace(librarianCommonInfo.settingMode, 0, patches);
      for (var i = 0; i < length; i++) {
        var patchInfo = (patches[i].memo)? patches[i].memo : new PatchInfo(false);
        newLiveset.memo(librarianCommonInfo.settingMode, i, patchInfo);
      }
    }
    var id = librarianServices.createLivesetId();
    if (id !== -1) {
      $native.app.control('indicator start');
      newLiveset.id = id;
      librarianCommonInfo.livesetList.unshift(newLiveset);
      librarianServices.saveToStorage2(newLiveset);
      librarianServices.saveIdList();
      $native.app.control('indicator stop');
    } else {
      ERROR_DIALOG_MAP.libraryFull.open();
      return;
    }
  },
  /**
   *  lievsetの名前を更新
   *  @param {string} name
   *  @param {LibrarianModel} liveset
   */
   renameLiveset: function (name, liveset) {
    var convertedName = util.convert2AsciiOnlyStr(name).slice(0, 64);
    liveset.name = convertedName;
  },
  /**
   *  patchの名前を更新
   *  @param {string} name
   *  @param {LibrarianCell} patch
   */
   renamePatch: function (name, patch) {
    var convertedName = util.convert2AsciiOnlyStr(name).slice(0, 16);
    patch.setValue(0, convertedName);
  },
  /**
   *  livesetのコピーを生成
   *  @param {LibrarianModel} liveset
   *  @return {LibrarianModel}
   */
   copyLiveset: function (liveset) {
    var newLiveset = new LibrarianModel('', false);
    newLiveset.setTitle(liveset.title());
    newLiveset.duplicate(liveset);
    return newLiveset; // idはそのまま
  },
  /**
   *  patchのコピーを生成
   *  @param {LibrarianCell} patch
   *  @return {LibrarianCell}
   */
   copyPatch: function (patch) {
    var newPatch = librarianCommonInfo.librarians[librarianCommonInfo.settingMode].factory();
    newPatch.copy(patch);
    return newPatch;
  },
  /**
   *  livesetの削除(ストレージからも削除)
   *  @param {int} index livesetListのindex
   */
   deleteLiveset: function (index) {
    librarianCommonInfo.livesetList.splice(index, 1);
  },
  /**
   *  patchの削除
   *  @param {int} index patchのindex
   */
   deletePatch: function (liveset, index) {
    liveset.remove(librarianCommonInfo.settingMode, index);
  },
  /**
   * Importの選択に用いる各値の初期化
   */
   initImportInfo: function () {
    librarianCommonInfo.import.mode = 0;
    librarianCommonInfo.import.startIndex = 0;
  },
  /**
   * Exportの選択に用いる各値の初期化
   */
   initExportInfo: function () {
    librarianCommonInfo.export.mode = 0;
    librarianCommonInfo.export.targetLiveset = null;
    librarianCommonInfo.export.instPatchIndex = 0;
    librarianCommonInfo.export.targetPatches = [];
  },
  /**
   * @param {LibrarianModel} targetLiveset import対象のliveset
   * @param {[int]} instPatchIndexes importする実機のpatchのindex
   * @param {int} startIndex  // patchを上書き、挿入する際の開始位置
   * @param {int} mode 0: update, 1:insert
   * @param {function} successFunc 成功時に実行される関数
   * @param {function} errorFunc エラー時に実行される関数
   */
   importInst: function (targetLiveset, instPatchIndexes, startIndex, mode, successFunc, errorFunc) {
    var observer = librarianObserver.import(
      function (o) { // Success Function
        librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(o);
        $native.app.control('indicator start');
        var instPatches = librarianCommonInfo.instLiveset.copy(librarianCommonInfo.settingMode, instPatchIndexes);
        if (mode === 0) { // 上書き
          targetLiveset.replace(librarianCommonInfo.settingMode, startIndex, instPatches);
        } else { // 挿入
          var head = targetLiveset.cells[librarianCommonInfo.settingMode].slice(0, startIndex);
          var tail = targetLiveset.cells[librarianCommonInfo.settingMode].slice(startIndex, targetLiveset.rows(librarianCommonInfo.settingMode));
          head = head.concat(instPatches);
          targetLiveset.cells[librarianCommonInfo.settingMode] = head.concat(tail);
        }
        librarianServices.saveToStorage2(targetLiveset);
        if (typeof successFunc === 'function') {
          successFunc();
        }
        $native.app.control('indicator stop');
        PROGRESS_DIALOG_MAP.import.close(function () {
          COMPLETE_DIALOG_MAP.import.open(function () {});
        });
      },
      function (o) { // Error function
        librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(o);
        PROGRESS_DIALOG_MAP.import.close(function () {});
        if (typeof errorFunc === 'function') {
          errorFunc();
        }
        var self = o;
        ERROR_DIALOG_MAP.communicationError.open(
          function () {},
          function () {
            PROGRESS_DIALOG_MAP.import.init();
            PROGRESS_DIALOG_MAP.import.open(function () {
              librarianCommonInfo.librarians[librarianCommonInfo.settingMode].cancel();
              librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(self);
            });
            var tempIndexes = [];
            for (var i = 0, length = instPatchIndexes.length; i < length; i++) {
              tempIndexes.push(instPatchIndexes[i]);
            }
            librarianCommonInfo.librarians[librarianCommonInfo.settingMode].addObserver(self);
            librarianCommonInfo.librarians[librarianCommonInfo.settingMode].read(tempIndexes);
          }
          );
      }
      );
    var tempIndexes = []; // read処理の時に空の配列になってしまうため、copyしたものを使う
    for (var i = 0, length = instPatchIndexes.length; i < length; i++) {
      tempIndexes.push(instPatchIndexes[i]);
    }
    PROGRESS_DIALOG_MAP.import.init();
    PROGRESS_DIALOG_MAP.import.open(function () {
      librarianCommonInfo.librarians[librarianCommonInfo.settingMode].cancel();
      librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(observer);
      if (typeof errorFunc === 'function') {
        errorFunc();
      }
    });
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].addObserver(observer);
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].read(tempIndexes);
  },
  /**
   * @param {function} successFunc 成功時に実行される関数
   * @param {function} errorFunc // エラー時に実行する関数
   */
   exportInst: function (successFunc, errorFunc) {

    let _errorFunc = function (patch) {
      window.patchFailure = [];
      if (patch) {
        window.patchFailure.push(patchModelController.getPrefix(parseInt(patch, 16)));
      } else {
        const rows = librarianCommonInfo.export.getTargetInstPatches(patchModelController.getTotalUserPatch());
        for (let i = 0; i < rows.length; i++) {
          window.patchFailure.push(patchModelController.getPrefix(rows[i]));
        }
      }
      PROGRESS_DIALOG_MAP.export.close(function () {});
      ERROR_DIALOG_MAP.communicationErrorOther.open(function () {
      }, function () {
      })
    }

    let _successFuncComplete = function (_successFunc) {
      patchMIDIController.fetchPatchNames(function () {
        PROGRESS_DIALOG_MAP.export.close(function () {
          COMPLETE_DIALOG_MAP.export.open(function () {});
        });
        if (typeof _successFunc === 'function') {
          _successFunc();
        }
      }, function() {
        PROGRESS_DIALOG_MAP.export.close(function () {});
      });
    }

    var observer = librarianObserver.export(
      function (o) { // Success Function
        for (var i in librarianCommonInfo.export.targetPatches) {
          if (librarianCommonInfo.export.targetPatches.hasOwnProperty(i)) {
            var patchInfo = null;
            if (librarianCommonInfo.export.targetPatches[i].memo) {
              patchInfo = librarianCommonInfo.export.targetPatches[i].memo;
              if (patchInfo.isToneCentralPatch) {
                addPatchesLogManager.post(librarianCommonInfo.export.targetPatches[i].value(0)); // ログの送信
              }
            }
          }
        }
        librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(o);
        let rowInstPatches = librarianCommonInfo.export.getTargetInstPatches(patchModelController.getTotalUserPatch());
        if (rowInstPatches.length > 2) {
          patchMIDIController.sendCommandExport(true, true, true, undefined, function () {
            _successFuncComplete(successFunc);
          }, function () {
            _errorFunc();
          });
        } else if (rowInstPatches.length == 2) {
          patchMIDIController.sendCommandExport(false, true, false, rowInstPatches[0], function () {
            patchMIDIController.sendCommandExport(false, false, true, rowInstPatches[1], function () {
              _successFuncComplete(successFunc);
            },
            function (patchFail) {
              _errorFunc(patchFail);
            })
          }, function (patchFail) {
            _errorFunc(patchFail);
          });
        } else {
          patchMIDIController.sendCommandExport(false, true, true, rowInstPatches[0], function () {
            _successFuncComplete(successFunc);
          }, function (patchFail) {
            _errorFunc(patchFail);
          });
        }
      },
      function (o) { // Error Function
        librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(o);
        PROGRESS_DIALOG_MAP.export.close(function () {});
        if (typeof errorFunc === 'function') {
          errorFunc();
        }
        var self = o;
        ERROR_DIALOG_MAP.communicationError.open(
          function () {},
          function () {
            PROGRESS_DIALOG_MAP.export.init();
            PROGRESS_DIALOG_MAP.export.open(function () {
              librarianCommonInfo.librarians[librarianCommonInfo.settingMode].cancel();
              librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(self);
            });
            var row = librarianCommonInfo.export.getTargetInstPatches(patchModelController.getTotalUserPatch());
            librarianCommonInfo.librarians[librarianCommonInfo.settingMode].addObserver(self);
            librarianCommonInfo.librarians[librarianCommonInfo.settingMode].read(row);
          }
          );
      }
    );
    var row = librarianCommonInfo.export.getTargetInstPatches(patchModelController.getTotalUserPatch());
    PROGRESS_DIALOG_MAP.export.init();
    PROGRESS_DIALOG_MAP.export.open(function () {
      librarianCommonInfo.librarians[librarianCommonInfo.settingMode].cancel();
      librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(observer);
      errorFunc();
    });
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].addObserver(observer);
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].read(row);
  },
  // Import, Export File
  importFile: function (successFunc, errorFunc) {
    fileManager.importFile(
      function (json, name) {
        if (librarianCommonInfo.livesetList.length === librarianCommonInfo.maxLivesetNum) {
          ERROR_DIALOG_MAP.libraryFull.open();
          if (typeof errorFunc === 'function' && errorFunc !== undefined) {
            errorFunc();
          }
        } else {
          if (typeof successFunc === 'function' && successFunc !== undefined) {
            successFunc(json, name);
          }
        }
      },
      function () {
        if (typeof errorFunc === 'function' && errorFunc !== undefined) {
          errorFunc();
        }
      },
      ProductSetting.livesetFile.extension
      );
  },
  exportFile: function (liveset, successFunc, errorFunc) {
    var fs = $native.fs;
    var nameFile = util.convert2ValidFileNameStr(liveset.name);
    fileManager.exportFile(
      function (name) {
        if (typeof successFunc === 'function' && successFunc !== undefined) {
          successFunc();
        }
        fs.writeString(name, liveset.toJSON());
      },
      function () {
        if (typeof errorFunc === 'function' && errorFunc !== undefined) {
          errorFunc();
        }
      },
      nameFile,
      ProductSetting.livesetFile.extension
      );
  },

  /** btx */

  importBtxData: {
    isProcessing: false,
    packetNum: 0,
    currentPacketNo: 0,
    data: '',
    clear: () => {
      const obj = librarianServices.importBtxData;
      obj.isProcessing = false;
      obj.packetNum = 0;
      obj.currentPacketNo = 0;
      obj.data = '';
    },
  },

  /* BTXViewへのTsl送信時の一回の送信データサイズ */
  /* urlLoad想定なので有効なURL長より小さい必要がある。RFC7230では8000だが、
     safariでは4096という情報があった。他の情報も積む事を考慮しマージンをとって3900程度に設定している */
  exportBtxTslMaxPayloadSize: 3900,

  exportBtxReadyData: {
    isReady: false,
    info: {
      model: undefined,
      tslFileName: "",
      packetNum: 0
    },
    data: undefined,

    clear: () => {
      const obj = librarianServices.exportBtxReadyData;
      obj.isReady = false;
      obj.info.model = undefined;
      obj.info.tslFileName = "";
      obj.info.packetNum = 0;
      obj.data = undefined;
    },
  },
  exportBtx: async function (liveset) {
    const readyData = librarianServices.exportBtxReadyData;
    readyData.clear();
    let fs = $native.fs;
    let tmpFileName = fs.path('temporary') + "tmpExportBtxTsl" + '.' + ProductSetting.livesetFile.extension;
    let base64Tsl = "";

    /* データ準備 */
    try {
      let binTslHexStr = "";
      fs.writeString(tmpFileName, liveset.toJSON()); /* ファイルを書き出し */

      /* バイナリで読み出しなおす */
      const fileInfo = fs.stat(tmpFileName);
      let fileSize = fileInfo.size;
      const fsReadDataMaxSize = 0x80000;  /* quattro側で一回の読み出しサイズに制限がある */
      let seek = 0;
      while (seek < fileSize) {
        let readSize = (fileSize > fsReadDataMaxSize) ? fsReadDataMaxSize : fileSize;
        let partial = { offset: seek, length: readSize };
        binTslHexStr += fs.readData(tmpFileName, partial);
        seek += readSize;
      }

      /* 読み出し時点ではHEXの文字列なので、Byte値で評価しなおしバイナリ文字列化する */
      seek = 0;
      const strLength = binTslHexStr.length;
      let binStrTsl = '';
      while (seek < strLength) {
        let byteHexStr = binTslHexStr.slice(seek, seek + 2);
        let byteVal = (Number('0x' + byteHexStr));  /* バイト値に変換 */
        binStrTsl += String.fromCharCode(byteVal);   /* 文字としてバイナリ文字列にまとめる */
        seek += 2;
      }

      /* URLセーフなBASE64に変換 */
      base64Tsl = btoa(binStrTsl).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    } catch {
      /* TODO: fsエラー。エラー表示 */
      alert('error: quattro fs module exception');
      return;
    }

    /* BTX側モデル定義取得 */
    let result = undefined;
    result = await new Promise((resolve, reject) => {
      $.ajax({
        url: ProductSetting.btx.info().systemGearUrl,
        type: "GET",
        async: true,
        contentType: "application/json",
        dataType: "json",
      }).then(
        (result) => { resolve(result); },   /* success */
        () => { reject(); } /* error */
      )
    });

    if (result == undefined) {
      /* TODO: エラー表示 */
      alert('error: failed to get btx defined models');
      return;
    }

    /* モデル情報検索 */
    const targetSlug = ProductSetting.targetSlug;
    for (const element of result.items) {
      if (element.slug === targetSlug) {
        readyData.info.model = element;
        break;
      }
    }
    if (readyData.info.model === undefined) {
      /* TODO: BTXに対応モデル定義が無い。エラー表示 */
      alert('error: not found from btx defined models');
      return;
    }

    const maxPayloadSize = librarianServices.exportBtxTslMaxPayloadSize;
    readyData.info.tslFileName = util.convert2ValidFileNameStr(liveset.name) + '.' + ProductSetting.livesetFile.extension;
    readyData.info.packetNum = (base64Tsl.length - (base64Tsl.length % maxPayloadSize)) / maxPayloadSize + 1;
    readyData.data = base64Tsl;
    readyData.isReady = true;

    popup_close(LIBRARIAN_ELEMENT_IDS.exportToDialog.slice(1));

    window.btxCommands.moveToUploadPage();
  },

  // Import, Export Cloud
  importCloud: function () {
    fileManager.importCloud(
      function (json) {
        popup_close(LIBRARIAN_ELEMENT_IDS.selectImportFromDialog.slice(1));
        var liveset = new LibrarianModel('', librarianCommonInfo.settingMode);
        liveset.load(json);
        librarianCommonInfo.livesetList.push(liveset);
        librarianServices.saveToStorage2(liveset);
        librarianServices.saveIdList();
      },
      function () {
        popup_close(LIBRARIAN_ELEMENT_IDS.selectImportFromDialog.slice(1));
      },
      ProductSetting.livesetFile.extension
      );
  },
  exportCloud: function (liveset) {
    var fs = $native.fs;
    fileManager.exportCloud(
      function (name) {
        try {
          fs.writeString(name, liveset.toJSON());
          popup_close(LIBRARIAN_ELEMENT_IDS.exportToCloudDialog.slice(1));
        } catch (e) {
          ERROR_DIALOG_MAP.fileError.open();
          popup_close(LIBRARIAN_ELEMENT_IDS.exportToCloudDialog.slice(1));
          return;
        }
      },
      function () {

      },
      ProductSetting.name,
      ProductSetting.livesetFile.extension
      );
  },
  /**
   *  @param {[LibrarianModel]} liveset
   */
   saveToStorage2: function (liveset) {
    var patchData = JSON.stringify(liveset);
    $native.app.storage2(liveset.id.toString(10), patchData);
  },
  /**
   * LivesetのIdListをstorage2へ保存
   */
   saveIdList: function () {
    var idList = {
      list: []
    };
    for (var i = 0, length = librarianCommonInfo.livesetList.length; i < length; i++) {
      idList.list.push(librarianCommonInfo.livesetList[i].id);
    }
    $native.app.storage2(librarianCommonInfo.idListKey, JSON.stringify(idList));
  },
  /**
   * 上書き確認ダイアログの表示フラグをstorage2へ保存
   */
   saveConfirmationFrag: function () {
    var confirmationFrag = librarianCommonInfo.confirmOverwrite;
    $native.app.storage2(librarianCommonInfo.confirmationFragKey, JSON.stringify(confirmationFrag));
  },
  /**
   *  @param {string} id
   *  @return {Object} read object
   */
   readStorage2: function (id) {
    var storageString = $native.app.storage2(id);
    if (typeof storageString === 'string' && storageString.length > 0) {
      try {
        var obj = JSON.parse(storageString);
        return obj;
      } catch (e) {
        return {};
      }
    } else {
      return null;
    }
  },
  /**
   *  Debug用storage2の初期化
   */
   initStorage2: function () {
    $native.app.storage2(librarianCommonInfo.idListKey, '');
    for (var i = 0, max = librarianCommonInfo.maxLivesetNum; i < max; i++) {
      $native.app.storage2(i, '');
    }
  },
  /**
   *  アプリ側で保持しているLivesetリストをストレージからロード
   */
   loadLivesetList: function () {
    var storage = librarianServices.readStorage2(librarianCommonInfo.idListKey);
    var idList = [];
    if (storage !== null) {
      if (storage.list instanceof Array) {
        idList = storage.list;
      }
    } else {
      librarianServices.createLiveset('LIVESET 1'); // ID_LIST key が存在しないときにLIVESET 1を追加
      return;
    }
    var livesetList = [];
    $native.app.control('indicator start');
    for (var i = 0, length = idList.length; i < length; i++) {
      var liveset = new LibrarianModel('', false);
      var readData = librarianServices.readStorage2(idList[i].toString(10));
      if (readData !== null) {
        liveset.load(readData);
        liveset.id = idList[i];
        livesetList.push(liveset);
      }
    }
    $native.app.control('indicator stop');
    librarianCommonInfo.livesetList = livesetList;
  },
  /**
   * 上書き確認ダイアログの表示フラグをstorage2からロード
   */
   loadConfirmationKey: function () {
    var storage = librarianServices.readStorage2(librarianCommonInfo.confirmationFragKey);
    if (storage !== null) {
      if (typeof storage === 'boolean') {
        librarianCommonInfo.confirmOverwrite = storage;
      }
    } else {
      librarianCommonInfo.confirmOverwrite = true;
    }
  },
  /**
   * ToneCentral preview
   * @param {[{}]} patch
   */
   previewPatch: async function (patch) {
    await patchMIDIController.sendCommandPreviewMute(1);
    var livesetForPrev = new LibrarianModel('', false);
    livesetForPrev.append(librarianCommonInfo.settingMode);
    livesetForPrev.cell(librarianCommonInfo.settingMode, 0).paramSet = patch[librarianCommonInfo.settingMode].paramSet;
    librarianCommonInfo.currentPatch = livesetForPrev.cell(librarianCommonInfo.settingMode, 0);
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].cancel();
    var observer = librarianObserver.temporaryWrite(
      function (o) {
        librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(o);
        util.waitForRQ1Reply(ADDRESS_CONST.ADDRESS.CURRENT_PATCH_NUMBER, 2, {
          error: function () {},
          success: function () {}
        });
        setupKnobModFxTargetList();
        setTimeout(() => {
          patchMIDIController.sendCommandPreviewMute(0);
        }, 10)
      },
      function (o) {
        librarianCommonInfo.librarians[librarianCommonInfo.settingMode].removeObserver(o);
        util.waitForRQ1Reply(ADDRESS_CONST.ADDRESS.CURRENT_PATCH_NUMBER, 2, {
          error: function () {},
          success: function () {}
        });
        setupKnobModFxTargetList();
        setTimeout(() => {
          patchMIDIController.sendCommandPreviewMute(0);
        }, 10)
      }
      );
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].addObserver(observer);
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].temporaryWrite(livesetForPrev.cell(librarianCommonInfo.settingMode, 0), 0);
  },
  /**
   * ToneCentral import
   * @param {string} livesetName
   * @param {[Object]} patchData
   */
   importToneCentral: function (livesetName, patchData) {
    var patches = [];
    var srcPatches = patchData[librarianCommonInfo.settingMode];
    for (var i = 0, length = srcPatches.length; i < length; i++) {
      var patch = new LibrarianCell(ProductSetting.librarian[librarianCommonInfo.settingMode].config);
      if (srcPatches[i].memo) {
        patch.memo = srcPatches[i].memo;
        patch.memo['isToneCentralPatch'] = true;
      } else {
        patch.memo = new PatchInfo(true);
      }
      patch.paramSet = patchData[librarianCommonInfo.settingMode][i].paramSet;
      patches.push(patch);
    }
    if (librarianCommonInfo.livesetList.length !== librarianCommonInfo.maxLivesetNum) {
      COMPLETE_DIALOG_MAP.addLiveset.open();
      librarianServices.createLiveset(livesetName, patches);
    } else {
      ERROR_DIALOG_MAP.libraryFull.open();
    }
  },
  /**
   * @param {int} patchNum
   */
   changeInstPatch: function (patchNum) {
    var isInst = librarianCommonInfo.currentLiveset.instrument;
    if (isInst) {
      librarianCommonInfo.currentPatch = librarianCommonInfo.instLiveset.cell(librarianCommonInfo.settingMode, patchNum);
      $(LIBRARIAN_ELEMENT_CLASSES.patchTableCell).removeClass('selected');
      var selectedRowNum = patchNum;
      $(LIBRARIAN_ELEMENT_CLASSES.patchTableCell).eq(selectedRowNum).addClass('selected');
    } else {
      librarianCommonInfo.currentPatch = librarianCommonInfo.instLiveset.cell(librarianCommonInfo.settingMode, patchNum);
      $(LIBRARIAN_ELEMENT_CLASSES.patchTableCell).removeClass('selected');
    }
  }
};