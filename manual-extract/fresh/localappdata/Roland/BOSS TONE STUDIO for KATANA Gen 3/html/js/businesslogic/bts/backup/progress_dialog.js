/**
 * [概要]
 * PROGRESS BAR 及び COMPLETE DAIALOGの処理
 *
 * [使用箇所]
 * LIBRARIAN, ALL DATA BACKUP画面
 * 
 */

function ProgressDialog(title, useCancelBtn = true) {
  this.id = '#progress-dialog';
  this.progressBar = '#progress-dialog-bar > div';
  this.titleLabel = '#progress-dialog-label p';
  this.cancelBtn = '#progress-dialog-cancel-btn';
  this.title = title;
  this.useCancelBtn = useCancelBtn;
}

ProgressDialog.prototype.init = function () {
  $(this.progressBar).width(0);
};

ProgressDialog.prototype.update = function (arg) {
  $(this.progressBar).width(arg + '%');
};

ProgressDialog.prototype.open = function (func) {
  popup_open(this.id.slice(1));
  $(this.progressBar).width(0);
  $(this.titleLabel).text(this.title);
  if(this.useCancelBtn){
      $(this.cancelBtn).show()
      $(this.cancelBtn).on(pointer.click, () => {
          $(this.cancelBtn).off(pointer.click);
          if (typeof func === 'function' && typeof func !== 'undefined') {
              setTimeout(() => {
                  func();
              }, 15);
          }
          popup_close(this.id.slice(1));
      });
  }
  else{ $(this.cancelBtn).hide(); }
};

ProgressDialog.prototype.close = function (func) {
  $(this.cancelBtn).off(pointer.click);
  if (typeof func === 'function' && typeof func !== 'undefined') {
      setTimeout(() => {
          func();
      }, 15);
  }
  popup_close(this.id.slice(1));
};

var PROGRESS_DIALOG_MAP = {
  import: new ProgressDialog(
      'IMPORT'
  ),
  export: new ProgressDialog(
      'EXPORT'
  ),
  backup: new ProgressDialog(
    'BACKUP'
  ),
  restore: new ProgressDialog(
    'RESTORE'
  ),
  closeAll: function() {
    this.import.close();
    this.export.close();
    this.backup.close();
    this.restore.close();
  },
  sendTslToBtx: new ProgressDialog('TRANSMITTING TO BTX', false),
};

function CompleteDialog(title) {
  this.id = '#complete-dialog';
  this.titleLabel = '#complete-dialog-label p';
  this.okBtn = '#complete-dialog-ok-btn';
  this.title = title;
}

CompleteDialog.prototype.open = function(func) {
  popup_open(this.id.slice(1));
  $(this.titleLabel).text(this.title);
  var self = this;
  $(this.okBtn).on(pointer.click, function() {
    $(self.okBtn).off(pointer.click);
    if (typeof func === 'function' && typeof func !== 'undefined') {
      func();
    }
    popup_close(self.id.slice(1));
  });
};

CompleteDialog.prototype.close = function(func) {
  $(this.okBtn).off(pointer.click);
  if (typeof func === 'function' && typeof func !== 'undefined') {
    func();
  }
  popup_close(this.id.slice(1));
};

var COMPLETE_DIALOG_MAP = {
  import: new CompleteDialog(
    'IMPORT'
  ),
  export: new CompleteDialog(
    'EXPORT'
  ),
  addLiveset: new CompleteDialog(
    'ADD LIVESET'
  ),
  backup: new CompleteDialog(
    'BACKUP'
  ),
  restore: new CompleteDialog(
    'RESTORE'
  ),
  closeAll: function() {
    this.import.close();
    this.export.close();
    this.addLiveset.close();
    this.backup.close();
    this.restore.close();
  }
};
