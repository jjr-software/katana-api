/**
 * [概要]
 * 汎用的なDOM処理の関数を定義
 *
 * [使用箇所]
 * customizeUIParts, initializeOtherDOM, assignOtherEventsはindex.jsから呼び出す
 * その他下記参照
 */

 (function () {
  // ID定義
  var IDS = {
    splash: '#splash',
    connection: '#connection',
    top: '#top',
    loading: '#loading',
    clear_popup: '#write-clear-dialog',
    write_popup: '#write-dialog',
    top_title: '#top-header-title-label',
  };
  // Splash画面のクロスフィード時間(msec)
  var CROSS_FEED_MSEC = 200;
  // AMP IN MODE用
  var ampInSlaveMode = {
    status: false,
    shownItems: [
      'patch-list-mask-frame',
      'current-patch-name-label',
      'editor-upper-mask-frame',
      'editor-middle-mask-frame',
      'editor-lower-mask-frame',
      'global-eq-content-mask-frame',
      'all-data-backup-content-mask-frame',
    ],
    hiddenItems: [
      'current-patch-name-label',
    ],
    disableKnobs: [
      'usb-setting-dry-out-level-dial',
      'usb-setting-to-effect-level-dial',
    ],
  };

  window.btsDOMController = {
    // Splash画面を閉じる
    closeSplashPage: function() {
      $(IDS.connection).fadeIn(CROSS_FEED_MSEC);
      $(IDS.splash).fadeOut(CROSS_FEED_MSEC);
    },
    // 初回接続ダイアログ表示中の真っ黒な画面を閉じる
    closeConnectingPage: function() {
      $(IDS.top).fadeIn(CROSS_FEED_MSEC);
      $(IDS.connection).fadeOut(CROSS_FEED_MSEC);
    },
    /**
     * Loading中の表示
     * [ケアポイント] 基本的には直接用いずprocessing_controllerを介する
     */
    openLoading: function() {
      popup_open(IDS.loading.slice(1));
    },
    /**
     * Loading中の表示を消す
     * [ケアポイント] 基本的には直接用いずprocessing_controllerを介する
     */
    closeLoading: function() {
      popup_close(IDS.loading.slice(1));
    },
    /**
     * Writeボタン押下時のメニューを閉じる
     * [使用箇所] 強制的に閉じる箇所で用いる
     */
    closeWritePopupMenu: function() {
    },

    // Menuを閉じる内部関数
    _closePopupMenu: function(matchFunc) {
      var selectPopup = $('.select-popup-wrapper');
      if (selectPopup.length > 0) {
        selectPopup.each(function() {
          var popupId = $(this).children('div').attr('id');
          if (matchFunc(popupId)) {
            popup_close(popupId);
          }
        });
      }
    },
    /**
     * Temporaryを再取得時・完了時にに無効化・有効化する処理を列挙
     * [使用箇所] Temporaryの再取得時とその完了時(midi_observer_controller.js)
     */
    disableBtnByTemporaryDT1: function(disabled) {
      patchDOMController.updatePatchWriteButton(disabled);
      patchDOMController.updatePatchClearButton(disabled);
      librarianDOMController.updateImportFromInstButton(disabled);
      librarianDOMController.updateExportToInstButton(disabled);
      //chainModelController.disableDraggingBlock(disabled);
      //chainDOMController.disableDraggingBlock(disabled);
    },
    /**
     * トップタイトル変更
     */
    setTopTitle: function(title) {
      $(IDS.top_title).text(title);
    },
    /**
     * AMP IN SLAVE MODE
     */
    getAmpInSlaveMode: function() {
      return ampInSlaveMode.status;
    },
    setAmpInSlaveMode: function(on) {
      function disableDialStatus(id, disable) {
        var _$ = $('#' + id);
        _$.attr('disabled', disable);
        var label = _$.attr('description');
        if (label) {
          $('#' + label).attr('disabled', disable);
        }
      }

      ampInSlaveMode.status = on;
      if (ampInSlaveMode.status) {
        ampInSlaveMode.shownItems.forEach(function(id) {
          $('#' + id).show();
        });
        ampInSlaveMode.hiddenItems.forEach(function(id) {
          $('#' + id).hide();
        });
        ampInSlaveMode.disableKnobs.forEach(function(id) {
          disableDialStatus(id, true);
        });
        window.effectDOMController.updateEditorLowerPage(-1);
      }
      else {
        ampInSlaveMode.shownItems.forEach(function(id) {
          $('#' + id).hide();
        });
        ampInSlaveMode.hiddenItems.forEach(function(id) {
          $('#' + id).show();
        });
        ampInSlaveMode.disableKnobs.forEach(function(id) {
          disableDialStatus(id, false);
        });
        window.effectDOMController.updateEditorLowerPage();
      }
      this.disableBtnByTemporaryDT1();
    }
  };

  /**
   * 初期設定
   * [使用箇所] index.jsで呼び出し
   */
   window.initializeOtherDOM = function() {
    var dialClassSelector = [
      '.item-dial-style',
      '.bts-dial-style',
      '.bts-dial-2ctrl-style',
      '.bts-dial-dialog-style'
    ].join(',');
    $(dialClassSelector).append($('<div>').addClass('item-dial-style__shadow-overlap'));
    btsDOMController.setAmpInSlaveMode(false);
  };


  /**
   * イベントリスナーを追加
   * [使用箇所] index.jsで呼び出し
   */
   window.assignOtherEvents = function() {
    $('#header-group-btn').on('elf-changed', function (e, v) {
      if (v === 2) {
        // TONE CENTRAL
        $('#sub').hide();
        // $('#tone-central').show();
      } else {
        // $('#tone-central').hide();
        $('#sub').show();
      }
    });
    $('#amp-in-mode-switcher').on('elf-changed', function(e, v) {
      btsDOMController.setAmpInSlaveMode(v == 2 || v == 3);
    });
  }
})();
