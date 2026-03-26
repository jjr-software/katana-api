/**
 *  [概要]
 *  All Dataのコンストラクタ
 *
 *  [使用箇所]
 *  ALL DATA BACKUP画面
 * 
 */

function AllData() {

  this.timerId = null;
  this.configCommand = null;
  this.configStop = null;
  this.observers = [];

  this.configs = [];
  this.configs.push({ // System
    name: 'system',
    config: ProductSetting.editor[1].config
  });
  this.configs.push({ // System
    name: 'setup',
    config: ProductSetting.editor[4].config
  });
  this.configs.push({ // UserPatch
    name: 'userPatch',
    config: ProductSetting.librarian[0].config
  });
  this.paramSets = {
    setup: {},
    system: {},
    userPatch: [],
  };
  this.paramSets = {};
  // それぞれのプロパティに対象のデータの参照をコピー
  for (var i = 0, length = this.configs.length; i < length; i++) {
    var name = this.configs[i].name;
    var hasRows = this.configs[i].config.hasOwnProperty('rows');
    var rows = 1;
    if (hasRows) {
      rows = this.configs[i].config.rows;
      this.paramSets[name] = [];
    } else {
      this.paramSets[name] = {};
    }
    var blockSet = this.configs[i].config.blockSet;
    for (var row = 0; row < rows; row++) {
      if (hasRows) {
        if (! this.dataExist(name, row)) {
          this.paramSets[name][row] = null;
          continue;
        }
        this.paramSets[name][row] = {};
      }
      for (var n = 0, num = blockSet.length; n < num; n++) {
        var bid = blockSet[n];
        if (hasRows) {
          this.paramSets[name][row][bid] = Parameter.paramSet[_bid(bid, row)];
        } else {
          this.paramSets[name][bid] = Parameter.paramSet[bid];
        }
      }
    }
  }
}

AllData.prototype = new ReadWriteLogic();

AllData.prototype.read = function () {
  if (this.timerId) return;
  var tasks = [];
  for (var i = 0, length = this.configs.length; i < length; i++) {
    var config = this.configs[i].config;
    var blockSet = config.blockSet;
    var hasRows = config.hasOwnProperty('rows');
    var rows = (hasRows)? config.rows : 1;
    for (var row = 0; row < rows; row++) {
      for (var n = 0, num = blockSet.length; n < num; n++) {
        var bid = blockSet[n];
        if (hasRows) {
          bid = _bid(blockSet[n], row);
        }
        var b = Parameter.getblock(bid);
        var addr = b.addr;
        var size = 0;
        while ((size = b.size.shift()) !== undefined) {
          tasks.push({ addr: addr, size: size });
          addr += size;
        }
      }
    }
  }
  this.configStop = function () { };
  this.readStart(tasks, 'all_data_read');
};

AllData.prototype.write = function () {
  if (this.timerId) return;
  var tasks = [];
  var systemCommon = [];
  for (var index = 0, length = this.configs.length; index < length; index++) {
    var config = this.configs[index].config;
    var paramSet = this.paramSets[this.configs[index].name];
    if (! paramSet) {
      continue;
    }
    var hasRows = config.hasOwnProperty('rows');
    var rows = (hasRows)? config.rows : 1;
    for (var row = 0; row < rows; row++) {
      for (var n = 0, num = config.blockSet.length; n < num; n++) {
        var bid = config.blockSet[n];
        var d = null;
        if (hasRows) {
          if (paramSet[row]) {
            d = paramSet[row][bid];
          }
        }
        else {
          d = paramSet[bid];
        }
        if (! d) {
          continue;
        }
        if (hasRows) {
          bid = _bid(config.blockSet[n], row);
        }
        var b = Parameter.getblock(bid);
        var addr = b.addr;
        var str = (d.join()).replace(/,/g, '');
        var wait = 0;
        if (b.size < 0) {
          b.size = [4];
          var len = (str.length / 2) - 4;
          wait = len ? ProductSetting.waitVariable : ProductSetting.waitVariable0;
          for (var cnt = 0; len > 0; len -= cnt) {
            cnt = (len < SYSEX_MAXLEN) ? len : SYSEX_MAXLEN;
            b.size.push(cnt);
          }
        }
        var size = 0;
        var i = 0;
        while ((size = b.size.shift()) !== undefined) {
          var data = str.substr(i * 2, size * 2);
          tasks.push({ addr: addr, data: data });
          addr += size; i += size;
        }
        if (wait) {
          tasks[tasks.length - 1].wait = wait;
        }
      }
    }
    if (index === 0) {
      for (var t = 0; t < tasks.length; t++) {
        if (tasks[t].addr === nibble(ADDRESS_CONST.COMMAND.CURRENT_PATCH_NUMBER)) {
          systemCommon = tasks.splice(t, 1); // SystemCommonの情報を最後に取得するように退避しておく
          break;
        }
      }
      //systemCommon = tasks.splice(1, 1); // SystemCommonの情報を最後に取得するように退避しておく
      //var tail = tasks.slice(1, tasks.length);
      //tasks = tail;
    }
  }
  //tasks = tasks.concat(systemCommon);
  this.configCommand = function () { };
  this.configStop = function () { };
  this.writeStart(tasks, 'all_data_write', ProductSetting.waitStart, ProductSetting.waitStop);
};

AllData.prototype.cancel = function () {
  this.abort();
  this.broadcast('all_data_cancel', null);
};

AllData.prototype.dataExist = function(name, row) {
  if ((name === 'userPatch') && (window.modelInfo)) {
    return window.modelInfo.config().patchExist(row);
  }
  return true;
};
