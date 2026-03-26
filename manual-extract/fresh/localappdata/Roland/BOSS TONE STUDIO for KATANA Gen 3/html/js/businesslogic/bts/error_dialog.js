/**
 * [概要]
 * エラーダイアログ処理
 *
 * [使用箇所]
 * 全体
 *
 * 各ダイアログインスタンスが代入された変数を以下のように用いる
 *
 * communicationError.open(function() {
 *   // 左側のボタンが押された場合の処理
 * }, function() {
 *   // 右側のボタンが押された場合の処理
 * });
 * (特にコールバック関数が必要なければ引数は渡さなくてよく、閉じる処理は自動で行われる)
 */

// エラーダイアログの種類分け
var ERROR_DIALOG_TYPE = {
  singleBtn: 'single',
  doubleBtn: 'double',
  singleBtnLongTitle: 'singleLongTitle',
  doubleBtnLongTitle: 'doubleLongTitle',
  singleBtnLongContents: 'singleLongContents',
  doubleBtnLongContents: 'doubleLongContents',
  wrongDevice: 'wrongDevice',
  midiDeviceConnection: 'midiDeviceConnection',
  disconnected: 'disconnected',
  btxWarningOfUnderConstruction: 'btxWarningOfUnderConstruction',
  btxWarningOfLeadingToUpdate: 'btxWarningOfLeadingToUpdate',
  // PC特有
  oldVersionOfBTS: 'oldVersionOfBTS',
  doubleBtn_1: 'double_1'
};

// 各ERROR_DIALOG_TYPEにおける、HTMLのid名定義
var ERROR_DIALOG_ID = {};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.singleBtn] = {
  page: '#error-dialog-single-btn-type',
  headerLabel: '#error-dialog-single-btn-type-title-label',
  contentsLabel: '#error-dialog-single-btn-type-contents-label',
  firstBtn: '#error-dialog-single-btn-type-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.doubleBtn] = {
  page: '#error-dialog-double-btn-type',
  headerLabel: '#error-dialog-double-btn-type-title-label',
  contentsLabel: '#error-dialog-double-btn-type-contents-label',
  firstBtn: '#error-dialog-double-btn-type-left-btn',
  secondBtn: '#error-dialog-double-btn-type-right-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.doubleBtn_1] = {
  page: '#error-dialog-double-btn-type-1',
  headerLabel: '#error-dialog-double-btn-type-title-label-1',
  contentsLabel: '#error-dialog-double-btn-type-contents-label-1',
  firstBtn: '#error-dialog-double-btn-type-left-btn-1',
  secondBtn: '#error-dialog-double-btn-type-right-btn-1'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.singleBtnLongTitle] = {
  page: '#error-dialog-single-btn-long-title-type',
  headerLabel: '#error-dialog-single-btn-long-title-type-title-label',
  contentsLabel: '#error-dialog-single-btn-long-title-type-contents-label',
  firstBtn: '#error-dialog-single-btn-long-title-type-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.doubleBtnLongTitle] = {
  page: '#error-dialog-double-btn-long-title-type',
  headerLabel: '#error-dialog-double-btn-long-title-type-title-label',
  contentsLabel: '#error-dialog-double-btn-long-title-type-contents-label',
  firstBtn: '#error-dialog-double-btn-long-title-type-left-btn',
  secondBtn: '#error-dialog-double-btn-long-title-type-right-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.singleBtnLongContents] = {
  page: '#error-dialog-single-btn-long-contents-type',
  headerLabel: '#error-dialog-single-btn-long-contents-type-title-label',
  contentsLabel: '#error-dialog-single-btn-long-contents-type-contents-label',
  firstBtn: '#error-dialog-single-btn-long-contents-type-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.doubleBtnLongContents] = {
  page: '#error-dialog-double-btn-long-contents-type',
  headerLabel: '#error-dialog-double-btn-long-contents-type-title-label',
  contentsLabel: '#error-dialog-double-btn-long-contents-type-contents-label',
  firstBtn: '#error-dialog-double-btn-long-contents-type-left-btn',
  secondBtn: '#error-dialog-double-btn-long-contents-type-right-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.wrongDevice] = {
  page: '#device-err-midi-connect-dialog',
  firstBtn: '#device-err-midi-connect-dialog-cancel-btn',
  secondBtn: '#device-err-midi-connect-dialog-ok-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.midiDeviceConnection] = {
  page: '#connection-err-midi-connect-dialog',
  firstBtn: '#connection-err-midi-connect-dialog-cancel-btn',
  secondBtn: '#connection-err-midi-connect-dialog-ok-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.disconnected] = {
  page: '#disconnected-midi-connect-dialog',
  firstBtn: '#disconnected-midi-connect-dialog-cancel-btn',
  secondBtn: '#disconnected-midi-connect-dialog-ok-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.btxWarningOfUnderConstruction] = {
    page: '#error-dialog-single-btn-long-contents-type-w-check1',
    headerLabel: '#error-dialog-single-btn-long-contents-type-w-check1-title-label',
    contentsLabel: '#error-dialog-single-btn-long-contents-type-w-check1-contents-label',
    checkBox: '#error-dialog-single-btn-long-contents-type-w-check1-CheckBox_1',
    firstBtn: '#error-dialog-single-btn-long-contents-type-w-check1-btn'
};
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.btxWarningOfLeadingToUpdate] = {
    page: '#error-dialog-single-btn-long-contents-type-w-check2',
    headerLabel: '#error-dialog-single-btn-long-contents-type-w-check2-title-label',
    contentsLabel: '#error-dialog-single-btn-long-contents-type-w-check2-contents-label',
    checkBox: '#error-dialog-single-btn-long-contents-type-w-check2-CheckBox_1',
    firstBtn: '#error-dialog-single-btn-long-contents-type-w-check2-btn'
};
// PC特有
ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.oldVersionOfBTS] = {
  page: '#old-version-of-bts-dialog',
  headerLabel: '#old-version-of-bts-dialog-title-label',
  contentsLabel: '#old-version-of-bts-dialog-message',
  firstBtn: '#old-version-of-bts-dialog-ok-btn'
};

