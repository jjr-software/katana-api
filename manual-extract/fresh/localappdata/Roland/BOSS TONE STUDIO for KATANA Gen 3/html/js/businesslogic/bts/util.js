/**
 * [概要]
 * 各種汎用的な関数を定義
 *
 * [使用箇所]
 * 全体
 *
 */

(function() {
  window.util = {
    /**
     * 成功時、エラー時ごとの処理を登録した上で、MIDI通信を行う関数
     * hexStrで渡したBit列をそのまま送信する
     * (使用箇所は今のところDevice Inquiryのみ)
     * @param hexStr 送信するbit列の16進数文字列
     * @param observer
     * {
     *   isSucceeded(必須),
     *   success,
     *   error
     * }
     */
    waitForMIDIMsgReply: function(hexStr, observer) {
      var timeOut = 0;
      var timer = null;
      var process = function() {
        if (timeOut > 0) {
          if (new Date().getTime() > timeOut) {
            clearTimeout(timer);
            MIDIController.removeReceiver(receiver);
            if (typeof observer.error === 'function') {
              observer.error();
            }
            return;
          }
        } else {
          timeOut = (new Date()).getTime() + (ProductSetting.timeout * 1000);
          MIDIController.send(hexStr);
        }
        timer = setTimeout(process, 10);
      };
      var receiver = {
        receive: function(msg) {
          if (observer.isSucceeded(msg)) {
            clearTimeout(timer);
            setTimeout(function() {
              MIDIController.removeReceiver(receiver);
            }, 0);
            if (typeof observer.success === 'function') {
              observer.success(msg);
            }
          }
        }
      };
      MIDIController.addReceiver(receiver);
      process();
    },
    /**
     * 成功時、エラー時ごとの処理を登録した上で、MIDI通信を行う関数
     * DT1を送信
     * (この関数内で行なっているのでnibble化などは渡す引数では行わなくてよい)
     * @param address
     * @param value
     * @param observer
     * {
     *   isSucceeded(必須),
     *   success,
     *   error
     * }
     */
    waitForDT1Reply: function(address, value, observer) {
      var timeOut = 0;
      var timer = null;
      var process = function() {
        if (timeOut > 0) {
          if (new Date().getTime() > timeOut) {
            clearTimeout(timer);
            MIDIController.removeReceiver(receiver);
            if (typeof observer.error === 'function') {
              observer.error();
            }
            return;
          }
        } else {
          timeOut = (new Date()).getTime() + (ProductSetting.timeout * 1000);
          MIDIController.dt1(nibble(address), value);
        }
        timer = setTimeout(process, 10);
      };
      var receiver = {
        receive: function(msg) {
          if (observer.isSucceeded(msg)) {
            clearTimeout(timer);
            setTimeout(function() {
              MIDIController.removeReceiver(receiver);
            }, 0);
            if (typeof observer.success === 'function') {
              observer.success(msg);
            }
          }
        }
      };
      MIDIController.addReceiver(receiver);
      process();
      return function() {
        clearTimeout(timer);
        MIDIController.removeReceiver(receiver);
      };
    },
    /**
     * 成功時、エラー時ごとの処理を登録した上で、MIDI通信を行う関数
     * RQ1を送信
     * (この関数内で行なっているのでnibble化などは渡す引数では行わなくてよい)
     * @param address
     * @param size
     * @param observer
     * {
     *   success
     *   error
     * }
     */
    waitForRQ1Reply: function(address, size, observer) {
      var timeOut = 0;
      var timer = null;
      var canceled = false;
      var process = function() {

        if (timeOut > 0) {
          if (new Date().getTime() > timeOut) {
            clearTimeout(timer);
            if (observer !== undefined && typeof observer.error === 'function') {
              observer.error();
            }
            return;
          }
        } else {
          timeOut = (new Date()).getTime() + (ProductSetting.timeout * 1000);
          MIDIController.rq1(nibble(address), nibble(size), function(msg) {
            if (canceled) {
              return;
            }
            clearTimeout(timer);
            if (observer !== undefined && typeof observer.success === 'function') {
              observer.success(msg);
            }
          });
        }
        timer = setTimeout(process, 10);
      };
      process();
      return function() {
        clearTimeout(timer);
        canceled = true;
      };
    },
    /**
     * storageの内容をJSONパースし返す
     * 見つからない場合やJSONパースできない場合は、空のオブジェクトを返す
     * @returns {*}
     */
    readStorage: function() {
      var storageString = $native.app.storage();
      if (typeof storageString === 'string' && storageString.length > 0) {
        try {
          var obj = JSON.parse(storageString);
          return obj;
        } catch (e) {
          return {};
        }
      } else {
        return {};
      }
    },
    /**
     * storage内のJSONの指定したkeyの値のみを書き換える
     * 入れ子構造では使用不可
     * @param key
     * @param value
     */
    writeStorage: function(key, value) {
      var storage = this.readStorage();
      storage[key] = value;
      $native.app.storage(JSON.stringify(storage));
    },
    /**
     * 16進数を文字列に変換(アドレス長に合わせるため0で埋める)
     * @param hex
     * @returns {string}
     */
    convert2AddrStr: function(hex) {
      var str = hex.toString(16).toUpperCase();
      if (str.length < 8) {
        var zeroPrefix = '';
        for (var i = 0; i < 8 - str.length; i++) {
          zeroPrefix += '0';
        }
        return zeroPrefix + str;
      } else {
        return str;
      }
    },
    /**
     * 文字列をAscii文字以外を取り除いた上で返却
     * @param str
     * @returns {string}
     */
    convert2AsciiOnlyStr: function(str) {
      var result = '';
      for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        result += ((0x20 <= char && char <= 0x7F) ? str.charAt(i) : '');
      }
      return result;
    },
    /**
     * ファイル名で使用できない文字を '_' にして返却
     */
    convert2ValidFileNameStr: function(str) {
      var result = str.replace(/[\\|/|:|?|*|.|"|<|>|\|]/g, '_');
      return result;
    },
    /**
     * 文字列を16進数文字列に変換
     * @param name
     * @returns {string}
     */
    convert2NameHex: function(name) {
      for (var i = 0, l = 16 - name.length; i < l; i++) {
        name += ' ';
      }
      var nameHex = '';
      for (var j = 0; j < name.length; j++) {
        var code = name.charCodeAt(j).toString(16).toUpperCase();
        if (code.length < 2) {
          code = '0' + code;
        }
        nameHex += code;
      }
      return nameHex;
    },
    /**
     * 16進数->文字列
     * TODO 現在使用箇所はなし
     * @param hex
     * @returns {string}
     */
    convert2NameStr: function(hex) {
      var patchName = '';
      for (var i = 0; i < 16; i++) {
        patchName += String.fromCharCode(parseInt(hex.substr(i * 2, 2), 16));
      }
      return patchName;
    },
    /**
     * UserAgentからOS情報を抜き出す(PC特有)
     * @returns {string}
     */
    getDeviceOs: function() {
      var deviceOs = navigator.userAgent;
      var matchesArray = deviceOs.match(/\(([^\)]*)\)/);
      if (matchesArray[1] !== undefined) {
        deviceOs = matchesArray[1];
      }
      return deviceOs;
    },
    /**
     * Storageに格納されているAPPバージョンとProductSettingに定義されたバージョンを比較
     * 結果次第でログ送信を行う。
     * Storageに格納
     */
    checkAppVersion: function() {
      var appVersion = ProductSetting.version;
      var storage = this.readStorage();
      var storedAppVersion = storage.appVersion;
      if (storedAppVersion !== undefined && this._isVersionLater(appVersion, storedAppVersion)) {
        updateLogManager.post(appVersion);
      }
      this.writeStorage('appVersion', appVersion);
    },
    /**
     * バージョンが新しいかを判定
     * @param current 新バージョン
     * @param stored 旧バージョン
     * @returns {boolean}
     * @private
     */
    _isVersionLater: function(current, stored) {
      var currentEachNum = current.split('.');
      for (var i = 0; i < currentEachNum.length; i++) {
        var storedValue = stored.split('.')[i];
        if (currentEachNum[i] > storedValue) {
          return true;
        } else if (currentEachNum[i] < storedValue) {
          return false;
        }
      }
      return false;
    }
  };
})();
