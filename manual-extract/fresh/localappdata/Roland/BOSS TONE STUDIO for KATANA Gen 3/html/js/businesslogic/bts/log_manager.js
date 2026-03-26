/* global
urlDefinition
util
*/

var LogManager = function() {
};

LogManager.prototype.TIME_OUT_MSEC = 15000;
LogManager.prototype.GUID = null;
LogManager.prototype.getUrlDefinition = function() {
  // urlDefinition宣言ファイルとこのファイルの前後関係を問わないように関数で返す
  return urlDefinition;
};

LogManager.prototype.setGUID = function() {
  var storage = util.readStorage();
  this.GUID = (storage.guid !== undefined) ? storage.guid : null;
  if (this.GUID === null) {
    var result = '';
    for (var i = 0; i < 32; i++) {
      var num = Math.round(Math.random() * 15);
      result += num.toString(16).toUpperCase();
      if (i === 7 || i === 11 || i === 15 || i === 19) {
        result += '-';
      }
    }
    this.GUID = result;
    storage.guid = result;
    $native.app.storage(JSON.stringify(storage));
  }
};
LogManager.prototype.getGUID = function() {
  if (this.GUID === null) {
    this.setGUID();
  }
  return this.GUID;
};
LogManager.prototype.getURL = function() {
  return '';
};
LogManager.prototype.post = function(params) {
  $.ajax({
    url: this.getURL(),
    type: 'POST',
    dataType: 'json',
    data: params,
    timeout: this.TIME_OUT_MSEC,
    success: function(success) {
      // console.log(success);
    },
    error: function(err) {
      // console.log(err);
    },
    complete: function(result) {
      // console.log(result);
    }
  });
};


var SelectLivesetLogManager = function() {
  LogManager.call(this);
};
SelectLivesetLogManager.prototype = Object.create(LogManager.prototype);
SelectLivesetLogManager.prototype.constructor = SelectLivesetLogManager;
SelectLivesetLogManager.prototype.getURL = function() {
  return this.getUrlDefinition().API_DOMAIN + this.getUrlDefinition().API_LIVESET_LOGS;
};
SelectLivesetLogManager.prototype.post = function(param) {
  var params = {
    guid: this.getGUID(),
    liveset_name: param
  };
  LogManager.prototype.post.call(this, params);
};


var PlayYouTubeLogManager = function() {
  LogManager.call(this);
};
PlayYouTubeLogManager.prototype = Object.create(LogManager.prototype);
PlayYouTubeLogManager.prototype.constructor = PlayYouTubeLogManager;
PlayYouTubeLogManager.prototype.getURL = function() {
  return this.getUrlDefinition().API_DOMAIN + this.getUrlDefinition().API_YOUTUBE_LOGS;
};
PlayYouTubeLogManager.prototype.post = function(param) {
  var params = {
    guid: this.getGUID(),
    play_event: param
  };
  LogManager.prototype.post.call(this, params);
};


var PlaySoundCloudLogManager = function() {
  LogManager.call(this);
};
PlaySoundCloudLogManager.prototype = Object.create(LogManager.prototype);
PlaySoundCloudLogManager.prototype.constructor = PlaySoundCloudLogManager;
PlaySoundCloudLogManager.prototype.getURL = function() {
  return this.getUrlDefinition().API_DOMAIN + this.getUrlDefinition().API_SOUND_CLOUD_LOGS;
};
PlaySoundCloudLogManager.prototype.post = function(param) {
  var params = {
    guid: this.getGUID(),
    sound_name: param
  };
  LogManager.prototype.post.call(this, params);
};


var UserLogManager = function() {
  LogManager.call(this);
};
UserLogManager.prototype = Object.create(LogManager.prototype);
UserLogManager.prototype.constructor = UserLogManager;
UserLogManager.prototype.getURL = function() {
  return this.getUrlDefinition().API_DOMAIN + this.getUrlDefinition().API_USER;
};
UserLogManager.prototype.post = function() {
  var params = {
    guid: this.getGUID(),
    remote_addr: '',
    product: ProductSetting.name,
    app_name: ProductSetting.appName,
    app_version: ProductSetting.version,
    app_revision: '',
    os: util.getDeviceOs(),
    resolution_x: screen.width,
    resolution_y: screen.height,
    runtime: ProductSetting.version,
    app_language: language,
    os_language: language
  };
  LogManager.prototype.post.call(this, params);
};


