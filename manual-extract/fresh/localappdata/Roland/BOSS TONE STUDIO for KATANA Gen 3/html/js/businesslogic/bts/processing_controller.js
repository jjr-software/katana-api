/**
 * [概要]
 * loadingを表示させる処理を一括管理するオブジェクトを定義
 *
 * loading処理が複数重なった場合にも、
 * 成功時、タイムアウト時によるloading表示の終了を適切に行えるようにしている。
 * また、disconnect時に、現在行なっているloading処理を強制終了することにも対応。
 *
 * [使用箇所]
 * loading表示をする処理を開始する場合に、以下のように使用する。
 * processingController.start(function (index) {
 *
 *   loading表示を発生させる処理
 *
 *   // 処理が終了orタイムアウトした場合の箇所で呼び出す
 *   processingController.finish(index);
 *
 *   return function() {
 *     allClear時に行いたい処理
 *     ※ finish()は呼ばない
 *   };
 * });
 *
 * [改善ポイント]
 * 使用場所においてコールバック関数がネストして可読性が著しく欠けている箇所がある。
 *
 * また、今後別のプロジェクトなどで各開発者が独自実装するとバグや考慮漏れなどが起こりやすい箇所なので、
 * editor, librarianのようにある程度共通にまとまっているといいように思えました。
 */

(function() {
  var nextIndex = 0;

  // 各処理終了時のコールバック関数を格納
  var pool = [];

  window.processingController = {
    // 一件も登録されていない場合はloadingを表示
    start: function(callback) {
      if (pool.length === 0) {
        this._popupOpen();
      }
      pool[nextIndex] = callback(nextIndex);
      nextIndex += 1;
    },
    // poolから取り除いた上で、全件終了している場合はloadingを終了
    finish: function(index) {
      pool[index] = null;
      if (pool.every(function(value) {
        return value === null;
      })) {
        nextIndex = 0;
        pool = [];
        this._popupClose();
      }
    },
    // 強制的に全ての処理を終了させ、loadingを終了
    allClear: function() {
      pool.forEach(function(value) {
        if (typeof value === 'function') {
          value();
        }
      });
      nextIndex = 0;
      pool = [];
      this._popupClose();
    },
    _popupOpen: function() {
      btsDOMController.openLoading();
    },
    _popupClose: function() {
      btsDOMController.closeLoading();
    }
  };
})();
