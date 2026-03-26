/**
 * [概要]
 * URL取得処理
 *
 * [使用箇所]
 * index.jsでurlDefinition.fetchUrlDefinition()を呼び出し、url定義を取得。
 * その後はurlDefinition.BTC_DOMAINのように取得したURLを各箇所で用いる。
 *
 */

/**
 *
 * @constructor
 */
var URLDefinition = function () {
  this.MODEL = ProductSetting.toneCentral.info().model;
  if (this.MODEL === undefined) {
    this.MODEL = ProductSetting.name;
  }

  // json ver
  this.BTC_VERSION = '';

  // BTC
  this.BTC_DOMAIN = '';
  this.BTC_DATA_API = '';
  this.BTC_LIVESET_FILE = '';

  // Roland
  this.API_DOMAIN = '';
  this.API_USER = '';
  this.API_STATUS_LOGS = '';
  this.API_UPDATE_LOGS = '';
  this.API_PATCH_USE_LOGS = '';
  this.API_LIVESET_ADD_LOGS = '';
  this.API_LIVESET_LOGS = '';
  this.API_YOUTUBE_LOGS = '';
  this.API_SOUND_CLOUD_LOGS = '';

  // Sound Cloud
  this.SC_DOMAIN = '';
  this.SC_CLIENT_ID = '';
  this.SC_RESOLVE = '';

  // Youtube
  this.YOUTUBE_URL = '';

  // マニュアル
  this.OWNERS_MANUALS_JA = 'https://www.boss.info/jp/products/katana-50_gen_3/support/';
  this.OWNERS_MANUALS_EN = 'https://www.boss.info/global/products/katana-50_gen_3/support/';

  // ドライバーアップデート
  this.UPDATES_DRIVERS_JA = 'https://www.boss.info/jp/products/katana-50_gen_3/downloads/';
  this.UPDATES_DRIVERS_EN = 'https://www.boss.info/global/products/katana-50_gen_3/downloads/';

  // tips
  this.TIPS_DOMAIN = null;
  this.TIPS_MODE = 0; // 0:pub, 1:dev, 2:local
};

URLDefinition.prototype.execURL = function (url) {
  if (url === '') {
    processingController.start(function (index) {
      var hasCanceled = false;
      urlDefinition.fetchUrlDefinition(function () {
        if (hasCanceled) {
          return;
        }
        processingController.finish(index);
        $native.fs.exec(url);
      });
      return function () {
        hasCanceled = true;
      };
    });
  } else {
    $native.fs.exec(url);
  }
}

/**
 * サーバから各URLを取得
 * 起動時に呼び出す必要有り
 */
URLDefinition.prototype.fetchUrlDefinition = function (completeFunc) {
  var self = this;
  var result = { urlObj: null, isSuccess: false };
  var isOnLine = navigator.onLine;

  const completeHndl = () => {
    let urlObj = {};
    if (result.urlObj !== null && result.isSuccess) {
      urlObj = result.urlObj;
    } else {
      urlObj = {};
    }
    self._updateTipsApi(urlObj);
    self._setUrlDefinition(urlObj);
    self._updateProductSettingManual();
    if (typeof completeFunc === 'function') {
      completeFunc();
    }
  };
  $.ajax({
    url: ProductSetting.toneCentral.info().url,
    type: 'GET',
    contentType: "application/json",
    success: function (obj) {
      try {
        result.urlObj = JSON.parse(obj);
      } catch (e) {
        result.urlObj = obj;
      }
      result.isSuccess = true;
    },
    error: function () {
      result.urlObj = null;
      result.isSuccess = false;

      if (ProductSetting.toneCentral.devMode == false) {
        /* PIDDまでUUIDで表現された仮ファイルを取得する処理 */
        const urlSubstitute = ProductSetting.toneCentral.info().urlSubstitute
        $.ajax({
          url: urlSubstitute,
          type: 'GET',
          dataType: 'json',
          success: function (obj) {
            result.urlObj = obj;
            result.isSuccess = true;
          },
          complete: completeHndl
        });
      }
    },
    complete: completeHndl
  });
};

/**
 * 取得したJSONをクラスメンバに代入(private method)
 * @param urlObj
 * @private
 */
