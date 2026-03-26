/**
 * [概要]
 * LIBRARIAN画面の静的なDOMへのイベント紐づけ
 *
 * [使用箇所]
 * LIBRARIAN画面
 * 
 * [改善ポイント]
 * ・IDやCLASSを指定する際にLIBRARIANという接頭辞をつけているため、変数名が長くなり、可読性が低くなっている。
 * 
 */

/* To prevent error on ESLint */
/* global
  LIBRARIAN_ELEMENT_IDS, LIBRARIAN_ELEMENT_CLASSES, 
  CREATE_LIVESET_DIALOG, ERROR_DIALOG_MAP,
  librarianDynamicDOMController, librarianServices, librarianCommonInfo, librarianDOMController,
  patchModelController, midiConnectionController,
  LibrarianModel,
  pointer, popup_open, popup_close
 */

(function () {
  window.assignLibrarianStaticDOMEvents = function () {

    $(LIBRARIAN_ELEMENT_IDS.exportToInstBtn).ready(updateExportInstBtn());
    $(LIBRARIAN_ELEMENT_IDS.exportToFileBtn).ready(updateExportFileBtn());
    $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtn).ready(updateExportBtxBtn());
    $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtnLabel).ready(updateExportBtxBtnLabel());

    /**
     *  headerボタン切り替え時のイベント
     */
     $('#header-group-btn').on('elf-changed', function (e, v) {
      var userPatchSelectMenu = $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu);
      var userPatchSelectMenuCells = $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu + '> label');
      var isLibrarianDisplayed = v === 1;
      /**
       *  LIBRARIAN画面を表示しているときのみUSER PATCHへイベントを紐づける
       */
       librarianDynamicDOMController.assignUserPatchTableEvent(isLibrarianDisplayed);
      // LIBRARIANの情報をload
      if (isLibrarianDisplayed) {
        librarianServices.loadLivesetList();
        librarianServices.loadConfirmationKey();
        librarianDynamicDOMController.updateLivesetTableCell();
      }
    });
    /**
     *  CREATE LIVESETボタン押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.createLivesetDialogBtn).on(pointer.click, function (e) {
      e.preventDefault();
      // フォームを初期化
      $(LIBRARIAN_ELEMENT_IDS.createLivesetTextInput + ' input[type=text]').val("");
      popup_open(LIBRARIAN_ELEMENT_IDS.createLivesetDialog.slice(1));
    });
    /**
     *  CREATE LIVESETダイアログでOKボタン押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.createLivesetDialogBtn).on(pointer.click, function (e) {
      e.preventDefault();
      $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).removeClass('librarian-select-patch-cell-pc');
      CREATE_LIVESET_DIALOG.open(function (text) {
        librarianServices.createLiveset(text);
        librarianDynamicDOMController.updateLivesetTableCell();
      });
    });
    /**
     *  IMPORTボタン押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.importDialogBtn).on(pointer.click, function (e) {
      popup_open(LIBRARIAN_ELEMENT_IDS.importFromDialog.slice(1));
    });
    /**
     *  IMPORT FROMダイアログでDevice押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.importFromInstBtn).on(pointer.click, function (e) {
      popup_close(LIBRARIAN_ELEMENT_IDS.importFromDialog.slice(1));
      if (librarianCommonInfo.livesetList.length + 1 <= librarianCommonInfo.maxLivesetNum) {
        CREATE_LIVESET_DIALOG.open(function (text) {
          var liveset = new LibrarianModel(librarianCommonInfo.settingMode, false);
          liveset.setTitle(text);
          liveset.id = librarianServices.createLivesetId();
          var row = [];
          var config = window.modelInfo.config();
          for (var i = 0, len = patchModelController.getTotalUserPatch(); i < len; i++) {
            if (window.modelInfo) {
              if (! config.transferablePatch(i))  continue;
              if (! config.patchExist(i))         continue;
            }
            row.push(i);
          }
          librarianServices.importInst(liveset, row, 0, 1,
            function () {
              // 左側にLiveSetを追加してくため、unshiftを用いる
              librarianCommonInfo.livesetList.unshift(liveset);
              librarianServices.saveIdList();
              librarianDynamicDOMController.updateLivesetTableCell();
            },
            function () { }
            );
        });
      } else {
        ERROR_DIALOG_MAP.libraryFull.open();
      }
    });
    /**
     *  IMPORT FROMダイアログでFILE押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.importFromFileBtn).on(pointer.click, function (e) {
      librarianServices.importFile(
        function (json, name) {
          popup_close(LIBRARIAN_ELEMENT_IDS.importFromDialog.slice(1));
          var liveset = new LibrarianModel('', librarianCommonInfo.settingMode);
          liveset.load(json, name);
          liveset.id = librarianServices.createLivesetId();
          // 左側にLiveSetを追加してくため、unshiftを用いる
          if (liveset.rows(0) <= librarianCommonInfo.maxPatchNum) {
            librarianCommonInfo.livesetList.unshift(liveset);
            librarianServices.saveToStorage2(liveset);
            librarianServices.saveIdList();
            librarianDynamicDOMController.updateLivesetTableCell();
          }
          else {
            ERROR_DIALOG_MAP.libraryFull.open();
          }

        },
        function () {
          popup_close(LIBRARIAN_ELEMENT_IDS.importFromDialog.slice(1));
        }
        );
    });
    /**
     *  EXPORTボタン押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.exportDialogBtn).on(pointer.click, function (e) {
      librarianCommonInfo.export.targetLiveset = null;
      window.btxCommands.checkSignIn();
      popup_open(LIBRARIAN_ELEMENT_IDS.exportToDialog.slice(1));
      librarianDOMController.updateExportToInstButton(true);
      $(LIBRARIAN_ELEMENT_IDS.exportToFileBtn).addClass("disabled");
      $(LIBRARIAN_ELEMENT_IDS.exportLivesetSelectList + " p").text("");
      const livesetListAvailable = librarianCommonInfo.livesetList.filter(liveset => liveset.rows(librarianCommonInfo.settingMode) > 0);
      if (librarianCommonInfo.livesetList.length > 0 && livesetListAvailable.length > 0) {
        $(LIBRARIAN_ELEMENT_IDS.exportLivesetSelectList).removeClass("disabled");
        librarianDynamicDOMController.updateSelectLivesetList();
      } else {
        $(LIBRARIAN_ELEMENT_IDS.exportLivesetSelectList).addClass("disabled");
      }

      // btx
      $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtn).addClass("disabled");
    });
    /**
     *  EXPORT TOダイアログでLIVESETセレクトリスト更新時の処理
     */
     $(document).on('elf-changed', LIBRARIAN_ELEMENT_IDS.exportLivesetSelectList, function (e, v) {
      const livesetListAvailable = librarianCommonInfo.livesetList.filter(liveset => liveset.rows(librarianCommonInfo.settingMode) > 0);
      librarianCommonInfo.export.targetLiveset = livesetListAvailable[v];
      if (midiConnectionController.getCurrentMIDI() != null) {
        librarianDOMController.updateExportToInstButton(false);
      }
      $(LIBRARIAN_ELEMENT_IDS.exportToFileBtn).removeClass("disabled");
      
      if ($(LIBRARIAN_ELEMENT_IDS.exportToBtxBtnLabel).find('p').text() === "") {
        $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtn).removeClass("disabled");
      }
    });
    /**
     *  EXPORT TOダイアログでDeviceを押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.exportToInstBtn).on(pointer.click, function (e) {
      popup_close(LIBRARIAN_ELEMENT_IDS.exportToDialog.slice(1));
      librarianCommonInfo.export.instPatchIndex = 0;
      var config = window.modelInfo.config();
      for (var i = 0, len = patchModelController.getTotalUserPatch(); i < len; i++) {
        if (! config.transferablePatch(i))  continue;
        librarianCommonInfo.export.instPatchIndex = i;
        break;
      }
      librarianCommonInfo.export.targetPatches = librarianCommonInfo.export.targetLiveset.cells[librarianCommonInfo.settingMode];
      librarianServices.exportInst(
        function () {
          $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu + '> label').on('mousedown.librarian', function (e) {
            _librarianSelectUserPatchEvent(e, $(this));
          });
        },
        function () { }
        );
    });
    /**
     *  EXPORT TOダイアログでFILEを押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.exportToFileBtn).on(pointer.click, function (e) {
      librarianServices.exportFile(librarianCommonInfo.export.targetLiveset,
        function () {
          popup_close(LIBRARIAN_ELEMENT_IDS.exportToDialog.slice(1));
        },
        function () {
          popup_close(LIBRARIAN_ELEMENT_IDS.exportToDialog.slice(1));
        }
        );
    });

    /**
     *  EXPORT TO BTX
     */
    $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtn).on(pointer.click, function (e) {
      librarianServices.exportBtx(librarianCommonInfo.export.targetLiveset);
    });

    /**
     *  LiveSetのEditボタン押下時の処理
     */
     $(LIBRARIAN_ELEMENT_CLASSES.editLivesetBtn).on(pointer.down, function (e) {
      e.preventDefault();
      e.stopPropagation();
      var cell = $(this).parent();
      _changeLivesetCellMode(1, cell);
    });
    /**
     *  LiveSetのRenameボタン押下時の処理
     */
     $(LIBRARIAN_ELEMENT_CLASSES.renameLivesetCheckBtn).on(pointer.down, function (e) {
      e.preventDefault();
      e.stopPropagation();
      var cell = $(this).parent();
      _changeLivesetCellMode(0, cell);
    });
    /**
     *  LiveSetのRename InputTextにフォーカスを当てた時の処理
     */
     $(LIBRARIAN_ELEMENT_CLASSES.renameLivesetInputText).on(pointer.down, function (e) {
      e.stopPropagation();
    });
    /**
     *  LiveSetのRename InputTextにフォーカスを当てた状態でEnterを押下時の処理
     */
     $(LIBRARIAN_ELEMENT_CLASSES.renameLivesetInputText).on('keydown', function (e) {
      if (e.keyCode === 13) {
        var cell = $(this).parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell);
        _changeLivesetCellMode(0, cell);
      }
    });
    /**
     *  LiveSetの削除確認ダイアログでOKボタンを押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.deleteLivesetBtn).on(pointer.click, function (e) {
      var cell = $(LIBRARIAN_ELEMENT_CLASSES.targetDeleteLiveset);
      var index = cell.index();
      cell.remove();
      librarianDynamicDOMController.sortableLivesetTableCell();
      $native.app.storage2(librarianCommonInfo.livesetList[index].id, '');
      librarianServices.deleteLiveset(index);
      librarianServices.saveIdList();
      popup_close(LIBRARIAN_ELEMENT_IDS.deleteLivesetDialog.slice(1));
    });
    /**
     *  Patchの削除確認ダイアログでOKボタンを押下時の処理
     */
     $(LIBRARIAN_ELEMENT_IDS.deletePatchBtn).on(pointer.click, function () {
      $(LIBRARIAN_ELEMENT_CLASSES.patchTable).sortable('enable');
      $(LIBRARIAN_ELEMENT_CLASSES.userPatchTable).sortable('enable');
      $(LIBRARIAN_ELEMENT_IDS.livesetTable).sortable('enable');
      var currentLivesetCell = librarianCommonInfo.editedPatchCell[0].parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell);
      var livesetIndex = librarianCommonInfo.editedPatchCell[0].parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).index();
      var currentLiveset = librarianCommonInfo.livesetList[livesetIndex];
      librarianCommonInfo.editedPatchCell.forEach(function (patch, index) {
        var patchIndex = patch.index();
        librarianServices.deletePatch(currentLiveset, patchIndex);
        patch.remove(); // Patch Tableから削除
      });
      $(currentLivesetCell).find('.librarian-patch-num-pc').text(currentLiveset.rows(librarianCommonInfo.settingMode));
      librarianDynamicDOMController.sortablePatchTableCell(currentLivesetCell);
      $native.app.control('indicator start');
      librarianServices.saveToStorage2(currentLiveset);
      $native.app.control('indicator stop');
      popup_close(LIBRARIAN_ELEMENT_IDS.deletePatchDialog.slice(1));
    });
    /**
     *  LIBRARIAN画面内を押下時の処理(Editモードの解除)
     */
     $(LIBRARIAN_ELEMENT_IDS.librarianPage).on(pointer.down, function () {
      var editPatchBtnHidden = $(LIBRARIAN_ELEMENT_CLASSES.editPatchBtn + ':hidden');
      var editingPatch = editPatchBtnHidden.parents(LIBRARIAN_ELEMENT_CLASSES.patchCell);
      if (editingPatch.length) {
        _changePatchCellMode(0, editingPatch);
      }
      var editLivesetBtnHidden = $(LIBRARIAN_ELEMENT_CLASSES.editLivesetBtn + ':hidden');
      var editingLiveset = editLivesetBtnHidden.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell);
      if (editingLiveset.length) {
        _changeLivesetCellMode(0, editingLiveset);
      }
    });
  }

  
  /* EXPORT先BTX選択ボタン */
  EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.exportStatusChanged, (e) => {
    let value = e.detail.value;
    switch (value) {
      case BTX_EXPORT_STATUS.CHECKING_SIGN_IN:
        $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtn).addClass('disabled');
        $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtnLabel).find('p').text("Checking");
        break;
      case BTX_EXPORT_STATUS.NOT_READY:
        $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtnLabel).find('p').text("Please\nSignIn");
        break;
      case BTX_EXPORT_STATUS.READY:
        $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtnLabel).find('p').text("");
        // $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtn).removeClass('disabled');
        if (librarianCommonInfo.export.targetLiveset) {
          $(LIBRARIAN_ELEMENT_IDS.exportToBtxBtn).removeClass('disabled');
        }
        break;
      default:
        /* EXPORT TOダイアログが表示されないので何もしなくてよい */
        break;
    }
  });

  const _updateItemBtxClass = (id, btxEnableClass, btxDisableClass) => {
    $(id).removeClass(btxEnableClass);
    $(id).removeClass(btxDisableClass);

    if (window.btxStatus.chinaRegionCheck == BTX_CHINA_REGION_CHECK.NOT_CHINA) {
        $(id).addClass(btxEnableClass);
    }
    else {
        $(id).addClass(btxDisableClass);
    }
  };

  const updateExportInstBtn = () => {
    _updateItemBtxClass(LIBRARIAN_ELEMENT_IDS.exportToInstBtn, 'btx-enable-export-inst-btn', 'btx-disable-export-inst-btn');
  };

  const updateExportFileBtn = () => {
    _updateItemBtxClass(LIBRARIAN_ELEMENT_IDS.exportToFileBtn, 'btx-enable-export-file-btn', 'btx-disable-export-file-btn');
  };

  const updateExportBtxBtn = () => {
    _updateItemBtxClass(LIBRARIAN_ELEMENT_IDS.exportToBtxBtn, 'btx-enable-export-btx-btn', 'btx-disable-export-btx-btn');
  };

  const updateExportBtxBtnLabel = () => {
    _updateItemBtxClass(LIBRARIAN_ELEMENT_IDS.exportToBtxBtnLabel, 'btx-enable-export-btx-btn', 'btx-disable-export-btx-btn');
  };

  EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.BTX).addEventListener(EVENT_BTX.chinaRegionCheckChanged, (e) => {
    updateExportInstBtn();
    updateExportFileBtn();
    updateExportBtxBtn();
    updateExportBtxBtnLabel();
});
 }());