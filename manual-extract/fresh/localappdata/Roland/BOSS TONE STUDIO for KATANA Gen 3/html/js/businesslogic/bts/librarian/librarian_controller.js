/**
 * [概要]
 * LIBRARIAN画面の初期設定、disable時の処理
 *
 * [使用箇所]
 * LIBRARIAN画面
 *
 * [改善ポイント]
 * ・今回扱うLIBRARIANで扱うLIBRARIANのmodeは一種類のみのため(All Data Backup, StompBox Data Backupを除く)、
 *  globalに定義する時に配列に格納しないようにしたほうが良い。
 * 
 */

(function() {
  var disableImportFromInstBtn = true;
  var disableExportToInstBtn = true;

  /**
   * Disconnectedになった場合の処理
   * すべてのダイアログを閉じるかつ現在通信を監視中のObserverを破棄し、
   * LiveSetリスト画面へ遷移する。
   */
  window.librarianForceTransition = function () {
    popup_close(LIBRARIAN_ELEMENT_IDS.createLivesetDialog.slice(1));
    popup_close(LIBRARIAN_ELEMENT_IDS.renameLivesetDialog.slice(1));
    popup_close(LIBRARIAN_ELEMENT_IDS.renamePatchDialog.slice(1));
    popup_close(LIBRARIAN_ELEMENT_IDS.deleteLivesetDialog.slice(1));
    popup_close(LIBRARIAN_ELEMENT_IDS.deletePatchDialog.slice(1));
    popup_close(LIBRARIAN_ELEMENT_IDS.importFromDialog.slice(1));
    popup_close(LIBRARIAN_ELEMENT_IDS.exportToDialog.slice(1));
    PROGRESS_DIALOG_MAP.closeAll();
    COMPLETE_DIALOG_MAP.closeAll();
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].cancel();
    librarianCommonInfo.librarians[librarianCommonInfo.settingMode].observers = [];
  };


  /* initialize */
  window.initLibrarian = function() {
    // Librarian Objectを作成し、グローバルに定義
    for (var i = 0; i < ProductSetting.librarian.length; i++) {
      librarianCommonInfo.librarians.push(new Librarian(ProductSetting.librarian[i].config));
    }
    // USER PATCHのmodelを生成
    librarianCommonInfo.instLiveset = new LibrarianModel('', true);
    assignLibrarianDynamicDOMController();
    assignLibrarianStaticDOMEvents();
    // librarianServices.initStorage2(); // Debug用

    // initial loading
    librarianServices.loadLivesetList();
  };


  window.librarianDOMController = {
    updateImportFromInstButton: function(disable) {
      if (disable !== undefined) {
        disableImportFromInstBtn = disable;
      }
      var stat = disableImportFromInstBtn;
      if (btsDOMController.getAmpInSlaveMode()) {
        stat = true;  // disable
      }
      var _$ = $(LIBRARIAN_ELEMENT_IDS.importFromInstBtn);
      if (stat) {
        _$.addClass('disabled');
      } else {
        _$.removeClass('disabled'); 
      }
      if (window.modelDOMController) {
        window.modelDOMController.updateIndivisual(LIBRARIAN_ELEMENT_IDS.importFromInstBtn);
      }
    },
    updateExportToInstButton: function(disable) {
      if (disable !== undefined) {
        disableExportToInstBtn = disable;
      }
      var stat = disableExportToInstBtn;
      if (btsDOMController.getAmpInSlaveMode()) {
        stat = true;  // disable
      }
      var _$ = $(LIBRARIAN_ELEMENT_IDS.exportToInstBtn);
      if (stat) {
        _$.addClass('disabled');
      } else {
        _$.removeClass('disabled'); 
      }
      if (window.modelDOMController) {
        window.modelDOMController.updateIndivisual(LIBRARIAN_ELEMENT_IDS.exportToInstBtn);
      }
    }
  };
})();

