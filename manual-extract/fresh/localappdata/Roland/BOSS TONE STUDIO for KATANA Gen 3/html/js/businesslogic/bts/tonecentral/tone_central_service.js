/**
 * [概要]
 * BOSS TONE CENTRAL画面 データ取得処理
 * 
 * [使用箇所]
 * BOSS TONE CENTRAL画面
 * 
 * [改善ポイント]
 * 通信処理完了関数の中に別の通信処理を記述しているため、ネストが深くなってしまっている。
 */

/**
 * BTC 定数定義object
 */
var TC_SERVICE_CONST = Object.freeze({
  YOUTUBE_API: "https://www.youtube.com/iframe_api", //Youtube API
  SC_API: "https://w.soundcloud.com/player/api.js", //Sound Cloud API
  TIMEOUT_MSEC: 15000 //通信時のタイムアウトの時間
});

// BTX WARNING for first version
function _ConvertVersionNumToDigit(versionStr) {
    var versionArray = versionStr.split('.');
    var versionInt = 0;
    for (var idx = 0; idx < versionArray.length; idx++) {
        versionInt += versionArray[idx] * (10 ** (2 - idx));
    }
    return versionInt;
}
function _OpenBtxLeadingToUpdateWarning() {
    var localVersion = _ConvertVersionNumToDigit(ProductSetting.version);
    var jasonVersion = _ConvertVersionNumToDigit(urlDefinition.BTC_VERSION);
    if (localVersion < jasonVersion) {
        if ($native.app.storage2(STORAGE_KEY.DO_NOT_SHOW_AGAIN_BTX_WARNING_OF_LEADING_TO_UPDATE) === 'true') {
        } else {
            ERROR_DIALOG_MAP.btxWarningOfLeadingToUpdate.open(function () {});
        }
    }
}
function _OpenBtxWarning () {
    if (_ConvertVersionNumToDigit(ProductSetting.version) >= 110) {} /* もうアップデート済みなので何もする必要はない */
    else if (_ConvertVersionNumToDigit(urlDefinition.BTC_VERSION) >= 110){
      /* サーバー側が1.1.0になったのでアップデートを勧告する */
      _OpenBtxLeadingToUpdateWarning();
    }
    else {
      /* まだ準備できていない旨を表示 */
      if ($native.app.storage2(STORAGE_KEY.DO_NOT_SHOW_AGAIN_BTX_WARNING_OF_UNDER_CONSTRUCTION) !== 'true'){
        ERROR_DIALOG_MAP.btxWarningOfUnderConstruction.open(function () {});
      }
    }
}

