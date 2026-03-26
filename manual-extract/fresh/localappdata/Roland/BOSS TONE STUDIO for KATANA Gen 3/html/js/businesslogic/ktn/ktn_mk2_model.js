//
//	ktn_mk2_model.js
//
//	Copyright 2024 Roland Corporation. All rights reserved.
//

/* To prevent error on ESLint */
/* global PatchConverter, LivesetConverter, hex2, PatchInfo */

const type_BST = "BST";
const type_MOD_FX1 = "MOD";
const type_FX_FX2 = "FX";
const type_DLY1 = "DLY1";
const type_DLY2 = "DLY2";
const type_REV = "REV";
const type_AMP = "AMP";

const asgnType_BST = "AsgnBST";
const asgnType_DLY = "AsgnDLY";
const asgnType_REV = "AsgnREV";
const asgnType_CHORUS = "AsgnCHORUS";
const asgnType_FLANGER = "AsgnFLANGER";
const asgnType_PHASER = "AsgnPHASER";
const asgnType_UNIV = "AsgnUNIV";
const asgnType_TREMOLO = "AsgnTREMOLO";
const asgnType_VIBRATO = "AsgnVIBRATO";
const asgnType_ROTARY = "AsgnROTARY";
const asgnType_RINGMOD = "AsgnRINGMOD";
const asgnType_SLOWGEAR = "AsgnSLOWGEAR";
const asgnType_SLICER = "AsgnSLICER";
const asgnType_COMP = "AsgnCOMP";
const asgnType_LIMIT = "AsgnLIMIT";
const asgnType_TWAH = "AsgnTWAH";
const asgnType_AUTOWAH = "AsgnAUTOWAH";
const asgnType_PDLWAH = "AsgnPDLWAH";
const asgnType_GEQ = "AsgnGEQ";
const asgnType_PEQ = "AsgnPEQ";
const asgnType_GUITARSIM = "AsgnGUITARSIM";
const asgnType_ACGUITSIM = "AsgnACGUITSIM";
const asgnType_ACPROC = "AsgnACPROC";
const asgnType_WAVESYNTH = "AsgnWAVESYNTH";
const asgnType_OCTAVE = "AsgnOCTAVE";
const asgnType_PITSHIF = "AsgnPITSHIF";
const asgnType_HARMONIST = "AsgnHARMONIST";
const asgnType_HUMANIZER = "AsgnHUMANIZER";
const asgnType_PHASE90E = "AsgnPHASE90E";
const asgnType_FLANGER117E = "AsgnFLANGER117E";
const asgnType_WAH95E = "AsgnWAH95E";
const asgnType_DC30 = "AsgnDC30";
const asgnType_HEAVYOCT = "AsgnHEAVYOCT";
const asgnType_PDLBEND = "AsgnPDLBEND";
const asgnType_PDLFUNC = "AsgnPDLFUNC";

const color_None = "ColorNone";
const color_G = "Green";
const color_R = "Red";
const color_Y = "Yellow";

const notSupportedConv = "notSupportedConv";

const CONFIG_TYPE = Object.freeze(({
    BOOSTER: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: 3 },
        { ap122: 4, ap146: 4 },
        { ap122: 5, ap146: 5 },
        { ap122: 6, ap146: 6 },
        { ap122: 7, ap146: 13 },
        { ap122: 8, ap146: 7 },
        { ap122: 9, ap146: 8 },
        { ap122: 10, ap146: 9 },
        { ap122: 11, ap146: 10 },
        { ap122: 12, ap146: 11 },
        { ap122: 13, ap146: 12 },
        { ap122: 14, ap146: 13 },
        { ap122: 15, ap146: 14 },
        { ap122: 16, ap146: 15 },
        { ap122: 17, ap146: 16 },
        { ap122: 18, ap146: 17 },
        { ap122: 19, ap146: 18 },
        { ap122: 20, ap146: 19 },
        { ap122: 21, ap146: 20 },
        { ap122: 22, ap146: 21 },
        { ap122: 23, ap146: 22 },
        { ap122: 24, ap146: notSupportedConv },    /* サポート外の変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 25, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
    ],
    AMP: [
        { ap122: 0, ap146: 1 },
        { ap122: 1, ap146: 0 },
        { ap122: 2, ap146: 3 },
        { ap122: 3, ap146: 3 },
        { ap122: 4, ap146: 4 },
        { ap122: 5, ap146: 5 },
        { ap122: 6, ap146: 4 },
        { ap122: 7, ap146: 4 },
        { ap122: 8, ap146: 1 },
        { ap122: 9, ap146: 1 },
        { ap122: 10, ap146: 3 },
        { ap122: 11, ap146: 3 },
        { ap122: 12, ap146: 3 },
        { ap122: 13, ap146: 3 },
        { ap122: 14, ap146: 3 },
        { ap122: 15, ap146: 3 },
        { ap122: 16, ap146: 4 },
        { ap122: 17, ap146: 4 },
        { ap122: 18, ap146: 4 },
        { ap122: 19, ap146: 4 },
        { ap122: 20, ap146: 4 },
        { ap122: 21, ap146: 4 },
        { ap122: 22, ap146: 4 },
        { ap122: 23, ap146: 5 },
        { ap122: 24, ap146: 4 },
        { ap122: 25, ap146: 1 },
        { ap122: 26, ap146: 4 },
        { ap122: 27, ap146: 5 },
        { ap122: 28, ap146: 0 },
        { ap122: 29, ap146: 1 },
        { ap122: 30, ap146: 3 },
        { ap122: 31, ap146: 4 },
        { ap122: 32, ap146: 5 },
    ],
    MOD_FX: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: 3 },
        { ap122: 4, ap146: 4 },
        { ap122: 5, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 6, ap146: 5 },
        { ap122: 7, ap146: 6 },
        { ap122: 8, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 9, ap146: 7 },
        { ap122: 10, ap146: 8 },
        { ap122: 11, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 12, ap146: 9 },
        { ap122: 13, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 14, ap146: 10 },
        { ap122: 15, ap146: 11 },
        { ap122: 16, ap146: 12 },
        { ap122: 17, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 18, ap146: 13 },
        { ap122: 19, ap146: 14 },
        { ap122: 20, ap146: 15 },
        { ap122: 21, ap146: 16 },
        { ap122: 22, ap146: 17 },
        { ap122: 23, ap146: 18 },
        { ap122: 24, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 25, ap146: 19 },
        { ap122: 26, ap146: 20 },
        { ap122: 27, ap146: 21 },
        { ap122: 28, ap146: 22 },
        { ap122: 29, ap146: 23 },
        { ap122: 30, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 31, ap146: 24 },
        { ap122: 32, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 33, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 34, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 35, ap146: 25 },
        { ap122: 36, ap146: 26 },
        { ap122: 37, ap146: 27 },
        { ap122: 38, ap146: 28 },
        { ap122: 39, ap146: 29 },
        { ap122: 40, ap146: 30 },
    ],
    DELAY: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: notSupportedConv },
        { ap122: 4, ap146: notSupportedConv },
        { ap122: 5, ap146: notSupportedConv },    /* 変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        { ap122: 6, ap146: 5 },
        { ap122: 7, ap146: 3 },
        { ap122: 8, ap146: 4 },
        { ap122: 9, ap146: 6 },
        { ap122: 10, ap146: 7 },
    ],
    REVERB: [
        { ap122: 0, ap146: notSupportedConv },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: notSupportedConv },
        { ap122: 3, ap146: 2 },
        { ap122: 4, ap146: 0 },
        { ap122: 5, ap146: 3 },
        { ap122: 6, ap146: 4 },
    ],
}));
const CONFIG_AsgnType = Object.freeze(({
    /* For KNOB ASSIGN, EXPPDL_DETAIL(EXP PDL / GA-FC EXP) */
    [asgnType_DLY]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: 3 },
        { ap122: 4, ap146: 4 },
        { ap122: 5, ap146: 5 },
        { ap122: 6, ap146: 6 },
        { ap122: 7, ap146: 7 },
        { ap122: 8, ap146: notSupportedConv },
    ],
    [asgnType_REV]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: 6 },
        { ap122: 4, ap146: 7 },
        { ap122: 5, ap146: 3 },
        { ap122: 6, ap146: 4 },
        { ap122: 7, ap146: 5 },
    ],
    [asgnType_CHORUS]: [
        { ap122: 0, ap146: 1 },
        { ap122: 1, ap146: 0 },
        { ap122: 2, ap146: 3 },
        { ap122: 3, ap146: 3 },
        { ap122: 4, ap146: 4 },
        { ap122: 5, ap146: 10 },
        { ap122: 6, ap146: 5 },
        { ap122: 7, ap146: 6 },
        { ap122: 8, ap146: 7 },
        { ap122: 9, ap146: 8 },
        { ap122: 10, ap146: 9 },
    ],
    [asgnType_FLANGER]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: 3 },
        { ap122: 4, ap146: 4 },
        { ap122: 5, ap146: 6 },
        { ap122: 6, ap146: 5 },
        { ap122: 7, ap146: 7 },
    ],
    [asgnType_PHASER]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: 3 },
        { ap122: 4, ap146: 4 },
        { ap122: 5, ap146: 6 },
        { ap122: 6, ap146: 5 },
        { ap122: 7, ap146: 7 },
    ],
    [asgnType_GUITARSIM]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 2 },
        { ap122: 2, ap146: 3 },
        { ap122: 3, ap146: 1 },
        { ap122: 4, ap146: 4 },
    ],
    [asgnType_ACPROC]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: 4 },
        { ap122: 4, ap146: 5 },
        { ap122: 5, ap146: 6 },
        { ap122: 6, ap146: 3 },
    ],
    [asgnType_PITSHIF]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 4 },
        { ap122: 3, ap146: 6 },
        { ap122: 4, ap146: 9 },
        { ap122: 5, ap146: 10 },
        { ap122: 6, ap146: 2 },
        { ap122: 7, ap146: 3 },
        { ap122: 8, ap146: 5 },
        { ap122: 9, ap146: 7 },
        { ap122: 10, ap146: 8 },
    ],
    [asgnType_HARMONIST] : [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 5 },
        { ap122: 3, ap146: 8 },
        { ap122: 4, ap146: 9 },
        { ap122: 5, ap146: 3 },
        { ap122: 6, ap146: 4 },
        { ap122: 7, ap146: 2 },
        { ap122: 8, ap146: 7 },
        { ap122: 9, ap146: 6 },
    ],
    [asgnType_HUMANIZER]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 2 },
        { ap122: 3, ap146: 5 },
        { ap122: 4, ap146: 3 },
        { ap122: 5, ap146: 4 },
    ],
    [asgnType_PDLBEND]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 2 },
        { ap122: 2, ap146: 1 },
        { ap122: 3, ap146: 3 },
        { ap122: 4, ap146: 4 },
        { ap122: 5, ap146: 5 },
    ],

    /* For PEDAL FUNCTION(EXP PDL / GA-FC EXP) */
    [asgnType_PDLFUNC]: [
        { ap122: 0, ap146: 0 },
        { ap122: 1, ap146: 1 },
        { ap122: 2, ap146: 3 },
        { ap122: 3, ap146: 4 },
        { ap122: 4, ap146: 5 },
        { ap122: 5, ap146: 7 },
        { ap122: 6, ap146: 6 },
        { ap122: 7, ap146: 8 },
        { ap122: 8, ap146: 9 },
        { ap122: 9, ap146: 2 },
    ],
}));

class AbstructConverter {
    /* 変換後(KTN3)のBlockIDとAddress */
    constructor(bid, adrs){
        this.bid = bid;
        this.index = adrs;
        if (this.index >= 256) this.index -= 128;
    }
    convert(fromData, fromIndex, size, target, notSupConvEffCtrl) {
        // console.log("AbstructConverter.convert: Not exist impl");
    }

    setVal(fromData, fromIndex, size, targetBlk){
 
        if (INTEGER1x1 <= size){
            // not name
            var decVal = Parameter.convToValue(fromData, fromIndex, size, 0);
            if (size == INTEGER2x7) {
                let byteArray = Parameter.convToHexArray(decVal, INTEGER4x4);
                for(let idx = 0; idx < 4; idx++){   /* 4Byte */
                    targetBlk[this.index + idx] = byteArray[idx].toString();
                }
            }
            else {
                targetBlk[this.index] = Parameter.convToHexArray(decVal, size).toString();
            }
        } else {
                // patch_name
                for (let position = 0; position < size; position++) {
                    targetBlk[this.index + position] = fromData[fromIndex + position]
                }
        }
    }
}

class SameValConverter extends AbstructConverter {
    constructor(bid, index){
        super(bid, index);
    }
    convert(fromData, fromIndex, size, target) {
        let targetBlk = target[this.bid];
        this.setVal(fromData, fromIndex, size, targetBlk);
    }
}

class AsgnTypeConverter extends AbstructConverter {
    constructor(bid, index, asgnType){
        super(bid, index);
        this.asgnType = asgnType;
    }
    convert(fromData, fromIndex, size, target, notSupConvEffCtrl) {
        let targetBlk = target[this.bid];
        if((this.asgnType in CONFIG_AsgnType) === false){
            /* 変換テーブルに無いので同値での変換を行う */
            this.setVal(fromData, fromIndex, size, targetBlk);
            return;
        }

        /* 変換対象は今のところINTEGER1x7のみなので、データサイズも固定で処理 */
        const decValue = parseInt(fromData[fromIndex], 16);
        let itemFound = CONFIG_AsgnType[this.asgnType].find(x => x.ap122 == decValue)

        if (!itemFound) {
            // console.log("TypeConverter.convert: Item not found");
            return;
        }

        if(itemFound.ap146 === notSupportedConv){
            /* サポート外の変換が発生した場合デフォルトに設定 */
            if(this.asgnType === asgnType_DLY){
                /* 今のところDLYで対象の組み合わせがある */
                targetBlk[this.index] = 0x00        /* PRESET (Default)*/
            }
            else{
                // console.log("AsgnTypeConverter.convert: Convert Exception(Unknown)");
                return;
            }
        }
        else{
            targetBlk[this.index] = hex2(itemFound.ap146);
        }
    }
}

class TypeConverter extends AbstructConverter {
    constructor(bid, index, typeCnvTbl, type, color){
        super(bid, index);
        this.typeCnvTbl = typeCnvTbl;
        this.type = type;
        this.color = color;
    }
    convert(fromData, fromIndex, size, target, notSupConvEffCtrl) {
        let targetBlk = target[this.bid];

        /* データサイズはINTEGER1x7のみを想定 */
        const decValue = parseInt(fromData[fromIndex], 16);
        let itemFound = this.typeCnvTbl.find(x => x.ap122 == decValue)

        if (!itemFound) {
            // console.log("TypeConverter.convert: Item not found");
            return;
        }

        if(itemFound.ap146 === notSupportedConv){
            /* サポート外の変換が発生した場合デフォルトに設定、後で色選択について評価する */
            if(this.type === type_AMP){
                /* 今のところ起こらない予定 */
                // console.log("TypeConverter.convert: Convert Exception(AMP)");
                return;
            }
            else if(this.type === type_BST){
                targetBlk[this.index] = 0x00        /* MID BOOST */
                if(this.color === color_G) notSupConvEffCtrl.BST_NotSupportedConvHasOccurred[0] = true;
                if(this.color === color_R) notSupConvEffCtrl.BST_NotSupportedConvHasOccurred[1] = true;
                if(this.color === color_Y) notSupConvEffCtrl.BST_NotSupportedConvHasOccurred[2] = true;
            }
            else if(this.type === type_MOD_FX1){
                targetBlk[this.index] = hex2(23)    /* CHORUS */
                if(this.color === color_G) notSupConvEffCtrl.MOD_NotSupportedConvHasOccurred[0] = true;
                if(this.color === color_R) notSupConvEffCtrl.MOD_NotSupportedConvHasOccurred[1] = true;
                if(this.color === color_Y) notSupConvEffCtrl.MOD_NotSupportedConvHasOccurred[2] = true;
            }
            else if(this.type === type_FX_FX2){
                targetBlk[this.index] = hex2(23)    /* CHORUS */
                if(this.color === color_G) notSupConvEffCtrl.FX_NotSupportedConvHasOccurred[0] = true;
                if(this.color === color_R) notSupConvEffCtrl.FX_NotSupportedConvHasOccurred[1] = true;
                if(this.color === color_Y) notSupConvEffCtrl.FX_NotSupportedConvHasOccurred[2] = true;
            }
            else if(this.type === type_DLY1){
                targetBlk[this.index] = 0x00        /* DIGITAL */
                if(this.color === color_G) notSupConvEffCtrl.DLY_NotSupportedConvHasOccurred[0] = true;
                if(this.color === color_R) notSupConvEffCtrl.DLY_NotSupportedConvHasOccurred[1] = true;
                if(this.color === color_Y) notSupConvEffCtrl.DLY_NotSupportedConvHasOccurred[2] = true;
            }
            else if(this.type === type_DLY2){
                targetBlk[this.index] = 0x00        /* DIGITAL */
                if(this.color === color_G) notSupConvEffCtrl.DLY2_NotSupportedConvHasOccurred[0] = true;
                if(this.color === color_R) notSupConvEffCtrl.DLY2_NotSupportedConvHasOccurred[1] = true;
                if(this.color === color_Y) notSupConvEffCtrl.DLY2_NotSupportedConvHasOccurred[2] = true;
            }
            else if(this.type === type_REV){
                targetBlk[this.index] = 0x00        /* PLATE */
                if(this.color === color_G) notSupConvEffCtrl.REV_NotSupportedConvHasOccurred[0] = true;
                if(this.color === color_G) notSupConvEffCtrl.REV_NotSupportedConvHasOccurred[1] = true;
                if(this.color === color_G) notSupConvEffCtrl.REV_NotSupportedConvHasOccurred[2] = true;
            }
            else{
                // console.log("TypeConverter.convert: Convert Exception(Unknown)");
                return;
            }
        }
        else{
            targetBlk[this.index] = hex2(itemFound.ap146);
        }
    }
}

class CpyToAllColorConverter extends AbstructConverter {
    constructor(type, adrs){
        super("", adrs);   /* bidはconvert処理中に生成する */

        if(type === type_BST){          /* PATCH%BOOSTER(1~3) */
            this.block = "PATCH%BOOSTER";
            this.originNo = 1;
        }
        if(type === type_MOD_FX1){      /* PATCH%FX_DETAIL(1~3) */
            this.block = "PATCH%FX_DETAIL";
            this.originNo = 1;
        }
        if(type === type_FX_FX2){       /* PATCH%FX_DETAIL(4~6) */
            this.block = "PATCH%FX_DETAIL";
            this.originNo = 4;
        }
        if(type === type_DLY1){         /* PATCH%DELAY(1~3) */
            this.block = "PATCH%DELAY";
            this.originNo = 1;
        }
        if(type === type_DLY2){         /* PATCH%DELAY(4~6) */
            this.block = "PATCH%DELAY";
            this.originNo = 4;
        }
        if(type === type_REV){          /* PATCH%REVERB(1~3) */
            this.block = "PATCH%REVERB";
            this.originNo = 1;
        }
    }
    convert(fromData, fromIndex, size, target, notSupConvEffCtrl) {
        for(let colorNo = 0; colorNo < 3; colorNo++){
            let bidColorNo = colorNo + this.originNo;
            let bid = this.block + "(" + bidColorNo + ")"; 
            let targetBlk = target[bid];
            this.setVal(fromData, fromIndex, size, targetBlk);
        }
    }
}

class ContourMargeConverter extends AbstructConverter {
    constructor(){
        super('PATCH%CONTOUR_COM', 0x00);
    }
    convert(fromData, fromIndex, size, target, notSupConvEffCtrl) {
        let targetBlk = target[this.bid];

        let contourSw_addr = 0x00000056;
        let localIdxFrom = parseInt(contourSw_addr, 10);
        if (localIdxFrom >= 256) localIdxFrom -= 128;
        if(parseInt(fromData[localIdxFrom], 16) === 0){
            /* CONTROUR_SWが0ならOFFなのでCONTOUR_COM_KNOBも0になる */
            targetBlk[this.index] = hex2(0);
        }
        else{
            /* CONTROUR_SWが!=0ならCONTOUR_SELECTが効いているのでCONTOUR_COM_KNOBも1~3になる */
            /* CONTOUR_SELECTは0originのため注意 */
            let contourSel_addr = 0x00000057;
            localIdxFrom = parseInt(contourSel_addr, 10);
            if (localIdxFrom >= 256) localIdxFrom -= 128;
            targetBlk[this.index] = hex2(parseInt(fromData[localIdxFrom], 16) + 1);
        }
    }
}

class NotSupportedConvEffectControl {
    constructor(){
        /* [Green, Red, Yellow] */
        this.BST_NotSupportedConvHasOccurred = [false, false, false];
        this.MOD_NotSupportedConvHasOccurred= [false, false, false];
        this.FX_NotSupportedConvHasOccurred= [false, false, false];
        this.DLY_NotSupportedConvHasOccurred= [false, false, false];
        this.REV_NotSupportedConvHasOccurred= [false, false, false];
        this.DLY2_NotSupportedConvHasOccurred= [false, false, false];
    }
    applyResult(convertedData){
        /* サポート外の変換が発生かつそのColorが選択されている(出音に反映される)場合、EffectをOFFにする */
        let selColorBlk= convertedData['PATCH%COLOR'];
        let swBlk = convertedData['PATCH%SW'];

        /* BOOST */
        let bstSelectedColor = parseInt(selColorBlk[0x000], 16);    /* 0:Green, 1:Red, 2:Yellow */
        if(this.BST_NotSupportedConvHasOccurred[bstSelectedColor]){
            swBlk[0x000] = hex2(0);
        }

        /* MOD */
        let modSelectedColor = parseInt(selColorBlk[0x001], 16);    /* 0:Green, 1:Red, 2:Yellow */
        if(this.MOD_NotSupportedConvHasOccurred[modSelectedColor]){
            swBlk[0x001] = hex2(0);
        }

        /* FX */
        let fxSelectedColor = parseInt(selColorBlk[0x002], 16);     /* 0:Green, 1:Red, 2:Yellow */
        if(this.FX_NotSupportedConvHasOccurred[fxSelectedColor]){
            swBlk[0x002] = hex2(0);
        }

        /* DELAY */
        let dlySelectedColor = parseInt(selColorBlk[0x003], 16);    /* 0:Green, 1:Red, 2:Yellow */
        if(this.DLY_NotSupportedConvHasOccurred[dlySelectedColor]){
            swBlk[0x003] = hex2(0);
        }

        /* REVERB */
        let revSelectedColor = parseInt(selColorBlk[0x004], 16);    /* 0:Green, 1:Red, 2:Yellow */
        if(this.REV_NotSupportedConvHasOccurred[revSelectedColor]){
            swBlk[0x005] = hex2(0);
        }

        /* DELAY2 */
        for(let colorNo = 0; colorNo < 3; colorNo++){               /* 0:Green, 1:Red, 2:Yellow */
            if (this.DLY2_NotSupportedConvHasOccurred[colorNo]) {
                let bidColorNo = colorNo + 1;
                let bid = "PATCH%REVERB" + "(" + bidColorNo + ")"; 
                let revLayerModeBlk = convertedData[bid];
                revLayerModeBlk[0x001] = hex2(2);   /* REVERBのみ使用するモードにする */
            }
        }
        /* LAYERモード毎切り替えているので、今のところDLY2(swBlk[0x004])をOFFにはしていない */
    }
}

