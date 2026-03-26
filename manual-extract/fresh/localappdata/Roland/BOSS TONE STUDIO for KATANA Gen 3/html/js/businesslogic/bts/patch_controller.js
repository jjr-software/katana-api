/**
 * [概要]
 * PATCHに関連する処理を定義
 *
 * [使用箇所]
 * initializePatch, assignPatchEventsはindex.jsで呼び出し
 */

 
/* To prevent error on ESLint */
/* global util, ProductSetting, Parameter, _bid, MIDIController, hex2,
  patchDOMController, patchModelController, patchMIDIController,
  librarianDynamicDOMController,
  midiConnectionController,
  btsDOMController,
  ERROR_DIALOG_MAP,
  ADDRESS_CONST,
 */

 (function() {
  // USER系のPATCH数
  var TOTAL_USER_PATCH = ProductSetting.librarian[0].config.rows;
  // PATCH名のデフォルト値
  var INITIAL_USER_PATCH_NAME = 'INIT TONE SETTING';

  // 現在選択中のPATCH
  var currentPatchNum = 0;
  // 現在選択中のPATCHの名前
  var currentPatchName = 'KATANA';
  // USER系のPATCH名
  var userPatchNames = [];

  var disabledWriteBtn = true;
  var disabledClearBtn = true;

  window.patchModelController = {
    /**
     * 上記クロージャ変数を取得、更新するメソッド群
     */
    // [使用箇所] midi_observe_controller.js
    updateCurrentPatch: function(num) {
      if (num >= 0 && num < TOTAL_USER_PATCH) {
        currentPatchNum = num;
      }
    },
    // [使用箇所] midi_observe_controller.js
    updateCurrentPatchName: function(name) {
      currentPatchName = name;
    },
    updateUserPatchNames: function(names) {
      if (names.length === TOTAL_USER_PATCH) {
        userPatchNames = names;
      }
    },
    updateUserPatchName: function(name, index) {
      if (index < TOTAL_USER_PATCH) {
        userPatchNames[index] = name;
      }
    },
    getUserPatchNames: function() {
      return userPatchNames;
    },
    getPatchName: function(i) {
      return userPatchNames[i];
    },
    getCurrentPatchNum: function() {
      return currentPatchNum;
    },
    getCurrentPatchName: function() {
      // return userPatchNames[currentPatchNum];
      return currentPatchName;
    },
    getInitUserPatchName: function(index) {
      return INITIAL_USER_PATCH_NAME;
    },
    getTotalUserPatch: function(){
      return TOTAL_USER_PATCH;
    },

    // [01-01]などのPATCH名の前に付く表示をPATCH番号から算出
    getPrefix: function(num) {
      if (window.modelInfo) {
        var info = window.modelInfo.config();
        var bankCh = info.getBankCh(num);
        if (bankCh) {
          var bank = info.bankName(bankCh.bank);
          if ((bankCh.ch < 0) || (info.numOfFixedCh(bankCh.bank) <= 1)) {
            return bank;
          }
          return bank + ': CH-'+ (bankCh.ch + 1);
        }
      }
      return num + 1;
    },
    getCurrentPatchPrefix: function() {
      return this.getPrefix(currentPatchNum);
    }
  };

  for (var i = 0; i < TOTAL_USER_PATCH; i++) {
    userPatchNames.push(patchModelController.getInitUserPatchName(i));
  }

  /**
   * 初期表示
   * [使用箇所] index.jsで呼び出し
   */
  window.initializePatch = function() {
    patchDOMController.updatePatchSelectPage();
    patchDOMController.updateCurrentPatchDOM();
  };

  /**
   * イベントリスナーを登録
   * [使用箇所] index.jsで呼び出し
   */
  window.assignPatchEvents = function() {
    // USER系PATCHの変更
    $('#user-patch-select-menu').on('elf-changed', function(e, v) {
      patchModelController.updateCurrentPatch(v);
      patchDOMController.updateCurrentPatchDOM();
      patchMIDIController.updateCurrentPatch(v);
    });

    $('#user-patch-select-menu-watcher').on('elf-changed', function(e, v) {
      patchModelController.updateCurrentPatch(v);
      patchDOMController.updateCurrentPatchDOM();
    });

    // WRITEダイアログ
    $("#write-btn").on('click', function(e){
      e.preventDefault();
      var newName = $('#write-dialog-patch-name input').val();
      var selectedNum = 0;
      $('#write-dialog-patch-select-list a').each(function(index, elm) {
        if ($(elm).attr('checked') === 'checked') {
          selectedNum = index;
        }
      });
      patchMIDIController.sendPatchName(newName);
      patchMIDIController.writePatch(selectedNum,newName);
    });

    // CLEARダイアログ
    $('#write-clear-btn').on('click',function(e){
      patchMIDIController.clearPatch();
    });
  };
  

  window.patchDOMController = {
    // PATCH選択画面のPATCH名の更新
    updatePatchSelectPage: function() {
      var userPatchHTML = '';

      for (var j = 0; j < TOTAL_USER_PATCH; j++) {
        userPatchHTML += updateEachPatchNameHTML('user', j);
      }

      $('#user-patch-select-menu').empty().append(userPatchHTML);

      function updateEachPatchNameHTML(type, index) {
        var html = '<input type="radio" id="' + type + '-patch-select-menu-' + (index % 250) + '" name="' + type + '-patch-select-menu" value="' + (index % 250) + '">';
        html += '<label for="' + type + '-patch-select-menu-' + (index % 250) + '" class="elf-radio-button-item" msg style="width: 100%; height: 0.4%; line-height: 48px;'
        if (window.modelInfo) {
          if (! window.modelInfo.config().patchExist(index)) {
            html += ' display: none;';
          }
        }
        html += '">';
        html += '<div class="patch-prefix" style="font-family:\'RobotoCondensedBold\';">' + patchModelController.getPrefix(index) + '</div>';
        html += '<div class="patch-name">' + patchModelController.getPatchName(index) + '</div>';
        html += '</label>';
        return html;
      }
      var isLibrarianDisplayed = $('#librarian').css('display') === 'block';
      if(isLibrarianDisplayed) {
        // LIBRARIAN画面以外で処理を走らせないため
        librarianDynamicDOMController.assignUserPatchTableEvent(true);
      }
    },
    // PATCH選択画面のチェックの更新
    updatePatchSelectPageCheck: function() {
      if (patchModelController.getCurrentPatchNum() < TOTAL_USER_PATCH) {
        $('#user-patch-select-menu').find('input').eq(patchModelController.getCurrentPatchNum()).prop('checked', true);
        $('#preset-patch-select-menu').find('input').prop('checked', false);
      } else {
        $('#preset-patch-select-menu').find('input').eq(patchModelController.getCurrentPatchNum() - TOTAL_USER_PATCH).prop('checked', true);
        $('#user-patch-select-menu').find('input').prop('checked', false);
      }
    },
    // EDITORトップ画面のPATCH名の更新
    updateTopPageText: function() {
      var patchSelectBtn = $('#current-patch-name-label').find('p');
      var prefixHtml = ''
      if(patchModelController.getCurrentPatchPrefix()!=''){
        prefixHtml = '<div class="prefix"><span>[</span>' + patchModelController.getCurrentPatchPrefix() + '<span>]</span></div>';
      }
      var patchNameDOM = $('<div>').addClass('patch-name').text( patchModelController.getCurrentPatchName());
      patchSelectBtn.html(prefixHtml);
      patchSelectBtn.append(patchNameDOM);
    },
    // ヘッダー部WRITEボタンの更新
    updatePatchWriteButton: function(disabled) {
      if (disabled !== undefined) {
        disabledWriteBtn = disabled;
      }
      var stat = disabledWriteBtn;
      if (btsDOMController.getAmpInSlaveMode()) {
        stat = true;  // disable
      }
      if (stat) {
        $('#patch-write-btn').addClass('disabled');
        $('#patch-write-btn-mask').css('display', 'block');
      } else {
        $('#patch-write-btn').removeClass('disabled');
        $('#patch-write-btn-mask').css('display', 'none');
      }
    },
    // ヘッダー部CLEARボタンの更新
    updatePatchClearButton: function(disabled) {
      if (disabled !== undefined) {
        disabledClearBtn = disabled;
      }
      var stat = disabledClearBtn;
      if (btsDOMController.getAmpInSlaveMode()) {
        stat = true;  // disable
      }
      if (stat) {
        $('#patch-clear-btn').addClass('disabled');
        $('#patch-clear-btn-mask').css('display', 'block');
      } else {
        $('#patch-clear-btn').removeClass('disabled');
        $('#patch-clear-btn-mask').css('display', 'none');
      }
      },
    // WRITEダイアログ内のPATCH名、CURRENT PATCHの更新
    updateWriteDialog: function() {
      var writeDialogInput = $('#write-dialog-patch-name').find('input');
      var writeDialogSelectRows = $('#write-dialog-patch-select-list').find('div').find('a');
      var writeDialogSelector = $('#write-dialog-patch-select');
      var index = currentPatchNum % TOTAL_USER_PATCH;
      writeDialogInput.val(patchModelController.getCurrentPatchName().trim());
      writeDialogSelectRows.attr('checked', false);
      writeDialogSelectRows.eq(index).attr('checked', true);
      var s = writeDialogSelectRows.eq(index).text();
      var v = index;
      setTimeout(function() {
        writeDialogSelector.find('p').text(s);
        writeDialogSelector.trigger('elf-change', v);
      }, 0);
    },
    // CurrentPatchNumber変更時のDOMの更新
    // [使用箇所] midi_observe_controller.js
    updateCurrentPatchDOM: function() {
      this.updatePatchSelectPageCheck();
      this.updateTopPageText();
      this.updateWriteDialog();
    },
    // CurrentPatchName変更時のDOMの更新
    // [使用箇所] midi_observe_controller.js
    updateCurrentPatchNameDOM: function() {
      this.updateTopPageText();
      this.updateWriteDialog();
    },
  };
  window.patchMIDIController = {
    /**
     * PATCH名の取得処理
     * @param successFunc 成功時に呼び出されるコールバック関数
     * @param errorFunc エラー時に呼び出されるコールバック関数
     * @returns {Function} Cancel時の呼び出すべき関数をreturn
     */
     fetchPatchNames: function(successFunc, errorFunc) {
      var userPatchNames = [];
      var indexPatch = 0;
      var observer = {
        notify: function(bid, start, end) {
          var _$ = ProductSetting.librarian[0].config.blockSet[0].split('%');
          var patchNow = _bid(_$[0], indexPatch);
          if(bid.indexOf(patchNow) != -1 ){
            var value = Parameter.value(bid+'%0', 16, 0);
            if(value.trim() != ''){
              userPatchNames.push(value);
            }else{
              userPatchNames.push(INITIAL_USER_PATCH_NAME);
            }
            indexPatch++;
          }
        }
      };
      Parameter.addObserver(observer);

      var getNameFunc = midiConnectionController.readEditor([2], function() {
        patchModelController.updateUserPatchNames(userPatchNames);
        patchDOMController.updatePatchSelectPage();
        patchDOMController.updateCurrentPatchDOM();
        Parameter.removeObserver(observer);

        if (successFunc !== undefined && typeof successFunc === 'function') {
          successFunc(userPatchNames);
        }
      }, function() {
        Parameter.removeObserver(observer);
        if (errorFunc !== undefined && typeof errorFunc === 'function') {
          errorFunc(userPatchNames);
        }
      });

      return function() {
        getNameFunc();
        Parameter.removeObserver(observer);
      };
    },
    // CurrentPatchNumberの更新(直後にRQ1で取得)
    updateCurrentPatch: function(v) {
      MIDIController.dt1(nibble(ADDRESS_CONST.COMMAND.PATCH_SELECT), '00'+hex2(v));
    },
    // CurrentPatchNameに対するRQ1送信
    requestCurrentPatchName: function() {
      MIDIController.rq1(nibble(ADDRESS_CONST.ADDRESS.CURRENT_PATCH_NAME), nibble(16));
    },
    // CurrentPatchNameに対するDT1送信
    sendPatchName: function(name) {
      name = util.convert2AsciiOnlyStr(name).slice(0, 16);
      var nameHex = util.convert2NameHex(name);
      MIDIController.dt1(nibble(ADDRESS_CONST.ADDRESS.CURRENT_PATCH_NAME), nameHex);
    },
    setCurrentPatch: function(v) {
      MIDIController.dt1(nibble(ADDRESS_CONST.COMMAND.CURRENT_PATCH_NUMBER), '00'+hex2(v));
    },
    _convert2RawCurrentPatchNum: function (patchNum) {
      return '00' + hex2(patchNum);
    },
    sendCommandPreviewMute(val = 1) {
      return new Promise(function(resolve, reject) {
        MIDIController.dt1(nibble(ADDRESS_CONST.COMMAND.CMDID_PREVIEW_MUTE), hex2(val));
        resolve();
      })
    },
    async sendCommandExport(isMultiple, isPreview, isUnmute, v, successFunc, errorFunc) {
      if (isPreview) {
        await patchMIDIController.sendCommandPreviewMute();
      }
      let hexVal = isMultiple ? '7F7F' : (isUnmute ? ('40' + hex2(v)) : ('00' + hex2(v)));
      util.waitForDT1Reply(ADDRESS_CONST.COMMAND.CMDID_EXPORT, hexVal, {
        isSucceeded: function (msg) {
          return msg.indexOf(util.convert2AddrStr(ADDRESS_CONST.COMMAND.CMDID_EXPORT)) >= 0;
        },
        success: async function (msg) {
          successFunc(v);
        },
        error: function () {
          errorFunc(v);
        }
      })
    },
    // WRITEコマンド送信
    writePatch: function(value, newName){
      btsDOMController.openLoading();
      var writeFunc = util.waitForDT1Reply(ADDRESS_CONST.COMMAND.PATCH_WRITE, '00' + hex2(value), {
        isSucceeded: function (msg) {
          return msg.indexOf(util.convert2AddrStr(ADDRESS_CONST.COMMAND.PATCH_WRITE)) >= 0;
        },
        success: function (msg) {
          patchMIDIController.sendCommandExport(false, true, true, value, function () {
            userPatchNames[value] = newName;
            patchModelController.updateUserPatchNames(userPatchNames);
            patchDOMController.updatePatchSelectPage();
            patchDOMController.updateCurrentPatchDOM();
            $('#user-patch-select-menu').trigger('elf-change', value);
            btsDOMController.closeLoading();
          }, function () {
            window.patchFailure = [patchModelController.getPrefix(value)];
            btsDOMController.closeLoading();
            ERROR_DIALOG_MAP.communicationErrorOther.open(function () {
            }, function () {
              patchMIDIController.writePatch(value, newName);
            })
          });
        },
        error: function () {
          window.patchFailure = [patchModelController.getPrefix(value)];
          btsDOMController.closeLoading();
          ERROR_DIALOG_MAP.communicationErrorOther.open(function () {
          }, function () {
            patchMIDIController.writePatch(value, newName);
          });
        }
      });
    },
    // CLEARコマンド送信
    clearPatch: function() {
      const currentPatchNumber = 0; // DUMMY
      const valHex = this._convert2RawCurrentPatchNum(currentPatchNumber);
      let errorFunc = function () {
        ERROR_DIALOG_MAP.communicationError.open(function () {
        }, function () {
          patchMIDIController.clearPatch();
        });
      };
      processingController.start(function (index) {
        let clearFunc = util.waitForDT1Reply(ADDRESS_CONST.COMMAND.PATCH_CLEAR, valHex, {
          isSucceeded: function (msg) {
            return msg.indexOf(util.convert2AddrStr(ADDRESS_CONST.COMMAND.PATCH_CLEAR)) >= 0;
          },
          success: function (msg) {
            processingController.finish(index);
          },
          error: function () {
            processingController.finish(index);
            errorFunc();
          }
        });

        return clearFunc;
      });
    }
  };
})();