/**
 *
 * @param type ERROR_DIALOG_TYPE(必須)
 * @param priority 優先順位(低い方が優先して表示される)(必須)
 * @param headerStr ダイアログのヘッダー文字列
 * @param contentsStr ダイアログの要素内の文字列
 * @param firstBtnStr 左側のボタンの文字列
 * @param secondBtnStr 右側のボタンの文字列
 * @constructor
 */
var ErrorDialog = function(type, priority, headerStr, contentsStr, firstBtnStr, secondBtnStr) {
  this.type = type;
  this.priority = priority;
  this.headerStr = headerStr === undefined ? '' : headerStr;
  this.contentsStr = contentsStr === undefined ? '' : contentsStr;
  this.firstBtnStr = firstBtnStr === undefined ? '' : firstBtnStr;
  this.secondBtnStr = secondBtnStr === undefined ? '' : secondBtnStr;
  this.visible = false;
};

/**
 * OPEN処理, プライオリティを計算して他ダイアログを閉じた上で、_openDialog()で実際にダイアログを開く
 * @param firstBtnFunc 左側のボタン押下時のコールバック関数
 * @param secondBtnFunc 右側のボタン押下時のコールバック関数
 */
ErrorDialog.prototype.open = function(firstBtnFunc, secondBtnFunc) {
  var currentDialogPriority = null;
  for (var error in ERROR_DIALOG_MAP) {
    if (ERROR_DIALOG_MAP.hasOwnProperty(error)) {
      if (ERROR_DIALOG_MAP[error].visible) {
        currentDialogPriority = ERROR_DIALOG_MAP[error].priority;
      }
    }
  }
  if (currentDialogPriority === null || currentDialogPriority > this.priority) {
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.doubleBtn].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.singleBtn].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.doubleBtnLongTitle].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.singleBtnLongTitle].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.doubleBtnLongContents].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.singleBtnLongContents].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.wrongDevice].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.midiDeviceConnection].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.disconnected].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.oldVersionOfBTS].page.slice(1));
    popup_close(ERROR_DIALOG_ID[ERROR_DIALOG_TYPE.doubleBtn_1].page.slice(1));
    this.visible = true;
    this._openDialog(firstBtnFunc, secondBtnFunc);
  }
  if (this.type == ERROR_DIALOG_TYPE.doubleBtn_1) {
    $('#error-dialog-double-btn-type-left-btn-1').css('bottom', '5px');
    $('#error-dialog-double-btn-type-right-btn-1').css('bottom', '5px');
    $('#error-dialog-double-btn-type-contents-label-1').css('display', 'block');
    if (window.patchFailure && window.patchFailure.length > 0) {
      $('#error-dialog-double-btn-type-1').css('height', (150 + window.patchFailure.length * 15) + 'px');
      let ulli = ''
      for (const i of window.patchFailure) {
        ulli += `<li>${i}</li>`;
      }
      $('#error-dialog-double-btn-type-contents-label-1').empty().append(
        `<p>Writing of the following patches failed. Try again.</p>
        <div>
          <ul>
            ${ulli}
          </ul>
        </div>`
      )
    }
  }
};

