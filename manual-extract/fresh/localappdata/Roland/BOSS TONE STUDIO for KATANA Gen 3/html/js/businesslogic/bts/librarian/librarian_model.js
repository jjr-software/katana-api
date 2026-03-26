/**
 * [概要]
 * LIVESETのMODEL
 *
 * [使用箇所]
 * LIBRARIAN画面
 *
 * [改善ポイント]
 * ・今回扱うLIBRARIANで扱うLIBRARIANのmodeは一種類のみのため(All Data Backup, StompBox Data Backupを除く)、
 *  cellsのmodeの階層を省いたほうが良い。
 *
 */

/* To prevent error on ESLint */
/* global ProductSetting, librarianCommonInfo */

function PatchInfo(isToneCentralPatch, memo) {
    this.memo = (memo)? memo : '';
    this.isToneCentralPatch = (isToneCentralPatch)? isToneCentralPatch : false; // Tone CentralからダウンロードしたPatchかどうかを判定するフラグ
}

function LibrarianModel(title, instrument) {
    this.instrument = instrument;
    this.name = title;
    this.cells = [];
    this.id = -1; // storage2へ保存する際のID(User: -1, librarian: 0 ~ max)

    for (var mode = 0; mode < librarianCommonInfo.librarians.length; mode++) {
        this.cells[mode] = [];
        if (this.instrument) {
            for (var row = 0; row < librarianCommonInfo.librarians[mode].rows; row++) {
                this.cells[mode][row] = librarianCommonInfo.librarians[mode].cell(row);
            }
        }
    }
}

LibrarianModel.prototype = {

    rows: function (mode) {
        return this.cells[mode].length;
    },

    title: function () {
        return this.name;
    },

    setTitle: function (title) {
        this.name = title;
    },

    memo: function (mode, row, memo) {
        if (memo === undefined) return this.cell(mode, row).memo;
        this.cell(mode, row).memo = memo;
    },

    value: function (mode, row, col) {
        return this.cell(mode, row).value(col);
    },

    setValue: function (mode, row, col, v) {
        if (col < 0) {
            this.cell(mode, row).memo = v;
        } else {
            this.cell(mode, row).setValue(col, v);
        }
    },

    append: function (mode) {
        if (this.instrument) return false;
        this.cells[mode].push(librarianCommonInfo.librarians[mode].factory());
        return true;
    },

    remove: function (mode, row) {
        if (this.instrument) return false;
        this.cells[mode].splice(row, 1);
        return true;
    },

    duplicate: function (model) {
        for (var mode = 0; mode < model.cells.length; mode++) {
            for (var i = 0, num = model.cells[mode].length; i < num; i++) {
                this.cells[mode][i] = librarianCommonInfo.librarians[mode].factory();
                this.cells[mode][i].copy(model.cells[mode][i]);
            }
        }
    },

    initialize: function (mode, row) {
        this.cells[mode][row].copy(librarianCommonInfo.librarians[mode].factory());
    },

    copy: function (mode, rows) {
        var _copycells = [];
        var row;
        while ((row = rows.shift()) != undefined) {
            var cell = librarianCommonInfo.librarians[mode].factory();
            cell.copy(this.cells[mode][row]);
            _copycells.push(cell);
        }
        return _copycells;
    },

    replace: function (mode, row, _copycells) {
        for (var i = 0, num = _copycells.length; i < num; i++) {
            if (row >= this.rows(mode)) {
                if (!this.append(mode)) return;
            }
            this.cells[mode][row++].copy(_copycells[i]);
        }
    },

    cell: function (mode, row) {
        return this.cells[mode][row];
    },



    toJSON: function () {
        var o = { name: this.name, formatRev: ProductSetting.livesetFile.formatRev, device: ProductSetting.name, data: [] };
        for (var mode = 0; mode < librarianCommonInfo.librarians.length; mode++) {
            o.data[mode] = [];
            for (var row = 0, num = this.cells[mode].length; row < num; row++) {
                o.data[mode].push({
                    memo: this.cells[mode][row].memo,
                    paramSet: this.cells[mode][row].paramSet
                });
            }
        }
        return JSON.stringify(o);
    },

    /**
     * 取り扱うJSONの形は以下の通り
     * {
     *   "name": "LiveSetの名前",
     *   "formatRev": "データのリビジョン",
     *   "device": "(アプリがサポートしている機種)",
     *   "data": [[
     *     {
     *       "memo": "PatchInfoオブジェクト",
     *       "paramSet": "patchのデータ"
     *     },...
     *   ]]
     * } 
     */
    load: function (json, name) {
        var o = JSON.parse(json);
        if (o.device !== ProductSetting.name) {
            if (window.Converter.liveset) {
                o = window.Converter.liveset.import(o);
            }
        }
        if (o.hasOwnProperty('name') && o.hasOwnProperty('formatRev') && o.hasOwnProperty('device') && o.hasOwnProperty('data')) {
            if (o.device !== ProductSetting.name) {
                throw new Error('this file is unsupported');
            }
            o = LibrarianModel.read(o);
            this.name = (name)? name : o.name;
            for (var mode = 0; mode < o.data.length; mode++) {
                var num =  o.data[mode].length>=librarianCommonInfo.maxPatchNum? librarianCommonInfo.maxPatchNum: o.data[mode].length ;
                for (var row = 0; row < num; row++) {
                    this.cells[mode][row] = librarianCommonInfo.librarians[mode].factory();
                    this.cells[mode][row].memo = o.data[mode][row].memo;
                    this.cells[mode][row].paramSet = o.data[mode][row].paramSet;
                }
            }
        } else {
            throw new Error('this file is unsupported');
        }
    },
};


LibrarianModel.read = function(tslObj) {
    var loadFileRev = tslObj.formatRev - 0;
    var appRev = ProductSetting.livesetFile.formatRev - 0;
    var patches = tslObj.data[0];
    if (loadFileRev < appRev) {
        if (tslObj.formatRev === '0000') {
        }
    }
    var factory = librarianCommonInfo.librarians[0].factory();
    for (var i = 0, len = patches.length; i < len; i++) {
        for (var prop in factory.paramSet) {
            var r = factory.paramSet[prop].concat();
            var d = patches[i].paramSet[prop];
            if (d) {
                if (r.length > d.length) {
                    patches[i].paramSet[prop] = d.concat(r.slice(d.length));
                }
            }
            else {
                patches[i].paramSet[prop] = r;
            }
        }
    }
    return tslObj;
}
