/**
 * [概要]
 * 自動では紐づけられないMIDIメッセージの監視
 *
 * [使用箇所]
 * startMIDIObservation()をindex.jsで呼び出し
 *
 */


(function () {
  window.startMIDIObservation = function () {

    // Temporary Readの重複フラグ
    var temporaryReadCount = 0;
    // Temporary Readをキャンセルする関数
    var temporaryReadCancelFunc = function () { };

    /**
     * address_map.jsには定義されていないアドレスの監視
     */
    MIDIController.addReceiver({
      receive: function (msg) {
        // console.log(Parameter.toJSON());
        // MIDI 接続処理中も監視するイベント
        if (midiConnectionController.getCurrentMIDI() === null) {
          return;
        }
        // MIDI 接続処理中は無視するイベント
        if (checkAndUpdateParameter(msg, ADDRESS_CONST.COMMAND.CURRENT_PATCH_NUMBER, 2, function (rawVal) {
          var v = parseInt(rawVal, 16);
          // 取得したPatchNumを使って更新
          patchModelController.updateCurrentPatch(v);
          patchDOMController.updateCurrentPatchDOM();
          librarianServices.changeInstPatch(v);

          _readTempPatchWrapper();
        })) {
          return;
        }
        if (checkAndUpdateParameter(msg, ADDRESS_CONST.COMMAND.PATCH_WRITE, 2, function () {
          setTimeout(function () {
            patchMIDIController.fetchPatchNames(function () {
              _readTempPatchWrapper();
            });
          }, 500);
        })) {
          return;
        }
      }
    });

    /**
     * AddressMapに存在するアドレスの監視
     */
    Parameter.addObserver({
      notify: function (bid, start, end) {
        if (bid === ADDRESS_CONST.BID.TEMPORARY_COMMON) {
          var targetBid = ADDRESS_CONST.BID.TEMPORARY_COMMON;

          /**
           * Current Patch Name
           */
          var addr = 0;
          if (start <= addr && addr < end) {
            var pid = targetBid + '%' + addr;
            var value = Parameter.value(pid, 16, 0);
            if (value.trim() == '') {
              value = patchModelController.getInitUserPatchName();
            }
            patchModelController.updateCurrentPatchName(value);
            patchDOMController.updateCurrentPatchNameDOM();
          }
        }
      }
    });

    /**
     * MIDIメッセージ受信時に指定したアドレスのメッセージかを判定し、
     * 一致する場合はコールバック関数updateFuncにsize分のデータ部分渡して実行する。
     * 一致するか否かの真偽値を返却。
     *
     * @param msg 受信メッセージ
     * @param address
     * @param size
     * @param updateFunc
     * @returns {boolean}
     */
    function checkAndUpdateParameter(msg, address, size, updateFunc) {
      var addressHead = STX + ROLAND + ProductSetting.deviceId + ProductSetting.modelId + DT1 + util.convert2AddrStr(address);
      if (msg.lastIndexOf(addressHead, 0) === 0) {
        var hexString = msg.substr(addressHead.length, size * 2);
        updateFunc(hexString);
        return true;
      } else {
        return false;
      }
    }

    function _readTempPatchWrapper() {
      closeNumpad();
      closeNumpadList();
      popup_close('write-dialog');
      popup_close('write-clear-dialog');
      popup_close('copy-to-patch');
      btsDOMController.closeWritePopupMenu();
      btsDOMController.disableBtnByTemporaryDT1(true);

      patchMIDIController.requestCurrentPatchName();
      if (temporaryReadCount === 0) {
        temporaryReadCount += 1;
      } else {
        temporaryReadCancelFunc();
      }

      var timer = setTimeout(function () {
        temporaryReadCancelFunc = readTemporary(function () {
          temporaryReadCount -= 1;
          btsDOMController.disableBtnByTemporaryDT1(false);
          setupKnobModFxTargetList();
        });
      }, 500);
      temporaryReadCancelFunc = function () {
        clearTimeout(timer);
      }
    }
    /**
     * IS_RQ1_ACCEPTのコマンドを送信しつつ、応答可能となった場合にTemporaryの取得のリクエストを行う
     * @param compFunc TemporaryReadが終了時に行う処理
     * @returns {Function} キャンセルする場合に呼び出すう関数をreturn
     */
    function readTemporary(compFunc) {
      var cancelFunc = function () { };
      var hasCanceled = false;
      var tempCnt = null;
      var MAX_TEMP_CNT = 40;
      var loop = function () {
        if (hasCanceled) {
          return;
        }

        if (tempCnt === null) {
          tempCnt = 0;
        } else if (tempCnt >= 0) {
          tempCnt += 1;
        }

        cancelFunc = midiConnectionController.readEditor([0], function () {
          if (typeof compFunc === 'function') {
            compFunc();
          }
        }, function () {
          if (typeof compFunc === 'function') {
            compFunc();
          }
        });
      };
      loop();
      return function () {
        hasCanceled = true;
        cancelFunc();
      };
    }
  };
})();