/**
 * OPEN処理(private method)
 * @param firstBtnFunc
 * @param secondBtnFunc
 * @private
 */
ErrorDialog.prototype._openDialog = function(firstBtnFunc, secondBtnFunc) {
  var self = this;
  $(ERROR_DIALOG_ID[this.type].headerLabel).html(this.headerStr);
  $(ERROR_DIALOG_ID[this.type].contentsLabel).html(this.contentsStr);
  $(ERROR_DIALOG_ID[this.type].firstBtn + ' p').html(this.firstBtnStr);
  $(ERROR_DIALOG_ID[this.type].firstBtn).on(pointer.click, function(e) {
    e.preventDefault();
    for (var error in ERROR_DIALOG_MAP) {
      if (ERROR_DIALOG_MAP.hasOwnProperty(error)) {
        ERROR_DIALOG_MAP[error].visible = false;
      }
    }
    popup_close(ERROR_DIALOG_ID[self.type].page.slice(1));
    $(ERROR_DIALOG_ID[self.type].firstBtn).off(pointer.click);
    $(ERROR_DIALOG_ID[self.type].secondBtn).off(pointer.click);
    if (firstBtnFunc !== undefined) {
      firstBtnFunc();
    }
  });
  if (
      this.type === ERROR_DIALOG_TYPE.doubleBtn ||
      this.type === ERROR_DIALOG_TYPE.doubleBtn_1 ||
      this.type === ERROR_DIALOG_TYPE.doubleBtnLongTitle ||
      this.type === ERROR_DIALOG_TYPE.doubleBtnLongContents
  ) {
    $(ERROR_DIALOG_ID[this.type].secondBtn + ' p').html(this.secondBtnStr);
    $(ERROR_DIALOG_ID[this.type].secondBtn).on(pointer.click, function(e) {
      e.preventDefault();
      for (var error in ERROR_DIALOG_MAP) {
        if (ERROR_DIALOG_MAP.hasOwnProperty(error)) {
          ERROR_DIALOG_MAP[error].visible = false;
        }
      }
      popup_close(ERROR_DIALOG_ID[self.type].page.slice(1));
      $(ERROR_DIALOG_ID[self.type].firstBtn).off(pointer.click);
      $(ERROR_DIALOG_ID[self.type].secondBtn).off(pointer.click);
      if (secondBtnFunc !== undefined) {
        secondBtnFunc();
      }
    });
  }
  popup_open(ERROR_DIALOG_ID[this.type].page.slice(1));
};

/**
 * MIDI接続関連のダイアログ
 * (priorityを扱う必要があるため, ErrorDialogを継承)
 * @param type
 * @param priority
 * @constructor
 */
var MIDIDialog = function(type, priority) {
  ErrorDialog.call(this, type, priority);
  this.id = ERROR_DIALOG_ID[type].page;
};
MIDIDialog.prototype = Object.create(ErrorDialog.prototype);
MIDIDialog.prototype.constructor = MIDIDialog;

