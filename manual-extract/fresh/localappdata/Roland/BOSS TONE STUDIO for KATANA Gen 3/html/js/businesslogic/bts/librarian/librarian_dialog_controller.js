/**
 * [概要]
 * LIBRARIAN画面で用いるダイアログの処理
 *
 * [使用箇所]
 * LIBRARIAN画面
 *
 */


 function CreateLivesetDialog() {
  this.id = '#librarian-create-liveset-dialog';
  this.textInput = '#librarian-create-liveset-text-input';
  this.okBtn = '#librarian-create-liveset-btn';
  this.cancelBtn = '#librarian-create-liveset-cancel-btn';
  this.status = true;
  this.mask = '#librarian-create-liveset-mask';
}

// OKボタン、CANCELボタン押下時に処理をリセットする必要がある
CreateLivesetDialog.prototype.open = function (func) {
  // フォームを初期化
  $(this.textInput).find('input[type=text]').val('');
  popup_open(this.id.slice(1));
  $(this.textInput+' input').focus();
  var self = this;
  $(this.okBtn).addClass("disabled-blue");
  $(this.mask).css('display', 'block');
  this.status = true;
  $(this.okBtn).on(pointer.click, function () {
    $(self.okBtn).off(pointer.click);
    $(self.cancelBtn).off(pointer.click);
    if (typeof func === 'function' && typeof func !== 'undefined') {
      var text = $(self.textInput).find('input[type=text]').val();
      text = util.convert2AsciiOnlyStr(text).slice(0, 64);
      func(text.trim());
    }
    popup_close(self.id.slice(1));
  });
  $(this.cancelBtn).on(pointer.click, function () {
    $(self.okBtn).off(pointer.click);
    $(self.cancelBtn).off(pointer.click);
  });
};

CreateLivesetDialog.prototype.close = function (func) {
  $(this.okBtn).off(pointer.click);
  if (typeof func === 'function' && typeof func !== 'undefined') {
    func();
  }
  popup_close(this.id.slice(1));
};

function OverwritePatchDialog() {
  this.id = '#librarian-overwrite-patch-dialog';
  this.check = '#librarian-overwrite-patch-dialog-check-btn'
  this.okBtn = '#librarian-overwrite-patch-dialog-ok-btn';
  this.cancelBtn = '#librarian-overwrite-patch-dialog-cancel-btn';
}

// OKボタン、CANCELボタン押下時に処理をリセットする必要がある
OverwritePatchDialog.prototype.open = function (firstFunc, secondFunc, openFlag) {
  if (openFlag) {
    popup_open(this.id.slice(1));
    var self = this;
    $(this.okBtn).on(pointer.click, function () {
      $(self.okBtn).off(pointer.click);
      $(self.cancelBtn).off(pointer.click);
      if (typeof firstFunc === 'function' && typeof firstFunc !== 'undefined') {
        firstFunc();
      }
      librarianServices.saveConfirmationFrag();
      popup_close(self.id.slice(1));
    });
    $(this.cancelBtn).on(pointer.click, function () {
      $(self.okBtn).off(pointer.click);
      $(self.cancelBtn).off(pointer.click);
      if (typeof secondFunc === 'function' && typeof secondFunc !== 'undefined') {
        $('.librarian-patch-table-pc').scrollLeft(0);
        secondFunc();
      }
      librarianServices.saveConfirmationFrag();
      popup_close(self.id.slice(1));
    });
  } else {
    if (typeof firstFunc === 'function' && typeof firstFunc !== 'undefined') {
      firstFunc();
    }
  }
};

OverwritePatchDialog.prototype.close = function (func) {
  $(this.okBtn).off(pointer.click);
  if (typeof func === 'function' && typeof func !== 'undefined') {
    func();
  }
  popup_close(this.id.slice(1));
};


(function () {
  window.CREATE_LIVESET_DIALOG = new CreateLivesetDialog()
  window.OVERWRITE_PATCH_DIALOG = new OverwritePatchDialog();
  window.assignCreateLivesetDialog = function () {
    // Enter押下時の処理
    $(CREATE_LIVESET_DIALOG.textInput).on('keydown', function (e) {
      if (e.keyCode === 13 && CREATE_LIVESET_DIALOG.status== false) {
        $(CREATE_LIVESET_DIALOG.okBtn).trigger('click');
      }
    });
  };
  window.assignOverwritePatchDialog = function () {
    $(OVERWRITE_PATCH_DIALOG.check).on(pointer.click, function (e) {
      // チェックを付けた場合にグローバルのflagをfalseにする。
      if ($(OVERWRITE_PATCH_DIALOG.check).hasClass('checked')) {
        $(OVERWRITE_PATCH_DIALOG.check).removeClass('checked');
        librarianCommonInfo.confirmOverwrite = true;
      } else {
        $(OVERWRITE_PATCH_DIALOG.check).addClass('checked');
        librarianCommonInfo.confirmOverwrite = false;
      }
    });
  };
})();