URLDefinition.prototype._setUrlDefinition = function (urlObj) {
  // undefinedを空文字に変換する関数
  var convertUndefined = function (str) {
    return str === undefined ? '' : str;
  };

  var btcObj = urlObj.btc;
  var apiObj = urlObj.api;
  var externalServiceObj = urlObj.external_service;
  var supportObj = urlObj.support;

  this.BTC_VERSION = convertUndefined(urlObj.version)

  if (btcObj !== undefined) {
    this.BTC_DOMAIN = convertUndefined(btcObj.domain);
    this.BTC_LIVESET_FILE = convertUndefined(btcObj.liveset_file);
    this.BTC_DATA_API = convertUndefined(btcObj.dataapi);
  }
  if (apiObj !== undefined) {
    this.API_DOMAIN = convertUndefined(apiObj.domain);
    this.API_USER = convertUndefined(apiObj.user);
    this.API_STATUS_LOGS = convertUndefined(apiObj.statuslogs);
    this.API_UPDATE_LOGS = convertUndefined(apiObj.updatelogs);
    this.API_PATCH_USE_LOGS = convertUndefined(apiObj.patchuselogs);
    this.API_LIVESET_ADD_LOGS = convertUndefined(apiObj.livesetaddlogs);
    this.API_LIVESET_LOGS = convertUndefined(apiObj.livesetlogs);
    this.API_YOUTUBE_LOGS = convertUndefined(apiObj.youtubelogs);
    this.API_SOUND_CLOUD_LOGS = convertUndefined(apiObj.soundcloudlogs);
  }
  if (externalServiceObj !== undefined) {
    if (externalServiceObj.soundcloud !== undefined) {
      var soundCloudObj = externalServiceObj.soundcloud;
      this.SC_DOMAIN = convertUndefined(soundCloudObj.domain);
      this.SC_CLIENT_ID = convertUndefined(soundCloudObj.client_id);
      this.SC_RESOLVE = convertUndefined(soundCloudObj.resolve);
    }
    if (externalServiceObj.youtube !== undefined) {
      var youtubeObj = externalServiceObj.youtube;
      this.YOUTUBE_URL = convertUndefined(youtubeObj.url);
    }
  }
  if (supportObj !== undefined) {
    if (supportObj.owners_manuals !== undefined) {
      var manuals = supportObj.owners_manuals;
      this.OWNERS_MANUALS_JA = convertUndefined(manuals.jp);
      this.OWNERS_MANUALS_EN = convertUndefined(manuals.en);
    }
    if (supportObj.updates_drivers !== undefined) {
      var updatesDrivers = supportObj.updates_drivers;
      this.UPDATES_DRIVERS_JA = convertUndefined(updatesDrivers.jp);
      this.UPDATES_DRIVERS_EN = convertUndefined(updatesDrivers.en);
    }
  }
};

URLDefinition.prototype._updateTipsApi = function (urlObj) {
  // undefinedを空文字に変換する関数
  var convertUndefined = function (str) {
    return str === undefined ? '' : str;
  };

  if (btsTipsController.isTipsReady) {
    return; // TIPS 切り替え非対応.
  }

  var isOnLine = navigator.onLine;
  var tipsObj = {};

  if (urlObj.tips !== undefined) {
    tipsObj.domain = convertUndefined(urlObj.tips.domain);
    tipsObj.api = convertUndefined(urlObj.tips.api);
    tipsObj.def = convertUndefined(urlObj.tips.def);
    }else { // load local
    tipsObj.api = "tipsapi.js";
    tipsObj.def = "tipsdef.js";
    tipsObj.domain = ProductSetting.toneCentral.tips_dev_local.url;
  } 

  if (isOnLine && !btsTipsController.isTipsReady && tipsObj.domain != "") {
    urlDefinition.TIPS_MODE = ProductSetting.toneCentral.devMode ? 1 : 0; // i.e. 0:pub, 1:dev
  } else {
    // console.log("url error1:" + tipsObj.domain);
    //if (tipsObj.domain == "") // 34ea9a27dd767be7.json の domain が空白の場合のみ有効にする.
    {
      tipsObj.domain = ProductSetting.toneCentral.tips_dev_local.url;
    }
    this.TIPS_MODE = 2; // i.e. 2:local
  }
  btsTipsController.loadTipsLocal(tipsObj);

  btsTipsController.updateContentHtml();
  this.TIPS_DOMAIN = tipsObj.domain;
  initializeMenuPage();
};

/**
 * ProductSetting内のマニュアル定義を書き換え
 * @private
 */
URLDefinition.prototype._updateProductSettingManual = function () {
  ProductSetting.manual.ja = this.OWNERS_MANUALS_JA;
  ProductSetting.manual.en = this.OWNERS_MANUALS_EN;
};

/**
 * インスタンスを作成
 */
(function () {
  window.urlDefinition = new URLDefinition;
})();
