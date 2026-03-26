//
//	tipsapi.js for KATANA3 (sample)
//
//	Copyright 2024 Roland Corporation. All rights reserved.
//
// language definition
var LANG_TBL = [
    'ja',
    'en',
];

// table index
var TBL_IDX = {
    PAGE: 0,
    BLOCK: 1,
    TYPE: 2,
    VARIATION: 3,
    URL: 4,
    NUMOF_TBL_IDX: 5
};

class TipsApi {
    constructor() {
        // variation of tips js file
        this.TIPS_JS_VERSION = TIPS_DEF.TIPS_JS_VERSION;

        // definition table
        this.TIPS_TABLE = TIPS_DEF.TIPS_TABLE;

        // tips html domain
        var langStr = (navigator.userLanguage || navigator.language).substr(0, 2);
        //if (langStr != 'ja') langStr = 'en';
        let idx = this.GetLanguageIndex(langStr);
        if(idx < 0){
            langStr = 'en'
            idx = 0;
        }
        this.LANG_IDX = idx;//LANG_TBL.findIndex((element) => element == langStr);
        this.TBL_LANG = this.TIPS_TABLE[this.LANG_IDX];
    }

    GetVersion() {
        return this.TIPS_JS_VERSION;
    }
    GetLanguageStr() {
        return this.TIPS_TABLE[this.LANG_IDX][0];
    }
    GetLanguageIndex(langStr) {
        if (langStr == ""){
            return this.LANG_IDX;
        } else {
            return this.TIPS_TABLE.findIndex(item => item[0] == langStr);
        }
    }
    GetUrlIndex(table, page, block, type, variation) {
        if ('page' in table[0]){
            let tipsIndex = table.findIndex(item => item.page == page && item.block.replace("/", " ") == block.replace("/", " ") && item.type == type && item.variation <= variation);
            if (tipsIndex < 0) {
                tipsIndex = table.findIndex(item => item.page == page && item.block.replace("/", " ") == block.replace("/", " ") && item.type == type );
            }
            if (tipsIndex < 0) {
                tipsIndex = table.findIndex(item => item.page == page && item.block.replace("/", " ") == block.replace("/", " ") && item.type == ""   && item.variation <= variation);
            }
            if (tipsIndex < 0) {
                tipsIndex = table.findIndex(item => item.page == page && item.block.replace("/", " ") == block.replace("/", " ") && item.type == ""   );
            }
            return tipsIndex;
        } else {
            let tipsIndex = table.findIndex(item => item[0] == page && item[1].replace("/", " ") == block.replace("/", " ") && item[2] == type && item[3] <= variation);
            if (tipsIndex < 0) {
                tipsIndex = table.findIndex(item => item[0] == page && item[1].replace("/", " ") == block.replace("/", " ") && item[2] == type );
            }
            if (tipsIndex < 0) {
                tipsIndex = table.findIndex(item => item[0] == page && item[1].replace("/", " ") == block.replace("/", " ") && item[2] == ""   && item[3] <= variation);
            }
            if (tipsIndex < 0) {
                tipsIndex = table.findIndex(item => item[0] == page && item[1].replace("/", " ") == block.replace("/", " ") && item[2] == ""   );
            }
            return tipsIndex;
        }
    }

    GetUrl(table, page, block, type, variation) { // to be removed
        var ret = null; // don't show TIPS window
        var tbl = table;
        if( tbl == null){
            tbl = this.TIPS_TABLE[this.LANG_IDX][1];
        }
        var idx = this.GetUrlIndex(tbl, page, block, type, variation)
        if (0 <= idx) {
            ret = tbl[idx];
            if ('page' in tbl[0]) {
                ret = tbl[idx].url;
            } else {
                ret = tbl[idx][4];
            }
        }
        return ret;
    }

}
