/**
 * [概要]
 * MIDI接続処理全般
 *
 * [使用箇所]
 * 全体
 *
 * assignMIDIEventをindex.jsで呼び出し
 * midiConnectionController.startInitSetting()をindex.jsで呼び出し
 *
 */

/* to prevent error for eslint */
/* global $native, util, ProductSetting, hex2, Editor, pointer,
    popup_open, popup_close, closeNumpad, closeNumpadList,
    MIDIController, midiConnectionController, patchMIDIController,
    midiDOMController, patchDOMController, librarianDOMController, btsDOMController,
    toneCentralController, processingController,
    ADDRESS_CONST,
    ERROR_DIALOG_MAP,
 */

 (function() {
  /**
   * MIDI関連のHTML ID
   */
   var MIDI_ELEMENT_IDS = Object.freeze({
    midiConnectDialog: '#device-connect-select-dialog',
    midiConnectRefreshBtn: '#device-connect-select-dialog-refresh-btn',
    midiConnectSelector: '#device-connect-select-dialog-menu-btn',
    midiConnectCancelBtn: '#device-connect-select-dialog-cancel-btn',
    midiConnectOkBtn: '#device-connect-select-dialog-ok-btn',
    disconnectedMidiConnectDialog: '#disconnected-midi-connect-dialog',
    disconnectedMidiConnectRefreshBtn: '#disconnected-midi-connect-dialog-refresh-btn',
    disconnectedMidiConnectSelector: '#disconnected-midi-connect-dialog-selector',
    disconnectedMidiConnectCancelBtn: '#disconnected-midi-connect-dialog-cancel-btn',
    disconnectedMidiConnectOkBtn: '#disconnected-midi-connect-dialog-ok-btn',
    deviceErrMidiConnectDialog: '#device-err-midi-connect-dialog',
    deviceErrMidiConnectRefreshBtn: '#device-err-midi-connect-dialog-refresh',
    deviceErrMidiInputSelector: '#device-err-midi-connect-dialog-midi-in-selector',
    deviceErrMidiOutputSelector: '#device-err-midi-connect-dialog-midi-out-selector',
    deviceErrMidiConnectCancelBtn: '#device-err-midi-connect-dialog-cancel-btn',
    deviceErrMidiConnectOkBtn: '#device-err-midi-connect-dialog-ok-btn',
    connectionErrMidiConnectDialog: '#connection-err-midi-connect-dialog',
    connectionErrMidiConnectRefreshBtn: '#connection-err-midi-connect-dialog-refresh-btn',
    connectionErrMidiConnectSelector: '#connection-err-midi-connect-dialog-selector',
    connectionErrMidiConnectSelector2: '#connection-err-midi-connect-dialog-selector-2',
    connectionErrMidiConnectCancelBtn: '#connection-err-midi-connect-dialog-cancel-btn',
    connectionErrMidiConnectOkBtn: '#connection-err-midi-connect-dialog-ok-btn',
    menuMidiRefreshBtn: '#menu-device-setting-device-refresh-btn',
    menuMidiDeviceSelector: '#menu-device-setting-device-select',
    menuMidiInputSelector: '#menu-device-setting-midi-in-select',
    menuMidiOutputSelector: '#menu-device-setting-midi-out-select',
    menuMidiOkBtn: '#menu-device-setting-ok-btn',
    menuMidiOkMask: '#menu-device-setting-ok-mask',
    deviceNotFoundDialog: '#device-not-found-dialog',
    deviceNotFoundDialogRefreshBtn: '#device-not-found-dialog-refresh-btn',
    deviceNotFoundDialogOfflineModeBtn: '#device-not-found-dialog-offline-mode-btn',
  });
  /**
   * MIDI関連のHTML Class名
   */
   var MIDI_ELEMENT_CLASS_NAMES = Object.freeze({
    midiConnectSelectorOption: '.bts-small-select-list-small-font-style-option'
  });

  // 現在接続中のMIDI
  var currentMIDI = null;
  // 現在認識中のInputs
  var inputs = [];
  // 現在認識中のOutputs
  var outputs = [];
  // 初回起動時のフラグ
  var hasInitialized = false;
  window.currentMIDIConnect = null;

  function disabledTopWriteWhenOflineMode() {
    btsDOMController.disableBtnByTemporaryDT1(true);
    btsDOMController.setAmpInSlaveMode(false);
  }
  function enableTopWriteWhenConnect() {
    btsDOMController.disableBtnByTemporaryDT1(false);
  }

  window.midiConnectionController = {
    /**
     * 上記クロージャ変数を取得、更新するメソッド群
     */
     setCurrentMIDI: function(val) {
      currentMIDI = val;
      window.currentMIDIConnect = val;
    },
    getCurrentMIDI: function() {
      return currentMIDI;
    },
    setInputs: function(val) {
      inputs = val;
    },
    getInput: function(num) {
      return inputs[num] ? inputs[num] : null;
    },
    getInputs: function() {
      return inputs;
    },
    setOutputs: function(val) {
      outputs = val;
    },
    getOutput: function(num) {
      return outputs[num] ? outputs[num] : null;
    },
    getOutputs: function() {
      return outputs;
    },
    updateHasInitialized: function() {
      hasInitialized = true;
    },
    getHasInitialized: function() {
      return hasInitialized;
    },

    /**
     * midi接続処理を開始
     * @param input
     * @param output
     */
     connectMIDI: function(input, output) {
      // loading画面を開く
      btsDOMController.openLoading();

      // outputが引数として渡されない場合、選択したinputに一致するoutputを探す
      // (PC特有)
      var matchedOutput = output;
      if (matchedOutput === undefined) {
        matchedOutput = this._getMatchedOutput(input);
        if (matchedOutput === null) {
          btsDOMController.closeLoading();
          return;
        }
      }

      // nativeの接続
      $native.midi.input.connect(input);
      $native.midi.output.connect(matchedOutput);

      // storageに接続情報を反映
      util.writeStorage('input', input);
      util.writeStorage('output', matchedOutput);

      // MIDI通信処理開始
      // 終了時のコールバック関数を渡す
      // この中でcurrentMIDIを更新し、current patch numberのRQ1を送る
      this.startCommunication(function() {
        midiConnectionController.setCurrentMIDI(input);
        midiDOMController.updateCurrentMIDI();
      });
    },
    /**
     * MIDI接続解除
     */
     disconnectMIDI: function() {
      // nativeの接続解除
      $native.midi.input.disconnect();
      $native.midi.output.disconnect();
      this.setCurrentMIDI(null);

      // storageに反映
      util.writeStorage('input', null);
      util.writeStorage('output', null);

      midiDOMController.updateCurrentMIDI();
    },
    /**
     * 接続処理のシーケンス
     * @param finishFunc
     */
     startCommunication: function(finishFunc) {
      // CommunicationError発生時のダイアログ表示関数

      var communicationErrorFunc = function() {
        ERROR_DIALOG_MAP.communicationError.open(function() {
          midiConnectionController.disconnectMIDI();
        }, function() {
          btsDOMController.openLoading();
          util.waitForMIDIMsgReply(ADDRESS_CONST.IDENTITY_REQUEST, identityRequestObserver);
        });
        btsDOMController.closeLoading();
      };

      // DeviceInquiryのObserver
      var identityRequestObserver = {
        isSucceeded: function(msg) {
          // Replyの一部分が一致するかを判定
          var partOfIdentityReply = ADDRESS_CONST.PART_OF_IDENTITY_REPLY;
          if (msg.slice(0, 4) !== partOfIdentityReply.slice(0, 4))    return false;
          if (msg.slice(6, 16) !== partOfIdentityReply.slice(6, 16))  return false;
          if (window.modelInfo) {
            if (! window.modelInfo.setModel(msg.slice(20, 22)))  return false;
          }
          return true;
        },
        success: function(msg) {
          // DeviceIDを書き換え
          ProductSetting.deviceId = msg.slice(4, 6);
          // 後続処理へ
          util.waitForRQ1Reply(ADDRESS_CONST.COMMAND.EDITOR_COMMUNICATION_LEVEL, 1, editorCommunicationLevelObserver);
        },
        error: function() {
          // 接続を解除
          midiConnectionController.disconnectMIDI();
          // WrongDeviceダイアログを開く
          ERROR_DIALOG_MAP.wrongDeviceError.open(function() {
            ERROR_DIALOG_MAP.offLineMode.open();
            disabledTopWriteWhenOflineMode();
          }, function() {
            // midiConnectionController.connectCheckedEndpoint(MIDI_ELEMENT_IDS.deviceErrMidiInputSelector, MIDI_ELEMENT_IDS.deviceErrMidiConnectDialog, MIDI_ELEMENT_IDS.deviceErrMidiOutputSelector);
            midiConnectionController.connectCheckedEndpoint(MIDI_ELEMENT_IDS.connectionErrMidiConnectSelector2, MIDI_ELEMENT_IDS.deviceErrMidiConnectDialog);
          });
          btsDOMController.closeLoading();
        }
      };

      // EditorCommunicationLevel取得のObserver
      var editorCommunicationLevelObserver = {
        success: function(msg) {
          if (ProductSetting.developmentMode || (parseInt(msg) === ProductSetting.communicationLevel)) {
            // CommunicationModeを1に設定
            MIDIController.dt1(nibble(ADDRESS_CONST.COMMAND.EDITOR_COMMUNICATION_MODE), hex2(1));       
            if (ProductSetting.communicationRevision) {
              // communicationRevisionに対応している場合は後続処理
              util.waitForRQ1Reply(ADDRESS_CONST.COMMAND.EDITOR_COMMUNICATION_REVISION, 1, editorCommunicationRevisionObserver);
            } else {
              syncParameters();
            }
          } else if (parseInt(msg) < ProductSetting.communicationLevel) {
            // アプリのバージョンが上の場合
            // 接続を解除し、ダイアログを開く
            midiConnectionController.disconnectMIDI();
            ERROR_DIALOG_MAP.oldVersionOfInstrument.open(function() {
              ERROR_DIALOG_MAP.offLineMode.open();
              disabledTopWriteWhenOflineMode();
            });
            btsDOMController.closeLoading();
          } else if (parseInt(msg) > ProductSetting.communicationLevel) {
            // 実機のバージョンが上の場合
            // 接続を解除し、ダイアログを開く
            midiConnectionController.disconnectMIDI();
            ERROR_DIALOG_MAP.oldVersionOfBTS.open(function() {
              ERROR_DIALOG_MAP.offLineMode.open();
              disabledTopWriteWhenOflineMode();
            });
            btsDOMController.closeLoading();
          }
        },
        // Timeoutの場合
        error: function() {
          communicationErrorFunc();
        }
      };
      // EditorCommunicationRevision取得のObserver
      var editorCommunicationRevisionObserver = {
        success: function(msg) {
          if (parseInt(msg) <= ProductSetting.communicationRevision) {
            // アプリのリビジョンが上の場合
            /**
             * コンバート処理
             */
          }
          syncParameters();
        },
        error: function() {
          communicationErrorFunc();
        }
      };
      
      function syncParameters() {
        enableTopWriteWhenConnect();
        patchMIDIController.fetchPatchNames(function () {
          systemRead();
        }, function() {
          communicationErrorFunc();
        });
      }

      // Temporary, System, Statusを取得
      function systemRead() {
        window.isReadPatch0 = false;
        midiConnectionController.readEditor([4, 0, 1, 3], function () {
          btsDOMController.closeLoading();
          finishFunc();
          setupKnobModFxTargetList();
          // GA-FCの接続状態をRQ1
          MIDIController.rq1(nibble(ADDRESS_CONST.COMMAND.GAFC_TYPE), 1, function() {});
        }, function () {
          communicationErrorFunc();
        });
      } 

      // Loadingの画面を開く
      btsDOMController.openLoading();
      // DeviceInquiryを送信
      util.waitForMIDIMsgReply(ADDRESS_CONST.IDENTITY_REQUEST, identityRequestObserver);

    },
    /**
     * EditorReadを行う
     * @param indexes readするeditorのname(配列で渡す)
     * @param completeFunc 成功時に呼び出されるコールバック関数
     * @param errorFunc エラー時に呼び出されるコールバック関数
     * @param delayTime 遅延させる場合にmsecを渡す(現在使用箇所なし)
     * @returns {Function} Cancel時の呼び出すべき関数をreturn
     */
    readEditor: function(indexes, completeFunc, errorFunc, delayTime) {
      var editors = [];
      var observers = [];
      var completedNum = 0;
      var errorNum = 0;
      for (var i = 0; i < indexes.length; i++) {
        if (indexes[i] == 0) {
          window.isReadPatch0 = true;
        }
        editors.push(new Editor(ProductSetting.editor[indexes[i]].config));
      }
      for (var j = 0; j < indexes.length; j++) {
        observers.push({
          index: j,
          notify: function(msg, arg) {
            if (arg === 'end') {
              completedNum += 1;
              editors[this.index].removeObserver(observers[this.index]);
              if (this.index + 1 < indexes.length) {
                editors[this.index + 1].read();
                editors[this.index + 1].addObserver(observers[this.index + 1]);
              }
              if (completedNum === indexes.length) {
                if (completeFunc !== undefined && typeof completeFunc === 'function') {
                  window.isReadPatch0 = false;
                  completeFunc();
                }
              } else if (completedNum + errorNum === indexes.length) {
                if (errorFunc !== undefined && typeof errorFunc === 'function') {
                  window.isReadPatch0 = false;
                  errorFunc();
                }
              }
            } else if (msg === 'editor_cancel' || arg === 'timeout') {
              errorNum += 1;
              editors[this.index].removeObserver(observers[this.index]);
              if (this.index + 1 < indexes.length) {
                editors[this.index + 1].read();
                editors[this.index + 1].addObserver(observers[this.index + 1]);
              }
              if (completedNum + errorNum === indexes.length) {
                if (errorFunc !== undefined && typeof errorFunc === 'function') {
                  window.isReadPatch0 = false;
                  errorFunc();
                }
              }
            } else {
              // debug log
              // console.log(this.index, msg, arg);
            }
          }
        });
      }
      if (delayTime !== undefined) {
        setTimeout(function() {
          editors[0].read();
          editors[0].addObserver(observers[0]);
        }, delayTime);
      } else {
        editors[0].read();
        editors[0].addObserver(observers[0]);
      }
      return function() {
        editors.forEach(function(editor, i) {
          editor.removeObserver(observers[i]);
        });
      };
    },
    /**
     * 初回接続ダイアログを開く or Storageの情報を使って自動接続
     * index.jsで呼び出し
     */
     startInitSetting: function() {
      midiConnectionController.setInputs($native.midi.input.endpoints());
      midiConnectionController.setOutputs($native.midi.output.endpoints());
      midiDOMController.updateMIDISelector();

      // input, outputのどちらかが0件の場合はDeviceNotFoundのダイアログを開く
      if (midiConnectionController.getInputs().length === 0 || midiConnectionController.getOutputs().length === 0) {
        popup_open(MIDI_ELEMENT_IDS.deviceNotFoundDialog.slice(1));
        return;
      }

      // ストレージに保存されているMIDI情報を取得(ない場合はnull)
      var storedInput = null;
      var storedOutput = null;
      var storage = util.readStorage();
      if (storage.input !== undefined && storage.output !== undefined) {
        storedInput = storage.input;
        storedOutput = storage.output;
      }

      // ストレージに保存されたMIDIと一致するEndpointsがある場合は接続
      // 見つからない場合、ストレージに保存されていない場合はダイアログを開く
      if (storedInput !== null && storedOutput !== null) {
        var inputs = midiConnectionController.getInputs();
        var outputs = midiConnectionController.getOutputs();
        var matchedInput = null;
        var matchedOutput = null;
        for (var i = 0, l = inputs.length; i < l; i++) {
          if (inputs[i].MIDIEndpointUIDKey === storedInput.MIDIEndpointUIDKey) {
            matchedInput = inputs[i];
            break;
          }
        }
        for (var i = 0, l = outputs.length; i < l; i++) {
          if (outputs[i].MIDIEndpointUIDKey === storedOutput.MIDIEndpointUIDKey) {
            matchedOutput = outputs[i];
            break;
          }
        }
        if (matchedInput !== null && matchedOutput !== null) {
          // Input, Outputどちらも合致するものが見つかった場合
          btsDOMController.closeConnectingPage();
          this.connectMIDI(matchedInput, matchedOutput);
          midiConnectionController.updateHasInitialized();
        } else {
          // 一致するEndpointsが見当たらない場合
          midiDOMController.openInitialMIDIConnect();
        }
      } else {
        // ストレージに保存されていない場合
        midiDOMController.openInitialMIDIConnect();
      }
    },
    /**
     * 引数で与えられたSelectListのチェックのindexを取得し、
     * 該当するinputを使って接続
     * @param selectorId
     * @param dialogId
     */
     connectCheckedEndpoint: function(inputSelectorId, dialogId, outputSelectorId) {
      var inputCheckedNum = null;
      var outputCheckedNum = null;
      $(inputSelectorId + ' div a').each(function(index, elm) {
        if ($(elm).attr('checked') === 'checked') {
          inputCheckedNum = index;
        }
      });
      if (outputSelectorId !== undefined) {
        $(outputSelectorId + ' div a').each(function(index, elm) {
          if ($(elm).attr('checked') === 'checked') {
            outputCheckedNum = index;
          }
        });
        if (inputCheckedNum !== null && outputCheckedNum !== null) {
          var input = midiConnectionController.getInput(inputCheckedNum);
          var output = midiConnectionController.getOutput(outputCheckedNum);
          if (input !== null && output !== null) {
            popup_close(dialogId.slice(1));
            midiConnectionController.connectMIDI(input, output);
          }
        }
      } else {
        if (inputCheckedNum !== null) {
          var input = midiConnectionController.getInput(inputCheckedNum);
          if (input !== null) {
            popup_close(dialogId.slice(1));
            midiConnectionController.connectMIDI(input);
          }
        }
      }
    },
    // Refresh処理
    refresh: function() {
      /**
       * Endpointを更新
       */
       midiConnectionController.setInputs($native.midi.input.endpoints());
       midiConnectionController.setOutputs($native.midi.output.endpoints());

       midiDOMController.updateMIDISelector();

      /**
       * 初期画面の場合は終了
       */
       if (!midiConnectionController.getHasInitialized()) {
        return;
      }

      /**
       * currentMIDIがnullではなく(接続中と認識している)、一致するNameKeyがない場合はdisconnectedと判断
       */
       var currentMIDI = midiConnectionController.getCurrentMIDI();

       var hasConnected = midiConnectionController.getInputs().some(function(value) {
        return currentMIDI !== null && value.MIDIEntityNameKey === currentMIDI.MIDIEntityNameKey;
      });
       if (currentMIDI !== null && !hasConnected) {
        midiConnectionController.disconnectMIDI();
        midiDOMController.openDisconnectedDialog();
      }

    },
    /**
     * inputに一致するoutputを探す
     * (見つからない場合はnull)
     * @param input
     * @returns {*}
     * @private
     */
     _getMatchedOutput: function(input) {
      var replacedInputName = input.MIDIEntityNameKey.replace(/^\([\d]+\)$/g, '');
      var outputArray = this.getOutputs();
      for (var i = 0, l = outputArray.length; i < l; i++) {
        if (replacedInputName === outputArray[i].MIDIEntityNameKey) {
          return outputArray[i];
        }
      }
      return null;
    }
  };

  /**
   * MIDIに関連するDOM処理を定義
   */
   window.midiDOMController = {
    inputSelectorIds: [
      MIDI_ELEMENT_IDS.midiConnectSelector,
      MIDI_ELEMENT_IDS.disconnectedMidiConnectSelector,
      // MIDI_ELEMENT_IDS.deviceErrMidiInputSelector,
      MIDI_ELEMENT_IDS.connectionErrMidiConnectSelector,
      MIDI_ELEMENT_IDS.connectionErrMidiConnectSelector2,
      MIDI_ELEMENT_IDS.menuMidiDeviceSelector,
      // MIDI_ELEMENT_IDS.menuMidiInputSelector
    ],
    outputSelectorIds: [
      // MIDI_ELEMENT_IDS.menuMidiOutputSelector,
      // MIDI_ELEMENT_IDS.deviceErrMidiOutputSelector
    ],
    okBtnIds: [
      MIDI_ELEMENT_IDS.midiConnectOkBtn,
      MIDI_ELEMENT_IDS.disconnectedMidiConnectOkBtn,
      MIDI_ELEMENT_IDS.deviceErrMidiConnectOkBtn,
      MIDI_ELEMENT_IDS.connectionErrMidiConnectOkBtn
    ],
    /**
     * 初期接続画面を開く
     */
     openInitialMIDIConnect: function() {
      popup_open(MIDI_ELEMENT_IDS.midiConnectDialog.slice(1));
    },
    /**
     * MIDIのEndpoint変更によるDOMの更新
     *
     * 0件か否かに応じて、自動的に先頭をチェック状態にする処理、ボタンの非活性化を行う
     */
     updateMIDISelector: function() {
      var inputs = midiConnectionController.getInputs();
      var outputs = midiConnectionController.getOutputs();
      var inputHtml = '';
      inputs.forEach(function(input) {
        inputHtml += ('<a href="#" class="' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption.slice(1) + ' elf-select-list-option-control" msg="">' + input.MIDIEntityNameKey + '</a>');
      });
      var outputHtml = '';
      outputs.forEach(function(output) {
        outputHtml += ('<a href="#" class="' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption.slice(1) + ' elf-select-list-option-control" msg="">' + output.MIDIEntityNameKey + '</a>');
      });
      this.inputSelectorIds.forEach(function(value) {
        $(value + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption).html(inputHtml);
        if (inputs.length > 0) {
          $(value).removeClass('disabled');
          if (value !== MIDI_ELEMENT_IDS.menuMidiDeviceSelector && value !== MIDI_ELEMENT_IDS.menuMidiInputSelector) {
            $(value + ' p').text(inputs[0].MIDIEntityNameKey);
            $(value + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').eq(0).attr('checked', 'checked');
          }
        } else {
          $(value).addClass('disabled');
          $(value + ' p').empty();
        }
      });
      this.outputSelectorIds.forEach(function(value) {
        $(value + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption).html(outputHtml);
        if (outputs.length > 0) {
          $(value).removeClass('disabled');
          if (value !== MIDI_ELEMENT_IDS.menuMidiOutputSelector) {
            $(value + ' p').text(outputs[0].MIDIEntityNameKey);
            $(value + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').eq(0).attr('checked', 'checked');
          }
        } else {
          $(value).addClass('disabled');
          $(value + ' p').empty();
        }
      });
      this.okBtnIds.forEach(function(value) {
        if (inputs.length > 0) {
          $(value).removeClass('disabled-blue');
        } else {
          $(value).addClass('disabled-blue');
        }
      });
      this.updateInitialDialogSelector();
      this.updateMenuPageSelector();
    },
    /**
     * 初期ダイアログ内のーの表示を更新
     */
     updateInitialDialogSelector: function () {
      var inputs = midiConnectionController.getInputs();
      var inputHtml = '';
      inputs.forEach(function(input, index) {
        inputHtml += '<input type="radio" name="device-connect-select-dialog-menu-btn" id="device-connect-select-dialog-menu-btn-' + index + '">'
        inputHtml += '<label class="elf-radio-button-item" for="device-connect-select-dialog-menu-btn-' + index + '" style="width: 100%; height: 10%; line-height: 33.6px;">' + input.MIDIEntityNameKey + '</label>';
      });
      $(MIDI_ELEMENT_IDS.midiConnectSelector).html(inputHtml);
      if (inputs.length > 0) {
        $(MIDI_ELEMENT_IDS.midiConnectSelector + ' input').eq(0).prop('checked', true);
      }
    },
    /**
     * Menuダイアログ・DiviceSetting画面内の表示を更新
     */
     updateMenuPageSelector: function() {
      var currentMIDI = midiConnectionController.getCurrentMIDI();
      var matchedInputIndex = midiConnectionController.getInputs().findIndex(function(input) {
        return currentMIDI !== null && input.MIDIEntityNameKey === currentMIDI.MIDIEntityNameKey;
      });
      if (matchedInputIndex !== -1) {
        var inputName = midiConnectionController.getInput(matchedInputIndex).MIDIEntityNameKey;
        $(MIDI_ELEMENT_IDS.menuMidiDeviceSelector + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').eq(matchedInputIndex).attr('checked', 'checked');
        $(MIDI_ELEMENT_IDS.menuMidiDeviceSelector + ' p').text(inputName);
        // $(MIDI_ELEMENT_IDS.menuMidiInputSelector + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').eq(matchedInputIndex).attr('checked', 'checked');
        // $(MIDI_ELEMENT_IDS.menuMidiInputSelector + ' p').text(inputName);
      } else {
        $(MIDI_ELEMENT_IDS.menuMidiDeviceSelector + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').removeAttr('checked');
        $(MIDI_ELEMENT_IDS.menuMidiDeviceSelector + ' p').text('');
        // $(MIDI_ELEMENT_IDS.menuMidiInputSelector + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').removeAttr('checked');
        // $(MIDI_ELEMENT_IDS.menuMidiInputSelector + ' p').text('');
      }
      // var matchedOutputIndex = midiConnectionController.getOutputs().findIndex(function(output) {
      //   return currentMIDI !== null && output.MIDIEntityNameKey === currentMIDI.MIDIEntityNameKey;
      // });
      // if (matchedOutputIndex !== -1) {
      //   var outputName = midiConnectionController.getOutput(matchedOutputIndex).MIDIEntityNameKey;
      //   $(MIDI_ELEMENT_IDS.menuMidiOutputSelector + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').eq(matchedOutputIndex).attr('checked', 'checked');
      //   $(MIDI_ELEMENT_IDS.menuMidiOutputSelector + ' p').text(outputName);
      // } else {
      //   $(MIDI_ELEMENT_IDS.menuMidiOutputSelector + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').removeAttr('checked');
      //   $(MIDI_ELEMENT_IDS.menuMidiOutputSelector + ' p').text('');
      // }

      // if (matchedInputIndex === -1 || matchedOutputIndex === -1) {
      //   $(MIDI_ELEMENT_IDS.menuMidiOkMask).css('display', 'block');
      //   $(MIDI_ELEMENT_IDS.menuMidiOkBtn).addClass('disabled-blue');
      // } else {
      //   $(MIDI_ELEMENT_IDS.menuMidiOkMask).css('display', 'none');
      //   $(MIDI_ELEMENT_IDS.menuMidiOkBtn).removeClass('disabled-blue');
      // }
    },
    /**
     * 選択中MIDIの変更によるDOMの更新
     */
     updateCurrentMIDI: function() {
      var addCheck = function (id, nameKey) {
        $(id + ' p').text(nameKey);
        var selectOptions = $(id + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a');
        for (var i = 0; i < selectOptions.length; i++) {
          if ($(selectOptions[i]).text() === nameKey) {
            $(selectOptions[i]).attr('checked', 'checked');
            break;
          }
        }
      };
      var removeCheck = function (id) {
        $(id + ' p').text('');
        $(id + ' ' + MIDI_ELEMENT_CLASS_NAMES.midiConnectSelectorOption + ' a').removeAttr('checked');
      };
      var current = midiConnectionController.getCurrentMIDI();
      if (current !== null) {
        addCheck(MIDI_ELEMENT_IDS.menuMidiDeviceSelector, current.MIDIEntityNameKey);
        // addCheck(MIDI_ELEMENT_IDS.menuMidiInputSelector, current.MIDIEntityNameKey);
        // addCheck(MIDI_ELEMENT_IDS.menuMidiOutputSelector, current.MIDIEntityNameKey);
        // Writeボタンの活性化
        patchDOMController.updatePatchWriteButton(false);
        patchDOMController.updatePatchClearButton(false);
      } else {
        removeCheck(MIDI_ELEMENT_IDS.menuMidiDeviceSelector);
        // removeCheck(MIDI_ELEMENT_IDS.menuMidiInputSelector);
        // removeCheck(MIDI_ELEMENT_IDS.menuMidiOutputSelector);
        // Writeボタンの非活性化
        patchDOMController.updatePatchWriteButton(true);
        patchDOMController.updatePatchClearButton(true);
      }
    },
    /**
     * DisconnectedDialogを開く際の前処理
     */
     openDisconnectedDialog: function() {
      processingController.allClear();

      closeNumpad();
      closeNumpadList();
      popup_close('write-dialog');
      popup_close('write-clear-dialog');

      btsDOMController.closeWritePopupMenu();
      toneCentralController.stopYoutubeVideo();
      toneCentralController.stopScMusicPlayer();
      window.librarianForceTransition();

      ERROR_DIALOG_MAP.disconnectedError.open(function() {
        ERROR_DIALOG_MAP.offLineMode.open();
        disabledTopWriteWhenOflineMode();
      }, function() {
        midiConnectionController.connectCheckedEndpoint(MIDI_ELEMENT_IDS.disconnectedMidiConnectSelector, MIDI_ELEMENT_IDS.disconnectedMidiConnectDialog);
      });
    }
  };

  /**
   * quattro nativeのMIDIイベントと、MIDI関連のDOMイベントを監視
   */
   window.assignMIDIEvent = function() {
    $native.midi.event.changed = function() {
      midiConnectionController.refresh();
    };
    $native.midi.event.error = function() {
      midiConnectionController.disconnectMIDI();
      midiDOMController.openDisconnectedDialog();
    };
    $native.midi.event.connectfailed = function() {
      midiConnectionController.disconnectMIDI();
      ERROR_DIALOG_MAP.midiDeviceConnectionError.open(function() {
        ERROR_DIALOG_MAP.offLineMode.open();
      }, function() {
        midiConnectionController.connectCheckedEndpoint(MIDI_ELEMENT_IDS.connectionErrMidiConnectSelector, MIDI_ELEMENT_IDS.connectionErrMidiConnectDialog);
      });
    };
    $native.app.event.command = function(param1, param2) {
      if (param1 === 'exit') {
        MIDIController.dt1(nibble(ADDRESS_CONST.COMMAND.EDITOR_COMMUNICATION_MODE), hex2(0));
        setTimeout(function () {
          $native.app.exit();
        }, 500);
      } else if (param1 === 'wakeup') {
        if(currentMIDI !== null) {
          midiConnectionController.disconnectMIDI();
          midiDOMController.openDisconnectedDialog();
        }
      }
    };

    /**
     * MIDI RefreshBtns
     */

    var refreshBtns = [
      MIDI_ELEMENT_IDS.midiConnectRefreshBtn,
      MIDI_ELEMENT_IDS.menuMidiRefreshBtn,
      MIDI_ELEMENT_IDS.disconnectedMidiConnectRefreshBtn,
      MIDI_ELEMENT_IDS.deviceErrMidiConnectRefreshBtn,
      MIDI_ELEMENT_IDS.connectionErrMidiConnectRefreshBtn
    ];
    $(refreshBtns.join(',')).on(pointer.click, function(e) {
      e.preventDefault();
      midiConnectionController.refresh();
    });
    // 初期接続画面のOKボタン
    $(MIDI_ELEMENT_IDS.midiConnectOkBtn).on(pointer.click, function(e) {
      e.preventDefault();
      var selectedNum = null;
      $(MIDI_ELEMENT_IDS.midiConnectSelector + ' input').each(function(index, elm) {
        if ($(elm).prop('checked') === true) {
          selectedNum = index;
        }
      });
      if (selectedNum !== null) {
        popup_close(MIDI_ELEMENT_IDS.midiConnectDialog.slice(1));
        btsDOMController.closeConnectingPage();
        midiConnectionController.updateHasInitialized();
        midiConnectionController.connectMIDI(midiConnectionController.getInput(selectedNum));
      }
    });

    // Menuダイアログ・DiviceSetting画面内のDeviceセレクター更新時
    $(MIDI_ELEMENT_IDS.menuMidiDeviceSelector).on('elf-changed', function(e, v) {
      midiConnectionController.disconnectMIDI();
      midiConnectionController.connectMIDI(midiConnectionController.getInput(v));
    });
    // // Menuダイアログ・DiviceSetting画面内のOKボタン押下時
    // $(MIDI_ELEMENT_IDS.menuMidiOkBtn).on('click', function(e, v) {
    //   $native.midi.input.disconnect();
    //   $native.midi.output.disconnect();
    //   midiConnectionController.connectCheckedEndpoint(MIDI_ELEMENT_IDS.menuMidiInputSelector, '', MIDI_ELEMENT_IDS.menuMidiOutputSelector);
    // });
    // // Menuダイアログ・DiviceSetting画面内のInput,Outputセレクター更新時
    // $(MIDI_ELEMENT_IDS.menuMidiInputSelector + ', ' + MIDI_ELEMENT_IDS.menuMidiOutputSelector).on('elf-changed', function(e, v) {
    //   var isInputSelected = false;
    //   var isOutputSelected = false;
    //   $(MIDI_ELEMENT_IDS.menuMidiInputSelector + ' a').each(function(index, elm) {
    //     if ($(elm).attr('checked') === 'checked') {
    //       isInputSelected = true;
    //     }
    //   });
    //   $(MIDI_ELEMENT_IDS.menuMidiOutputSelector + ' a').each(function(index, elm) {
    //     if ($(elm).attr('checked') === 'checked') {
    //       isOutputSelected = true;
    //     }
    //   });
    //   if (isInputSelected && isOutputSelected) {
    //     $(MIDI_ELEMENT_IDS.menuMidiOkMask).css('display', 'none');
    //     $(MIDI_ELEMENT_IDS.menuMidiOkBtn).removeClass('disabled-blue');
    //   }
    // });

    // DeviceNotFoundダイアログのRefreshモード押下時
    $(MIDI_ELEMENT_IDS.deviceNotFoundDialogRefreshBtn).on(pointer.click, function(e) {
      midiConnectionController.refresh();
      popup_close(MIDI_ELEMENT_IDS.deviceNotFoundDialog.slice(1));
      midiConnectionController.startInitSetting();
    });

    // 初期接続画面のCancelボタン
    $(MIDI_ELEMENT_IDS.midiConnectCancelBtn).on(pointer.click, function(e) {
      e.preventDefault();
      popup_close(MIDI_ELEMENT_IDS.midiConnectDialog.slice(1));
      btsDOMController.closeConnectingPage();
      midiConnectionController.updateHasInitialized();
      ERROR_DIALOG_MAP.offLineMode.open();
      disabledTopWriteWhenOflineMode();
    });
    // DeviceNotFoundダイアログのOfflineモード押下時
    $(MIDI_ELEMENT_IDS.deviceNotFoundDialogOfflineModeBtn).on(pointer.click, function(e) {
      e.preventDefault();
      popup_close(MIDI_ELEMENT_IDS.deviceNotFoundDialog.slice(1));
      btsDOMController.closeConnectingPage();
      midiConnectionController.updateHasInitialized();
      ERROR_DIALOG_MAP.offLineMode.open();
      disabledTopWriteWhenOflineMode();
    });
  };
  
})();
