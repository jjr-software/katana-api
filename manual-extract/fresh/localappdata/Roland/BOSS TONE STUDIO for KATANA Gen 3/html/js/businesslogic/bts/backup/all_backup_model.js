/**
 *  [概要]
 *  ALL DATA BACKUPで扱うデータのModel
 *
 *  [使用箇所]
 *  ALL DATA BACKUP画面
 *
 *  [改善ポイント]
 *  ・load時にコードのnestが深くなっているため、可読性が低い
 * 
 */

function AllDataModel() {
  this.allDataParamSets = allBackupController.allData.paramSets;
  this.allDataConfigs = {};
  for (var i = 0, len = allBackupController.allData.configs.length; i < len; i++) {
    var _$ = allBackupController.allData.configs[i];
    this.allDataConfigs[_$.name] = _$.config;
  }
  this.dataExist = allBackupController.allData.dataExist;
}

AllDataModel.prototype = {
  /** 
   * All Dataの構造は以下の通り
   * {
   *   "system": { SystemSetting },
   *   "userPatch": [
   *      LibrarianSetting, // ユーザーパッチ数分；null が入る場合あり
   *    ],
   *   "formatRev": "データのリビジョン",
   *   "device": "アプリがサポートしている機種"
   * } 
   */
  toJSON: function() {
    var o = {};
    for (var prop in this.allDataParamSets) {
      if (! this.allDataParamSets.hasOwnProperty(prop)) {
        continue;
      }
      if (this.allDataConfigs[prop].hasOwnProperty('rows')) {
        o[prop] = [];
        for (var i = 0, length = this.allDataParamSets[prop].length; i < length; i++) {
          o[prop][i] = this.allDataParamSets[prop][i];
        }
      } else {
        o[prop] = this.allDataParamSets[prop];
      }
    }
    o['formatRev'] = ProductSetting.backupFile.formatRev;
    o['device'] = ProductSetting.name;
    o['model'] = ProductSetting.modelNameForAlb;
    var json = JSON.stringify(o);
    return json;
  },
  load: function(json) {
    var o = JSON.parse(json);
    if (_checkAllDataBackupFormat(o)) {
      _checkAllDataBackupRevision(o, this.allDataParamSets);
      for (var prop in this.allDataParamSets) {
        if (! o.hasOwnProperty(prop)) {
          delete this.allDataParamSets[prop];
          continue;
        }
        var hasRows = this.allDataConfigs[prop].hasOwnProperty('rows');
        var length = (hasRows)? o[prop].length : 1;
        for (var i = 0; i < length; i++) {
          var src = (hasRows)? o[prop][i] : o[prop];
          var dst = (hasRows)? this.allDataParamSets[prop][i] : this.allDataParamSets[prop];
          if ((! this.dataExist(prop, i)) || (! src)) {
            dst = null;
          } else {
            for (var key in dst) {
              var bid = (hasRows)? _bid(key, i) : key;
              if (src.hasOwnProperty(key)) {
                var snum = src[key].length;
                var dnum = dst[key].length;
                dst[key] = src[key];
                if (snum < dnum) {
                  dst[key] = dst[key].concat(Parameter.initblock(bid).slice(snum));
                } else if (snum > dnum) {
                  dst[key].splice(dnum);
                }
              } else {
                if (prop === 'system') {
                  delete dst[key];
                } else {
                  dst[key] = Parameter.initblock(bid);
                }
              }
            }
          }
        }
      }
    } else {
      throw new Error('this file is unsupported');
    }

    function _checkAllDataBackupFormat(o) {
      if (! o.hasOwnProperty('formatRev'))      return false;
      if (! o.hasOwnProperty('device'))         return false;
      if (o.device !== ProductSetting.name)     return false;
      if (! o.hasOwnProperty('system'))         return false;
      if (! o.hasOwnProperty('userPatch'))      return false;
      return true;
    }

    function _checkAllDataBackupRevision(o, ref) {
      var loadFileRev = o.formatRev - 0;
      var appRev = ProductSetting.backupFile.formatRev - 0;
      if (loadFileRev < appRev) {
        // if (o.formatRev === '0000') {
        // }
      }
      
    }
  }
};