MIDIDialog.prototype._openDialog = function(firstBtnFunc, secondBtnFunc) {
  var self = this;
  $(ERROR_DIALOG_ID[this.type].firstBtn).on(pointer.click, function(e) {
    e.preventDefault();
    for (var error in ERROR_DIALOG_MAP) {
      if (ERROR_DIALOG_MAP.hasOwnProperty(error)) {
        ERROR_DIALOG_MAP[error].visible = false;
      }
    }
    popup_close(ERROR_DIALOG_ID[self.type].page.slice(1));
    $(ERROR_DIALOG_ID[self.type].secondBtn).off(pointer.click);
    $(ERROR_DIALOG_ID[self.type].firstBtn).off(pointer.click);
    if (firstBtnFunc !== undefined) {
      firstBtnFunc();
    }
  });
  $(ERROR_DIALOG_ID[this.type].secondBtn).on(pointer.click, function(e) {
    e.preventDefault();
    for (var error in ERROR_DIALOG_MAP) {
      if (ERROR_DIALOG_MAP.hasOwnProperty(error)) {
        ERROR_DIALOG_MAP[error].visible = false;
      }
    }
    popup_close(ERROR_DIALOG_ID[self.type].page.slice(1));
    $(ERROR_DIALOG_ID[self.type].secondBtn).off(pointer.click);
    $(ERROR_DIALOG_ID[self.type].firstBtn).off(pointer.click);
    if (secondBtnFunc !== undefined) {
      secondBtnFunc();
    }
  });
  popup_open(this.id.slice(1));
};

//attach events
$(() => {
    $('#error-dialog-single-btn-long-contents-type-w-check1-CheckBox_1').on('elf-changed', function (e, v) {
        var isChecked = ((v == '1') ? true : false);
        $native.app.storage2(STORAGE_KEY.DO_NOT_SHOW_AGAIN_BTX_WARNING_OF_UNDER_CONSTRUCTION, isChecked.toString());
    });
    $('#error-dialog-single-btn-long-contents-type-w-check2-CheckBox_1').on('elf-changed', function (e, v) {
        var isChecked = ((v == '1') ? true : false);    
        $native.app.storage2(STORAGE_KEY.DO_NOT_SHOW_AGAIN_BTX_WARNING_OF_LEADING_TO_UPDATE, isChecked.toString());
    });

    $(document).on("click", ".open-link-external-app", function (e) { // for IDM_FULL_VERSION_OF_BTX_IS_UNDER_CONSTRUCTION_M
        e.preventDefault();
        let url = $(this).attr('href');
        if (url !== undefined) {
            $native.fs.exec(url);
        }
    });
});

/**
 * OldVersionダイアログ
 * (Errorダイアログを継承)
 * @param type
 * @param priority
 * @param headerStr
 * @param contentsStr
 * @constructor
 */
var OldVersionOfBTSDialog = function (type, priority, headerStr, contentsStr) {
  ErrorDialog.call(this, type, priority);
  this.id = ERROR_DIALOG_ID[type].page;
  this.headerStr = headerStr === undefined ? '' : headerStr;
  this.contentsStr = contentsStr === undefined ? '' : contentsStr;
}
OldVersionOfBTSDialog.prototype = Object.create(ErrorDialog.prototype);
OldVersionOfBTSDialog.prototype.constructor = OldVersionOfBTSDialog;

OldVersionOfBTSDialog.prototype._openDialog = function(firstBtnFunc) {
  var self = this;
  $(ERROR_DIALOG_ID[this.type].headerLabel).html(this.headerStr);
  $(ERROR_DIALOG_ID[this.type].contentsLabel).html(this.contentsStr);
  $(ERROR_DIALOG_ID[this.type].firstBtn).on(pointer.click, function(e) {
    e.preventDefault();
    for (var error in ERROR_DIALOG_MAP) {
      if (ERROR_DIALOG_MAP.hasOwnProperty(error)) {
        ERROR_DIALOG_MAP[error].visible = false;
      }
    }
    popup_close(ERROR_DIALOG_ID[self.type].page.slice(1));
    $(this).off(pointer.click);
    if (firstBtnFunc !== undefined) {
      firstBtnFunc();
    }
  });
  popup_open(this.id.slice(1));
};

var messageEn = new Message_en();

/**
 * 各ダイアログインスタンスを作成
 *
 */
