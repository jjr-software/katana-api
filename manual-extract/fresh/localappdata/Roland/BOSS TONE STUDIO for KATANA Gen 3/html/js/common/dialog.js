function InfomarionDialog(title, message) {
    this.id = '#info-dialog';
    this.titleLabel = '#info-dialog-title p';
    this.messageLabel = '#info-dialog-message p';
    this.okBtn = '#info-dialog-ok-btn';
    this.title = title;
    this.message = message;
}

InfomarionDialog.prototype.open = function (func) {
    popup_open(this.id.slice(1));
    $(this.titleLabel).text(this.title);
    $(this.messageLabel).text(this.message); 
    var self = this;
    $(this.okBtn).on(pointer.click, function () {
        $(self.okBtn).off(pointer.click);
        if (typeof func === 'function' && typeof func !== 'undefined') {
            func();
        }
        popup_close(self.id.slice(1));
    });
};

InfomarionDialog.prototype.close = function (func) {
    $(this.okBtn).off(pointer.click);
    if (typeof func === 'function' && typeof func !== 'undefined') {
        func();
    }
    popup_close(this.id.slice(1));
};

function getCompleteDialog(title) {
    return new InfomarionDialog(title, 'Completed.');
}

var COMPLETE_DIALOG_MAP = {
    import: getCompleteDialog( 'IMPORT' ),
    export: getCompleteDialog( 'EXPORT' ),
    addLiveset: getCompleteDialog( 'ADD LIVESET' ),
    addSession: getCompleteDialog( 'ADD SONG' ),
    addSessionAndLiveset: getCompleteDialog( 'ADD SONG AND LIVESET' )
};

function getCanceledDialog(title) {
    return new InfomarionDialog(title, 'Canceled.');
}

var CANCELED_DIALOG_MAP = {
    export: getCanceledDialog( 'EXPORT' ),
}

function getFailedDialog(title) {
    return new InfomarionDialog(title, 'Failed.');
}

var FAILED_DIALOG_MAP = {
    export: getFailedDialog( 'EXPORT' ),
}