var ToneCentralService = {
  ytApiSuccess: false,
  scApiSuccess: false,
  tcLivesetObj: null,
  tcYoutubePlayer: null,
  tcSCPlayer: null,
  /**
   * tslファイルバリデート処理
   */
  checkTslFile: function(tslObj) {
    if (typeof tslObj !== 'object') {
      return false;
    }
    //if (tslObj.data && (tslObj.data[0] !== undefined) && (tslObj.name !== undefined) && (tslObj.data !== undefined)) {
    //  var isValid = true;
    //  for (var i = 0; i < tslObj.data[0].length; i++) {
    //    if (tslObj.data[0][i].memo === undefined && tslObj.data[0][i].paramSet === undefined) {
    //        isValid = false;
    //    }
    //  }
    //  return isValid;
    //}
    return true;
  },
  getUrl: function() {
    return urlDefinition;
  },
  /**
   * BTC LIVESET一覧取得処理
   */
  tcLoadLivesetList: function() {
    var livesetList = null;
    processingController.start(function(index) {
      var hasCanceled = false;
      var url = ToneCentralService.getUrl();
      if (url.BTC_DOMAIN === '' || url.BTC_DATA_API === '') {
        //URL定義がない場合はサーバーから再取得する
        urlDefinition.fetchUrlDefinition(function() {
          if (hasCanceled) {
            return;
          }
          getLivesetList(
            function() {
              processingController.finish(index);
              _OpenBtxWarning();
            },
            function() {
              processingController.finish(index);
              ERROR_DIALOG_MAP.noInternetAccess.open();
            }
          );
        });
      } else {
        getLivesetList(
          function() {
            processingController.finish(index);
            _OpenBtxWarning();
          },
          function() {
            processingController.finish(index);
            ERROR_DIALOG_MAP.noInternetAccess.open();
          }
        );
      }
      return function() {
        hasCanceled = true;
      };
    });
    function getLivesetList(completeFunc, errorFunc) {
      $.ajax({
        url: urlDefinition.BTC_DOMAIN + urlDefinition.BTC_DATA_API,
        type: 'GET',
        cache: false, //キャッシュは残さないようにする
        timeout: TC_SERVICE_CONST.TIMEOUT_MSEC,
        success: function(data) {
          if (data.items !== undefined) {
            livesetList = data.items;
          } else {
            livesetList = null;
          }
        },
        error: function(e) {
          livesetList = null;
        },
        complete: function(r) {
          if (livesetList !== null) {
            completeFunc();
            ToneCentralUiService.tcDrawLivesetList(livesetList);
          } else {
            errorFunc();
          }
        }
      });
    }
  },
  /**
   * BTC LIVESETポップアップ表示に必要なデータ取得処理
   */
  tcLoadLivesetInfo: function(liveset) {
    processingController.start(function(index) {
      var hasCanceled = false;
      var url = ToneCentralService.getUrl();
      if (url.SC_DOMAIN === '' || url.SC_RESOLVE === '' || url.SC_CLIENT_ID === '' || url.BTC_LIVESET_FILE === '') {
        //URL定義がない場合はサーバーから再取得
        urlDefinition.fetchUrlDefinition(function() {
          if (hasCanceled) {
            return;
          }
          ToneCentralService.getLivesetInfo(
            liveset,
            function() {
              processingController.finish(index);
            },
            function() {
              processingController.finish(index);
              ERROR_DIALOG_MAP.noInternetAccess.open();
            },
            function() {
              processingController.finish(index);
              ERROR_DIALOG_MAP.unsupportedData.open();
            }
          );
        });
      } else {
        ToneCentralService.getLivesetInfo(
          liveset,
          function() {
            processingController.finish(index);
          },
          function() {
            processingController.finish(index);
            ERROR_DIALOG_MAP.noInternetAccess.open();
          },
          function() {
            processingController.finish(index);
            ERROR_DIALOG_MAP.unsupportedData.open();
          }
        );
      }
      return function() {
        hasCanceled = true;
      };
    });
  },
  /**
   * LIVESETポップアップ データ取得処理
   * @param liveset LIVESETの描画に必要なデータを格納してあるobject
   * @param scData Sound CloudのURLが定義されているobject
   * @param livesetDetail tslファイル
   */
  getLivesetInfo: function(liveset, completeFunc, errorFunc, unSupportError) {
    function _getLivesetInfo(liveset, completeFunc, errorFunc, unSupportError) {
      $.ajax({
        url: urlDefinition.BTC_DOMAIN + urlDefinition.BTC_LIVESET_FILE + liveset.basename + '.' + ProductSetting.livesetFile.extension,
        type: 'GET',
        cache: false,
        timeout: TC_SERVICE_CONST.TIMEOUT_MSEC,
        success: function(livesetItem) {
          livesetDetail = livesetItem;
        },
        error: function(error) {
          livesetDetail = null;
        },
        complete: function(complete) {
          if (livesetDetail === null) {
            errorFunc();
            return;
          }
          var tslObj = JSON.parse(livesetDetail);
          if (ToneCentralService.checkTslFile(tslObj)) {
            let models = ProductSetting.toneCentral.info().models;
            if (models.includes(tslObj.device)) {
              ToneCentralService.tcLivesetObj = ToneCentralService.import(tslObj);
              completeFunc();
              ToneCentralUiService.tcDrawLivesetInfo(
                liveset, ToneCentralService.tcLivesetObj, scData
              );
              ToneCentralUiService.assignDomEvent();
              return;
            }
          }
          unSupportError();
        }
      });
    }
    var scData = null;
    var livesetDetail = null;
    if (! liveset.soundcloudUrl) {
      _getLivesetInfo(liveset, completeFunc, errorFunc, unSupportError);
      return;
    }
    $.ajax({
      url: urlDefinition.SC_DOMAIN + urlDefinition.SC_RESOLVE + '?client_id=' + urlDefinition.SC_CLIENT_ID + '&url=' + liveset.soundcloudUrl,
      type: 'GET',
      cache: false, //キャッシュは残さないようにする
      timeout: TC_SERVICE_CONST.TIMEOUT_MSEC,
      success: function(data) {
        scData = data;
      },
      error: function(e) {
        scData = null;
      },
      complete: function(response) {
        _getLivesetInfo(liveset, completeFunc, errorFunc, unSupportError);
      }
    });
  },
  import: function(tslObj) {
    if (tslObj.device === ProductSetting.name) {
      return LibrarianModel.read(tslObj);
    }
    try {
      return window.Converter.liveset.import(tslObj);
    }
    catch (e) {
      return null;
    }
  }
};
window.YT = undefined;
window.tcLoadYoutubeApi = function() {
  $.ajax({
    url: TC_SERVICE_CONST.YOUTUBE_API,
    type: 'GET',
    dataType: 'script',
    timeout: TC_SERVICE_CONST.TIMEOUT_MSEC,
    success: function (s) {
      if (YT !== undefined) {
        ToneCentralService.ytApiSuccess = true;
      }
    },
    error: function(e) {
      ToneCentralService.ytApiSuccess = false;
    }
  });
};
window.tcLoadSCApi = function() {
  $.ajax({
    url: TC_SERVICE_CONST.SC_API,
    type: 'GET',
    dataType: 'script',
    timeout: TC_SERVICE_CONST.TIMEOUT_MSEC,
    success: function(s) {
      ToneCentralService.scApiSuccess = true;
    },
    error: function(e) {
      ToneCentralService.scApiSuccess = false;
    }
  });
};