var ERROR_DIALOG_MAP = {
  wrongDeviceError: new MIDIDialog(
      ERROR_DIALOG_TYPE.wrongDevice,
      0
  ),
  midiDeviceConnectionError: new MIDIDialog(
      ERROR_DIALOG_TYPE.midiDeviceConnection,
      1
  ),
  disconnectedError: new MIDIDialog(
      ERROR_DIALOG_TYPE.disconnected,
      2
  ),
  communicationError: new ErrorDialog(
      ERROR_DIALOG_TYPE.doubleBtn,
      3,
      messageEn.IDM_ERROR_COMMUNICATION_TITLE,
      messageEn.IDM_ERROR_COMMUNICATION_MESSAGE,
      'CANCEL',
      'RETRY'
  ),
  communicationErrorOther: new ErrorDialog(
      ERROR_DIALOG_TYPE.doubleBtn_1,
      11,
      messageEn.IDM_ERROR_COMMUNICATION_TITLE,
      messageEn.IDM_ERROR_COMMUNICATION_MESSAGE_1,
      'CANCEL',
      'RETRY'
  ),
  fileError: new ErrorDialog(
      ERROR_DIALOG_TYPE.singleBtn,
      4,
      messageEn.IDM_ERROR_FILE_TITLE,
      messageEn.IDM_ERROR_FILE_MESSAGE,
      'OK'
  ),
  noInternetAccess: new ErrorDialog(
      ERROR_DIALOG_TYPE.singleBtn,
      10,
      messageEn.IDM_ERROR_INTERNET_TITLE,
      messageEn.IDM_ERROR_INTERNET_MESSAGE,
      'OK'
  ),
  libraryFull: new ErrorDialog(
      ERROR_DIALOG_TYPE.singleBtn,
      5,
      messageEn.IDM_ERROR_LIBRARY_TITLE,
      messageEn.IDM_ERROR_LIBRARY_MESSAGE,
      'OK'
  ),
  unsupportedData: new ErrorDialog(
      ERROR_DIALOG_TYPE.singleBtn,
      6,
      messageEn.IDM_ERROR_UNSUPPORTED_TITLE,
      messageEn.IDM_ERROR_UNSUPPORTED_MESSAGE,
      'OK'
  ),
  oldVersionOfBTS: new OldVersionOfBTSDialog(
      ERROR_DIALOG_TYPE.oldVersionOfBTS,
      7,
      messageEn.IDM_ERROR_OLD_BTS_TITLE,
      messageEn.IDM_ERROR_OLD_BTS_MESSAGE
  ),
  oldVersionOfInstrument: new OldVersionOfBTSDialog(
      ERROR_DIALOG_TYPE.oldVersionOfBTS,
      8,
      messageEn.IDM_ERROR_OLD_FIRM_TITLE,
      messageEn.IDM_ERROR_OLD_FIRM_MESSAGE
  ),
  offLineMode: new ErrorDialog(
      ERROR_DIALOG_TYPE.singleBtnLongContents,
      9,
      messageEn.IDM_ERROR_OFFLINE_MODE_TITLE,
      messageEn.IDM_ERROR_OFFLINE_MODE_MESSAGE,
      'OK'
  ),

  btxWarningOfUnderConstruction: new ErrorDialog(
    ERROR_DIALOG_TYPE.btxWarningOfUnderConstruction,
    15,
    messageEn.IDM_FULL_VERSION_OF_BTX_IS_UNDER_CONSTRUCTION_T,
    messageEn.IDM_FULL_VERSION_OF_BTX_IS_UNDER_CONSTRUCTION_M,
    'OK'
  ),
  btxWarningOfLeadingToUpdate: new ErrorDialog(
    ERROR_DIALOG_TYPE.btxWarningOfLeadingToUpdate,
    15,
    messageEn.IDM_LEADING_TO_UPDATE_FOR_BTX_FULLVERSION_T,
    messageEn.IDM_LEADING_TO_UPDATE_FOR_BTX_FULLVERSION_M,
    'OK'
  ),
  errExportingToBTXCommon: new ErrorDialog(
    ERROR_DIALOG_TYPE.singleBtnLongContents,
    15,
    messageEn.IDM_ERROR_EXPORTING_TO_BTX_COMMON_SCREEN_TITLE,
    messageEn.IDM_ERROR_EXPORTING_TO_BTX_COMMON_SCREEN_MESSAGE,
    'OK'
  )
};
