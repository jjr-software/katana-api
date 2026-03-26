
/**
 * [概要]
 * LIBRARIAN画面で使用するグローバル変数定義
 *
 * [使用箇所]
 * LIBRARIAN画面
 *
 */

(function() {
  window.LIBRARIAN_ELEMENT_IDS = Object.freeze({
    livesetTableFrame: "#librarian-liveset-table-frame", // liveset table frame
    createLivesetDialogBtn: "#librarian-create-liveset-dialog-btn",
    importBtn: "#librarian-import-btn",
    exportBtn: "#librarian-export-btn",
    // create Liveset
    createLivesetDialog: "#librarian-create-liveset-dialog",
    createLivesetTextInput: "#librarian-create-liveset-text-input",
    createLivesetBtn: "#librarian-create-liveset-btn",
    // rename Liveset
    renameLivesetDialog: "#librarian-liveset-rename-dialog",
    renameLivesetTextInput: "#librarian-liveset-rename-text-input",
    renameLivesetCancelBtn: "#librarian-liveset-rename-cancel-btn",
    renameLivesetBtn: "#librarian-liveset-rename-btn",
    // rename Patch
    renamePatchDialog: "#librarian-patch-rename-dialog",
    renamePatchTextInput: "#librarian-patch-rename-text-input",
    renamePatchCancelBtn: "#librarian-patch-rename-cancel-btn",
    renamePatchBtn: "#librarian-patch-rename-btn",
    // delete Liveset
    deleteLivesetDialog: "#librarian-delete-liveset-dialog",
    deleteLivesetBtn: "#librarian-delete-liveset-btn",
    // delete Patch
    deletePatchDialog: "#librarian-delete-patch-dialog",
    deletePatchBtn: "#librarian-delete-patch-btn",
    // import
    importDialogBtn: "#librarian-import-dialog-btn",
    importFromDialog: "#librarian-import-from-dialog",
    importFromInstBtn: "#librarian-import-from-inst-btn",
    importFromFileBtn: "#librarian-import-from-file-btn",
    // export
    exportDialogBtn: "#librarian-export-dialog-btn",
    exportLivesetSelectList: "#librarian-export-select-liveset-list",
    exportToDialog: "#librarian-export-to-dialog",
    exportToInstBtn: "#librarian-export-to-inst-btn",
    exportToFileBtn: "#librarian-export-to-file-btn",
    livesetTable: "#librarian-liveset-table",
    subPage: "#sub",
    librarianPage: "#librarian",
    userPatchSelectMenu: '#user-patch-select-menu',
    userPatch: "#patch-list",

    /** btx */
    exportToBtxBtn: "#librarian-export-to-btx-btn",
    exportToBtxBtnLabel: '#librarian-export-to-btx-btn-label',
  });
  window.LIBRARIAN_ELEMENT_CLASSES = Object.freeze({
    instCell: ".librarian-inst-cell",
    livesetTableCell: ".librarian-liveset-table-cell-pc",
    livesetTableCellTwoLine: ".librarian-liveset-table-cell-two-line-pc",
    patchTableCell: ".librarian-patch-table-cell-pc",
    editLivesetTableCell: ".librarian-edit-liveset-table-cell-pc",
    editLivesetTableCellTwoLine: ".librarian-edit-liveset-table-cell-two-line-pc",
    editPatchTableCell: ".librarian-edit-patch-table-cell-pc",
    livesetInfoBlock: ".librarian-liveset-info-block-pc",
    livesetInfo: ".librarian-liveset-info-pc",
    livesetName: ".librarian-liveset-name-pc",
    renameLivesetBtn: ".librarian-rename-liveset-btn-pc",
    renameLivesetCheckBtn: ".librarian-rename-liveset-check-btn-pc",
    renameLivesetInputText: ".rename-liveset-input-text",
    deleteLivesetBtn: '.librarian-delete-liveset-btn-pc',
    renamePatchBtn: ".librarian-rename-patch-btn-pc",
    patchListBtn: ".patch-list-btn",
    livesetSelectorOption: ".bts-librarian-select-liveset-list-style-pc-option",
    patchTable: ".librarian-patch-table-pc",
    userPatchTable: ".librarian-user-patch-table-pc",
    patchCell: ".librarian-patch-cell-pc",
    patchName: ".librarian-patch-name-pc",
    renamePatchCheckBtn: ".librarian-rename-patch-check-btn-pc",
    editPatchBtn: ".librarian-edit-patch-btn-pc",
    editLivesetBtn: ".librarian-edit-liveset-btn-pc",
    livesetTableCellSelect: '.librarian-select-liveset-pc',
    livesetSelectorPopup: ".bts-librarian-select-liveset-list-style-popup",
    renamePatchInputText: ".rename-patch-input-text",
    deletePatchBtn: ".librarian-delete-patch-btn-pc",
    updatePatchCell: '.librarian-update-patch-cell-pc',
    selectPatchCell: '.librarian-select-patch-cell-pc',
    targetDeleteLiveset: ".librarian-target-delete-liveset-pc",
    selectUserPatch: '.librarian-select-user-patch-cell',
    librarianUserPatchTable: '.librarian-user-patch-table'
  });
  // LIBRARIAN画面共通情報
  window.librarianCommonInfo = {
    librarians: [], // LibrarianObjects
    settingMode: 0, // LibrarianObjectのindex
    maxLivesetNum: 50, // LiveSetの上限
    maxPatchNum: 15, // Patchの上限
    instLiveset: {}, // UserDataのモデル
    livesetList: [], // LibrarianでLiveSetのリスト
    currentLiveset: {}, // フォーカスされているLiveset
    longPress: 500, // 長押し時間(ms)
    idListKey: 'ID_LIST', // IDリストのキー
    confirmationFragKey: 'CONFIRM_FLAG', // 確認ダイアログ表示フラグのキー
    /** import, export */
    import: {
      mode: 0, // 0: device, 1: FILE
      startIndex: 0 // patchを上書きする際の開始位置
    },
    export: {
      mode: 0, // 0: device, 1: FILE
      targetLiveset: null, // exportするliveset
      instPatchIndex: 0, // exprotの開始位置(実機のpatchリスト)
      targetPatches: [], // exportするpatch
      getTargetInstPatches: function(limit) {
        var row = [];
        for (var i = this.instPatchIndex; i < limit; i++) {
          if (window.modelInfo) {
            if (! window.modelInfo.config().patchExist(i))  continue;
          }
          row.push(i);
          if (row.length >= this.targetPatches.length) {
            break;
          }
        }
        return row;
      }
    },
    editedPatchCell: [], // 現在編集中のPatchCell(DOM)
    lastSelectPatch: null,  //キーボード操作で最後に選択したPatch
    patchEditing: false, //Patch編集中
    confirmOverwrite: true, // 確認ダイアログを表示するかどうかのフラグ
    statusRename: true,
    // Mac: Command Key, Win: CTRL Key
    disContinuitySelectKey: function() {
      if (navigator.userAgent.indexOf('Chrome') > 0) {
        return 'ctrlKey';
      } else {
        return 'metaKey';
      }
    },
    selectKeyPressed: false // Win: Alt, Mac: Commandが押されているかどうかのフラグ
  };
  window.librarianDynamicDOMController = {};
  window.librarianObserver = {};
}());