var ConvertTbl_FromKtnMk2ToKtn3 = {
	'UserPatch%PatchName': [
		{ addr:0x00000000, size:16                , name:'PATCH NAME'             , converter: new SameValConverter('PATCH%COM', 0x00)}
	],
	'UserPatch%Patch_0': [
		{ addr:0x00000000, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%SW', 0x00)},    // PRM_ODDS_SW
		// { addr:0x00000001, size:INTEGER1x7        , name:'TYPE'                   },    // PRM_ODDS_TYPE                      Ver200
		{ addr:0x00000002, size:INTEGER1x7        , name:'DRIVE'                  , converter: new CpyToAllColorConverter(type_BST, 0x01)},    // PRM_ODDS_DRIVE
		{ addr:0x00000003, size:INTEGER1x7        , name:'BOTTOM'                 , converter: new CpyToAllColorConverter(type_BST, 0x02)},    // PRM_ODDS_BOTTOM
		{ addr:0x00000004, size:INTEGER1x7        , name:'TONE'                   , converter: new CpyToAllColorConverter(type_BST, 0x03)},    // PRM_ODDS_TONE
		{ addr:0x00000005, size:INTEGER1x7        , name:'SOLO SW'                , converter: new CpyToAllColorConverter(type_BST, 0x04)},    // PRM_ODDS_SOLO_SW
		{ addr:0x00000006, size:INTEGER1x7        , name:'SOLO LEVEL'             , converter: new CpyToAllColorConverter(type_BST, 0x05)},    // PRM_ODDS_SOLO_LEVEL
		{ addr:0x00000007, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_BST, 0x06)},    // PRM_ODDS_EFFECT_LEVEL
		{ addr:0x00000008, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_BST, 0x07)},    // PRM_ODDS_DIRECT_LEVEL
		// { addr:0x00000009, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000000a, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000000b, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000000c, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000000d, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000000e, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000000f, size:(PADDING | 0x1)   , name:''                       },    // (padding)
		// { addr:0x00000010, size:INTEGER1x7        , name:''                       },    //
		{ addr:0x00000011, size:INTEGER1x7        , name:'TYPE'                   , converter: new TypeConverter('PATCH%AMP', 0x07, CONFIG_TYPE.AMP, type_AMP, color_None)},    // PRM_PREAMP_A_TYPE
		// { addr:0x00000012, size:INTEGER1x7        , name:'GAIN'                   , bid: 'PATCH%AMP',			indexTo: 0x00 },    // PRM_PREAMP_A_GAIN
		// { addr:0x00000013, size:INTEGER1x7        , name:''                       },    //
		{ addr:0x00000014, size:INTEGER1x7        , name:'BASS'                   , converter: new SameValConverter('PATCH%AMP', 0x02)},    // PRM_PREAMP_A_BASS
		{ addr:0x00000015, size:INTEGER1x7        , name:'MIDDLE'                 , converter: new SameValConverter('PATCH%AMP', 0x03)},    // PRM_PREAMP_A_MIDDLE
		{ addr:0x00000016, size:INTEGER1x7        , name:'TREBLE'                 , converter: new SameValConverter('PATCH%AMP', 0x04)},    // PRM_PREAMP_A_TREBLE
		{ addr:0x00000017, size:INTEGER1x7        , name:'PRESENCE'               , converter: new SameValConverter('PATCH%AMP', 0x05)},    // PRM_PREAMP_A_PRESENCE
		{ addr:0x00000018, size:INTEGER1x7        , name:'LEVEL'                  , converter: new SameValConverter('PATCH%AMP', 0x01)},    // PRM_PREAMP_A_LEVEL
		// { addr:0x00000019, size:INTEGER1x7        , name:'BRIGHT'                 },    // PRM_PREAMP_A_BRIGHT
		// { addr:0x0000001a, size:INTEGER1x7        , name:''                       },    //
		{ addr:0x0000001b, size:INTEGER1x7        , name:'SOLO SW'                , converter: new SameValConverter('PATCH%SOLO_COM', 0x00)},    // PRM_PREAMP_A_SOLO_SW
		{ addr:0x0000001c, size:INTEGER1x7        , name:'SOLO LEVEL'             , converter: new SameValConverter('PATCH%SOLO_COM', 0x01)},    // PRM_PREAMP_A_SOLO_LEVEL
		// { addr:0x0000001d, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000001e, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000001f, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000020, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000021, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000022, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000023, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000024, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000025, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000026, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000027, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000028, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x00000029, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000002a, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000002b, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000002c, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000002d, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000002e, size:INTEGER1x7        , name:''                       },    //
		// { addr:0x0000002f, size:INTEGER1x7        , name:''                       },    //
		{ addr:0x00000030, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%EQ_EACH(1)', 0x01)},    // PRM_EQ_SW
		{ addr:0x00000031, size:INTEGER1x7        , name:'TYPE'                   , converter: new SameValConverter('PATCH%EQ_EACH(1)', 0x02)},    // PRM_EQ_TYPE
		{ addr:0x00000032, size:INTEGER1x7        , name:'LOW CUT'                , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x00)},    // PRM_EQ_LOW_CUT
		{ addr:0x00000033, size:INTEGER1x7        , name:'LOW GAIN'               , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x01)},    // PRM_EQ_LOW_GAIN
		{ addr:0x00000034, size:INTEGER1x7        , name:'LOW-MID FREQ'           , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x02)},    // PRM_EQ_LOWMID_FREQ
		{ addr:0x00000035, size:INTEGER1x7        , name:'LOW-MID Q'              , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x03)},    // PRM_EQ_LOWMID_Q
		{ addr:0x00000036, size:INTEGER1x7        , name:'LOW-MID GAIN'           , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x04)},    // PRM_EQ_LOWMID_GAIN
		{ addr:0x00000037, size:INTEGER1x7        , name:'HIGH-MID FREQ'          , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x05)},    // PRM_EQ_HIGHMID_FREQ
		{ addr:0x00000038, size:INTEGER1x7        , name:'HIGH-MID Q'             , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x06)},    // PRM_EQ_HIGHMID_Q
		{ addr:0x00000039, size:INTEGER1x7        , name:'HIGH-MID GAIN'          , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x07)},    // PRM_EQ_HIGHMID_GAIN
		{ addr:0x0000003a, size:INTEGER1x7        , name:'HIGH GAIN'              , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x08)},    // PRM_EQ_HIGH_GAIN
		{ addr:0x0000003b, size:INTEGER1x7        , name:'HIGH CUT'               , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x09)},    // PRM_EQ_HIGH_CUT
		{ addr:0x0000003c, size:INTEGER1x7        , name:'LEVEL'                  , converter: new SameValConverter('PATCH%EQ_PEQ(1)', 0x0a)},    // PRM_EQ_LEVEL
		{ addr:0x0000003d, size:INTEGER1x7        , name:'31Hz'                   , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x00)},    // PRM_EQ_GEQ_BAND1
		{ addr:0x0000003e, size:INTEGER1x7        , name:'62Hz'                   , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x01)},    // PRM_EQ_GEQ_BAND2
		{ addr:0x0000003f, size:INTEGER1x7        , name:'125Hz'                  , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x02)},    // PRM_EQ_GEQ_BAND3
		{ addr:0x00000040, size:INTEGER1x7        , name:'250Hz'                  , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x03)},    // PRM_EQ_GEQ_BAND4
		{ addr:0x00000041, size:INTEGER1x7        , name:'500Hz'                  , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x04)},    // PRM_EQ_GEQ_BAND5
		{ addr:0x00000042, size:INTEGER1x7        , name:'1KHz'                   , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x05)},    // PRM_EQ_GEQ_BAND6
		{ addr:0x00000043, size:INTEGER1x7        , name:'2KHz'                   , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x06)},    // PRM_EQ_GEQ_BAND7
		{ addr:0x00000044, size:INTEGER1x7        , name:'4KHz'                   , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x07)},    // PRM_EQ_GEQ_BAND8
		{ addr:0x00000045, size:INTEGER1x7        , name:'8KHz'                   , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x08)},    // PRM_EQ_GEQ_BAND9
		{ addr:0x00000046, size:INTEGER1x7        , name:'16KHz'                  , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x09)},    // PRM_EQ_GEQ_BAND10
		{ addr:0x00000047, size:INTEGER1x7        , name:'LEVEL'                  , converter: new SameValConverter('PATCH%EQ_GE10(1)', 0x0a)},    // PRM_EQ_GEQ_LEVEL
	],
	'UserPatch%Eq(2)': [
		{ addr:0x00000000, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%EQ_EACH(2)', 0x01)},    // PRM_EQ_SW
        { addr:0x00000001, size:INTEGER1x7        , name:'TYPE'                   , converter: new SameValConverter('PATCH%EQ_EACH(2)', 0x02)},    // PRM_EQ_TYPE
        { addr:0x00000002, size:INTEGER1x7        , name:'LOW CUT'                , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x00)},    // PRM_EQ_LOW_CUT
        { addr:0x00000003, size:INTEGER1x7        , name:'LOW GAIN'               , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x01)},    // PRM_EQ_LOW_GAIN
        { addr:0x00000004, size:INTEGER1x7        , name:'LOW-MID FREQ'           , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x02)},    // PRM_EQ_LOWMID_FREQ
        { addr:0x00000005, size:INTEGER1x7        , name:'LOW-MID Q'              , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x03)},    // PRM_EQ_LOWMID_Q
        { addr:0x00000006, size:INTEGER1x7        , name:'LOW-MID GAIN'           , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x04)},    // PRM_EQ_LOWMID_GAIN
        { addr:0x00000007, size:INTEGER1x7        , name:'HIGH-MID FREQ'          , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x05)},    // PRM_EQ_HIGHMID_FREQ
        { addr:0x00000008, size:INTEGER1x7        , name:'HIGH-MID Q'             , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x06)},    // PRM_EQ_HIGHMID_Q
        { addr:0x00000009, size:INTEGER1x7        , name:'HIGH-MID GAIN'          , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x07)},    // PRM_EQ_HIGHMID_GAIN
        { addr:0x0000000a, size:INTEGER1x7        , name:'HIGH GAIN'              , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x08)},    // PRM_EQ_HIGH_GAIN
        { addr:0x0000000b, size:INTEGER1x7        , name:'HIGH CUT'               , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x09)},    // PRM_EQ_HIGH_CUT
        { addr:0x0000000c, size:INTEGER1x7        , name:'LEVEL'                  , converter: new SameValConverter('PATCH%EQ_PEQ(2)', 0x0a)},    // PRM_EQ_LEVEL
        { addr:0x0000000d, size:INTEGER1x7        , name:'31Hz'                   , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x00)},    // PRM_EQ_GEQ_BAND1
        { addr:0x0000000e, size:INTEGER1x7        , name:'62Hz'                   , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x01)},    // PRM_EQ_GEQ_BAND2
        { addr:0x0000000f, size:INTEGER1x7        , name:'125Hz'                  , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x02)},    // PRM_EQ_GEQ_BAND3
        { addr:0x00000010, size:INTEGER1x7        , name:'250Hz'                  , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x03)},    // PRM_EQ_GEQ_BAND4
        { addr:0x00000011, size:INTEGER1x7        , name:'500Hz'                  , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x04)},    // PRM_EQ_GEQ_BAND5
        { addr:0x00000012, size:INTEGER1x7        , name:'1KHz'                   , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x05)},    // PRM_EQ_GEQ_BAND6
        { addr:0x00000013, size:INTEGER1x7        , name:'2KHz'                   , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x06)},    // PRM_EQ_GEQ_BAND7
        { addr:0x00000014, size:INTEGER1x7        , name:'4KHz'                   , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x07)},    // PRM_EQ_GEQ_BAND8
        { addr:0x00000015, size:INTEGER1x7        , name:'8KHz'                   , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x08)},    // PRM_EQ_GEQ_BAND9
        { addr:0x00000016, size:INTEGER1x7        , name:'16KHz'                  , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x09)},    // PRM_EQ_GEQ_BAND10
        { addr:0x00000017, size:INTEGER1x7        , name:'LEVEL'                  , converter: new SameValConverter('PATCH%EQ_GE10(2)', 0x0a)},    // PRM_EQ_GEQ_LEVEL
	],
	'UserPatch%Fx(1)': [
		{ addr:0x00000000, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%SW', 0x01)},    // PRM_FX1_SW
        // { addr:0x00000001, size:INTEGER1x7        , name:'TYPE'                   , bid: 'PATCH%FX(1)',					indexTo: 0x00, convert: CONFIG_TYPE.FX },    // PRM_FX1_FXTYPE                      Ver200
        { addr:0x00000002, size:INTEGER1x7        , name:'MODE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x000)},    // PRM_FX1_TWAH_MODE
        { addr:0x00000003, size:INTEGER1x7        , name:'POLARITY'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x001)},    // PRM_FX1_TWAH_POLARITY
        { addr:0x00000004, size:INTEGER1x7        , name:'SENS'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x002)},    // PRM_FX1_TWAH_SENS
        { addr:0x00000005, size:INTEGER1x7        , name:'FREQ'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x003)},    // PRM_FX1_TWAH_FREQ
        { addr:0x00000006, size:INTEGER1x7        , name:'PEAK'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x004)},    // PRM_FX1_TWAH_PEAK
        { addr:0x00000007, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x005)},    // PRM_FX1_TWAH_D_LEVEL
        { addr:0x00000008, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x006)},    // PRM_FX1_TWAH_LEVEL
        { addr:0x00000009, size:INTEGER1x7        , name:'MODE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x007)},    // PRM_FX1_AWAH_MODE
        { addr:0x0000000a, size:INTEGER1x7        , name:'FREQ'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x008)},    // PRM_FX1_AWAH_FREQ
        { addr:0x0000000b, size:INTEGER1x7        , name:'PEAK'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x009)},    // PRM_FX1_AWAH_PEAK
        { addr:0x0000000c, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x00a)},    // PRM_FX1_AWAH_RATE
        { addr:0x0000000d, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x00b)},    // PRM_FX1_AWAH_DEPTH
        { addr:0x0000000e, size:INTEGER1x7        , name:'DIRET MIX'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x00c)},    // PRM_FX1_AWAH_D_LEVEL
        { addr:0x0000000f, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x00d)},    // PRM_FX1_AWAH_LEVEL
        { addr:0x00000010, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x00e)},    // PRM_FX1_SUBWAH_TYPE
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x00f)},    // PRM_FX1_SUBWAH_PDLPOS
        { addr:0x00000012, size:INTEGER1x7        , name:'PEDAL MIN'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x010)},    // PRM_FX1_SUBWAH_MIN
        { addr:0x00000013, size:INTEGER1x7        , name:'PEDAL MAX'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x011)},    // PRM_FX1_SUBWAH_MAX
        { addr:0x00000014, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x012)},    // PRM_FX1_SUBWAH_E_LEVEL
        { addr:0x00000015, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x013)},    // PRM_FX1_SUBWAH_D_LEVEL
        { addr:0x00000016, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x014)},    // PRM_FX1_ADCOMP_TYPE
        { addr:0x00000017, size:INTEGER1x7        , name:'SUSTAIN'                , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x015)},    // PRM_FX1_ADCOMP_SUSTAIN
        { addr:0x00000018, size:INTEGER1x7        , name:'ATTACK'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x016)},    // PRM_FX1_ADCOMP_ATTACK
        { addr:0x00000019, size:INTEGER1x7        , name:'TONE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x017)},    // PRM_FX1_ADCOMP_TONE
        { addr:0x0000001a, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x018)},    // PRM_FX1_ADCOMP_LEVEL
        { addr:0x0000001b, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x019)},    // PRM_FX1_LIMITER_TYPE
        { addr:0x0000001c, size:INTEGER1x7        , name:'ATTACK'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x01a)},    // PRM_FX1_LIMITER_ATTACK
        { addr:0x0000001d, size:INTEGER1x7        , name:'THRESHOLD'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x01b)},    // PRM_FX1_LIMITER_THRESHOLD
        { addr:0x0000001e, size:INTEGER1x7        , name:'RATIO'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x01c)},    // PRM_FX1_LIMITER_RATIO
        { addr:0x0000001f, size:INTEGER1x7        , name:'RELEASE'                , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x01d)},    // PRM_FX1_LIMITER_RELEASE
        { addr:0x00000020, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x01e)},    // PRM_FX1_LIMITER_LEVEL
        { addr:0x00000021, size:INTEGER1x7        , name:'31Hz'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x01f)},    // PRM_FX1_GEQ_BAND1
        { addr:0x00000022, size:INTEGER1x7        , name:'62Hz'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x020)},    // PRM_FX1_GEQ_BAND2
        { addr:0x00000023, size:INTEGER1x7        , name:'125Hz'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x021)},    // PRM_FX1_GEQ_BAND3
        { addr:0x00000024, size:INTEGER1x7        , name:'250Hz'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x022)},    // PRM_FX1_GEQ_BAND4
        { addr:0x00000025, size:INTEGER1x7        , name:'500Hz'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x023)},    // PRM_FX1_GEQ_BAND5
        { addr:0x00000026, size:INTEGER1x7        , name:'1kHz'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x024)},    // PRM_FX1_GEQ_BAND6
        { addr:0x00000027, size:INTEGER1x7        , name:'2kHz'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x025)},    // PRM_FX1_GEQ_BAND7
        { addr:0x00000028, size:INTEGER1x7        , name:'4kHz'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x026)},    // PRM_FX1_GEQ_BAND8
        { addr:0x00000029, size:INTEGER1x7        , name:'8kHz'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x027)},    // PRM_FX1_GEQ_BAND9
        { addr:0x0000002a, size:INTEGER1x7        , name:'16kHz'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x028)},    // PRM_FX1_GEQ_BAND10
        { addr:0x0000002b, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x029)},    // PRM_FX1_GEQ_LEVEL
        { addr:0x0000002c, size:INTEGER1x7        , name:'LOW CUT'                , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x02a)},    // PRM_FX1_PEQ_LOW_CUT
        { addr:0x0000002d, size:INTEGER1x7        , name:'LOW GAIN'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x02b)},    // PRM_FX1_PEQ_LOW_GAIN
        { addr:0x0000002e, size:INTEGER1x7        , name:'LOW-MID FREQ'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x02c)},    // PRM_FX1_PEQ_LOWMID_FREQ
        { addr:0x0000002f, size:INTEGER1x7        , name:'LOW-MID Q'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x02d)},    // PRM_FX1_PEQ_LOWMID_Q
        { addr:0x00000030, size:INTEGER1x7        , name:'LOW-MID GAIN'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x02e)},    // PRM_FX1_PEQ_LOWMID_GAIN
        { addr:0x00000031, size:INTEGER1x7        , name:'HIGH-MID FREQ'          , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x02f)},    // PRM_FX1_PEQ_HIGHMID_FREQ
        { addr:0x00000032, size:INTEGER1x7        , name:'HIGH-MID Q'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x030)},    // PRM_FX1_PEQ_HIGHMID_Q
        { addr:0x00000033, size:INTEGER1x7        , name:'HIGH-MID GAIN'          , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x031)},    // PRM_FX1_PEQ_HIGHMID_GAIN
        { addr:0x00000034, size:INTEGER1x7        , name:'HIGH GAIN'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x032)},    // PRM_FX1_PEQ_HIGH_GAIN
        { addr:0x00000035, size:INTEGER1x7        , name:'HIGH CUT'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x033)},    // PRM_FX1_PEQ_HIGH_CUT
        { addr:0x00000036, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x034)},    // PRM_FX1_PEQ_LEVEL
        { addr:0x00000037, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x035)},    // PRM_FX1_GTRSIM_TYPE
        { addr:0x00000038, size:INTEGER1x7        , name:'LOW'                    , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x036)},    // PRM_FX1_GTRSIM_LOW
        { addr:0x00000039, size:INTEGER1x7        , name:'HIGH'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x037)},    // PRM_FX1_GTRSIM_HIGH
        { addr:0x0000003a, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x038)},    // PRM_FX1_GTRSIM_LEVEL
        { addr:0x0000003b, size:INTEGER1x7        , name:'BODY'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x039)},    // PRM_FX1_GTRSIM_BODY
        { addr:0x0000003c, size:INTEGER1x7        , name:'SENS'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x03a)},    // PRM_FX1_SLOWGEAR_SENS
        { addr:0x0000003d, size:INTEGER1x7        , name:'RISE TIME'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x03b)},    // PRM_FX1_SLOWGEAR_RISETIME
        { addr:0x0000003e, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x03c)},    // PRM_FX1_SLOWGEAR_LEVEL
        { addr:0x0000003f, size:INTEGER1x7        , name:'WAVE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x03d)},    // PRM_FX1_WAVESYN_WAVE
        { addr:0x00000040, size:INTEGER1x7        , name:'CUTOFF'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x03e)},    // PRM_FX1_WAVESYN_CUTOFF
        { addr:0x00000041, size:INTEGER1x7        , name:'RESONANCE'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x03f)},    // PRM_FX1_WAVESYN_RESONANCE
        { addr:0x00000042, size:INTEGER1x7        , name:'FILTER SENS'            , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x040)},    // PRM_FX1_WAVESYN_FLT_SENS
        { addr:0x00000043, size:INTEGER1x7        , name:'FILTER DECAY'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x041)},    // PRM_FX1_WAVESYN_FLT_DECAY
        { addr:0x00000044, size:INTEGER1x7        , name:'FILTER DEPTH'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x042)},    // PRM_FX1_WAVESYN_FLT_DEPTH
        { addr:0x00000045, size:INTEGER1x7        , name:'SYNTH LEVEL'            , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x043)},    // PRM_FX1_WAVESYN_SYN_LEVEL
        { addr:0x00000046, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x044)},    // PRM_FX1_WAVESYN_D_LEVEL
        { addr:0x00000047, size:INTEGER1x7        , name:'RANGE'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x045)},    // PRM_FX1_OCTAVE_RANGE
        { addr:0x00000048, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x046)},    // PRM_FX1_OCTAVE_LEVEL
        { addr:0x00000049, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x047)},    // PRM_FX1_OCTAVE_D_LEVEL
        { addr:0x0000004a, size:INTEGER1x7        , name:'VOICE'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x048)},    // PRM_FX1_PITCHSHIFT_VOICE
        { addr:0x0000004b, size:INTEGER1x7        , name:'PS1:MODE'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x049)},    // PRM_FX1_PITCHSHIFT_MODE1
        { addr:0x0000004c, size:INTEGER1x7        , name:'PS1:PITCH'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x04a)},    // PRM_FX1_PITCHSHIFT_PITCH1
        { addr:0x0000004d, size:INTEGER1x7        , name:'PS1:FINE'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x04b)},    // PRM_FX1_PITCHSHIFT_FINE1
        { addr:0x0000004e, size:INTEGER2x7        , name:'PS1:PRE DELAY'          , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x04c)},    // PRM_FX1_PITCHSHIFT_PREDELAY1
        { addr:0x00000050, size:INTEGER1x7        , name:'PS1:LEVEL'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x050)},    // PRM_FX1_PITCHSHIFT_LEVEL1
        { addr:0x00000051, size:INTEGER1x7        , name:'PS2:MODE'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x051)},    // PRM_FX1_PITCHSHIFT_MODE2
        { addr:0x00000052, size:INTEGER1x7        , name:'PS2:PITCH'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x052)},    // PRM_FX1_PITCHSHIFT_PITCH2
        { addr:0x00000053, size:INTEGER1x7        , name:'PS2:FINE'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x053)},    // PRM_FX1_PITCHSHIFT_FINE2
        { addr:0x00000054, size:INTEGER2x7        , name:'PS2:PRE DELAY'          , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x054)},    // PRM_FX1_PITCHSHIFT_PREDELAY2
        { addr:0x00000056, size:INTEGER1x7        , name:'PS2:LEVEL'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x058)},    // PRM_FX1_PITCHSHIFT_LEVEL2
        { addr:0x00000057, size:INTEGER1x7        , name:'PS1:FEEDBACK'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x059)},    // PRM_FX1_PITCHSHIFT_FEEDBACK
        { addr:0x00000058, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x05a)},    // PRM_FX1_PITCHSHIFT_D_LEVEL
        { addr:0x00000059, size:INTEGER1x7        , name:'VOICE'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x05b)},    // PRM_FX1_HARMONIST_VOICE
        { addr:0x0000005a, size:INTEGER1x7        , name:'HR1:HARMONY'            , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x05c)},    // PRM_FX1_HARMONIST_HARMONY1
        { addr:0x0000005b, size:INTEGER2x7        , name:'HR1:PRE DELAY'          , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x05d)},    // PRM_FX1_HARMONIST_PREDELAY1
        { addr:0x0000005d, size:INTEGER1x7        , name:'HR1:LEVEL'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x061)},    // PRM_FX1_HARMONIST_LEVEL1
        { addr:0x0000005e, size:INTEGER1x7        , name:'HR2:HARMONY'            , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x062)},    // PRM_FX1_HARMONIST_HARMONY2
        { addr:0x0000005f, size:INTEGER2x7        , name:'HR2:PREDELAY'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x063)},    // PRM_FX1_HARMONIST_PREDELAY2
        { addr:0x00000061, size:INTEGER1x7        , name:'HR2:LEVEL'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x067)},    // PRM_FX1_HARMONIST_LEVEL2
        { addr:0x00000062, size:INTEGER1x7        , name:'HR1:FEEDBACK'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x068)},    // PRM_FX1_HARMONIST_FEEDBACK
        { addr:0x00000063, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x069)},    // PRM_FX1_HARMONIST_D_LEVEL
        { addr:0x00000064, size:INTEGER1x7        , name:'HR1:C'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x06a)},    // PRM_FX1_HARMONIST_V1_HARM_1
        { addr:0x00000065, size:INTEGER1x7        , name:'HR1:Db'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x06b)},    // PRM_FX1_HARMONIST_V1_HARM_2
        { addr:0x00000066, size:INTEGER1x7        , name:'HR1:D'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x06c)},    // PRM_FX1_HARMONIST_V1_HARM_3
        { addr:0x00000067, size:INTEGER1x7        , name:'HR1:Eb'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x06d)},    // PRM_FX1_HARMONIST_V1_HARM_4
        { addr:0x00000068, size:INTEGER1x7        , name:'HR1:E'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x06e)},    // PRM_FX1_HARMONIST_V1_HARM_5
        { addr:0x00000069, size:INTEGER1x7        , name:'HR1:F'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x06f)},    // PRM_FX1_HARMONIST_V1_HARM_6
        { addr:0x0000006a, size:INTEGER1x7        , name:'HR1:F#'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x070)},    // PRM_FX1_HARMONIST_V1_HARM_7
        { addr:0x0000006b, size:INTEGER1x7        , name:'HR1:G'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x071)},    // PRM_FX1_HARMONIST_V1_HARM_8
        { addr:0x0000006c, size:INTEGER1x7        , name:'HR1:Ab'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x072)},    // PRM_FX1_HARMONIST_V1_HARM_9
        { addr:0x0000006d, size:INTEGER1x7        , name:'HR1:A'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x073)},    // PRM_FX1_HARMONIST_V1_HARM_10
        { addr:0x0000006e, size:INTEGER1x7        , name:'HR1:Bb'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x074)},    // PRM_FX1_HARMONIST_V1_HARM_11
        { addr:0x0000006f, size:INTEGER1x7        , name:'HR1:B'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x075)},    // PRM_FX1_HARMONIST_V1_HARM_12
        { addr:0x00000070, size:INTEGER1x7        , name:'HR2:C'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x076)},    // PRM_FX1_HARMONIST_V2_HARM_1
        { addr:0x00000071, size:INTEGER1x7        , name:'HR2:Db'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x077)},    // PRM_FX1_HARMONIST_V2_HARM_2
        { addr:0x00000072, size:INTEGER1x7        , name:'HR2:D'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x078)},    // PRM_FX1_HARMONIST_V2_HARM_3
        { addr:0x00000073, size:INTEGER1x7        , name:'HR2:Eb'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x079)},    // PRM_FX1_HARMONIST_V2_HARM_4
        { addr:0x00000074, size:INTEGER1x7        , name:'HR2:E'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x07a)},    // PRM_FX1_HARMONIST_V2_HARM_5
        { addr:0x00000075, size:INTEGER1x7        , name:'HR2:F'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x07b)},    // PRM_FX1_HARMONIST_V2_HARM_6
        { addr:0x00000076, size:INTEGER1x7        , name:'HR2:F#'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x07c)},    // PRM_FX1_HARMONIST_V2_HARM_7
        { addr:0x00000077, size:INTEGER1x7        , name:'HR2:G'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x07d)},    // PRM_FX1_HARMONIST_V2_HARM_8
        { addr:0x00000078, size:INTEGER1x7        , name:'HR2:Ab'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x07e)},    // PRM_FX1_HARMONIST_V2_HARM_9
        { addr:0x00000079, size:INTEGER1x7        , name:'HR2:A'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x07f)},    // PRM_FX1_HARMONIST_V2_HARM_10
        { addr:0x0000007a, size:INTEGER1x7        , name:'HR2:Bb'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x100)},    // PRM_FX1_HARMONIST_V2_HARM_11
        { addr:0x0000007b, size:INTEGER1x7        , name:'HR2:B'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x101)},    // PRM_FX1_HARMONIST_V2_HARM_12
        { addr:0x0000007c, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x102)},    // PRM_FX1_ACPROCESS_TYPE
        { addr:0x0000007d, size:INTEGER1x7        , name:'BASS'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x103)},    // PRM_FX1_ACPROCESS_BASS
        { addr:0x0000007e, size:INTEGER1x7        , name:'MIDDLE'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x104)},    // PRM_FX1_ACPROCESS_MID
        { addr:0x0000007f, size:INTEGER1x7        , name:'MIDDLE FREQ'            , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x105)},    // PRM_FX1_ACPROCESS_MID_F
        { addr:0x00000100, size:INTEGER1x7        , name:'TREBLE'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x106)},    // PRM_FX1_ACPROCESS_TREBLE
        { addr:0x00000101, size:INTEGER1x7        , name:'PRESENCE'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x107)},    // PRM_FX1_ACPROCESS_PRESENCE
        { addr:0x00000102, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x108)},    // PRM_FX1_ACPROCESS_LEVEL
        { addr:0x00000103, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x109)},    // PRM_FX1_PHASER_TYPE
        { addr:0x00000104, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x10a)},    // PRM_FX1_PHASER_RATE
        { addr:0x00000105, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x10b)},    // PRM_FX1_PHASER_DEPTH
        { addr:0x00000106, size:INTEGER1x7        , name:'MANUAL'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x10c)},    // PRM_FX1_PHASER_MANUAL
        { addr:0x00000107, size:INTEGER1x7        , name:'RESONANCE'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x10d)},    // PRM_FX1_PHASER_RESONANCE
        { addr:0x00000108, size:INTEGER1x7        , name:'STEP RATE'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x10e)},    // PRM_FX1_PHASER_STEPRATE
        { addr:0x00000109, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x10f)},    // PRM_FX1_PHASER_E_LEVEL
        { addr:0x0000010a, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x110)},    // PRM_FX1_PHASER_D_LEVEL
        { addr:0x0000010b, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x111)},    // PRM_FX1_FLANGER_RATE
        { addr:0x0000010c, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x112)},    // PRM_FX1_FLANGER_DEPTH
        { addr:0x0000010d, size:INTEGER1x7        , name:'MANUAL'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x113)},    // PRM_FX1_FLANGER_MANUAL
        { addr:0x0000010e, size:INTEGER1x7        , name:'RESONANCE'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x114)},    // PRM_FX1_FLANGER_RESONANCE
        // { addr:0x0000010f, size:INTEGER1x7        , name:''                       },    //
        { addr:0x00000110, size:INTEGER1x7        , name:'LOW CUT'                , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x115)},    // PRM_FX1_FLANGER_LOWCUT
        { addr:0x00000111, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x116)},    // PRM_FX1_FLANGER_E_LEVEL
        { addr:0x00000112, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x117)},    // PRM_FX1_FLANGER_D_LEVEL
        { addr:0x00000113, size:INTEGER1x7        , name:'WAVE SHAPE'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x118)},    // PRM_FX1_TREMOLO_WAVESHAPE
        { addr:0x00000114, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x119)},    // PRM_FX1_TREMOLO_RATE
        { addr:0x00000115, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x11a)},    // PRM_FX1_TREMOLO_DEPTH
        { addr:0x00000116, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x11b)},    // PRM_FX1_TREMOLO_LEVEL
        // { addr:0x00000117, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x00000118, size:INTEGER1x7        , name:''                       },    //
        { addr:0x00000119, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x11c)},    // PRM_FX1_ROTARY_RATE_FAST
        // { addr:0x0000011a, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x0000011b, size:INTEGER1x7        , name:''                       },    //
        { addr:0x0000011c, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x11d)},    // PRM_FX1_ROTARY_DEPTH
        { addr:0x0000011d, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x11e)},    // PRM_FX1_ROTARY_LEVEL
        { addr:0x0000011e, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x11f)},    // PRM_FX1_UNI_V_RATE
        { addr:0x0000011f, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x120)},    // PRM_FX1_UNI_V_DEPTH
        { addr:0x00000120, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x121)},    // PRM_FX1_UNI_V_LEVEL
        { addr:0x00000121, size:INTEGER1x7        , name:'PATTERN'                , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x122)},    // PRM_FX1_SLICER_PATTERN
        { addr:0x00000122, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x123)},    // PRM_FX1_SLICER_RATE
        { addr:0x00000123, size:INTEGER1x7        , name:'TRIGGER SENS'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x124)},    // PRM_FX1_SLICER_TRIGSENS
        { addr:0x00000124, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x125)},    // PRM_FX1_SLICER_EFFECT_LEVEL
        { addr:0x00000125, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x126)},    // PRM_FX1_SLICER_DIRECT_LEVEL
        { addr:0x00000126, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x127)},    // PRM_FX1_VIBRATO_RATE
        { addr:0x00000127, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x128)},    // PRM_FX1_VIBRATO_DEPTH
        // { addr:0x00000128, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x00000129, size:INTEGER1x7        , name:''                       },    //
        { addr:0x0000012a, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x129)},    // PRM_FX1_VIBRATO_LEVEL
        { addr:0x0000012b, size:INTEGER1x7        , name:'MODE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x12a)},    // PRM_FX1_RINGMOD_MODE
        { addr:0x0000012c, size:INTEGER1x7        , name:'FREQUENCY'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x12b)},    // PRM_FX1_RINGMOD_FREQ
        { addr:0x0000012d, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x12c)},    // PRM_FX1_RINGMOD_E_LEVEL
        { addr:0x0000012e, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x12d)},    // PRM_FX1_RINGMOD_D_LEVEL
        { addr:0x0000012f, size:INTEGER1x7        , name:'MODE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x12e)},    // PRM_FX1_HUMANIZER_MODE
        { addr:0x00000130, size:INTEGER1x7        , name:'VOWEL1'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x12f)},    // PRM_FX1_HUMANIZER_VOWEL1
        { addr:0x00000131, size:INTEGER1x7        , name:'VOWEL2'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x130)},    // PRM_FX1_HUMANIZER_VOWEL2
        { addr:0x00000132, size:INTEGER1x7        , name:'SENS'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x131)},    // PRM_FX1_HUMANIZER_SENS
        { addr:0x00000133, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x132)},    // PRM_FX1_HUMANIZER_RATE
        { addr:0x00000134, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x133)},    // PRM_FX1_HUMANIZER_DEPTH
        { addr:0x00000135, size:INTEGER1x7        , name:'MANUAL'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x134)},    // PRM_FX1_HUMANIZER_MANUAL
        { addr:0x00000136, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x135)},    // PRM_FX1_HUMANIZER_LEVEL
        { addr:0x00000137, size:INTEGER1x7        , name:'XOVER FREQUENCY'        , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x136)},    // PRM_FX1_2x2CHORUS_XOVERF
        { addr:0x00000138, size:INTEGER1x7        , name:'LOW RATE'               , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x137)},    // PRM_FX1_2x2CHORUS_LOW_RATE
        { addr:0x00000139, size:INTEGER1x7        , name:'LOW DEPTH'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x138)},    // PRM_FX1_2x2CHORUS_LOW_DEPTH
        { addr:0x0000013a, size:INTEGER1x7        , name:'LOW PRE DELAY'          , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x139)},    // PRM_FX1_2x2CHORUS_LOW_PREDELAY
        { addr:0x0000013b, size:INTEGER1x7        , name:'LOW LEVEL'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x13a)},    // PRM_FX1_2x2CHORUS_LOW_LEVEL
        { addr:0x0000013c, size:INTEGER1x7        , name:'HIGH RATE'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x13b)},    // PRM_FX1_2x2CHORUS_HIGH_RATE
        { addr:0x0000013d, size:INTEGER1x7        , name:'HIGH DEPTH'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x13c)},    // PRM_FX1_2x2CHORUS_HIGH_DEPTH
        { addr:0x0000013e, size:INTEGER1x7        , name:'HIGH PRE DELAY'         , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x13d)},    // PRM_FX1_2x2CHORUS_HIGH_PREDELAY
        { addr:0x0000013f, size:INTEGER1x7        , name:'HIGH LEVEL'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x13e)},    // PRM_FX1_2x2CHORUS_HIGH_LEVEL
        { addr:0x00000140, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x13f)},    // PRM_FX1_2x2CHORUS_DIRECT_LEVEL
        { addr:0x00000141, size:INTEGER1x7        , name:'HIGH'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x140)},    // PRM_FX1_ACSIM_TOP
        { addr:0x00000142, size:INTEGER1x7        , name:'BODY'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x141)},    // PRM_FX1_ACSIM_BODY
        { addr:0x00000143, size:INTEGER1x7        , name:'LOW'                    , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x142)},    // PRM_FX1_ACSIM_LOW
        // { addr:0x00000144, size:INTEGER1x7        , name:''                       },    //
        { addr:0x00000145, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x143)},    // PRM_FX1_ACSIM_LEVEL
        { addr:0x00000146, size:INTEGER1x7        , name:'SCRIPT'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x144)},    // PRM_FX1_EVH_PHASER_SCRIPT
        { addr:0x00000147, size:INTEGER1x7        , name:'SPEED'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x145)},    // PRM_FX1_EVH_PHASER_SPEED
        { addr:0x00000148, size:INTEGER1x7        , name:'MANUAL'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x146)},    // PRM_FX1_EVH_FLANGER_MANUAL
        { addr:0x00000149, size:INTEGER1x7        , name:'WIDTH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x147)},    // PRM_FX1_EVH_FLANGER_WIDTH
        { addr:0x0000014a, size:INTEGER1x7        , name:'SPEED'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x148)},    // PRM_FX1_EVH_FLANGER_SPEED
        { addr:0x0000014b, size:INTEGER1x7        , name:'REGEN.'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x149)},    // PRM_FX1_EVH_FLANGER_REGEN
        { addr:0x0000014c, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x14a)},    // PRM_FX1_EVH_WAH_PEDAL_POS
        { addr:0x0000014d, size:INTEGER1x7        , name:'PEDAL MIN'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x14b)},    // PRM_FX1_EVH_WAH_PEDAL_MIN
        { addr:0x0000014e, size:INTEGER1x7        , name:'PEDAL MAX'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x14c)},    // PRM_FX1_EVH_WAH_PEDAL_MAX
        { addr:0x0000014f, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x14d)},    // PRM_FX1_EVH_WAH_EFFECT_LEVEL
        { addr:0x00000150, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x14e)},    // PRM_FX1_EVH_WAH_DIRECT_MIX
        { addr:0x00000151, size:INTEGER1x7        , name:'SELECT'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x14f)},    // PRM_FX1_DC30_SELECTOR
        { addr:0x00000152, size:INTEGER1x7        , name:'INPUT VOLUME'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x150)},    // PRM_FX1_DC30_INPUT_VOLUME
        { addr:0x00000153, size:INTEGER1x7        , name:'CHORUS INTENSITY'       , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x151)},    // PRM_FX1_DC30_CHORUS_INTENSITY
        { addr:0x00000154, size:INTEGER2x7        , name:'ECHO REPEAT RATE'       , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x152)},    // PRM_FX1_DC30_ECHO_REPEAT_RATE
        { addr:0x00000156, size:INTEGER1x7        , name:'ECHO INTENSISTY'        , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x156)},    // PRM_FX1_DC30_ECHO_INTENSITY
        { addr:0x00000157, size:INTEGER1x7        , name:'ECHO VOLUME'            , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x157)},    // PRM_FX1_DC30_ECHO_VOLUME
        { addr:0x00000158, size:INTEGER1x7        , name:'TONE'                   , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x158)},    // PRM_FX1_DC30_TONE
        { addr:0x00000159, size:INTEGER1x7        , name:'OUTPUT'                 , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x159)},    // PRM_FX1_DC30_OUTPUT
        { addr:0x0000015a, size:INTEGER1x7        , name:'1OCT LEVEL'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x15a)},    // PRM_FX1_HEAVY_OCTAVE_1OCT_LEVEL
        { addr:0x0000015b, size:INTEGER1x7        , name:'2OCT LEVEL'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x15b)},    // PRM_FX1_HEAVY_OCTAVE_2OCT_LEVEL
        { addr:0x0000015c, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x15c)},    // PRM_FX1_HEAVY_OCTAVE_DIRECT_LEVEL
        { addr:0x0000015d, size:INTEGER1x7        , name:'PITCH'                  , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x15d)},    // PRM_FX1_PEDAL_BEND_PITCH_MAX                //Ver200
        { addr:0x0000015e, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x15e)},    // PRM_FX1_PEDAL_BEND_PEDAL_POSITION           //Ver200
        { addr:0x0000015f, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x15f)},    // PRM_FX1_PEDAL_BEND_EFFECT_LEVEL             //Ver200
        { addr:0x00000160, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_MOD_FX1, 0x160)},    // PRM_FX1_PEDAL_BEND_DIRECT_MIX               //Ver200
	],
	'UserPatch%Fx(2)': [
        { addr:0x00000000, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%SW', 0x02)},    // PRM_FX1_SW
        // { addr:0x00000001, size:INTEGER1x7        , name:'TYPE'                   , bid: 'PATCH%FX(2)',					indexTo: 0x00, convert: CONFIG_TYPE.FX },    // PRM_FX1_FXTYPE                      Ver200
        { addr:0x00000002, size:INTEGER1x7        , name:'MODE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x000)},    // PRM_FX1_TWAH_MODE
        { addr:0x00000003, size:INTEGER1x7        , name:'POLARITY'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x001)},    // PRM_FX1_TWAH_POLARITY
        { addr:0x00000004, size:INTEGER1x7        , name:'SENS'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x002)},    // PRM_FX1_TWAH_SENS
        { addr:0x00000005, size:INTEGER1x7        , name:'FREQ'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x003)},    // PRM_FX1_TWAH_FREQ
        { addr:0x00000006, size:INTEGER1x7        , name:'PEAK'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x004)},    // PRM_FX1_TWAH_PEAK
        { addr:0x00000007, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x005)},    // PRM_FX1_TWAH_D_LEVEL
        { addr:0x00000008, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x006)},    // PRM_FX1_TWAH_LEVEL
        { addr:0x00000009, size:INTEGER1x7        , name:'MODE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x007)},    // PRM_FX1_AWAH_MODE
        { addr:0x0000000a, size:INTEGER1x7        , name:'FREQ'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x008)},    // PRM_FX1_AWAH_FREQ
        { addr:0x0000000b, size:INTEGER1x7        , name:'PEAK'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x009)},    // PRM_FX1_AWAH_PEAK
        { addr:0x0000000c, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x00a)},    // PRM_FX1_AWAH_RATE
        { addr:0x0000000d, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x00b)},    // PRM_FX1_AWAH_DEPTH
        { addr:0x0000000e, size:INTEGER1x7        , name:'DIRET MIX'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x00c)},    // PRM_FX1_AWAH_D_LEVEL
        { addr:0x0000000f, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x00d)},    // PRM_FX1_AWAH_LEVEL
        { addr:0x00000010, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x00e)},    // PRM_FX1_SUBWAH_TYPE
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x00f)},    // PRM_FX1_SUBWAH_PDLPOS
        { addr:0x00000012, size:INTEGER1x7        , name:'PEDAL MIN'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x010)},    // PRM_FX1_SUBWAH_MIN
        { addr:0x00000013, size:INTEGER1x7        , name:'PEDAL MAX'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x011)},    // PRM_FX1_SUBWAH_MAX
        { addr:0x00000014, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x012)},    // PRM_FX1_SUBWAH_E_LEVEL
        { addr:0x00000015, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x013)},    // PRM_FX1_SUBWAH_D_LEVEL
        { addr:0x00000016, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x014)},    // PRM_FX1_ADCOMP_TYPE
        { addr:0x00000017, size:INTEGER1x7        , name:'SUSTAIN'                , converter: new CpyToAllColorConverter(type_FX_FX2, 0x015)},    // PRM_FX1_ADCOMP_SUSTAIN
        { addr:0x00000018, size:INTEGER1x7        , name:'ATTACK'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x016)},    // PRM_FX1_ADCOMP_ATTACK
        { addr:0x00000019, size:INTEGER1x7        , name:'TONE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x017)},    // PRM_FX1_ADCOMP_TONE
        { addr:0x0000001a, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x018)},    // PRM_FX1_ADCOMP_LEVEL
        { addr:0x0000001b, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x019)},    // PRM_FX1_LIMITER_TYPE
        { addr:0x0000001c, size:INTEGER1x7        , name:'ATTACK'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x01a)},    // PRM_FX1_LIMITER_ATTACK
        { addr:0x0000001d, size:INTEGER1x7        , name:'THRESHOLD'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x01b)},    // PRM_FX1_LIMITER_THRESHOLD
        { addr:0x0000001e, size:INTEGER1x7        , name:'RATIO'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x01c)},    // PRM_FX1_LIMITER_RATIO
        { addr:0x0000001f, size:INTEGER1x7        , name:'RELEASE'                , converter: new CpyToAllColorConverter(type_FX_FX2, 0x01d)},    // PRM_FX1_LIMITER_RELEASE
        { addr:0x00000020, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x01e)},    // PRM_FX1_LIMITER_LEVEL
        { addr:0x00000021, size:INTEGER1x7        , name:'31Hz'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x01f)},    // PRM_FX1_GEQ_BAND1
        { addr:0x00000022, size:INTEGER1x7        , name:'62Hz'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x020)},    // PRM_FX1_GEQ_BAND2
        { addr:0x00000023, size:INTEGER1x7        , name:'125Hz'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x021)},    // PRM_FX1_GEQ_BAND3
        { addr:0x00000024, size:INTEGER1x7        , name:'250Hz'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x022)},    // PRM_FX1_GEQ_BAND4
        { addr:0x00000025, size:INTEGER1x7        , name:'500Hz'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x023)},    // PRM_FX1_GEQ_BAND5
        { addr:0x00000026, size:INTEGER1x7        , name:'1kHz'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x024)},    // PRM_FX1_GEQ_BAND6
        { addr:0x00000027, size:INTEGER1x7        , name:'2kHz'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x025)},    // PRM_FX1_GEQ_BAND7
        { addr:0x00000028, size:INTEGER1x7        , name:'4kHz'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x026)},    // PRM_FX1_GEQ_BAND8
        { addr:0x00000029, size:INTEGER1x7        , name:'8kHz'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x027)},    // PRM_FX1_GEQ_BAND9
        { addr:0x0000002a, size:INTEGER1x7        , name:'16kHz'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x028)},    // PRM_FX1_GEQ_BAND10
        { addr:0x0000002b, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x029)},    // PRM_FX1_GEQ_LEVEL
        { addr:0x0000002c, size:INTEGER1x7        , name:'LOW CUT'                , converter: new CpyToAllColorConverter(type_FX_FX2, 0x02a)},    // PRM_FX1_PEQ_LOW_CUT
        { addr:0x0000002d, size:INTEGER1x7        , name:'LOW GAIN'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x02b)},    // PRM_FX1_PEQ_LOW_GAIN
        { addr:0x0000002e, size:INTEGER1x7        , name:'LOW-MID FREQ'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x02c)},    // PRM_FX1_PEQ_LOWMID_FREQ
        { addr:0x0000002f, size:INTEGER1x7        , name:'LOW-MID Q'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x02d)},    // PRM_FX1_PEQ_LOWMID_Q
        { addr:0x00000030, size:INTEGER1x7        , name:'LOW-MID GAIN'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x02e)},    // PRM_FX1_PEQ_LOWMID_GAIN
        { addr:0x00000031, size:INTEGER1x7        , name:'HIGH-MID FREQ'          , converter: new CpyToAllColorConverter(type_FX_FX2, 0x02f)},    // PRM_FX1_PEQ_HIGHMID_FREQ
        { addr:0x00000032, size:INTEGER1x7        , name:'HIGH-MID Q'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x030)},    // PRM_FX1_PEQ_HIGHMID_Q
        { addr:0x00000033, size:INTEGER1x7        , name:'HIGH-MID GAIN'          , converter: new CpyToAllColorConverter(type_FX_FX2, 0x031)},    // PRM_FX1_PEQ_HIGHMID_GAIN
        { addr:0x00000034, size:INTEGER1x7        , name:'HIGH GAIN'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x032)},    // PRM_FX1_PEQ_HIGH_GAIN
        { addr:0x00000035, size:INTEGER1x7        , name:'HIGH CUT'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x033)},    // PRM_FX1_PEQ_HIGH_CUT
        { addr:0x00000036, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x034)},    // PRM_FX1_PEQ_LEVEL
        { addr:0x00000037, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x035)},    // PRM_FX1_GTRSIM_TYPE
        { addr:0x00000038, size:INTEGER1x7        , name:'LOW'                    , converter: new CpyToAllColorConverter(type_FX_FX2, 0x036)},    // PRM_FX1_GTRSIM_LOW
        { addr:0x00000039, size:INTEGER1x7        , name:'HIGH'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x037)},    // PRM_FX1_GTRSIM_HIGH
        { addr:0x0000003a, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x038)},    // PRM_FX1_GTRSIM_LEVEL
        { addr:0x0000003b, size:INTEGER1x7        , name:'BODY'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x039)},    // PRM_FX1_GTRSIM_BODY
        { addr:0x0000003c, size:INTEGER1x7        , name:'SENS'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x03a)},    // PRM_FX1_SLOWGEAR_SENS
        { addr:0x0000003d, size:INTEGER1x7        , name:'RISE TIME'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x03b)},    // PRM_FX1_SLOWGEAR_RISETIME
        { addr:0x0000003e, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x03c)},    // PRM_FX1_SLOWGEAR_LEVEL
        { addr:0x0000003f, size:INTEGER1x7        , name:'WAVE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x03d)},    // PRM_FX1_WAVESYN_WAVE
        { addr:0x00000040, size:INTEGER1x7        , name:'CUTOFF'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x03e)},    // PRM_FX1_WAVESYN_CUTOFF
        { addr:0x00000041, size:INTEGER1x7        , name:'RESONANCE'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x03f)},    // PRM_FX1_WAVESYN_RESONANCE
        { addr:0x00000042, size:INTEGER1x7        , name:'FILTER SENS'            , converter: new CpyToAllColorConverter(type_FX_FX2, 0x040)},    // PRM_FX1_WAVESYN_FLT_SENS
        { addr:0x00000043, size:INTEGER1x7        , name:'FILTER DECAY'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x041)},    // PRM_FX1_WAVESYN_FLT_DECAY
        { addr:0x00000044, size:INTEGER1x7        , name:'FILTER DEPTH'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x042)},    // PRM_FX1_WAVESYN_FLT_DEPTH
        { addr:0x00000045, size:INTEGER1x7        , name:'SYNTH LEVEL'            , converter: new CpyToAllColorConverter(type_FX_FX2, 0x043)},    // PRM_FX1_WAVESYN_SYN_LEVEL
        { addr:0x00000046, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x044)},    // PRM_FX1_WAVESYN_D_LEVEL
        { addr:0x00000047, size:INTEGER1x7        , name:'RANGE'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x045)},    // PRM_FX1_OCTAVE_RANGE
        { addr:0x00000048, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x046)},    // PRM_FX1_OCTAVE_LEVEL
        { addr:0x00000049, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x047)},    // PRM_FX1_OCTAVE_D_LEVEL
        { addr:0x0000004a, size:INTEGER1x7        , name:'VOICE'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x048)},    // PRM_FX1_PITCHSHIFT_VOICE
        { addr:0x0000004b, size:INTEGER1x7        , name:'PS1:MODE'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x049)},    // PRM_FX1_PITCHSHIFT_MODE1
        { addr:0x0000004c, size:INTEGER1x7        , name:'PS1:PITCH'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x04a)},    // PRM_FX1_PITCHSHIFT_PITCH1
        { addr:0x0000004d, size:INTEGER1x7        , name:'PS1:FINE'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x04b)},    // PRM_FX1_PITCHSHIFT_FINE1
        { addr:0x0000004e, size:INTEGER2x7        , name:'PS1:PRE DELAY'          , converter: new CpyToAllColorConverter(type_FX_FX2, 0x04c)},    // PRM_FX1_PITCHSHIFT_PREDELAY1
        { addr:0x00000050, size:INTEGER1x7        , name:'PS1:LEVEL'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x050)},    // PRM_FX1_PITCHSHIFT_LEVEL1
        { addr:0x00000051, size:INTEGER1x7        , name:'PS2:MODE'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x051)},    // PRM_FX1_PITCHSHIFT_MODE2
        { addr:0x00000052, size:INTEGER1x7        , name:'PS2:PITCH'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x052)},    // PRM_FX1_PITCHSHIFT_PITCH2
        { addr:0x00000053, size:INTEGER1x7        , name:'PS2:FINE'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x053)},    // PRM_FX1_PITCHSHIFT_FINE2
        { addr:0x00000054, size:INTEGER2x7        , name:'PS2:PRE DELAY'          , converter: new CpyToAllColorConverter(type_FX_FX2, 0x054)},    // PRM_FX1_PITCHSHIFT_PREDELAY2
        { addr:0x00000056, size:INTEGER1x7        , name:'PS2:LEVEL'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x058)},    // PRM_FX1_PITCHSHIFT_LEVEL2
        { addr:0x00000057, size:INTEGER1x7        , name:'PS1:FEEDBACK'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x059)},    // PRM_FX1_PITCHSHIFT_FEEDBACK
        { addr:0x00000058, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x05a)},    // PRM_FX1_PITCHSHIFT_D_LEVEL
        { addr:0x00000059, size:INTEGER1x7        , name:'VOICE'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x05b)},    // PRM_FX1_HARMONIST_VOICE
        { addr:0x0000005a, size:INTEGER1x7        , name:'HR1:HARMONY'            , converter: new CpyToAllColorConverter(type_FX_FX2, 0x05c)},    // PRM_FX1_HARMONIST_HARMONY1
        { addr:0x0000005b, size:INTEGER2x7        , name:'HR1:PRE DELAY'          , converter: new CpyToAllColorConverter(type_FX_FX2, 0x05d)},    // PRM_FX1_HARMONIST_PREDELAY1
        { addr:0x0000005d, size:INTEGER1x7        , name:'HR1:LEVEL'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x061)},    // PRM_FX1_HARMONIST_LEVEL1
        { addr:0x0000005e, size:INTEGER1x7        , name:'HR2:HARMONY'            , converter: new CpyToAllColorConverter(type_FX_FX2, 0x062)},    // PRM_FX1_HARMONIST_HARMONY2
        { addr:0x0000005f, size:INTEGER2x7        , name:'HR2:PREDELAY'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x063)},    // PRM_FX1_HARMONIST_PREDELAY2
        { addr:0x00000061, size:INTEGER1x7        , name:'HR2:LEVEL'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x067)},    // PRM_FX1_HARMONIST_LEVEL2
        { addr:0x00000062, size:INTEGER1x7        , name:'HR1:FEEDBACK'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x068)},    // PRM_FX1_HARMONIST_FEEDBACK
        { addr:0x00000063, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x069)},    // PRM_FX1_HARMONIST_D_LEVEL
        { addr:0x00000064, size:INTEGER1x7        , name:'HR1:C'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x06a)},    // PRM_FX1_HARMONIST_V1_HARM_1
        { addr:0x00000065, size:INTEGER1x7        , name:'HR1:Db'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x06b)},    // PRM_FX1_HARMONIST_V1_HARM_2
        { addr:0x00000066, size:INTEGER1x7        , name:'HR1:D'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x06c)},    // PRM_FX1_HARMONIST_V1_HARM_3
        { addr:0x00000067, size:INTEGER1x7        , name:'HR1:Eb'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x06d)},    // PRM_FX1_HARMONIST_V1_HARM_4
        { addr:0x00000068, size:INTEGER1x7        , name:'HR1:E'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x06e)},    // PRM_FX1_HARMONIST_V1_HARM_5
        { addr:0x00000069, size:INTEGER1x7        , name:'HR1:F'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x06f)},    // PRM_FX1_HARMONIST_V1_HARM_6
        { addr:0x0000006a, size:INTEGER1x7        , name:'HR1:F#'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x070)},    // PRM_FX1_HARMONIST_V1_HARM_7
        { addr:0x0000006b, size:INTEGER1x7        , name:'HR1:G'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x071)},    // PRM_FX1_HARMONIST_V1_HARM_8
        { addr:0x0000006c, size:INTEGER1x7        , name:'HR1:Ab'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x072)},    // PRM_FX1_HARMONIST_V1_HARM_9
        { addr:0x0000006d, size:INTEGER1x7        , name:'HR1:A'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x073)},    // PRM_FX1_HARMONIST_V1_HARM_10
        { addr:0x0000006e, size:INTEGER1x7        , name:'HR1:Bb'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x074)},    // PRM_FX1_HARMONIST_V1_HARM_11
        { addr:0x0000006f, size:INTEGER1x7        , name:'HR1:B'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x075)},    // PRM_FX1_HARMONIST_V1_HARM_12
        { addr:0x00000070, size:INTEGER1x7        , name:'HR2:C'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x076)},    // PRM_FX1_HARMONIST_V2_HARM_1
        { addr:0x00000071, size:INTEGER1x7        , name:'HR2:Db'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x077)},    // PRM_FX1_HARMONIST_V2_HARM_2
        { addr:0x00000072, size:INTEGER1x7        , name:'HR2:D'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x078)},    // PRM_FX1_HARMONIST_V2_HARM_3
        { addr:0x00000073, size:INTEGER1x7        , name:'HR2:Eb'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x079)},    // PRM_FX1_HARMONIST_V2_HARM_4
        { addr:0x00000074, size:INTEGER1x7        , name:'HR2:E'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x07a)},    // PRM_FX1_HARMONIST_V2_HARM_5
        { addr:0x00000075, size:INTEGER1x7        , name:'HR2:F'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x07b)},    // PRM_FX1_HARMONIST_V2_HARM_6
        { addr:0x00000076, size:INTEGER1x7        , name:'HR2:F#'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x07c)},    // PRM_FX1_HARMONIST_V2_HARM_7
        { addr:0x00000077, size:INTEGER1x7        , name:'HR2:G'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x07d)},    // PRM_FX1_HARMONIST_V2_HARM_8
        { addr:0x00000078, size:INTEGER1x7        , name:'HR2:Ab'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x07e)},    // PRM_FX1_HARMONIST_V2_HARM_9
        { addr:0x00000079, size:INTEGER1x7        , name:'HR2:A'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x07f)},    // PRM_FX1_HARMONIST_V2_HARM_10
        { addr:0x0000007a, size:INTEGER1x7        , name:'HR2:Bb'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x100)},    // PRM_FX1_HARMONIST_V2_HARM_11
        { addr:0x0000007b, size:INTEGER1x7        , name:'HR2:B'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x101)},    // PRM_FX1_HARMONIST_V2_HARM_12
        { addr:0x0000007c, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x102)},    // PRM_FX1_ACPROCESS_TYPE
        { addr:0x0000007d, size:INTEGER1x7        , name:'BASS'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x103)},    // PRM_FX1_ACPROCESS_BASS
        { addr:0x0000007e, size:INTEGER1x7        , name:'MIDDLE'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x104)},    // PRM_FX1_ACPROCESS_MID
        { addr:0x0000007f, size:INTEGER1x7        , name:'MIDDLE FREQ'            , converter: new CpyToAllColorConverter(type_FX_FX2, 0x105)},    // PRM_FX1_ACPROCESS_MID_F
        { addr:0x00000100, size:INTEGER1x7        , name:'TREBLE'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x106)},    // PRM_FX1_ACPROCESS_TREBLE
        { addr:0x00000101, size:INTEGER1x7        , name:'PRESENCE'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x107)},    // PRM_FX1_ACPROCESS_PRESENCE
        { addr:0x00000102, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x108)},    // PRM_FX1_ACPROCESS_LEVEL
        { addr:0x00000103, size:INTEGER1x7        , name:'TYPE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x109)},    // PRM_FX1_PHASER_TYPE
        { addr:0x00000104, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x10a)},    // PRM_FX1_PHASER_RATE
        { addr:0x00000105, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x10b)},    // PRM_FX1_PHASER_DEPTH
        { addr:0x00000106, size:INTEGER1x7        , name:'MANUAL'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x10c)},    // PRM_FX1_PHASER_MANUAL
        { addr:0x00000107, size:INTEGER1x7        , name:'RESONANCE'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x10d)},    // PRM_FX1_PHASER_RESONANCE
        { addr:0x00000108, size:INTEGER1x7        , name:'STEP RATE'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x10e)},    // PRM_FX1_PHASER_STEPRATE
        { addr:0x00000109, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x10f)},    // PRM_FX1_PHASER_E_LEVEL
        { addr:0x0000010a, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x110)},    // PRM_FX1_PHASER_D_LEVEL
        { addr:0x0000010b, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x111)},    // PRM_FX1_FLANGER_RATE
        { addr:0x0000010c, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x112)},    // PRM_FX1_FLANGER_DEPTH
        { addr:0x0000010d, size:INTEGER1x7        , name:'MANUAL'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x113)},    // PRM_FX1_FLANGER_MANUAL
        { addr:0x0000010e, size:INTEGER1x7        , name:'RESONANCE'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x114)},    // PRM_FX1_FLANGER_RESONANCE
        // { addr:0x0000010f, size:INTEGER1x7        , name:''                       },    //                             
        { addr:0x00000110, size:INTEGER1x7        , name:'LOW CUT'                , converter: new CpyToAllColorConverter(type_FX_FX2, 0x115)},    // PRM_FX1_FLANGER_LOWCUT
        { addr:0x00000111, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x116)},    // PRM_FX1_FLANGER_E_LEVEL
        { addr:0x00000112, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x117)},    // PRM_FX1_FLANGER_D_LEVEL
        { addr:0x00000113, size:INTEGER1x7        , name:'WAVE SHAPE'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x118)},    // PRM_FX1_TREMOLO_WAVESHAPE
        { addr:0x00000114, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x119)},    // PRM_FX1_TREMOLO_RATE
        { addr:0x00000115, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x11a)},    // PRM_FX1_TREMOLO_DEPTH
        { addr:0x00000116, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x11b)},    // PRM_FX1_TREMOLO_LEVEL
        // { addr:0x00000117, size:INTEGER1x7        , name:''                       },    //                             
        // { addr:0x00000118, size:INTEGER1x7        , name:''                       },    //                             
        { addr:0x00000119, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x11c)},    // PRM_FX1_ROTARY_RATE_FAST
        // { addr:0x0000011a, size:INTEGER1x7        , name:''                       },    //                             
        // { addr:0x0000011b, size:INTEGER1x7        , name:''                       },    //                             
        { addr:0x0000011c, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x11d)},    // PRM_FX1_ROTARY_DEPTH
        { addr:0x0000011d, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x11e)},    // PRM_FX1_ROTARY_LEVEL
        { addr:0x0000011e, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x11f)},    // PRM_FX1_UNI_V_RATE
        { addr:0x0000011f, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x120)},    // PRM_FX1_UNI_V_DEPTH
        { addr:0x00000120, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x121)},    // PRM_FX1_UNI_V_LEVEL
        { addr:0x00000121, size:INTEGER1x7        , name:'PATTERN'                , converter: new CpyToAllColorConverter(type_FX_FX2, 0x122)},    // PRM_FX1_SLICER_PATTERN
        { addr:0x00000122, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x123)},    // PRM_FX1_SLICER_RATE
        { addr:0x00000123, size:INTEGER1x7        , name:'TRIGGER SENS'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x124)},    // PRM_FX1_SLICER_TRIGSENS
        { addr:0x00000124, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x125)},    // PRM_FX1_SLICER_EFFECT_LEVEL
        { addr:0x00000125, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x126)},    // PRM_FX1_SLICER_DIRECT_LEVEL
        { addr:0x00000126, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x127)},    // PRM_FX1_VIBRATO_RATE
        { addr:0x00000127, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x128)},    // PRM_FX1_VIBRATO_DEPTH
        // { addr:0x00000128, size:INTEGER1x7        , name:''                       },    //                             
        // { addr:0x00000129, size:INTEGER1x7        , name:''                       },    //                             
        { addr:0x0000012a, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x129)},    // PRM_FX1_VIBRATO_LEVEL
        { addr:0x0000012b, size:INTEGER1x7        , name:'MODE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x12a)},    // PRM_FX1_RINGMOD_MODE
        { addr:0x0000012c, size:INTEGER1x7        , name:'FREQUENCY'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x12b)},    // PRM_FX1_RINGMOD_FREQ
        { addr:0x0000012d, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x12c)},    // PRM_FX1_RINGMOD_E_LEVEL
        { addr:0x0000012e, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x12d)},    // PRM_FX1_RINGMOD_D_LEVEL
        { addr:0x0000012f, size:INTEGER1x7        , name:'MODE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x12e)},    // PRM_FX1_HUMANIZER_MODE
        { addr:0x00000130, size:INTEGER1x7        , name:'VOWEL1'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x12f)},    // PRM_FX1_HUMANIZER_VOWEL1
        { addr:0x00000131, size:INTEGER1x7        , name:'VOWEL2'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x130)},    // PRM_FX1_HUMANIZER_VOWEL2
        { addr:0x00000132, size:INTEGER1x7        , name:'SENS'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x131)},    // PRM_FX1_HUMANIZER_SENS
        { addr:0x00000133, size:INTEGER1x7        , name:'RATE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x132)},    // PRM_FX1_HUMANIZER_RATE
        { addr:0x00000134, size:INTEGER1x7        , name:'DEPTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x133)},    // PRM_FX1_HUMANIZER_DEPTH
        { addr:0x00000135, size:INTEGER1x7        , name:'MANUAL'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x134)},    // PRM_FX1_HUMANIZER_MANUAL
        { addr:0x00000136, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x135)},    // PRM_FX1_HUMANIZER_LEVEL
        { addr:0x00000137, size:INTEGER1x7        , name:'XOVER FREQUENCY'        , converter: new CpyToAllColorConverter(type_FX_FX2, 0x136)},    // PRM_FX1_2x2CHORUS_XOVERF
        { addr:0x00000138, size:INTEGER1x7        , name:'LOW RATE'               , converter: new CpyToAllColorConverter(type_FX_FX2, 0x137)},    // PRM_FX1_2x2CHORUS_LOW_RATE
        { addr:0x00000139, size:INTEGER1x7        , name:'LOW DEPTH'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x138)},    // PRM_FX1_2x2CHORUS_LOW_DEPTH
        { addr:0x0000013a, size:INTEGER1x7        , name:'LOW PRE DELAY'          , converter: new CpyToAllColorConverter(type_FX_FX2, 0x139)},    // PRM_FX1_2x2CHORUS_LOW_PREDELAY
        { addr:0x0000013b, size:INTEGER1x7        , name:'LOW LEVEL'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x13a)},    // PRM_FX1_2x2CHORUS_LOW_LEVEL
        { addr:0x0000013c, size:INTEGER1x7        , name:'HIGH RATE'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x13b)},    // PRM_FX1_2x2CHORUS_HIGH_RATE
        { addr:0x0000013d, size:INTEGER1x7        , name:'HIGH DEPTH'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x13c)},    // PRM_FX1_2x2CHORUS_HIGH_DEPTH
        { addr:0x0000013e, size:INTEGER1x7        , name:'HIGH PRE DELAY'         , converter: new CpyToAllColorConverter(type_FX_FX2, 0x13d)},    // PRM_FX1_2x2CHORUS_HIGH_PREDELAY
        { addr:0x0000013f, size:INTEGER1x7        , name:'HIGH LEVEL'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x13e)},    // PRM_FX1_2x2CHORUS_HIGH_LEVEL
        { addr:0x00000140, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x13f)},    // PRM_FX1_2x2CHORUS_DIRECT_LEVEL
        { addr:0x00000141, size:INTEGER1x7        , name:'HIGH'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x140)},    // PRM_FX1_ACSIM_TOP
        { addr:0x00000142, size:INTEGER1x7        , name:'BODY'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x141)},    // PRM_FX1_ACSIM_BODY
        { addr:0x00000143, size:INTEGER1x7        , name:'LOW'                    , converter: new CpyToAllColorConverter(type_FX_FX2, 0x142)},    // PRM_FX1_ACSIM_LOW
        // { addr:0x00000144, size:INTEGER1x7        , name:''                       },    //                             
        { addr:0x00000145, size:INTEGER1x7        , name:'LEVEL'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x143)},    // PRM_FX1_ACSIM_LEVEL
        { addr:0x00000146, size:INTEGER1x7        , name:'SCRIPT'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x144)},    // PRM_FX1_EVH_PHASER_SCRIPT
        { addr:0x00000147, size:INTEGER1x7        , name:'SPEED'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x145)},    // PRM_FX1_EVH_PHASER_SPEED
        { addr:0x00000148, size:INTEGER1x7        , name:'MANUAL'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x146)},    // PRM_FX1_EVH_FLANGER_MANUAL
        { addr:0x00000149, size:INTEGER1x7        , name:'WIDTH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x147)},    // PRM_FX1_EVH_FLANGER_WIDTH
        { addr:0x0000014a, size:INTEGER1x7        , name:'SPEED'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x148)},    // PRM_FX1_EVH_FLANGER_SPEED
        { addr:0x0000014b, size:INTEGER1x7        , name:'REGEN.'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x149)},    // PRM_FX1_EVH_FLANGER_REGEN
        { addr:0x0000014c, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x14a)},    // PRM_FX1_EVH_WAH_PEDAL_POS
        { addr:0x0000014d, size:INTEGER1x7        , name:'PEDAL MIN'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x14b)},    // PRM_FX1_EVH_WAH_PEDAL_MIN
        { addr:0x0000014e, size:INTEGER1x7        , name:'PEDAL MAX'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x14c)},    // PRM_FX1_EVH_WAH_PEDAL_MAX
        { addr:0x0000014f, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x14d)},    // PRM_FX1_EVH_WAH_EFFECT_LEVEL
        { addr:0x00000150, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x14e)},    // PRM_FX1_EVH_WAH_DIRECT_MIX
        { addr:0x00000151, size:INTEGER1x7        , name:'SELECT'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x14f)},    // PRM_FX1_DC30_SELECTOR
        { addr:0x00000152, size:INTEGER1x7        , name:'INPUT VOLUME'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x150)},    // PRM_FX1_DC30_INPUT_VOLUME
        { addr:0x00000153, size:INTEGER1x7        , name:'CHORUS INTENSITY'       , converter: new CpyToAllColorConverter(type_FX_FX2, 0x151)},    // PRM_FX1_DC30_CHORUS_INTENSITY
        { addr:0x00000154, size:INTEGER2x7        , name:'ECHO REPEAT RATE'       , converter: new CpyToAllColorConverter(type_FX_FX2, 0x152)},    // PRM_FX1_DC30_ECHO_REPEAT_RATE
        { addr:0x00000156, size:INTEGER1x7        , name:'ECHO INTENSISTY'        , converter: new CpyToAllColorConverter(type_FX_FX2, 0x156)},    // PRM_FX1_DC30_ECHO_INTENSITY
        { addr:0x00000157, size:INTEGER1x7        , name:'ECHO VOLUME'            , converter: new CpyToAllColorConverter(type_FX_FX2, 0x157)},    // PRM_FX1_DC30_ECHO_VOLUME
        { addr:0x00000158, size:INTEGER1x7        , name:'TONE'                   , converter: new CpyToAllColorConverter(type_FX_FX2, 0x158)},    // PRM_FX1_DC30_TONE
        { addr:0x00000159, size:INTEGER1x7        , name:'OUTPUT'                 , converter: new CpyToAllColorConverter(type_FX_FX2, 0x159)},    // PRM_FX1_DC30_OUTPUT
        { addr:0x0000015a, size:INTEGER1x7        , name:'1OCT LEVEL'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x15a)},    // PRM_FX1_HEAVY_OCTAVE_1OCT_LEVEL
        { addr:0x0000015b, size:INTEGER1x7        , name:'2OCT LEVEL'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x15b)},    // PRM_FX1_HEAVY_OCTAVE_2OCT_LEVEL
        { addr:0x0000015c, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x15c)},    // PRM_FX1_HEAVY_OCTAVE_DIRECT_LEVEL
        { addr:0x0000015d, size:INTEGER1x7        , name:'PITCH'                  , converter: new CpyToAllColorConverter(type_FX_FX2, 0x15d)},    // PRM_FX1_PEDAL_BEND_PITCH_MAX                //Ver200
        { addr:0x0000015e, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new CpyToAllColorConverter(type_FX_FX2, 0x15e)},    // PRM_FX1_PEDAL_BEND_PEDAL_POSITION           //Ver200
        { addr:0x0000015f, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_FX_FX2, 0x15f)},    // PRM_FX1_PEDAL_BEND_EFFECT_LEVEL             //Ver200
        { addr:0x00000160, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_FX_FX2, 0x160)},    // PRM_FX1_PEDAL_BEND_DIRECT_MIX              //Ver200
	],
	'UserPatch%Delay(1)': [
		{ addr:0x00000000, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%SW', 0x03)},    // PRM_DLY_SW
        // { addr:0x00000001, size:INTEGER1x7        , name:'TYPE'                   , bid: cpyToAllColor_DLY1,		indexTo: 0x00, convert: CONFIG_TYPE.DELAY },    // PRM_DLY_TYPE
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY TIME'             , converter: new CpyToAllColorConverter(type_DLY1, 0x01)},    // PRM_DLY_COMMON_DLY_TIME
        { addr:0x00000004, size:INTEGER1x7        , name:'FEEDBACK'               , converter: new CpyToAllColorConverter(type_DLY1, 0x05)},    // PRM_DLY_COMMON_FEEDBACK
        { addr:0x00000005, size:INTEGER1x7        , name:'HIGH CUT'               , converter: new CpyToAllColorConverter(type_DLY1, 0x06)},    // PRM_DLY_COMMON_HICUT
        { addr:0x00000006, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_DLY1, 0x07)},    // PRM_DLY_COMMON_EFFECT_LEVEL
        { addr:0x00000007, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_DLY1, 0x08)},    // PRM_DLY_COMMON_DIRECT_LEVEL
        { addr:0x00000008, size:INTEGER1x7        , name:'TAP TIME'               , converter: new CpyToAllColorConverter(type_DLY1, 0x09)},    // PRM_DLY_PAN_TAPTIME
        // { addr:0x00000009, size:INTEGER2x7        , name:''                       },    //
        // { addr:0x0000000b, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x0000000c, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x0000000d, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x0000000e, size:INTEGER2x7        , name:''                       },    //
        // { addr:0x00000010, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x00000011, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x00000012, size:INTEGER1x7        , name:''                       },    //
        { addr:0x00000013, size:INTEGER1x7        , name:'MOD RATE'               , converter: new CpyToAllColorConverter(type_DLY1, 0x0A)},    // PRM_DLY_MOD_RATE
        { addr:0x00000014, size:INTEGER1x7        , name:'MOD DEPTH'              , converter: new CpyToAllColorConverter(type_DLY1, 0x0B)},    // PRM_DLY_MOD_DEPTH
        { addr:0x00000015, size:INTEGER1x7        , name:'RANGE'                  , converter: new CpyToAllColorConverter(type_DLY1, 0x0C)},    // PRM_DLY_VINTAGE_LPF
        { addr:0x00000016, size:INTEGER1x7        , name:'FILTER'                 , converter: new CpyToAllColorConverter(type_DLY1, 0x0D)},    // PRM_DLY_VINTAGE_FILTER
        { addr:0x00000017, size:INTEGER1x7        , name:'FEEDBACK PHASE'         , converter: new CpyToAllColorConverter(type_DLY1, 0x0E)},    // PRM_DLY_VINTAGE_FEEDBACK_PHASE
        { addr:0x00000018, size:INTEGER1x7        , name:'DELAY PHASE'            , converter: new CpyToAllColorConverter(type_DLY1, 0x0F)},    // PRM_DLY_VINTAGE_EFFECT_PHASE
        { addr:0x00000019, size:INTEGER1x7        , name:'MOD SW'                 , converter: new CpyToAllColorConverter(type_DLY1, 0x10)},    // PRM_DLY_VINTAGE_MOD_SW
	],
	'UserPatch%Delay(2)': [
		{ addr:0x00000000, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%SW', 0x04)},    // PRM_DLY_SW
        // { addr:0x00000001, size:INTEGER1x7        , name:'TYPE'                   , bid: cpyToAllColor_DLY2,		indexTo: 0x00, convert: CONFIG_TYPE.DELAY },    // PRM_DLY_TYPE
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY TIME'             , converter: new CpyToAllColorConverter(type_DLY2, 0x01)},    // PRM_DLY_COMMON_DLY_TIME
        { addr:0x00000004, size:INTEGER1x7        , name:'FEEDBACK'               , converter: new CpyToAllColorConverter(type_DLY2, 0x05)},    // PRM_DLY_COMMON_FEEDBACK
        { addr:0x00000005, size:INTEGER1x7        , name:'HIGH CUT'               , converter: new CpyToAllColorConverter(type_DLY2, 0x06)},    // PRM_DLY_COMMON_HICUT
        { addr:0x00000006, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_DLY2, 0x07)},    // PRM_DLY_COMMON_EFFECT_LEVEL
        { addr:0x00000007, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_DLY2, 0x08)},    // PRM_DLY_COMMON_DIRECT_LEVEL
        { addr:0x00000008, size:INTEGER1x7        , name:'TAP TIME'               , converter: new CpyToAllColorConverter(type_DLY2, 0x09)},    // PRM_DLY_PAN_TAPTIME
        // { addr:0x00000009, size:INTEGER2x7        , name:''                       },    //
        // { addr:0x0000000b, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x0000000c, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x0000000d, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x0000000e, size:INTEGER2x7        , name:''                       },    //
        // { addr:0x00000010, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x00000011, size:INTEGER1x7        , name:''                       },    //
        // { addr:0x00000012, size:INTEGER1x7        , name:''                       },    //
        { addr:0x00000013, size:INTEGER1x7        , name:'MOD RATE'               , converter: new CpyToAllColorConverter(type_DLY2, 0x0A)},    // PRM_DLY_MOD_RATE
        { addr:0x00000014, size:INTEGER1x7        , name:'MOD DEPTH'              , converter: new CpyToAllColorConverter(type_DLY2, 0x0B)},    // PRM_DLY_MOD_DEPTH
        { addr:0x00000015, size:INTEGER1x7        , name:'RANGE'                  , converter: new CpyToAllColorConverter(type_DLY2, 0x0C)},    // PRM_DLY_VINTAGE_LPF
        { addr:0x00000016, size:INTEGER1x7        , name:'FILTER'                 , converter: new CpyToAllColorConverter(type_DLY2, 0x0D)},    // PRM_DLY_VINTAGE_FILTER
        { addr:0x00000017, size:INTEGER1x7        , name:'FEEDBACK PHASE'         , converter: new CpyToAllColorConverter(type_DLY2, 0x0E)},    // PRM_DLY_VINTAGE_FEEDBACK_PHASE
        { addr:0x00000018, size:INTEGER1x7        , name:'DELAY PHASE'            , converter: new CpyToAllColorConverter(type_DLY2, 0x0F)},    // PRM_DLY_VINTAGE_EFFECT_PHASE
        { addr:0x00000019, size:INTEGER1x7        , name:'MOD SW'                 , converter: new CpyToAllColorConverter(type_DLY2, 0x10)},    // PRM_DLY_VINTAGE_MOD_SW
	],
	'UserPatch%Patch_1': [
		{ addr:0x00000000, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%SW', 0x05)},    // PRM_REVERB_SW
        // { addr:0x00000001, size:INTEGER1x7        , name:'TYPE'                   , bid: 'PATCH%REVERB',		indexTo: 0x00, convert: CONFIG_TYPE.REVERB },    // PRM_REVERB_TYPE
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB TIME'            , converter: new CpyToAllColorConverter(type_REV, 0x02)},    // PRM_REVERB_TIME
        { addr:0x00000003, size:INTEGER2x7        , name:'PRE DELAY'              , converter: new CpyToAllColorConverter(type_REV, 0x03)},    // PRM_REVERB_PREDELAY
        { addr:0x00000005, size:INTEGER1x7        , name:'LOW CUT'                , converter: new CpyToAllColorConverter(type_REV, 0x07)},    // PRM_REVERB_LOWCUT
        { addr:0x00000006, size:INTEGER1x7        , name:'HIGH CUT'               , converter: new CpyToAllColorConverter(type_REV, 0x08)},    // PRM_REVERB_HICUT
        { addr:0x00000007, size:INTEGER1x7        , name:'DENSITY'                , converter: new CpyToAllColorConverter(type_REV, 0x09)},    // PRM_REVERB_DENSITY
        { addr:0x00000008, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new CpyToAllColorConverter(type_REV, 0x0A)},    // PRM_REVERB_EFFECT_LEVEL
        { addr:0x00000009, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new CpyToAllColorConverter(type_REV, 0x0B)},    // PRM_REVERB_DIRECT_LEVEL
        // { addr:0x0000000a, size:(PADDING | 0x1)   , name:''                       },    // (padding)
        { addr:0x0000000b, size:INTEGER1x7        , name:'SPRING COLOR'           , converter: new CpyToAllColorConverter(type_REV, 0x0C)},    // PRM_REVERB_SPRING_COLOR
        // { addr:0x0000000c, size:(PADDING | 0x4)   , name:''                       },    // (padding)
        { addr:0x00000010, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%PEDALFX_COM', 0x01)},    // PRM_PEDAL_FX_SW
        { addr:0x00000011, size:INTEGER1x7        , name:'TYPE'                   , converter: new SameValConverter('PATCH%PEDALFX_COM', 0x02)},    // PRM_PEDAL_FX_TYPE
        { addr:0x00000012, size:INTEGER1x7        , name:'TYPE'                   , converter: new SameValConverter('PATCH%PEDALFX', 0x00)},    // PRM_PEDAL_FX_WAH_TYPE
        { addr:0x00000013, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new SameValConverter('PATCH%PEDALFX', 0x01)},    // PRM_PEDAL_FX_WAH_PEDAL_POSITION
        { addr:0x00000014, size:INTEGER1x7        , name:'PEDAL MIN'              , converter: new SameValConverter('PATCH%PEDALFX', 0x02)},    // PRM_PEDAL_FX_WAH_PEDAL_MIN
        { addr:0x00000015, size:INTEGER1x7        , name:'PEDAL MAX'              , converter: new SameValConverter('PATCH%PEDALFX', 0x03)},    // PRM_PEDAL_FX_WAH_PEDAL_MAX
        { addr:0x00000016, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new SameValConverter('PATCH%PEDALFX', 0x04)},    // PRM_PEDAL_FX_WAH_EFFECT_LEVEL
        { addr:0x00000017, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new SameValConverter('PATCH%PEDALFX', 0x05)},    // PRM_PEDAL_FX_WAH_DIRECT_MIX
        { addr:0x00000018, size:INTEGER1x7        , name:'PITCH'                  , converter: new SameValConverter('PATCH%PEDALFX', 0x06)},    // PRM_PEDAL_FX_PEDAL_BEND_PITCH_MAX
        { addr:0x00000019, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new SameValConverter('PATCH%PEDALFX', 0x07)},    // PRM_PEDAL_FX_PEDAL_BEND_PEDAL_POSITION
        { addr:0x0000001a, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new SameValConverter('PATCH%PEDALFX', 0x08)},    // PRM_PEDAL_FX_PEDAL_BEND_EFFECT_LEVEL
        { addr:0x0000001b, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new SameValConverter('PATCH%PEDALFX', 0x09)},    // PRM_PEDAL_FX_PEDAL_BEND_DIRECT_MIX
        { addr:0x0000001c, size:INTEGER1x7        , name:'PEDAL POS'              , converter: new SameValConverter('PATCH%PEDALFX', 0x0A)},    // PRM_PEDAL_FX_EVH95_POS
        { addr:0x0000001d, size:INTEGER1x7        , name:'PEDAL MIN'              , converter: new SameValConverter('PATCH%PEDALFX', 0x0B)},    // PRM_PEDAL_FX_EVH95_MIN
        { addr:0x0000001e, size:INTEGER1x7        , name:'PEDAL MAX'              , converter: new SameValConverter('PATCH%PEDALFX', 0x0C)},    // PRM_PEDAL_FX_EVH95_MAX
        { addr:0x0000001f, size:INTEGER1x7        , name:'EFFECT LEVEL'           , converter: new SameValConverter('PATCH%PEDALFX', 0x0D)},    // PRM_PEDAL_FX_EVH95_E_LEVEL
        { addr:0x00000020, size:INTEGER1x7        , name:'DIRECT MIX'             , converter: new SameValConverter('PATCH%PEDALFX', 0x0E)},    // PRM_PEDAL_FX_EVH95_D_LEVEL
        // { addr:0x00000021, size:INTEGER1x7        , name:'FOOT VOLUME'            , bid: 'PATCH%PEDALFX_COM',	indexTo: 0x03       , convertToSize: INTEGER4x4 },    // PRM_FOOT_VOLUME_VOL_LEVEL
        { addr:0x00000022, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%SENDRETURN', 0x00)},    // PRM_SEND_RETURN_SW
        { addr:0x00000023, size:INTEGER1x7        , name:'MODE'                   , converter: new SameValConverter('PATCH%SENDRETURN', 0x02)},    // PRM_SEND_RETURN_MODE
        { addr:0x00000024, size:INTEGER1x7        , name:'SEND LEVEL'             , converter: new SameValConverter('PATCH%SENDRETURN', 0x03)},    // PRM_SEND_RETURN_SEND_LEVEL
        { addr:0x00000025, size:INTEGER1x7        , name:'RETURN LEVEL'           , converter: new SameValConverter('PATCH%SENDRETURN', 0x04)},    // PRM_SEND_RETURN_RETURN_LEVEL
        { addr:0x00000026, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%NS', 0x00)},    // PRM_NS1_SW
        { addr:0x00000027, size:INTEGER1x7        , name:'THRESHOLD'              , converter: new SameValConverter('PATCH%NS', 0x01)},    // PRM_NS1_THRESHOLD
        { addr:0x00000028, size:INTEGER1x7        , name:'RELEASE'                , converter: new SameValConverter('PATCH%NS', 0x02)},    // PRM_NS1_RELEASE
        // { addr:0x00000029, size:(PADDING | 0x7)   , name:''                       },    // (padding)
        // { addr:0x00000030, size:INTEGER1x7        , name:''                       },    //
        { addr:0x00000031, size:INTEGER1x7        , name:'MASTER KEY'             , converter: new SameValConverter('PATCH%OTHER', 0x02)},    // PRM_MASTER_KEY
        // { addr:0x00000032, size:(PADDING | 0x22)  , name:''                       },    // (padding)
        { addr:0x00000054, size:INTEGER1x7        , name:'SW'                     , converter: new SameValConverter('PATCH%SOLO_COM', 0x00)},    // PRM_SOLO_SW
        { addr:0x00000055, size:INTEGER1x7        , name:'LEVEL'                  , converter: new SameValConverter('PATCH%SOLO_COM', 0x01)},    // PRM_SOLO_LEVEL

        /* ***********************  CONTOURはSWとSELECTの組み合わせで一つのパラメータに変換するので専用の処理になる  ******************************* */
        { addr:0x00000056, size:INTEGER1x7        , name:'CONTOUR SW'             , converter: new ContourMargeConverter()},    // PRM_CONTOUR_SW
        // { addr:0x00000057, size:INTEGER1x7        , name:'CONTOUR SELECT'         , bid: 'PATCH%CONTOUR_COM',	indexTo: 0x00 },    // PRM_CONTOUR_SELECT                  //Ver200
        /* ************************************************************************************************************************************* */

        // { addr:0x00000058, size:INTEGER1x7        , name:'FS2 FUNCTION'           },    // PRM_FS_FUNCTION_FS2
        { addr:0x00000059, size:INTEGER1x7        , name:'POSITION'               , converter: new SameValConverter('PATCH%EQ_EACH(2)', 0x00)},    // PRM_POSITION_EQ2
        // { addr:0x0000005a, size:INTEGER1x7        , name:'FREQ SHIFT'             , bid: 'PATCH%CONTOUR(1)',	indexTo: 0x01 },    // PRM_CONTOUR_FREQ_SHIFT
	],
	'UserPatch%Patch_2': [
		{ addr:0x00000000, size:INTEGER1x7        , name:'CHAIN'                    , converter: new SameValConverter('PATCH%OTHER', 0x00)},    // PRM_CHAIN_PTN                       //Ver200
        { addr:0x00000001, size:INTEGER1x7        , name:'POSITION'                 , converter: new SameValConverter('PATCH%SENDRETURN', 0x01)},    // PRM_POSITION_SEND_RETURN
        { addr:0x00000002, size:INTEGER1x7        , name:'POSITION'                 , converter: new SameValConverter('PATCH%EQ_EACH(1)', 0x00)},    // PRM_POSITION_EQ
        { addr:0x00000003, size:INTEGER1x7        , name:'POSITION'                 , converter: new SameValConverter('PATCH%PEDALFX_COM', 0x00)},    // PRM_POSITION_PEDAL_FX
        { addr:0x00000004, size:INTEGER1x7        , name:'BOOSTER GRN'              , converter: new TypeConverter('PATCH%BOOSTER(1)', 0x00, CONFIG_TYPE.BOOSTER, type_BST, color_G)},    // PRM_FXBOX_ASGN_BOOSTER_G            //Ver200
        { addr:0x00000005, size:INTEGER1x7        , name:'BOOSTER RED'              , converter: new TypeConverter('PATCH%BOOSTER(2)', 0x00, CONFIG_TYPE.BOOSTER, type_BST, color_R)},    // PRM_FXBOX_ASGN_BOOSTER_R            //Ver200
        { addr:0x00000006, size:INTEGER1x7        , name:'BOOSTER YLW'              , converter: new TypeConverter('PATCH%BOOSTER(3)', 0x00, CONFIG_TYPE.BOOSTER, type_BST, color_Y)},    // PRM_FXBOX_ASGN_BOOSTER_Y            //Ver200
        { addr:0x00000007, size:INTEGER1x7        , name:'MOD GRN'                  , converter: new TypeConverter('PATCH%FX(1)', 0x00, CONFIG_TYPE.MOD_FX, type_MOD_FX1, color_G)},    // PRM_FXBOX_ASGN_MOD_G                //Ver200
        { addr:0x00000008, size:INTEGER1x7        , name:'MOD RED'                  , converter: new TypeConverter('PATCH%FX(2)', 0x00, CONFIG_TYPE.MOD_FX, type_MOD_FX1, color_R)},    // PRM_FXBOX_ASGN_MOD_R                //Ver200
        { addr:0x00000009, size:INTEGER1x7        , name:'MOD YLW'                  , converter: new TypeConverter('PATCH%FX(3)', 0x00, CONFIG_TYPE.MOD_FX, type_MOD_FX1, color_Y)},    // PRM_FXBOX_ASGN_MOD_Y                //Ver200
        { addr:0x0000000a, size:INTEGER1x7        , name:'FX GRN'                   , converter: new TypeConverter('PATCH%FX(4)', 0x00, CONFIG_TYPE.MOD_FX, type_FX_FX2, color_G)},    // PRM_FXBOX_ASGN_FX_G                 //Ver200
        { addr:0x0000000b, size:INTEGER1x7        , name:'FX RED'                   , converter: new TypeConverter('PATCH%FX(5)', 0x00, CONFIG_TYPE.MOD_FX, type_FX_FX2, color_R)},    // PRM_FXBOX_ASGN_FX_R                 //Ver200
        { addr:0x0000000c, size:INTEGER1x7        , name:'FX YLW'                   , converter: new TypeConverter('PATCH%FX(6)', 0x00, CONFIG_TYPE.MOD_FX, type_FX_FX2, color_Y)},    // PRM_FXBOX_ASGN_FX_Y                 //Ver200
        { addr:0x0000000d, size:INTEGER1x7        , name:'DELAY GRN'                , converter: new TypeConverter('PATCH%DELAY(1)', 0x00, CONFIG_TYPE.DELAY, type_DLY1, color_G)},    // PRM_FXBOX_ASGN_DELAY_G
        { addr:0x0000000e, size:INTEGER1x7        , name:'DELAY RED'                , converter: new TypeConverter('PATCH%DELAY(2)', 0x00, CONFIG_TYPE.DELAY, type_DLY1, color_R)},    // PRM_FXBOX_ASGN_DELAY_R
        { addr:0x0000000f, size:INTEGER1x7        , name:'DELAY YLW'                , converter: new TypeConverter('PATCH%DELAY(3)', 0x00, CONFIG_TYPE.DELAY, type_DLY1, color_Y)},    // PRM_FXBOX_ASGN_DELAY_Y
        { addr:0x00000010, size:INTEGER1x7        , name:'REVERB GRN'               , converter: new TypeConverter('PATCH%REVERB(1)', 0x00, CONFIG_TYPE.REVERB, type_REV, color_G)},    // PRM_FXBOX_ASGN_REVERB_G
        { addr:0x00000011, size:INTEGER1x7        , name:'REVERB RED'               , converter: new TypeConverter('PATCH%REVERB(2)', 0x00, CONFIG_TYPE.REVERB, type_REV, color_R)},    // PRM_FXBOX_ASGN_REVERB_R
        { addr:0x00000012, size:INTEGER1x7        , name:'REVERB YLW'               , converter: new TypeConverter('PATCH%REVERB(3)', 0x00, CONFIG_TYPE.REVERB, type_REV, color_Y)},    // PRM_FXBOX_ASGN_REVERB_Y
        { addr:0x00000013, size:INTEGER1x7        , name:'DELAY2 GRN'               , converter: new TypeConverter('PATCH%DELAY(4)', 0x00, CONFIG_TYPE.DELAY, type_DLY2, color_G)},    // PRM_FXBOX_ASGN_DELAY2_G
        { addr:0x00000014, size:INTEGER1x7        , name:'DELAY2 RED'               , converter: new TypeConverter('PATCH%DELAY(5)', 0x00, CONFIG_TYPE.DELAY, type_DLY2, color_R)},    // PRM_FXBOX_ASGN_DELAY2_R
        { addr:0x00000015, size:INTEGER1x7        , name:'DELAY2 YLW'               , converter: new TypeConverter('PATCH%DELAY(6)', 0x00, CONFIG_TYPE.DELAY, type_DLY2, color_Y)},    // PRM_FXBOX_ASGN_DELAY2_Y
        { addr:0x00000016, size:INTEGER1x7        , name:'LAYER MODE GRN'           , converter: new SameValConverter('PATCH%REVERB(1)', 0x01)},    // PRM_FXBOX_DLYREV_LAYER_G
        { addr:0x00000017, size:INTEGER1x7        , name:'LAYER MODE RED'           , converter: new SameValConverter('PATCH%REVERB(2)', 0x01)},    // PRM_FXBOX_DLYREV_LAYER_R
        { addr:0x00000018, size:INTEGER1x7        , name:'LAYER MODE YLW'           , converter: new SameValConverter('PATCH%REVERB(3)', 0x01)},    // PRM_FXBOX_DLYREV_LAYER_Y
        { addr:0x00000019, size:INTEGER1x7        , name:''                         , converter: new SameValConverter('PATCH%COLOR', 0x00)},    // PRM_FXBOX_SEL_BOOST
        { addr:0x0000001a, size:INTEGER1x7        , name:''                         , converter: new SameValConverter('PATCH%COLOR', 0x01)},    // PRM_FXBOX_SEL_MOD
        { addr:0x0000001b, size:INTEGER1x7        , name:''                         , converter: new SameValConverter('PATCH%COLOR', 0x02)},    // PRM_FXBOX_SEL_FX
        { addr:0x0000001c, size:INTEGER1x7        , name:''                         , converter: new SameValConverter('PATCH%COLOR', 0x03)},    // PRM_FXBOX_SEL_DELAY
        { addr:0x0000001d, size:INTEGER1x7        , name:''                         , converter: new SameValConverter('PATCH%COLOR', 0x04)},    // PRM_FXBOX_SEL_REVERB
        { addr:0x0000001d, size:INTEGER1x7        , name:''                         , converter: new SameValConverter('PATCH%COLOR', 0x05)},    // PRM_FXBOX_SEL_REVERB
        { addr:0x0000001e, size:INTEGER1x7        , name:'EXP PEDAL FUNCTION'       , converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_FUNC', 0x00, asgnType_PDLFUNC)},    // PRM_PEDAL_FUNCTION_EXP_PEDAL
        { addr:0x0000001f, size:INTEGER1x7        , name:'GAFC EXP1FUNCTION'        , converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_FUNC(1)', 0x00, asgnType_PDLFUNC)},    // PRM_PEDAL_FUNCTION_GAFC_EXP1
        { addr:0x00000020, size:INTEGER1x7        , name:'GAFC EXP2FUNCTION'        , converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_FUNC(1)', 0x00, asgnType_PDLFUNC)},    // PRM_PEDAL_FUNCTION_GAFC_EXP2

        { addr:0x00000021, size:INTEGER1x7        , name:'GAFC FS1FUNCTION'         , converter: new SameValConverter('PATCH%ASSIGN_GAFCFS(1)', 0x00)},    // PRM_FS_FUNCTION_GAFC_FS1
        { addr:0x00000022, size:INTEGER1x7        , name:'GAFC FS2FUNCTION'         , converter: new SameValConverter('PATCH%ASSIGN_GAFCFS(1)', 0x01)},    // PRM_FS_FUNCTION_GAFC_FS2
        { addr:0x00000023, size:INTEGER1x7        , name:'CABINET RESONANCE'        , converter: new SameValConverter('PATCH%OTHER', 0x01)},    // PRM_CABINET_RESONANCE
	],
    'UserPatch%Status': [
        // { addr:0x00000000, size:INTEGER1x7        , name:'TYPE'                   },    // PRM_KNOB_POS_TYPE
        { addr:0x00000001, size:INTEGER1x7        , name:'GAIN'                     , converter: new SameValConverter('PATCH%AMP', 0x00)},    // PRM_KNOB_POS_GAIN
        // { addr:0x00000002, size:INTEGER1x7        , name:'VOLUME'                 },    // PRM_KNOB_POS_VOLUME
        // { addr:0x00000003, size:INTEGER1x7        , name:'BASS'                   },    // PRM_KNOB_POS_BASS
        // { addr:0x00000004, size:INTEGER1x7        , name:'MIDDLE'                 },    // PRM_KNOB_POS_MIDDLE
        // { addr:0x00000005, size:INTEGER1x7        , name:'TREBLE'                 },    // PRM_KNOB_POS_TREBLE
        // { addr:0x00000006, size:INTEGER1x7        , name:'PRESENCE'               },    // PRM_KNOB_POS_PRESENCE
        { addr:0x00000007, size:INTEGER1x7        , name:'BOOSTER'                , converter: new SameValConverter('PATCH%PATCH_KNOB_READONLY', 0x00)},    // PRM_KNOB_POS_BOOST
        { addr:0x00000008, size:INTEGER1x7        , name:'MOD'                    , converter: new SameValConverter('PATCH%PATCH_KNOB_READONLY', 0x01)},    // PRM_KNOB_POS_MOD
        { addr:0x00000009, size:INTEGER1x7        , name:'FX'                     , converter: new SameValConverter('PATCH%PATCH_KNOB_READONLY', 0x02)},    // PRM_KNOB_POS_FX
        { addr:0x0000000a, size:INTEGER1x7        , name:'DELAY'                  , converter: new SameValConverter('PATCH%PATCH_KNOB_READONLY', 0x03)},    // PRM_KNOB_POS_DELAY
        { addr:0x0000000b, size:INTEGER1x7        , name:'REVERB'                 , converter: new SameValConverter('PATCH%PATCH_KNOB_READONLY', 0x04)},    // PRM_KNOB_POS_REVERB
        { addr:0x0000000c, size:INTEGER1x7        , name:'VARIATION'                , converter: new SameValConverter('PATCH%AMP', 0x09)},    // PRM_LED_STATE_VARI
        // { addr:0x0000000d, size:INTEGER1x7        , name:'BOOSTER'                },    // PRM_LED_STATE_BOOST
        // { addr:0x0000000e, size:INTEGER1x7        , name:'MOD'                    },    // PRM_LED_STATE_MOD
        // { addr:0x0000000f, size:INTEGER1x7        , name:'FX'                     },    // PRM_LED_STATE_FX
        // { addr:0x00000010, size:INTEGER1x7        , name:'DELAY'                  },    // PRM_LED_STATE_DELAY
        // { addr:0x00000011, size:INTEGER1x7        , name:'REVERB'                 },    // PRM_LED_STATE_REVERB
    ],
	'UserPatch%Patch_Mk2V2': [
		{ addr:0x00000000, size:INTEGER1x7        , name:'SOLO_EQ_POSITION'       	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x00)},    // PRM_POSITION_SOLO_EQ                //Ver200
        { addr:0x00000001, size:INTEGER1x7        , name:'SOLO_EQ_SW'             	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x01)},    // PRM_SOLO_EQ_SW                      //Ver200
        { addr:0x00000002, size:INTEGER1x7        , name:'SOLO_EQ_LOW_CUT'        	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x02)},    // PRM_SOLO_EQ_LOW_CUT                 //Ver200
        { addr:0x00000003, size:INTEGER1x7        , name:'SOLO_EQ_LOW_GAIN'       	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x03)},    // PRM_SOLO_EQ_LOW_GAIN                //Ver200
        { addr:0x00000004, size:INTEGER1x7        , name:'SOLO_EQ_MID_FREQ'       	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x04)},    // PRM_SOLO_EQ_MID_FREQ                //Ver200
        { addr:0x00000005, size:INTEGER1x7        , name:'SOLO_EQ_MID_Q'          	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x05)},    // PRM_SOLO_EQ_MID_Q                   //Ver200
        { addr:0x00000006, size:INTEGER1x7        , name:'SOLO_EQ_MID_GAIN'       	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x06)},    // PRM_SOLO_EQ_MID_GAIN                //Ver200
        { addr:0x00000007, size:INTEGER1x7        , name:'SOLO_EQ_HIGH_GAIN'      	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x07)},    // PRM_SOLO_EQ_HIGH_GAIN               //Ver200
        { addr:0x00000008, size:INTEGER1x7        , name:'SOLO_EQ_HIGH_CUT'       	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x08)},    // PRM_SOLO_EQ_HIGH_CUT                //Ver200
        { addr:0x00000009, size:INTEGER1x7        , name:'SOLO_EQ_LEVEL'          	, converter: new SameValConverter('PATCH%SOLO_EQ', 0x09)},    // PRM_SOLO_EQ_LEVEL                   //Ver200
        { addr:0x0000000a, size:INTEGER1x7        , name:'SOLO_DELAY_SW'          	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x00)},  //ap146 では 0 固定  // PRM_SOLO_DELAY_SW                   //Ver210
        { addr:0x0000000b, size:INTEGER1x7        , name:'SOLO_DELAY_CARRYOVER'   	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x01)},    // PRM_SOLO_DELAY_CARRYOVER            //Ver210
        { addr:0x0000000c, size:INTEGER2x7        , name:'SOLO_DELAY_TIME'        	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x02)},    // PRM_SOLO_DELAY_TIME                 //Ver210
        { addr:0x0000000e, size:INTEGER1x7        , name:'SOLO_DELAY_FEEDBACK'    	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x06)},    // PRM_SOLO_DELAY_FEEDBACK             //Ver210
        { addr:0x0000000f, size:INTEGER1x7        , name:'SOLO_DELAY_EFFECT_LEVEL'  , converter: new SameValConverter('PATCH%SOLO_DELAY', 0x07)},    // PRM_SOLO_DELAY_EFFECT_LEVEL         //Ver210
        { addr:0x00000010, size:INTEGER1x7        , name:'SOLO_DELAY_DIRECT_LEVEL'  , converter: new SameValConverter('PATCH%SOLO_DELAY', 0x08)},    // PRM_SOLO_DELAY_DIRECT_LEVEL         //Ver210
        { addr:0x00000011, size:INTEGER1x7        , name:'SOLO_DELAY_FILTER'      	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x09)},    // PRM_SOLO_DELAY_FILTER               //Ver210
        { addr:0x00000012, size:INTEGER1x7        , name:'SOLO_DELAY_HIGH_CUT'    	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x0a)},    // PRM_SOLO_DELAY_HIGH_CUT             //Ver210
        { addr:0x00000013, size:INTEGER1x7        , name:'SOLO_DELAY_MOD_SW'      	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x0b)},    // PRM_SOLO_DELAY_MOD_SW               //Ver210
        { addr:0x00000014, size:INTEGER1x7        , name:'SOLO_DELAY_MOD_RATE'    	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x0c)},    // PRM_SOLO_DELAY_MOD_RATE             //Ver210
        { addr:0x00000015, size:INTEGER1x7        , name:'SOLO_DELAY_MOD_DEPTH'   	, converter: new SameValConverter('PATCH%SOLO_DELAY', 0x0d)},    // PRM_SOLO_DELAY_MOD_DEPTH
	],
	'UserPatch%Contour(1)':	[
		{ addr:0x00000000, size:INTEGER1x7        , name:'CONTOUR TYPE'           , converter: new SameValConverter('PATCH%CONTOUR(1)', 0x00)},    // PRM_CONTOUR1_TYPE
        { addr:0x00000001, size:INTEGER1x7        , name:'FREQ SHIFT'             , converter: new SameValConverter('PATCH%CONTOUR(1)', 0x01)},    // PRM_CONTOUR1_FREQ_SHIFT
	],
	'UserPatch%Contour(2)':	[
		{ addr:0x00000000, size:INTEGER1x7        , name:'CONTOUR TYPE'           , converter: new SameValConverter('PATCH%CONTOUR(2)', 0x00)},    // PRM_CONTOUR2_TYPE
        { addr:0x00000001, size:INTEGER1x7        , name:'FREQ SHIFT'             , converter: new SameValConverter('PATCH%CONTOUR(2)', 0x01)},    // PRM_CONTOUR2_FREQ_SHIFT
	],
	'UserPatch%Contour(3)':	[
		{ addr:0x00000000, size:INTEGER1x7        , name:'CONTOUR TYPE'           , converter: new SameValConverter('PATCH%CONTOUR(3)', 0x00)},    // PRM_CONTOUR3_TYPE
        { addr:0x00000001, size:INTEGER1x7        , name:'FREQ SHIFT'             , converter: new SameValConverter('PATCH%CONTOUR(3)', 0x01)},    // PRM_CONTOUR3_FREQ_SHIFT
	],

    /* TODO: ASSIGN KNOB, PDL系は未実装 */
	'UserPatch%KnobAsgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x00, asgnType_BST)},
        { addr:0x00000001, size:INTEGER1x7        , name:'DELAY',              converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x01, asgnType_DLY)},
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB',             converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x02, asgnType_REV)},
        { addr:0x00000003, size:INTEGER1x7        , name:'CHORUS',             converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x03, asgnType_CHORUS)},
        { addr:0x00000004, size:INTEGER1x7        , name:'FLANGER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x04, asgnType_FLANGER)},
        { addr:0x00000005, size:INTEGER1x7        , name:'PHASER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x05, asgnType_PHASER)},
        { addr:0x00000006, size:INTEGER1x7        , name:'UNI-V',              converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x06, asgnType_UNIV)},
        { addr:0x00000007, size:INTEGER1x7        , name:'TREMOLO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x07, asgnType_TREMOLO)},
        { addr:0x00000008, size:INTEGER1x7        , name:'VIBRATO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x08, asgnType_VIBRATO)},
        { addr:0x00000009, size:INTEGER1x7        , name:'ROTARY',             converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x09, asgnType_ROTARY)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'RING MOD',           converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x0a, asgnType_RINGMOD)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'SLOW GEAR',          converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x0b, asgnType_SLOWGEAR)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'SLICER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x0c, asgnType_SLICER)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'COMP',               converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x0d, asgnType_COMP)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'LIMITER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x0e, asgnType_LIMIT)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'T.WAH',              converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x0f, asgnType_TWAH)},
        { addr:0x00000010, size:INTEGER1x7        , name:'AUTO WAH',           converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x10, asgnType_AUTOWAH)},
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL WAH',          converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x11, asgnType_PDLWAH)},
        { addr:0x00000012, size:INTEGER1x7        , name:'GEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x12, asgnType_GEQ)},
        { addr:0x00000013, size:INTEGER1x7        , name:'PEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x13, asgnType_PEQ)},
        { addr:0x00000014, size:INTEGER1x7        , name:'GUITAR SIM',         converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x14, asgnType_GUITARSIM)},
        { addr:0x00000015, size:INTEGER1x7        , name:'AC.GUITAR SIM',      converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x15, asgnType_ACGUITSIM)},
        { addr:0x00000016, size:INTEGER1x7        , name:'AC.PROCESSOR',       converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x16, asgnType_ACPROC)},
        { addr:0x00000017, size:INTEGER1x7        , name:'WAVE SYNTH',         converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x17, asgnType_WAVESYNTH)},
        { addr:0x00000018, size:INTEGER1x7        , name:'OCTAVE',             converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x18, asgnType_OCTAVE)},
        { addr:0x00000019, size:INTEGER1x7        , name:'PITCH SHIFTER',      converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x19, asgnType_PITSHIF)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'HARMONIST',          converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x1a, asgnType_HARMONIST)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'HUMANIZER',          converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x1b, asgnType_HUMANIZER)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'PHASE 90E',          converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x1c, asgnType_PHASE90E)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'FLANGER 117E',       converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x1d, asgnType_FLANGER117E)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'WAH 95E',            converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x1e, asgnType_WAH95E)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'DC-30',              converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x1f, asgnType_DC30)},
        { addr:0x00000020, size:INTEGER1x7        , name:'HEAVY OCT',          converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x20, asgnType_HEAVYOCT)},
        { addr:0x00000021, size:INTEGER1x7        , name:'PEDAL BEND',         converter: new AsgnTypeConverter('PATCH%ASSIGN_KNOBS', 0x21, asgnType_PDLBEND)},
	],                                                         
	'UserPatch%ExpPedalAsgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x00, asgnType_BST)},
        { addr:0x00000001, size:INTEGER1x7        , name:'DELAY',              converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x01, asgnType_DLY)},
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB',             converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x02, asgnType_REV)},
        { addr:0x00000003, size:INTEGER1x7        , name:'CHORUS',             converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x03, asgnType_CHORUS)},
        { addr:0x00000004, size:INTEGER1x7        , name:'FLANGER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x04, asgnType_FLANGER)},
        { addr:0x00000005, size:INTEGER1x7        , name:'PHASER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x05, asgnType_PHASER)},
        { addr:0x00000006, size:INTEGER1x7        , name:'UNI-V',              converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x06, asgnType_UNIV)},
        { addr:0x00000007, size:INTEGER1x7        , name:'TREMOLO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x07, asgnType_TREMOLO)},
        { addr:0x00000008, size:INTEGER1x7        , name:'VIBRATO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x08, asgnType_VIBRATO)},
        { addr:0x00000009, size:INTEGER1x7        , name:'ROTARY',             converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x09, asgnType_ROTARY)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'RING MOD',           converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x0a, asgnType_RINGMOD)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'SLOW GEAR',          converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x0b, asgnType_SLOWGEAR)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'SLICER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x0c, asgnType_SLICER)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'COMP',               converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x0d, asgnType_COMP)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'LIMITER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x0e, asgnType_LIMIT)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'T.WAH',              converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x0f, asgnType_TWAH)},
        { addr:0x00000010, size:INTEGER1x7        , name:'AUTO WAH',           converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x10, asgnType_AUTOWAH)},
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL WAH',          converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x11, asgnType_PDLWAH)},
        { addr:0x00000012, size:INTEGER1x7        , name:'GEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x12, asgnType_GEQ)},
        { addr:0x00000013, size:INTEGER1x7        , name:'PEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x13, asgnType_PEQ)},
        { addr:0x00000014, size:INTEGER1x7        , name:'GUITAR SIM',         converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x14, asgnType_GUITARSIM)},
        { addr:0x00000015, size:INTEGER1x7        , name:'AC.GUITAR SIM',      converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x15, asgnType_ACGUITSIM)},
        { addr:0x00000016, size:INTEGER1x7        , name:'AC.PROCESSOR',       converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x16, asgnType_ACPROC)},
        { addr:0x00000017, size:INTEGER1x7        , name:'WAVE SYNTH',         converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x17, asgnType_WAVESYNTH)},
        { addr:0x00000018, size:INTEGER1x7        , name:'OCTAVE',             converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x18, asgnType_OCTAVE)},
        { addr:0x00000019, size:INTEGER1x7        , name:'PITCH SHIFTER',      converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x19, asgnType_PITSHIF)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'HARMONIST',          converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x1a, asgnType_HARMONIST)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'HUMANIZER',          converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x1b, asgnType_HUMANIZER)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'PHASE 90E',          converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x1c, asgnType_PHASE90E)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'FLANGER 117E',       converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x1d, asgnType_FLANGER117E)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'WAH 95E',            converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x1e, asgnType_WAH95E)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'DC-30',              converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x1f, asgnType_DC30)},
        { addr:0x00000020, size:INTEGER1x7        , name:'HEAVY OCT',          converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x20, asgnType_HEAVYOCT)},
        { addr:0x00000021, size:INTEGER1x7        , name:'PEDAL BEND',         converter: new AsgnTypeConverter('PATCH%ASSIGN_EXPPDL_DETAIL', 0x21, asgnType_PDLBEND)},
    ],
	'UserPatch%ExpPedalAsgnMinMax':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER MIN',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x00)},
        { addr:0x00000001, size:INTEGER1x7        , name:'BOOSTER MAX',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x00)},
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY MIN',              converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x01)},
        { addr:0x00000004, size:INTEGER2x7        , name:'DELAY MAX',              converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x01)},
        { addr:0x00000006, size:INTEGER2x7        , name:'REVERB MIN',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x05)},
        { addr:0x00000008, size:INTEGER2x7        , name:'REVERB MAX',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x05)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'CHORUS MIN',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x09)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'CHORUS MAX',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x09)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'FLANGER MIN',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x0a)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'FLANGER MAX',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x0a)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'PHASER MIN',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x0b)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'PHASER MAX',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x0b)},
        { addr:0x00000010, size:INTEGER1x7        , name:'UNI-V MIN',              converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x0c)},
        { addr:0x00000011, size:INTEGER1x7        , name:'UNI-V MAX',              converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x0c)},
        { addr:0x00000012, size:INTEGER1x7        , name:'TREMOLO MIN',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x0d)},
        { addr:0x00000013, size:INTEGER1x7        , name:'TREMOLO MAX',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x0d)},
        { addr:0x00000014, size:INTEGER1x7        , name:'VIBRATO MIN',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x0e)},
        { addr:0x00000015, size:INTEGER1x7        , name:'VIBRATO MAX',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x0e)},
        { addr:0x00000016, size:INTEGER1x7        , name:'ROTARY MIN',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x0f)},
        { addr:0x00000017, size:INTEGER1x7        , name:'ROTARY MAX',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x0f)},
        { addr:0x00000018, size:INTEGER1x7        , name:'RING MOD MIN',           converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x10)},
        { addr:0x00000019, size:INTEGER1x7        , name:'RING MOD MAX',           converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x10)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'SLOW GEAR MIN',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x11)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'SLOW GEAR MAX',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x11)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'SLICER MIN',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x12)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'SLICER MAX',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x12)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'COMP MIN',               converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x13)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'COMP MAX',               converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x13)},
        { addr:0x00000020, size:INTEGER1x7        , name:'LIMITER MIN',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x14)},
        { addr:0x00000021, size:INTEGER1x7        , name:'LIMITER MAX',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x14)},
        { addr:0x00000022, size:INTEGER1x7        , name:'T.WAH MIN',              converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x15)},
        { addr:0x00000023, size:INTEGER1x7        , name:'T.WAH MAX',              converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x15)},
        { addr:0x00000024, size:INTEGER1x7        , name:'AUTO WAH MIN',           converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x16)},
        { addr:0x00000025, size:INTEGER1x7        , name:'AUTO WAH MAX',           converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x16)},
        { addr:0x00000026, size:INTEGER1x7        , name:'PEDAL WAH MIN',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x17)},
        { addr:0x00000027, size:INTEGER1x7        , name:'PEDAL WAH MAX',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x17)},
        { addr:0x00000028, size:INTEGER1x7        , name:'GEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x18)},
        { addr:0x00000029, size:INTEGER1x7        , name:'GEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x18)},
        { addr:0x0000002a, size:INTEGER1x7        , name:'PEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x19)},
        { addr:0x0000002b, size:INTEGER1x7        , name:'PEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x19)},
        { addr:0x0000002c, size:INTEGER1x7        , name:'GUITAR SIM MIN',         converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x1a)},
        { addr:0x0000002d, size:INTEGER1x7        , name:'GUITAR SIM MAX',         converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x1a)},
        { addr:0x0000002e, size:INTEGER1x7        , name:'AC.GUITAR SIM MIN',      converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x1b)},
        { addr:0x0000002f, size:INTEGER1x7        , name:'AC.GUITAR SIM MAX',      converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x1b)},
        { addr:0x00000030, size:INTEGER1x7        , name:'AC.PROCESSOR MIN',       converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x1c)},
        { addr:0x00000031, size:INTEGER1x7        , name:'AC.PROCESSOR MAX',       converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x1c)},
        { addr:0x00000032, size:INTEGER1x7        , name:'WAVE SYNTH MIN',         converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x1d)},
        { addr:0x00000033, size:INTEGER1x7        , name:'WAVE SYNTH MAX',         converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x1d)},
        { addr:0x00000034, size:INTEGER1x7        , name:'OCTAVE MIN',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x1e)},
        { addr:0x00000035, size:INTEGER1x7        , name:'OCTAVE MAX',             converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x1e)},
        { addr:0x00000036, size:INTEGER2x7        , name:'PITCH SHIFTER MIN',      converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x1f)},
        { addr:0x00000038, size:INTEGER2x7        , name:'PITCH SHIFTER MAX',      converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x1f)},
        { addr:0x0000003a, size:INTEGER2x7        , name:'HARMONIST MIN',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x23)},
        { addr:0x0000003c, size:INTEGER2x7        , name:'HARMONIST MAX',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x23)},
        { addr:0x0000003e, size:INTEGER1x7        , name:'HUMANIZER MIN',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x27)},
        { addr:0x0000003f, size:INTEGER1x7        , name:'HUMANIZER MAX',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x27)},
        { addr:0x00000040, size:INTEGER1x7        , name:'PHASE 90E MIN',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x28)},
        { addr:0x00000041, size:INTEGER1x7        , name:'PHASE 90E MAX',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x28)},
        { addr:0x00000042, size:INTEGER1x7        , name:'FLANGER 117E MIN',       converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x29)},
        { addr:0x00000043, size:INTEGER1x7        , name:'FLANGER 117E MAX',       converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x29)},
        { addr:0x00000044, size:INTEGER1x7        , name:'WAH 95E MIN',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x2a)},
        { addr:0x00000045, size:INTEGER1x7        , name:'WAH 95E MAX',            converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x2a)},
        { addr:0x00000046, size:INTEGER2x7        , name:'DC-30 MIN',              converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x2b)},
        { addr:0x00000048, size:INTEGER2x7        , name:'DC-30 MAX',              converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x2b)},
        { addr:0x0000004a, size:INTEGER1x7        , name:'HEAVY OCT MIN',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x2f)},
        { addr:0x0000004b, size:INTEGER1x7        , name:'HEAVY OCT MAX',          converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x2f)},
        { addr:0x0000004c, size:INTEGER1x7        , name:'PEDAL BEND MIN',         converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MIN', 0x30)},
        { addr:0x0000004d, size:INTEGER1x7        , name:'PEDAL BEND MAX',         converter: new SameValConverter('PATCH%ASSIGN_EXPPDL_MAX', 0x30)},
    ],
    'UserPatch%GafcExp1Asgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x00, asgnType_BST)},
        { addr:0x00000001, size:INTEGER1x7        , name:'DELAY',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x01, asgnType_DLY)},
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x02, asgnType_REV)},
        { addr:0x00000003, size:INTEGER1x7        , name:'CHORUS',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x03, asgnType_CHORUS)},
        { addr:0x00000004, size:INTEGER1x7        , name:'FLANGER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x04, asgnType_FLANGER)},
        { addr:0x00000005, size:INTEGER1x7        , name:'PHASER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x05, asgnType_PHASER)},
        { addr:0x00000006, size:INTEGER1x7        , name:'UNI-V',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x06, asgnType_UNIV)},
        { addr:0x00000007, size:INTEGER1x7        , name:'TREMOLO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x07, asgnType_TREMOLO)},
        { addr:0x00000008, size:INTEGER1x7        , name:'VIBRATO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x08, asgnType_VIBRATO)},
        { addr:0x00000009, size:INTEGER1x7        , name:'ROTARY',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x09, asgnType_ROTARY)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'RING MOD',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x0a, asgnType_RINGMOD)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'SLOW GEAR',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x0b, asgnType_SLOWGEAR)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'SLICER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x0c, asgnType_SLICER)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'COMP',               converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x0d, asgnType_COMP)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'LIMITER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x0e, asgnType_LIMIT)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'T.WAH',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x0f, asgnType_TWAH)},
        { addr:0x00000010, size:INTEGER1x7        , name:'AUTO WAH',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x10, asgnType_AUTOWAH)},
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL WAH',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x11, asgnType_PDLWAH)},
        { addr:0x00000012, size:INTEGER1x7        , name:'GEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x12, asgnType_GEQ)},
        { addr:0x00000013, size:INTEGER1x7        , name:'PEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x13, asgnType_PEQ)},
        { addr:0x00000014, size:INTEGER1x7        , name:'GUITAR SIM',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x14, asgnType_GUITARSIM)},
        { addr:0x00000015, size:INTEGER1x7        , name:'AC.GUITAR SIM',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x15, asgnType_ACGUITSIM)},
        { addr:0x00000016, size:INTEGER1x7        , name:'AC.PROCESSOR',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x16, asgnType_ACPROC)},
        { addr:0x00000017, size:INTEGER1x7        , name:'WAVE SYNTH',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x17, asgnType_WAVESYNTH)},
        { addr:0x00000018, size:INTEGER1x7        , name:'OCTAVE',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x18, asgnType_OCTAVE)},
        { addr:0x00000019, size:INTEGER1x7        , name:'PITCH SHIFTER',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x19, asgnType_PITSHIF)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'HARMONIST',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x1a, asgnType_HARMONIST)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'HUMANIZER',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x1b, asgnType_HUMANIZER)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'PHASE 90E',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x1c, asgnType_PHASE90E)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'FLANGER 117E',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x1d, asgnType_FLANGER117E)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'WAH 95E',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x1e, asgnType_WAH95E)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'DC-30',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x1f, asgnType_DC30)},
        { addr:0x00000020, size:INTEGER1x7        , name:'HEAVY OCT',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x20, asgnType_HEAVYOCT)},
        { addr:0x00000021, size:INTEGER1x7        , name:'PEDAL BEND',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)', 0x21, asgnType_PDLBEND)},
    ],
	'UserPatch%GafcExp1AsgnMinMax':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x00)},
        { addr:0x00000001, size:INTEGER1x7        , name:'BOOSTER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x00)},
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x01)},
        { addr:0x00000004, size:INTEGER2x7        , name:'DELAY MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x01)},
        { addr:0x00000006, size:INTEGER2x7        , name:'REVERB MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x05)},
        { addr:0x00000008, size:INTEGER2x7        , name:'REVERB MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x05)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'CHORUS MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x09)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'CHORUS MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x09)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'FLANGER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x0a)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'FLANGER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x0a)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'PHASER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x0b)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'PHASER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x0b)},
        { addr:0x00000010, size:INTEGER1x7        , name:'UNI-V MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x0c)},
        { addr:0x00000011, size:INTEGER1x7        , name:'UNI-V MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x0c)},
        { addr:0x00000012, size:INTEGER1x7        , name:'TREMOLO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x0d)},
        { addr:0x00000013, size:INTEGER1x7        , name:'TREMOLO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x0d)},
        { addr:0x00000014, size:INTEGER1x7        , name:'VIBRATO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x0e)},
        { addr:0x00000015, size:INTEGER1x7        , name:'VIBRATO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x0e)},
        { addr:0x00000016, size:INTEGER1x7        , name:'ROTARY MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x0f)},
        { addr:0x00000017, size:INTEGER1x7        , name:'ROTARY MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x0f)},
        { addr:0x00000018, size:INTEGER1x7        , name:'RING MOD MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x10)},
        { addr:0x00000019, size:INTEGER1x7        , name:'RING MOD MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x10)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'SLOW GEAR MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x11)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'SLOW GEAR MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x11)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'SLICER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x12)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'SLICER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x12)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'COMP MIN',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x13)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'COMP MAX',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x13)},
        { addr:0x00000020, size:INTEGER1x7        , name:'LIMITER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x14)},
        { addr:0x00000021, size:INTEGER1x7        , name:'LIMITER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x14)},
        { addr:0x00000022, size:INTEGER1x7        , name:'T.WAH MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x15)},
        { addr:0x00000023, size:INTEGER1x7        , name:'T.WAH MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x15)},
        { addr:0x00000024, size:INTEGER1x7        , name:'AUTO WAH MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x16)},
        { addr:0x00000025, size:INTEGER1x7        , name:'AUTO WAH MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x16)},
        { addr:0x00000026, size:INTEGER1x7        , name:'PEDAL WAH MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x17)},
        { addr:0x00000027, size:INTEGER1x7        , name:'PEDAL WAH MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x17)},
        { addr:0x00000028, size:INTEGER1x7        , name:'GEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x18)},
        { addr:0x00000029, size:INTEGER1x7        , name:'GEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x18)},
        { addr:0x0000002a, size:INTEGER1x7        , name:'PEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x19)},
        { addr:0x0000002b, size:INTEGER1x7        , name:'PEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x19)},
        { addr:0x0000002c, size:INTEGER1x7        , name:'GUITAR SIM MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x1a)},
        { addr:0x0000002d, size:INTEGER1x7        , name:'GUITAR SIM MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x1a)},
        { addr:0x0000002e, size:INTEGER1x7        , name:'AC.GUITAR SIM MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x1b)},
        { addr:0x0000002f, size:INTEGER1x7        , name:'AC.GUITAR SIM MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x1b)},
        { addr:0x00000030, size:INTEGER1x7        , name:'AC.PROCESSOR MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x1c)},
        { addr:0x00000031, size:INTEGER1x7        , name:'AC.PROCESSOR MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x1c)},
        { addr:0x00000032, size:INTEGER1x7        , name:'WAVE SYNTH MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x1d)},
        { addr:0x00000033, size:INTEGER1x7        , name:'WAVE SYNTH MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x1d)},
        { addr:0x00000034, size:INTEGER1x7        , name:'OCTAVE MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x1e)},
        { addr:0x00000035, size:INTEGER1x7        , name:'OCTAVE MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x1e)},
        { addr:0x00000036, size:INTEGER2x7        , name:'PITCH SHIFTER MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x1f)},
        { addr:0x00000038, size:INTEGER2x7        , name:'PITCH SHIFTER MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x1f)},
        { addr:0x0000003a, size:INTEGER2x7        , name:'HARMONIST MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x23)},
        { addr:0x0000003c, size:INTEGER2x7        , name:'HARMONIST MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x23)},
        { addr:0x0000003e, size:INTEGER1x7        , name:'HUMANIZER MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x27)},
        { addr:0x0000003f, size:INTEGER1x7        , name:'HUMANIZER MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x27)},
        { addr:0x00000040, size:INTEGER1x7        , name:'PHASE 90E MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x28)},
        { addr:0x00000041, size:INTEGER1x7        , name:'PHASE 90E MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x28)},
        { addr:0x00000042, size:INTEGER1x7        , name:'FLANGER 117E MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x29)},
        { addr:0x00000043, size:INTEGER1x7        , name:'FLANGER 117E MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x29)},
        { addr:0x00000044, size:INTEGER1x7        , name:'WAH 95E MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x2a)},
        { addr:0x00000045, size:INTEGER1x7        , name:'WAH 95E MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x2a)},
        { addr:0x00000046, size:INTEGER2x7        , name:'DC-30 MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x2b)},
        { addr:0x00000048, size:INTEGER2x7        , name:'DC-30 MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x2b)},
        { addr:0x0000004a, size:INTEGER1x7        , name:'HEAVY OCT MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x2f)},
        { addr:0x0000004b, size:INTEGER1x7        , name:'HEAVY OCT MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x2f)},
        { addr:0x0000004c, size:INTEGER1x7        , name:'PEDAL BEND MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)', 0x30)},
        { addr:0x0000004d, size:INTEGER1x7        , name:'PEDAL BEND MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)', 0x30)},
    ],
    'UserPatch%GafcExp2Asgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x00, asgnType_BST)},
        { addr:0x00000001, size:INTEGER1x7        , name:'DELAY',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x01, asgnType_DLY)},
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x02, asgnType_REV)},
        { addr:0x00000003, size:INTEGER1x7        , name:'CHORUS',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x03, asgnType_CHORUS)},
        { addr:0x00000004, size:INTEGER1x7        , name:'FLANGER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x04, asgnType_FLANGER)},
        { addr:0x00000005, size:INTEGER1x7        , name:'PHASER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x05, asgnType_PHASER)},
        { addr:0x00000006, size:INTEGER1x7        , name:'UNI-V',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x06, asgnType_UNIV)},
        { addr:0x00000007, size:INTEGER1x7        , name:'TREMOLO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x07, asgnType_TREMOLO)},
        { addr:0x00000008, size:INTEGER1x7        , name:'VIBRATO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x08, asgnType_VIBRATO)},
        { addr:0x00000009, size:INTEGER1x7        , name:'ROTARY',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x09, asgnType_ROTARY)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'RING MOD',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x0a, asgnType_RINGMOD)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'SLOW GEAR',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x0b, asgnType_SLOWGEAR)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'SLICER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x0c, asgnType_SLICER)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'COMP',               converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x0d, asgnType_COMP)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'LIMITER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x0e, asgnType_LIMIT)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'T.WAH',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x0f, asgnType_TWAH)},
        { addr:0x00000010, size:INTEGER1x7        , name:'AUTO WAH',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x10, asgnType_AUTOWAH)},
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL WAH',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x11, asgnType_PDLWAH)},
        { addr:0x00000012, size:INTEGER1x7        , name:'GEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x12, asgnType_GEQ)},
        { addr:0x00000013, size:INTEGER1x7        , name:'PEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x13, asgnType_PEQ)},
        { addr:0x00000014, size:INTEGER1x7        , name:'GUITAR SIM',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x14, asgnType_GUITARSIM)},
        { addr:0x00000015, size:INTEGER1x7        , name:'AC.GUITAR SIM',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x15, asgnType_ACGUITSIM)},
        { addr:0x00000016, size:INTEGER1x7        , name:'AC.PROCESSOR',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x16, asgnType_ACPROC)},
        { addr:0x00000017, size:INTEGER1x7        , name:'WAVE SYNTH',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x17, asgnType_WAVESYNTH)},
        { addr:0x00000018, size:INTEGER1x7        , name:'OCTAVE',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x18, asgnType_OCTAVE)},
        { addr:0x00000019, size:INTEGER1x7        , name:'PITCH SHIFTER',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x19, asgnType_PITSHIF)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'HARMONIST',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x1a, asgnType_HARMONIST)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'HUMANIZER',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x1b, asgnType_HUMANIZER)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'PHASE 90E',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x1c, asgnType_PHASE90E)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'FLANGER 117E',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x1d, asgnType_FLANGER117E)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'WAH 95E',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x1e, asgnType_WAH95E)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'DC-30',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x1f, asgnType_DC30)},
        { addr:0x00000020, size:INTEGER1x7        , name:'HEAVY OCT',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x20, asgnType_HEAVYOCT)},
        { addr:0x00000021, size:INTEGER1x7        , name:'PEDAL BEND',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)', 0x21, asgnType_PDLBEND)},
    ],
	'UserPatch%GafcExp2AsgnMinMax':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x00)},
        { addr:0x00000001, size:INTEGER1x7        , name:'BOOSTER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x00)},
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x01)},
        { addr:0x00000004, size:INTEGER2x7        , name:'DELAY MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x01)},
        { addr:0x00000006, size:INTEGER2x7        , name:'REVERB MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x05)},
        { addr:0x00000008, size:INTEGER2x7        , name:'REVERB MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x05)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'CHORUS MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x09)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'CHORUS MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x09)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'FLANGER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x0a)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'FLANGER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x0a)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'PHASER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x0b)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'PHASER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x0b)},
        { addr:0x00000010, size:INTEGER1x7        , name:'UNI-V MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x0c)},
        { addr:0x00000011, size:INTEGER1x7        , name:'UNI-V MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x0c)},
        { addr:0x00000012, size:INTEGER1x7        , name:'TREMOLO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x0d)},
        { addr:0x00000013, size:INTEGER1x7        , name:'TREMOLO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x0d)},
        { addr:0x00000014, size:INTEGER1x7        , name:'VIBRATO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x0e)},
        { addr:0x00000015, size:INTEGER1x7        , name:'VIBRATO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x0e)},
        { addr:0x00000016, size:INTEGER1x7        , name:'ROTARY MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x0f)},
        { addr:0x00000017, size:INTEGER1x7        , name:'ROTARY MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x0f)},
        { addr:0x00000018, size:INTEGER1x7        , name:'RING MOD MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x10)},
        { addr:0x00000019, size:INTEGER1x7        , name:'RING MOD MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x10)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'SLOW GEAR MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x11)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'SLOW GEAR MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x11)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'SLICER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x12)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'SLICER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x12)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'COMP MIN',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x13)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'COMP MAX',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x13)},
        { addr:0x00000020, size:INTEGER1x7        , name:'LIMITER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x14)},
        { addr:0x00000021, size:INTEGER1x7        , name:'LIMITER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x14)},
        { addr:0x00000022, size:INTEGER1x7        , name:'T.WAH MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x15)},
        { addr:0x00000023, size:INTEGER1x7        , name:'T.WAH MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x15)},
        { addr:0x00000024, size:INTEGER1x7        , name:'AUTO WAH MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x16)},
        { addr:0x00000025, size:INTEGER1x7        , name:'AUTO WAH MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x16)},
        { addr:0x00000026, size:INTEGER1x7        , name:'PEDAL WAH MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x17)},
        { addr:0x00000027, size:INTEGER1x7        , name:'PEDAL WAH MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x17)},
        { addr:0x00000028, size:INTEGER1x7        , name:'GEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x18)},
        { addr:0x00000029, size:INTEGER1x7        , name:'GEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x18)},
        { addr:0x0000002a, size:INTEGER1x7        , name:'PEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x19)},
        { addr:0x0000002b, size:INTEGER1x7        , name:'PEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x19)},
        { addr:0x0000002c, size:INTEGER1x7        , name:'GUITAR SIM MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x1a)},
        { addr:0x0000002d, size:INTEGER1x7        , name:'GUITAR SIM MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x1a)},
        { addr:0x0000002e, size:INTEGER1x7        , name:'AC.GUITAR SIM MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x1b)},
        { addr:0x0000002f, size:INTEGER1x7        , name:'AC.GUITAR SIM MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x1b)},
        { addr:0x00000030, size:INTEGER1x7        , name:'AC.PROCESSOR MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x1c)},
        { addr:0x00000031, size:INTEGER1x7        , name:'AC.PROCESSOR MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x1c)},
        { addr:0x00000032, size:INTEGER1x7        , name:'WAVE SYNTH MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x1d)},
        { addr:0x00000033, size:INTEGER1x7        , name:'WAVE SYNTH MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x1d)},
        { addr:0x00000034, size:INTEGER1x7        , name:'OCTAVE MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x1e)},
        { addr:0x00000035, size:INTEGER1x7        , name:'OCTAVE MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x1e)},
        { addr:0x00000036, size:INTEGER2x7        , name:'PITCH SHIFTER MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x1f)},
        { addr:0x00000038, size:INTEGER2x7        , name:'PITCH SHIFTER MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x1f)},
        { addr:0x0000003a, size:INTEGER2x7        , name:'HARMONIST MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x23)},
        { addr:0x0000003c, size:INTEGER2x7        , name:'HARMONIST MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x23)},
        { addr:0x0000003e, size:INTEGER1x7        , name:'HUMANIZER MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x27)},
        { addr:0x0000003f, size:INTEGER1x7        , name:'HUMANIZER MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x27)},
        { addr:0x00000040, size:INTEGER1x7        , name:'PHASE 90E MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x28)},
        { addr:0x00000041, size:INTEGER1x7        , name:'PHASE 90E MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x28)},
        { addr:0x00000042, size:INTEGER1x7        , name:'FLANGER 117E MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x29)},
        { addr:0x00000043, size:INTEGER1x7        , name:'FLANGER 117E MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x29)},
        { addr:0x00000044, size:INTEGER1x7        , name:'WAH 95E MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x2a)},
        { addr:0x00000045, size:INTEGER1x7        , name:'WAH 95E MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x2a)},
        { addr:0x00000046, size:INTEGER2x7        , name:'DC-30 MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x2b)},
        { addr:0x00000048, size:INTEGER2x7        , name:'DC-30 MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x2b)},
        { addr:0x0000004a, size:INTEGER1x7        , name:'HEAVY OCT MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x2f)},
        { addr:0x0000004b, size:INTEGER1x7        , name:'HEAVY OCT MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x2f)},
        { addr:0x0000004c, size:INTEGER1x7        , name:'PEDAL BEND MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)', 0x30)},
        { addr:0x0000004d, size:INTEGER1x7        , name:'PEDAL BEND MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)', 0x30)},
    ],
    'UserPatch%GafcExp3Asgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x00, asgnType_BST)},
        { addr:0x00000001, size:INTEGER1x7        , name:'DELAY',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x01, asgnType_DLY)},
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x02, asgnType_REV)},
        { addr:0x00000003, size:INTEGER1x7        , name:'CHORUS',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x03, asgnType_CHORUS)},
        { addr:0x00000004, size:INTEGER1x7        , name:'FLANGER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x04, asgnType_FLANGER)},
        { addr:0x00000005, size:INTEGER1x7        , name:'PHASER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x05, asgnType_PHASER)},
        { addr:0x00000006, size:INTEGER1x7        , name:'UNI-V',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x06, asgnType_UNIV)},
        { addr:0x00000007, size:INTEGER1x7        , name:'TREMOLO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x07, asgnType_TREMOLO)},
        { addr:0x00000008, size:INTEGER1x7        , name:'VIBRATO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x08, asgnType_VIBRATO)},
        { addr:0x00000009, size:INTEGER1x7        , name:'ROTARY',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x09, asgnType_ROTARY)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'RING MOD',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x0a, asgnType_RINGMOD)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'SLOW GEAR',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x0b, asgnType_SLOWGEAR)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'SLICER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x0c, asgnType_SLICER)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'COMP',               converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x0d, asgnType_COMP)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'LIMITER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x0e, asgnType_LIMIT)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'T.WAH',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x0f, asgnType_TWAH)},
        { addr:0x00000010, size:INTEGER1x7        , name:'AUTO WAH',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x10, asgnType_AUTOWAH)},
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL WAH',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x11, asgnType_PDLWAH)},
        { addr:0x00000012, size:INTEGER1x7        , name:'GEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x12, asgnType_GEQ)},
        { addr:0x00000013, size:INTEGER1x7        , name:'PEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x13, asgnType_PEQ)},
        { addr:0x00000014, size:INTEGER1x7        , name:'GUITAR SIM',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x14, asgnType_GUITARSIM)},
        { addr:0x00000015, size:INTEGER1x7        , name:'AC.GUITAR SIM',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x15, asgnType_ACGUITSIM)},
        { addr:0x00000016, size:INTEGER1x7        , name:'AC.PROCESSOR',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x16, asgnType_ACPROC)},
        { addr:0x00000017, size:INTEGER1x7        , name:'WAVE SYNTH',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x17, asgnType_WAVESYNTH)},
        { addr:0x00000018, size:INTEGER1x7        , name:'OCTAVE',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x18, asgnType_OCTAVE)},
        { addr:0x00000019, size:INTEGER1x7        , name:'PITCH SHIFTER',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x19, asgnType_PITSHIF)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'HARMONIST',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x1a, asgnType_HARMONIST)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'HUMANIZER',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x1b, asgnType_HUMANIZER)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'PHASE 90E',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x1c, asgnType_PHASE90E)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'FLANGER 117E',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x1d, asgnType_FLANGER117E)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'WAH 95E',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x1e, asgnType_WAH95E)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'DC-30',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x1f, asgnType_DC30)},
        { addr:0x00000020, size:INTEGER1x7        , name:'HEAVY OCT',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x20, asgnType_HEAVYOCT)},
        { addr:0x00000021, size:INTEGER1x7        , name:'PEDAL BEND',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)', 0x21, asgnType_PDLBEND)},
    ],
	'UserPatch%GafcExp3AsgnMinMax':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x00)},
        { addr:0x00000001, size:INTEGER1x7        , name:'BOOSTER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x00)},
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x01)},
        { addr:0x00000004, size:INTEGER2x7        , name:'DELAY MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x01)},
        { addr:0x00000006, size:INTEGER2x7        , name:'REVERB MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x05)},
        { addr:0x00000008, size:INTEGER2x7        , name:'REVERB MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x05)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'CHORUS MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x09)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'CHORUS MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x09)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'FLANGER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x0a)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'FLANGER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x0a)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'PHASER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x0b)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'PHASER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x0b)},
        { addr:0x00000010, size:INTEGER1x7        , name:'UNI-V MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x0c)},
        { addr:0x00000011, size:INTEGER1x7        , name:'UNI-V MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x0c)},
        { addr:0x00000012, size:INTEGER1x7        , name:'TREMOLO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x0d)},
        { addr:0x00000013, size:INTEGER1x7        , name:'TREMOLO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x0d)},
        { addr:0x00000014, size:INTEGER1x7        , name:'VIBRATO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x0e)},
        { addr:0x00000015, size:INTEGER1x7        , name:'VIBRATO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x0e)},
        { addr:0x00000016, size:INTEGER1x7        , name:'ROTARY MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x0f)},
        { addr:0x00000017, size:INTEGER1x7        , name:'ROTARY MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x0f)},
        { addr:0x00000018, size:INTEGER1x7        , name:'RING MOD MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x10)},
        { addr:0x00000019, size:INTEGER1x7        , name:'RING MOD MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x10)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'SLOW GEAR MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x11)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'SLOW GEAR MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x11)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'SLICER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x12)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'SLICER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x12)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'COMP MIN',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x13)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'COMP MAX',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x13)},
        { addr:0x00000020, size:INTEGER1x7        , name:'LIMITER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x14)},
        { addr:0x00000021, size:INTEGER1x7        , name:'LIMITER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x14)},
        { addr:0x00000022, size:INTEGER1x7        , name:'T.WAH MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x15)},
        { addr:0x00000023, size:INTEGER1x7        , name:'T.WAH MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x15)},
        { addr:0x00000024, size:INTEGER1x7        , name:'AUTO WAH MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x16)},
        { addr:0x00000025, size:INTEGER1x7        , name:'AUTO WAH MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x16)},
        { addr:0x00000026, size:INTEGER1x7        , name:'PEDAL WAH MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x17)},
        { addr:0x00000027, size:INTEGER1x7        , name:'PEDAL WAH MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x17)},
        { addr:0x00000028, size:INTEGER1x7        , name:'GEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x18)},
        { addr:0x00000029, size:INTEGER1x7        , name:'GEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x18)},
        { addr:0x0000002a, size:INTEGER1x7        , name:'PEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x19)},
        { addr:0x0000002b, size:INTEGER1x7        , name:'PEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x19)},
        { addr:0x0000002c, size:INTEGER1x7        , name:'GUITAR SIM MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x1a)},
        { addr:0x0000002d, size:INTEGER1x7        , name:'GUITAR SIM MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x1a)},
        { addr:0x0000002e, size:INTEGER1x7        , name:'AC.GUITAR SIM MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x1b)},
        { addr:0x0000002f, size:INTEGER1x7        , name:'AC.GUITAR SIM MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x1b)},
        { addr:0x00000030, size:INTEGER1x7        , name:'AC.PROCESSOR MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x1c)},
        { addr:0x00000031, size:INTEGER1x7        , name:'AC.PROCESSOR MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x1c)},
        { addr:0x00000032, size:INTEGER1x7        , name:'WAVE SYNTH MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x1d)},
        { addr:0x00000033, size:INTEGER1x7        , name:'WAVE SYNTH MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x1d)},
        { addr:0x00000034, size:INTEGER1x7        , name:'OCTAVE MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x1e)},
        { addr:0x00000035, size:INTEGER1x7        , name:'OCTAVE MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x1e)},
        { addr:0x00000036, size:INTEGER2x7        , name:'PITCH SHIFTER MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x1f)},
        { addr:0x00000038, size:INTEGER2x7        , name:'PITCH SHIFTER MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x1f)},
        { addr:0x0000003a, size:INTEGER2x7        , name:'HARMONIST MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x23)},
        { addr:0x0000003c, size:INTEGER2x7        , name:'HARMONIST MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x23)},
        { addr:0x0000003e, size:INTEGER1x7        , name:'HUMANIZER MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x27)},
        { addr:0x0000003f, size:INTEGER1x7        , name:'HUMANIZER MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x27)},
        { addr:0x00000040, size:INTEGER1x7        , name:'PHASE 90E MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x28)},
        { addr:0x00000041, size:INTEGER1x7        , name:'PHASE 90E MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x28)},
        { addr:0x00000042, size:INTEGER1x7        , name:'FLANGER 117E MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x29)},
        { addr:0x00000043, size:INTEGER1x7        , name:'FLANGER 117E MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x29)},
        { addr:0x00000044, size:INTEGER1x7        , name:'WAH 95E MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x2a)},
        { addr:0x00000045, size:INTEGER1x7        , name:'WAH 95E MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x2a)},
        { addr:0x00000046, size:INTEGER2x7        , name:'DC-30 MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x2b)},
        { addr:0x00000048, size:INTEGER2x7        , name:'DC-30 MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x2b)},
        { addr:0x0000004a, size:INTEGER1x7        , name:'HEAVY OCT MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x2f)},
        { addr:0x0000004b, size:INTEGER1x7        , name:'HEAVY OCT MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x2f)},
        { addr:0x0000004c, size:INTEGER1x7        , name:'PEDAL BEND MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)', 0x30)},
        { addr:0x0000004d, size:INTEGER1x7        , name:'PEDAL BEND MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)', 0x30)},
    ],
    'UserPatch%GafcExExp1Asgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x00, asgnType_BST)},
        { addr:0x00000001, size:INTEGER1x7        , name:'DELAY',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x01, asgnType_DLY)},
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x02, asgnType_REV)},
        { addr:0x00000003, size:INTEGER1x7        , name:'CHORUS',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x03, asgnType_CHORUS)},
        { addr:0x00000004, size:INTEGER1x7        , name:'FLANGER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x04, asgnType_FLANGER)},
        { addr:0x00000005, size:INTEGER1x7        , name:'PHASER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x05, asgnType_PHASER)},
        { addr:0x00000006, size:INTEGER1x7        , name:'UNI-V',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x06, asgnType_UNIV)},
        { addr:0x00000007, size:INTEGER1x7        , name:'TREMOLO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x07, asgnType_TREMOLO)},
        { addr:0x00000008, size:INTEGER1x7        , name:'VIBRATO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x08, asgnType_VIBRATO)},
        { addr:0x00000009, size:INTEGER1x7        , name:'ROTARY',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x09, asgnType_ROTARY)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'RING MOD',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x0a, asgnType_RINGMOD)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'SLOW GEAR',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x0b, asgnType_SLOWGEAR)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'SLICER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x0c, asgnType_SLICER)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'COMP',               converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x0d, asgnType_COMP)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'LIMITER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x0e, asgnType_LIMIT)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'T.WAH',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x0f, asgnType_TWAH)},
        { addr:0x00000010, size:INTEGER1x7        , name:'AUTO WAH',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x10, asgnType_AUTOWAH)},
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL WAH',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x11, asgnType_PDLWAH)},
        { addr:0x00000012, size:INTEGER1x7        , name:'GEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x12, asgnType_GEQ)},
        { addr:0x00000013, size:INTEGER1x7        , name:'PEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x13, asgnType_PEQ)},
        { addr:0x00000014, size:INTEGER1x7        , name:'GUITAR SIM',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x14, asgnType_GUITARSIM)},
        { addr:0x00000015, size:INTEGER1x7        , name:'AC.GUITAR SIM',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x15, asgnType_ACGUITSIM)},
        { addr:0x00000016, size:INTEGER1x7        , name:'AC.PROCESSOR',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x16, asgnType_ACPROC)},
        { addr:0x00000017, size:INTEGER1x7        , name:'WAVE SYNTH',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x17, asgnType_WAVESYNTH)},
        { addr:0x00000018, size:INTEGER1x7        , name:'OCTAVE',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x18, asgnType_OCTAVE)},
        { addr:0x00000019, size:INTEGER1x7        , name:'PITCH SHIFTER',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x19, asgnType_PITSHIF)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'HARMONIST',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x1a, asgnType_HARMONIST)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'HUMANIZER',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x1b, asgnType_HUMANIZER)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'PHASE 90E',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x1c, asgnType_PHASE90E)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'FLANGER 117E',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x1d, asgnType_FLANGER117E)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'WAH 95E',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x1e, asgnType_WAH95E)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'DC-30',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x1f, asgnType_DC30)},
        { addr:0x00000020, size:INTEGER1x7        , name:'HEAVY OCT',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x20, asgnType_HEAVYOCT)},
        { addr:0x00000021, size:INTEGER1x7        , name:'PEDAL BEND',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)', 0x21, asgnType_PDLBEND)},
    ],
	'UserPatch%GafcExExp1AsgnMinMax':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x00)},
        { addr:0x00000001, size:INTEGER1x7        , name:'BOOSTER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x00)},
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x01)},
        { addr:0x00000004, size:INTEGER2x7        , name:'DELAY MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x01)},
        { addr:0x00000006, size:INTEGER2x7        , name:'REVERB MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x05)},
        { addr:0x00000008, size:INTEGER2x7        , name:'REVERB MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x05)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'CHORUS MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x09)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'CHORUS MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x09)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'FLANGER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x0a)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'FLANGER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x0a)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'PHASER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x0b)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'PHASER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x0b)},
        { addr:0x00000010, size:INTEGER1x7        , name:'UNI-V MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x0c)},
        { addr:0x00000011, size:INTEGER1x7        , name:'UNI-V MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x0c)},
        { addr:0x00000012, size:INTEGER1x7        , name:'TREMOLO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x0d)},
        { addr:0x00000013, size:INTEGER1x7        , name:'TREMOLO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x0d)},
        { addr:0x00000014, size:INTEGER1x7        , name:'VIBRATO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x0e)},
        { addr:0x00000015, size:INTEGER1x7        , name:'VIBRATO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x0e)},
        { addr:0x00000016, size:INTEGER1x7        , name:'ROTARY MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x0f)},
        { addr:0x00000017, size:INTEGER1x7        , name:'ROTARY MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x0f)},
        { addr:0x00000018, size:INTEGER1x7        , name:'RING MOD MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x10)},
        { addr:0x00000019, size:INTEGER1x7        , name:'RING MOD MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x10)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'SLOW GEAR MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x11)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'SLOW GEAR MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x11)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'SLICER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x12)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'SLICER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x12)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'COMP MIN',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x13)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'COMP MAX',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x13)},
        { addr:0x00000020, size:INTEGER1x7        , name:'LIMITER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x14)},
        { addr:0x00000021, size:INTEGER1x7        , name:'LIMITER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x14)},
        { addr:0x00000022, size:INTEGER1x7        , name:'T.WAH MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x15)},
        { addr:0x00000023, size:INTEGER1x7        , name:'T.WAH MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x15)},
        { addr:0x00000024, size:INTEGER1x7        , name:'AUTO WAH MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x16)},
        { addr:0x00000025, size:INTEGER1x7        , name:'AUTO WAH MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x16)},
        { addr:0x00000026, size:INTEGER1x7        , name:'PEDAL WAH MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x17)},
        { addr:0x00000027, size:INTEGER1x7        , name:'PEDAL WAH MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x17)},
        { addr:0x00000028, size:INTEGER1x7        , name:'GEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x18)},
        { addr:0x00000029, size:INTEGER1x7        , name:'GEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x18)},
        { addr:0x0000002a, size:INTEGER1x7        , name:'PEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x19)},
        { addr:0x0000002b, size:INTEGER1x7        , name:'PEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x19)},
        { addr:0x0000002c, size:INTEGER1x7        , name:'GUITAR SIM MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x1a)},
        { addr:0x0000002d, size:INTEGER1x7        , name:'GUITAR SIM MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x1a)},
        { addr:0x0000002e, size:INTEGER1x7        , name:'AC.GUITAR SIM MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x1b)},
        { addr:0x0000002f, size:INTEGER1x7        , name:'AC.GUITAR SIM MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x1b)},
        { addr:0x00000030, size:INTEGER1x7        , name:'AC.PROCESSOR MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x1c)},
        { addr:0x00000031, size:INTEGER1x7        , name:'AC.PROCESSOR MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x1c)},
        { addr:0x00000032, size:INTEGER1x7        , name:'WAVE SYNTH MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x1d)},
        { addr:0x00000033, size:INTEGER1x7        , name:'WAVE SYNTH MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x1d)},
        { addr:0x00000034, size:INTEGER1x7        , name:'OCTAVE MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x1e)},
        { addr:0x00000035, size:INTEGER1x7        , name:'OCTAVE MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x1e)},
        { addr:0x00000036, size:INTEGER2x7        , name:'PITCH SHIFTER MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x1f)},
        { addr:0x00000038, size:INTEGER2x7        , name:'PITCH SHIFTER MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x1f)},
        { addr:0x0000003a, size:INTEGER2x7        , name:'HARMONIST MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x23)},
        { addr:0x0000003c, size:INTEGER2x7        , name:'HARMONIST MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x23)},
        { addr:0x0000003e, size:INTEGER1x7        , name:'HUMANIZER MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x27)},
        { addr:0x0000003f, size:INTEGER1x7        , name:'HUMANIZER MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x27)},
        { addr:0x00000040, size:INTEGER1x7        , name:'PHASE 90E MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x28)},
        { addr:0x00000041, size:INTEGER1x7        , name:'PHASE 90E MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x28)},
        { addr:0x00000042, size:INTEGER1x7        , name:'FLANGER 117E MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x29)},
        { addr:0x00000043, size:INTEGER1x7        , name:'FLANGER 117E MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x29)},
        { addr:0x00000044, size:INTEGER1x7        , name:'WAH 95E MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x2a)},
        { addr:0x00000045, size:INTEGER1x7        , name:'WAH 95E MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x2a)},
        { addr:0x00000046, size:INTEGER2x7        , name:'DC-30 MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x2b)},
        { addr:0x00000048, size:INTEGER2x7        , name:'DC-30 MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x2b)},
        { addr:0x0000004a, size:INTEGER1x7        , name:'HEAVY OCT MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x2f)},
        { addr:0x0000004b, size:INTEGER1x7        , name:'HEAVY OCT MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x2f)},
        { addr:0x0000004c, size:INTEGER1x7        , name:'PEDAL BEND MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)', 0x30)},
        { addr:0x0000004d, size:INTEGER1x7        , name:'PEDAL BEND MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)', 0x30)},
    ],
    'UserPatch%GafcExExp2Asgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x00, asgnType_BST)},
        { addr:0x00000001, size:INTEGER1x7        , name:'DELAY',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x01, asgnType_DLY)},
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x02, asgnType_REV)},
        { addr:0x00000003, size:INTEGER1x7        , name:'CHORUS',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x03, asgnType_CHORUS)},
        { addr:0x00000004, size:INTEGER1x7        , name:'FLANGER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x04, asgnType_FLANGER)},
        { addr:0x00000005, size:INTEGER1x7        , name:'PHASER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x05, asgnType_PHASER)},
        { addr:0x00000006, size:INTEGER1x7        , name:'UNI-V',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x06, asgnType_UNIV)},
        { addr:0x00000007, size:INTEGER1x7        , name:'TREMOLO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x07, asgnType_TREMOLO)},
        { addr:0x00000008, size:INTEGER1x7        , name:'VIBRATO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x08, asgnType_VIBRATO)},
        { addr:0x00000009, size:INTEGER1x7        , name:'ROTARY',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x09, asgnType_ROTARY)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'RING MOD',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x0a, asgnType_RINGMOD)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'SLOW GEAR',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x0b, asgnType_SLOWGEAR)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'SLICER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x0c, asgnType_SLICER)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'COMP',               converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x0d, asgnType_COMP)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'LIMITER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x0e, asgnType_LIMIT)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'T.WAH',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x0f, asgnType_TWAH)},
        { addr:0x00000010, size:INTEGER1x7        , name:'AUTO WAH',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x10, asgnType_AUTOWAH)},
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL WAH',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x11, asgnType_PDLWAH)},
        { addr:0x00000012, size:INTEGER1x7        , name:'GEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x12, asgnType_GEQ)},
        { addr:0x00000013, size:INTEGER1x7        , name:'PEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x13, asgnType_PEQ)},
        { addr:0x00000014, size:INTEGER1x7        , name:'GUITAR SIM',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x14, asgnType_GUITARSIM)},
        { addr:0x00000015, size:INTEGER1x7        , name:'AC.GUITAR SIM',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x15, asgnType_ACGUITSIM)},
        { addr:0x00000016, size:INTEGER1x7        , name:'AC.PROCESSOR',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x16, asgnType_ACPROC)},
        { addr:0x00000017, size:INTEGER1x7        , name:'WAVE SYNTH',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x17, asgnType_WAVESYNTH)},
        { addr:0x00000018, size:INTEGER1x7        , name:'OCTAVE',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x18, asgnType_OCTAVE)},
        { addr:0x00000019, size:INTEGER1x7        , name:'PITCH SHIFTER',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x19, asgnType_PITSHIF)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'HARMONIST',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x1a, asgnType_HARMONIST)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'HUMANIZER',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x1b, asgnType_HUMANIZER)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'PHASE 90E',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x1c, asgnType_PHASE90E)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'FLANGER 117E',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x1d, asgnType_FLANGER117E)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'WAH 95E',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x1e, asgnType_WAH95E)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'DC-30',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x1f, asgnType_DC30)},
        { addr:0x00000020, size:INTEGER1x7        , name:'HEAVY OCT',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x20, asgnType_HEAVYOCT)},
        { addr:0x00000021, size:INTEGER1x7        , name:'PEDAL BEND',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)', 0x21, asgnType_PDLBEND)},
    ],
	'UserPatch%GafcExExp2AsgnMinMax':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x00)},
        { addr:0x00000001, size:INTEGER1x7        , name:'BOOSTER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x00)},
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x01)},
        { addr:0x00000004, size:INTEGER2x7        , name:'DELAY MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x01)},
        { addr:0x00000006, size:INTEGER2x7        , name:'REVERB MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x05)},
        { addr:0x00000008, size:INTEGER2x7        , name:'REVERB MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x05)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'CHORUS MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x09)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'CHORUS MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x09)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'FLANGER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x0a)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'FLANGER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x0a)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'PHASER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x0b)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'PHASER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x0b)},
        { addr:0x00000010, size:INTEGER1x7        , name:'UNI-V MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x0c)},
        { addr:0x00000011, size:INTEGER1x7        , name:'UNI-V MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x0c)},
        { addr:0x00000012, size:INTEGER1x7        , name:'TREMOLO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x0d)},
        { addr:0x00000013, size:INTEGER1x7        , name:'TREMOLO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x0d)},
        { addr:0x00000014, size:INTEGER1x7        , name:'VIBRATO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x0e)},
        { addr:0x00000015, size:INTEGER1x7        , name:'VIBRATO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x0e)},
        { addr:0x00000016, size:INTEGER1x7        , name:'ROTARY MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x0f)},
        { addr:0x00000017, size:INTEGER1x7        , name:'ROTARY MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x0f)},
        { addr:0x00000018, size:INTEGER1x7        , name:'RING MOD MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x10)},
        { addr:0x00000019, size:INTEGER1x7        , name:'RING MOD MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x10)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'SLOW GEAR MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x11)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'SLOW GEAR MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x11)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'SLICER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x12)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'SLICER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x12)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'COMP MIN',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x13)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'COMP MAX',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x13)},
        { addr:0x00000020, size:INTEGER1x7        , name:'LIMITER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x14)},
        { addr:0x00000021, size:INTEGER1x7        , name:'LIMITER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x14)},
        { addr:0x00000022, size:INTEGER1x7        , name:'T.WAH MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x15)},
        { addr:0x00000023, size:INTEGER1x7        , name:'T.WAH MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x15)},
        { addr:0x00000024, size:INTEGER1x7        , name:'AUTO WAH MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x16)},
        { addr:0x00000025, size:INTEGER1x7        , name:'AUTO WAH MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x16)},
        { addr:0x00000026, size:INTEGER1x7        , name:'PEDAL WAH MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x17)},
        { addr:0x00000027, size:INTEGER1x7        , name:'PEDAL WAH MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x17)},
        { addr:0x00000028, size:INTEGER1x7        , name:'GEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x18)},
        { addr:0x00000029, size:INTEGER1x7        , name:'GEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x18)},
        { addr:0x0000002a, size:INTEGER1x7        , name:'PEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x19)},
        { addr:0x0000002b, size:INTEGER1x7        , name:'PEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x19)},
        { addr:0x0000002c, size:INTEGER1x7        , name:'GUITAR SIM MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x1a)},
        { addr:0x0000002d, size:INTEGER1x7        , name:'GUITAR SIM MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x1a)},
        { addr:0x0000002e, size:INTEGER1x7        , name:'AC.GUITAR SIM MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x1b)},
        { addr:0x0000002f, size:INTEGER1x7        , name:'AC.GUITAR SIM MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x1b)},
        { addr:0x00000030, size:INTEGER1x7        , name:'AC.PROCESSOR MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x1c)},
        { addr:0x00000031, size:INTEGER1x7        , name:'AC.PROCESSOR MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x1c)},
        { addr:0x00000032, size:INTEGER1x7        , name:'WAVE SYNTH MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x1d)},
        { addr:0x00000033, size:INTEGER1x7        , name:'WAVE SYNTH MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x1d)},
        { addr:0x00000034, size:INTEGER1x7        , name:'OCTAVE MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x1e)},
        { addr:0x00000035, size:INTEGER1x7        , name:'OCTAVE MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x1e)},
        { addr:0x00000036, size:INTEGER2x7        , name:'PITCH SHIFTER MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x1f)},
        { addr:0x00000038, size:INTEGER2x7        , name:'PITCH SHIFTER MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x1f)},
        { addr:0x0000003a, size:INTEGER2x7        , name:'HARMONIST MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x23)},
        { addr:0x0000003c, size:INTEGER2x7        , name:'HARMONIST MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x23)},
        { addr:0x0000003e, size:INTEGER1x7        , name:'HUMANIZER MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x27)},
        { addr:0x0000003f, size:INTEGER1x7        , name:'HUMANIZER MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x27)},
        { addr:0x00000040, size:INTEGER1x7        , name:'PHASE 90E MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x28)},
        { addr:0x00000041, size:INTEGER1x7        , name:'PHASE 90E MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x28)},
        { addr:0x00000042, size:INTEGER1x7        , name:'FLANGER 117E MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x29)},
        { addr:0x00000043, size:INTEGER1x7        , name:'FLANGER 117E MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x29)},
        { addr:0x00000044, size:INTEGER1x7        , name:'WAH 95E MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x2a)},
        { addr:0x00000045, size:INTEGER1x7        , name:'WAH 95E MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x2a)},
        { addr:0x00000046, size:INTEGER2x7        , name:'DC-30 MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x2b)},
        { addr:0x00000048, size:INTEGER2x7        , name:'DC-30 MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x2b)},
        { addr:0x0000004a, size:INTEGER1x7        , name:'HEAVY OCT MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x2f)},
        { addr:0x0000004b, size:INTEGER1x7        , name:'HEAVY OCT MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x2f)},
        { addr:0x0000004c, size:INTEGER1x7        , name:'PEDAL BEND MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)', 0x30)},
        { addr:0x0000004d, size:INTEGER1x7        , name:'PEDAL BEND MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)', 0x30)},
    ],
    'UserPatch%GafcExExp3Asgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x00, asgnType_BST)},
        { addr:0x00000001, size:INTEGER1x7        , name:'DELAY',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x01, asgnType_DLY)},
        { addr:0x00000002, size:INTEGER1x7        , name:'REVERB',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x02, asgnType_REV)},
        { addr:0x00000003, size:INTEGER1x7        , name:'CHORUS',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x03, asgnType_CHORUS)},
        { addr:0x00000004, size:INTEGER1x7        , name:'FLANGER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x04, asgnType_FLANGER)},
        { addr:0x00000005, size:INTEGER1x7        , name:'PHASER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x05, asgnType_PHASER)},
        { addr:0x00000006, size:INTEGER1x7        , name:'UNI-V',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x06, asgnType_UNIV)},
        { addr:0x00000007, size:INTEGER1x7        , name:'TREMOLO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x07, asgnType_TREMOLO)},
        { addr:0x00000008, size:INTEGER1x7        , name:'VIBRATO',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x08, asgnType_VIBRATO)},
        { addr:0x00000009, size:INTEGER1x7        , name:'ROTARY',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x09, asgnType_ROTARY)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'RING MOD',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x0a, asgnType_RINGMOD)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'SLOW GEAR',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x0b, asgnType_SLOWGEAR)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'SLICER',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x0c, asgnType_SLICER)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'COMP',               converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x0d, asgnType_COMP)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'LIMITER',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x0e, asgnType_LIMIT)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'T.WAH',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x0f, asgnType_TWAH)},
        { addr:0x00000010, size:INTEGER1x7        , name:'AUTO WAH',           converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x10, asgnType_AUTOWAH)},
        { addr:0x00000011, size:INTEGER1x7        , name:'PEDAL WAH',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x11, asgnType_PDLWAH)},
        { addr:0x00000012, size:INTEGER1x7        , name:'GEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x12, asgnType_GEQ)},
        { addr:0x00000013, size:INTEGER1x7        , name:'PEQ',                converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x13, asgnType_PEQ)},
        { addr:0x00000014, size:INTEGER1x7        , name:'GUITAR SIM',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x14, asgnType_GUITARSIM)},
        { addr:0x00000015, size:INTEGER1x7        , name:'AC.GUITAR SIM',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x15, asgnType_ACGUITSIM)},
        { addr:0x00000016, size:INTEGER1x7        , name:'AC.PROCESSOR',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x16, asgnType_ACPROC)},
        { addr:0x00000017, size:INTEGER1x7        , name:'WAVE SYNTH',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x17, asgnType_WAVESYNTH)},
        { addr:0x00000018, size:INTEGER1x7        , name:'OCTAVE',             converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x18, asgnType_OCTAVE)},
        { addr:0x00000019, size:INTEGER1x7        , name:'PITCH SHIFTER',      converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x19, asgnType_PITSHIF)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'HARMONIST',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x1a, asgnType_HARMONIST)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'HUMANIZER',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x1b, asgnType_HUMANIZER)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'PHASE 90E',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x1c, asgnType_PHASE90E)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'FLANGER 117E',       converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x1d, asgnType_FLANGER117E)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'WAH 95E',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x1e, asgnType_WAH95E)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'DC-30',              converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x1f, asgnType_DC30)},
        { addr:0x00000020, size:INTEGER1x7        , name:'HEAVY OCT',          converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x20, asgnType_HEAVYOCT)},
        { addr:0x00000021, size:INTEGER1x7        , name:'PEDAL BEND',         converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)', 0x21, asgnType_PDLBEND)},
    ],
	'UserPatch%GafcExExp3AsgnMinMax':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'BOOSTER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x00)},
        { addr:0x00000001, size:INTEGER1x7        , name:'BOOSTER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x00)},
        { addr:0x00000002, size:INTEGER2x7        , name:'DELAY MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x01)},
        { addr:0x00000004, size:INTEGER2x7        , name:'DELAY MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x01)},
        { addr:0x00000006, size:INTEGER2x7        , name:'REVERB MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x05)},
        { addr:0x00000008, size:INTEGER2x7        , name:'REVERB MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x05)},
        { addr:0x0000000a, size:INTEGER1x7        , name:'CHORUS MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x09)},
        { addr:0x0000000b, size:INTEGER1x7        , name:'CHORUS MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x09)},
        { addr:0x0000000c, size:INTEGER1x7        , name:'FLANGER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x0a)},
        { addr:0x0000000d, size:INTEGER1x7        , name:'FLANGER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x0a)},
        { addr:0x0000000e, size:INTEGER1x7        , name:'PHASER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x0b)},
        { addr:0x0000000f, size:INTEGER1x7        , name:'PHASER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x0b)},
        { addr:0x00000010, size:INTEGER1x7        , name:'UNI-V MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x0c)},
        { addr:0x00000011, size:INTEGER1x7        , name:'UNI-V MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x0c)},
        { addr:0x00000012, size:INTEGER1x7        , name:'TREMOLO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x0d)},
        { addr:0x00000013, size:INTEGER1x7        , name:'TREMOLO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x0d)},
        { addr:0x00000014, size:INTEGER1x7        , name:'VIBRATO MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x0e)},
        { addr:0x00000015, size:INTEGER1x7        , name:'VIBRATO MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x0e)},
        { addr:0x00000016, size:INTEGER1x7        , name:'ROTARY MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x0f)},
        { addr:0x00000017, size:INTEGER1x7        , name:'ROTARY MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x0f)},
        { addr:0x00000018, size:INTEGER1x7        , name:'RING MOD MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x10)},
        { addr:0x00000019, size:INTEGER1x7        , name:'RING MOD MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x10)},
        { addr:0x0000001a, size:INTEGER1x7        , name:'SLOW GEAR MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x11)},
        { addr:0x0000001b, size:INTEGER1x7        , name:'SLOW GEAR MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x11)},
        { addr:0x0000001c, size:INTEGER1x7        , name:'SLICER MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x12)},
        { addr:0x0000001d, size:INTEGER1x7        , name:'SLICER MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x12)},
        { addr:0x0000001e, size:INTEGER1x7        , name:'COMP MIN',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x13)},
        { addr:0x0000001f, size:INTEGER1x7        , name:'COMP MAX',               converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x13)},
        { addr:0x00000020, size:INTEGER1x7        , name:'LIMITER MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x14)},
        { addr:0x00000021, size:INTEGER1x7        , name:'LIMITER MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x14)},
        { addr:0x00000022, size:INTEGER1x7        , name:'T.WAH MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x15)},
        { addr:0x00000023, size:INTEGER1x7        , name:'T.WAH MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x15)},
        { addr:0x00000024, size:INTEGER1x7        , name:'AUTO WAH MIN',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x16)},
        { addr:0x00000025, size:INTEGER1x7        , name:'AUTO WAH MAX',           converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x16)},
        { addr:0x00000026, size:INTEGER1x7        , name:'PEDAL WAH MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x17)},
        { addr:0x00000027, size:INTEGER1x7        , name:'PEDAL WAH MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x17)},
        { addr:0x00000028, size:INTEGER1x7        , name:'GEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x18)},
        { addr:0x00000029, size:INTEGER1x7        , name:'GEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x18)},
        { addr:0x0000002a, size:INTEGER1x7        , name:'PEQ MIN',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x19)},
        { addr:0x0000002b, size:INTEGER1x7        , name:'PEQ MAX',                converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x19)},
        { addr:0x0000002c, size:INTEGER1x7        , name:'GUITAR SIM MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x1a)},
        { addr:0x0000002d, size:INTEGER1x7        , name:'GUITAR SIM MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x1a)},
        { addr:0x0000002e, size:INTEGER1x7        , name:'AC.GUITAR SIM MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x1b)},
        { addr:0x0000002f, size:INTEGER1x7        , name:'AC.GUITAR SIM MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x1b)},
        { addr:0x00000030, size:INTEGER1x7        , name:'AC.PROCESSOR MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x1c)},
        { addr:0x00000031, size:INTEGER1x7        , name:'AC.PROCESSOR MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x1c)},
        { addr:0x00000032, size:INTEGER1x7        , name:'WAVE SYNTH MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x1d)},
        { addr:0x00000033, size:INTEGER1x7        , name:'WAVE SYNTH MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x1d)},
        { addr:0x00000034, size:INTEGER1x7        , name:'OCTAVE MIN',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x1e)},
        { addr:0x00000035, size:INTEGER1x7        , name:'OCTAVE MAX',             converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x1e)},
        { addr:0x00000036, size:INTEGER2x7        , name:'PITCH SHIFTER MIN',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x1f)},
        { addr:0x00000038, size:INTEGER2x7        , name:'PITCH SHIFTER MAX',      converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x1f)},
        { addr:0x0000003a, size:INTEGER2x7        , name:'HARMONIST MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x23)},
        { addr:0x0000003c, size:INTEGER2x7        , name:'HARMONIST MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x23)},
        { addr:0x0000003e, size:INTEGER1x7        , name:'HUMANIZER MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x27)},
        { addr:0x0000003f, size:INTEGER1x7        , name:'HUMANIZER MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x27)},
        { addr:0x00000040, size:INTEGER1x7        , name:'PHASE 90E MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x28)},
        { addr:0x00000041, size:INTEGER1x7        , name:'PHASE 90E MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x28)},
        { addr:0x00000042, size:INTEGER1x7        , name:'FLANGER 117E MIN',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x29)},
        { addr:0x00000043, size:INTEGER1x7        , name:'FLANGER 117E MAX',       converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x29)},
        { addr:0x00000044, size:INTEGER1x7        , name:'WAH 95E MIN',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x2a)},
        { addr:0x00000045, size:INTEGER1x7        , name:'WAH 95E MAX',            converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x2a)},
        { addr:0x00000046, size:INTEGER2x7        , name:'DC-30 MIN',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x2b)},
        { addr:0x00000048, size:INTEGER2x7        , name:'DC-30 MAX',              converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x2b)},
        { addr:0x0000004a, size:INTEGER1x7        , name:'HEAVY OCT MIN',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x2f)},
        { addr:0x0000004b, size:INTEGER1x7        , name:'HEAVY OCT MAX',          converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x2f)},
        { addr:0x0000004c, size:INTEGER1x7        , name:'PEDAL BEND MIN',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)', 0x30)},
        { addr:0x0000004d, size:INTEGER1x7        , name:'PEDAL BEND MAX',         converter: new SameValConverter('PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)', 0x30)},
    ],
	'UserPatch%CtrlAsgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'GAFC EXP3 FUNCTION',               converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_FUNC(1)', 0x00, asgnType_PDLFUNC)},
        { addr:0x00000001, size:INTEGER1x7        , name:'GAFC EX EXP1 FUNCTION',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL1_FUNC(2)', 0x00, asgnType_PDLFUNC)},
        { addr:0x00000002, size:INTEGER1x7        , name:'GAFC EX EXP2 FUNCTION',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL2_FUNC(2)', 0x00, asgnType_PDLFUNC)},
        { addr:0x00000003, size:INTEGER1x7        , name:'GAFC EX EXP3 FUNCTION',            converter: new AsgnTypeConverter('PATCH%ASSIGN_GAFCEXPPDL3_FUNC(2)', 0x00, asgnType_PDLFUNC)},
        { addr:0x00000004, size:INTEGER1x7        , name:'GAFC FS3 FUNCTION',                converter: new SameValConverter('PATCH%ASSIGN_GAFCFS(1)', 0x02)},
        { addr:0x00000005, size:INTEGER1x7        , name:'GAFC EX FS1 FUNCTION',             converter: new SameValConverter('PATCH%ASSIGN_GAFCFS(2)', 0x00)},
        { addr:0x00000006, size:INTEGER1x7        , name:'GAFC EX FS2 FUNCTION',             converter: new SameValConverter('PATCH%ASSIGN_GAFCFS(2)', 0x01)},
        { addr:0x00000007, size:INTEGER1x7        , name:'GAFC EX FS3FUNCTION',              converter: new SameValConverter('PATCH%ASSIGN_GAFCFS(2)', 0x02)},
    ],
	'UserPatch%FsAsgn':	[
        { addr:0x00000000, size:INTEGER1x7        , name:'FS1 TIP FUNCTION' ,            converter: new SameValConverter('PATCH%ASSIGN_FS', 0x00)},
        { addr:0x00000001, size:INTEGER1x7        , name:'FS1 RING FUNCTION',            converter: new SameValConverter('PATCH%ASSIGN_FS', 0x01)},
    ],
};

function PatchConverterModel() {
    this.convTbl = ConvertTbl_FromKtnMk2ToKtn3;
	// PatchConverter.call(this);
}

PatchConverterModel.prototype = Object.create(PatchConverter.prototype);

PatchConverterModel.prototype.import = function (data, revision) {
	try {
		// _checkRevision(revision);
		let patchInfo = new PatchInfo(false);
        if (data.memo)	patchInfo['memo'] = data.memo;
		let patch = this.create(patchInfo);
		let Ktn3PrmSet = patch.paramSet;
		const Ktn2PrmSet = data.paramSet;

        let notSupConvEffCtrl = new NotSupportedConvEffectControl();
		for (const prop in Ktn2PrmSet) {

			const prms = this.convTbl[prop];
			if (!prms || !prms.length) continue;
			const dataFrom = Ktn2PrmSet[prop];
            for (let idx = 0; idx < prms.length; idx++) {
                const item = prms[idx];

				let indexFrom = parseInt(item.addr, 10);
				if (indexFrom >= 256) indexFrom -= 128;

                item.converter.convert(dataFrom, indexFrom, item.size, Ktn3PrmSet, notSupConvEffCtrl);

            }
        }

        notSupConvEffCtrl.applyResult(Ktn3PrmSet);
        
		return patch;
	} catch (error) {
		throw new Error('this file is unsupported');
	};

    function getSelColor(mk2ParamSet, indexSel) {
        const prmsSel = mk2ParamSet['UserPatch%SelColorSw'];
        if (prmsSel && prmsSel[indexSel]) {
            const val = parseInt(prmsSel[indexSel]);
            return val + 1;
        }

        return 0;
    }
}

function KtnMk2LivesetModel() {
	var converter = new PatchConverterModel();
	LivesetConverter.call(this, 'KATANA MkII', converter, 'GT');
}

KtnMk2LivesetModel.prototype = Object.create(LivesetConverter.prototype);
KtnMk2LivesetModel.prototype.livesetName = function(data)	{ return data.name;	};

$(function () {
    window.configConverterLiveset = () => {
        window.Converter.liveset = new KtnMk2LivesetModel();
    }
    configConverterLiveset();
});