var StatusLogManager = function() {
  LogManager.call(this);
};
StatusLogManager.prototype = Object.create(LogManager.prototype);
StatusLogManager.prototype.constructor = StatusLogManager;
StatusLogManager.prototype.getURL = function() {
  return this.getUrlDefinition().API_DOMAIN + this.getUrlDefinition().API_STATUS_LOGS;
};
StatusLogManager.prototype.post = function(param) {
  var currentDate = new Date();
  var formatDate = [
    currentDate.getFullYear(),
    ('0' + (currentDate.getMonth() + 1)).slice(-2),
    ('0' + currentDate.getDate()).slice(-2)
  ].join('/');
  var formatTime = [
    ('0' + (currentDate.getHours() + 1)).slice(-2),
    ('0' + (currentDate.getMinutes() + 1)).slice(-2),
    ('0' + (currentDate.getSeconds() + 1)).slice(-2)
  ].join(':');
  var statusDate = formatDate + ' ' + formatTime;
  var params = {
    guid: this.getGUID(),
    status_date: statusDate,
    status_flag: param
  };
  LogManager.prototype.post.call(this, params);
};


var UpdateLogManager = function() {
  LogManager.call(this);
};
UpdateLogManager.prototype = Object.create(LogManager.prototype);
UpdateLogManager.prototype.constructor = UpdateLogManager;
UpdateLogManager.prototype.getURL = function() {
  return this.getUrlDefinition().API_DOMAIN + this.getUrlDefinition().API_UPDATE_LOGS;
};
UpdateLogManager.prototype.post = function(param) {
  var params = {
    guid: this.getGUID(),
    update_version: param
  };
  LogManager.prototype.post.call(this, params);
};


var AddLivesetLogManager = function() {
  LogManager.call(this);
};
AddLivesetLogManager.prototype = Object.create(LogManager.prototype);
AddLivesetLogManager.prototype.constructor = AddLivesetLogManager;
AddLivesetLogManager.prototype.getURL = function() {
  return this.getUrlDefinition().API_DOMAIN + this.getUrlDefinition().API_LIVESET_ADD_LOGS;
};
AddLivesetLogManager.prototype.post = function(param) {
  var params = {
    guid: this.getGUID(),
    liveset_name: param
  };
  LogManager.prototype.post.call(this, params);
};


var AddPatchesLogManager = function() {
  LogManager.call(this);
};
AddPatchesLogManager.prototype = Object.create(LogManager.prototype);
AddPatchesLogManager.prototype.constructor = AddPatchesLogManager;
AddPatchesLogManager.prototype.getURL = function() {
  return this.getUrlDefinition().API_DOMAIN + this.getUrlDefinition().API_PATCH_USE_LOGS;
};
AddPatchesLogManager.prototype.post = function(param) {
  var params = {
    guid: this.getGUID(),
    patch_name: param
  };
  LogManager.prototype.post.call(this, params);
};

(function() {
  // TONCE CENTRAL Liveset選択
  window.selectLivesetLogManager = new SelectLivesetLogManager();
// TONE CENTRAL Youtube動画再生
  window.playYouTubeLogManager = new PlayYouTubeLogManager();
// TONE CENTRAL SoundCloud再生
  window.playSoundCloudLogManager = new PlaySoundCloudLogManager();
// アプリ起動時
  window.userLogManager = new UserLogManager();
// アップデート時
  window.updateLogManager = new UpdateLogManager();
// アプリ起動時、終了時
  window.statusLogManager = new StatusLogManager();
// TONE CENTRAL LibrarianにLivesetを追加
  window.addLivesetLogManager = new AddLivesetLogManager();
// 本体PATCH追加
  window.addPatchesLogManager = new AddPatchesLogManager();
})();
