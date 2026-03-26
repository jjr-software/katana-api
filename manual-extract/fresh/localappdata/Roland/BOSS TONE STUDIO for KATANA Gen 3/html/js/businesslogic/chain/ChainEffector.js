/* global
ChainBlock
*/
var abbreviatedString = {
    "MID BST":      "MID BOOST",
    "CLEAN BST":    "CLEAN BOOST",
    "TREBLE BST":   "TREBLE BOOST",
    "GEQ":          "GRAPHIC EQ",
    "PEQ":          "PARAMETRIC EQ",
    "PITCH SHIFT":  "PITCH SHIFTER",
    "AC.PROCESS":   "AC.PROCESSOR",
    "AC.GTR SIM":   "AC.GUITAR SIM",
    "FLNGR 117E":   "FLANGER 117E",
    "HEAVY OCT":    "HEAVY OCTAVE"
}
var keys = Object.keys(abbreviatedString);
function updateAbbreviatedText (text) { 
    if (keys.includes(text))  text = abbreviatedString[text];
    else text = text;
    return text;
}
var ChainEffector = function (blockModelMap, id, canTurnOn, canSelectStompbox) {
    ChainBlock.call(this, blockModelMap, id, canTurnOn, true, true, true);
    this.canSelectStompbox = canSelectStompbox;
    this.isStompboxSelected = false;
    this.typeName = "";
    this.mainBgr = "";
    this.mainWidth = BLOCK_WIDTH_DEFAULT;
    this.brgColor = "";
};

ChainEffector.prototype = Object.create(ChainBlock.prototype);
ChainEffector.prototype.constructor = ChainEffector;

// constants
ChainBlock.prototype.STOMPBOX_IMAGE_SUFFIX = '_SB' + ChainBlock.prototype.IMAGE_SUFFIX;
ChainBlock.prototype.STOMPBOX_SELECTED_IMAGE_SUFFIX = '_SB_selected' + ChainBlock.prototype.IMAGE_SUFFIX;
ChainBlock.prototype.STOMPBOX_HOVER_IMAGE_SUFFIX = '_SB_hover' + ChainBlock.prototype.IMAGE_SUFFIX;

ChainEffector.prototype.getImageSuffix = function () {
    // if (this.canHover && this.isHovered) {
    //     if (this.canTurnOn && !this.isTurnedOn) {
    //         return this.OFF_HOVER_IMAGE_SUFFIX;
    //     } else if (this.canSelectStompbox && this.isStompboxSelected) {
    //         return this.STOMPBOX_HOVER_IMAGE_SUFFIX;
    //     } else {
    //         return this.HOVER_IMAGE_SUFFIX;
    //     }
    // } else if (this.canSelect && this.isSelected) {
    //     if (this.canTurnOn && !this.isTurnedOn) {
    //         return this.OFF_SELECTED_IMAGE_SUFFIX;
    //     } else if (this.canSelectStompbox && this.isStompboxSelected) {
    //         return this.STOMPBOX_SELECTED_IMAGE_SUFFIX;
    //     } else {
    //         return this.SELECTED_IMAGE_SUFFIX;
    //     }
    // } else {
        let noSuffixBlocks = ['amp', 'sr'];
        if(noSuffixBlocks.findIndex(item => item == this.id) != -1) {
            return this.IMAGE_SUFFIX;
        }

        if (this.canTurnOn && !this.isTurnedOn) {
            return this.OFF_IMAGE_SUFFIX;
        } else if (this.canSelectStompbox && this.isStompboxSelected) {
            return this.STOMPBOX_IMAGE_SUFFIX;
        } else {
            return this.IMAGE_SUFFIX;
        }
    // }
};

ChainEffector.prototype.getNewBlockIdArray = function (currentBlockIdArray, targetId) {
    var selfIndex = currentBlockIdArray.indexOf(this.id);
    var resultArray = currentBlockIdArray.slice(0, selfIndex)
        .concat(currentBlockIdArray.slice(selfIndex + 1));
    var targetIndex = resultArray.indexOf(targetId);
    return resultArray.slice(0, targetIndex + 1)
        .concat(this.id, resultArray.slice(targetIndex + 1));
};
ChainEffector.prototype.getMovablePositions = function (currentBlockIdArray, blockPatchChainVal, blockEq1Val, blockEq2Val, blockPdlVal, blockSrVal) {
    var selfId = this.id;

    var movablePositions = [];
    switch (selfId) {
        case CHAIN_BLOCK_ID_MAP.bootster:
        case CHAIN_BLOCK_ID_MAP.mod:
        case CHAIN_BLOCK_ID_MAP.fx:
        case CHAIN_BLOCK_ID_MAP.delay1:
        case CHAIN_BLOCK_ID_MAP.delay2:
            movablePositions = this.getMovablePositionsForPatch(selfId, currentBlockIdArray, blockPatchChainVal, blockEq1Val, blockEq2Val, blockPdlVal, blockSrVal);
            break;
        case CHAIN_BLOCK_ID_MAP.eq:
        case CHAIN_BLOCK_ID_MAP.eq2:
            movablePositions = this.getMovablePositionsForEq(selfId, currentBlockIdArray, blockPatchChainVal, blockEq1Val, blockEq2Val, blockPdlVal, blockSrVal);
            break;
        case CHAIN_BLOCK_ID_MAP.pedalFx:
        case CHAIN_BLOCK_ID_MAP.sendreturn:
            movablePositions = this.getMovablePositionsForPdlSr(selfId, currentBlockIdArray, blockPatchChainVal, blockEq1Val, blockEq2Val, blockPdlVal, blockSrVal);
            break;
        default:
            // movablePositions = this.getMovablePositionsDefault(selfId, currentBlockIdArray)
            movablePositions = [];
    }

    return movablePositions;
};

ChainEffector.prototype.getMovablePositionsForPatch = function (selfId, currentBlockIdArray, blockPatchChainVal, blockEq1Val, blockEq2Val, blockPdlVal, blockSrVal) {
    let ret = [];
    let baseTransPattern = CHAIN_BASE_TRANSITION.find(item => item.patchVal == blockPatchChainVal);
    let currentBlockIndex = currentBlockIdArray.findIndex(item => item == selfId) - 1;

    if(baseTransPattern.hasOwnProperty(selfId)) {
        let targetPatchVal = baseTransPattern[selfId];
        let targetBaseFlowList = CHAIN_BASE_FLOW.find(item => item.pdlVal == blockPdlVal && item.srVal == blockSrVal).list;
        let targetEqFlow = CHAIN_EQ_FLOW.find(item => item.eqPos1 == blockEq1Val && item.eqPos2 == blockEq2Val).list;
        jQuery.each(targetPatchVal, (index, patchVal) => {
            let targetBaseFlow = targetBaseFlowList[patchVal];
            let ampIndex = targetBaseFlow.findIndex(item => item == "amp");
            let targetFullFlow = [...targetBaseFlow.slice(0, ampIndex), ...targetEqFlow, ...targetBaseFlow.slice(ampIndex + 1)];
            let newIndexOfBlock = targetFullFlow.findIndex(item => item == selfId);
             if(currentBlockIndex != newIndexOfBlock) {
                 newIndexOfBlock - 1 >= 0 ? ret.push(targetFullFlow[newIndexOfBlock - 1]) : ret.push(CHAIN_BLOCK_ID_MAP.input);
             }
        });
    }

    return ret;
}

ChainEffector.prototype.getMovablePositionsForEq = function (selfId, currentBlockIdArray, blockPatchChainVal, blockEq1Val, blockEq2Val, blockPdlVal, blockSrVal) {
    let ret = [];
    let nextEqFlow;
    let currentEqFlow = CHAIN_EQ_FLOW.find(item => item.eqPos1 == blockEq1Val && item.eqPos2 == blockEq2Val);
    if(selfId == CHAIN_BLOCK_ID_MAP.eq) {
        //EQ
        nextEqFlow = CHAIN_EQ_FLOW.find(item => item.eqPos1 == (!currentEqFlow.eqPos1 ? 1 : 0) && item.eqPos2 == currentEqFlow.eqPos2);
    } else {
        //EQ2
        nextEqFlow = CHAIN_EQ_FLOW.find(item => item.eqPos2 == (!currentEqFlow.eqPos2 ? 1 : 0) && item.eqPos1 == currentEqFlow.eqPos1);
    }
    let currentBlockIndex = currentBlockIdArray.findIndex(item => item == selfId) - 1;

    let targetBaseFlow = CHAIN_BASE_FLOW.find(item => item.pdlVal == blockPdlVal && item.srVal == blockSrVal).list[blockPatchChainVal];
    let ampIndex = targetBaseFlow.findIndex(item => item == "amp");
    let targetFullFlow = [...targetBaseFlow.slice(0, ampIndex), ...nextEqFlow.list, ...targetBaseFlow.slice(ampIndex + 1)];
    let newIndexOfBlock = targetFullFlow.findIndex(item => item == selfId);
    if(currentBlockIndex != newIndexOfBlock)  {
        ret.push(targetFullFlow[newIndexOfBlock - 1]);
    }
    return ret;
}

ChainEffector.prototype.getMovablePositionsForPdlSr = function (selfId, currentBlockIdArray, blockPatchChainVal, blockEq1Val, blockEq2Val, blockPdlVal, blockSrVal) {
    let ret = [];
    let nextBaseFlowLists;
    if(selfId == CHAIN_BLOCK_ID_MAP.pedalFx) {
        // PEDAL FX
        nextBaseFlowLists = CHAIN_BASE_FLOW.filter(item => item.pdlVal != blockPdlVal && item.srVal == blockSrVal);
    } else {
        // SEND RETURN
        nextBaseFlowLists = CHAIN_BASE_FLOW.filter(item => item.pdlVal == blockPdlVal && item.srVal != blockSrVal);
    }
    let targetEqFlow = CHAIN_EQ_FLOW.find(item => item.eqPos1 == blockEq1Val && item.eqPos2 == blockEq2Val).list;
    let currentBlockIndex = currentBlockIdArray.findIndex(item => item == selfId) - 1;

    jQuery.each(nextBaseFlowLists, (index, baseFlow) => {
        let targetBaseFlow = baseFlow.list[blockPatchChainVal];
        let ampIndex = targetBaseFlow.findIndex(item => item == "amp");
        let targetFullFlow = [...targetBaseFlow.slice(0, ampIndex), ...targetEqFlow, ...targetBaseFlow.slice(ampIndex + 1)];
        let newIndexOfBlock = targetFullFlow.findIndex(item => item == selfId);
        if(currentBlockIndex != newIndexOfBlock) {
            newIndexOfBlock - 1 >= 0 ? ret.push(targetFullFlow[newIndexOfBlock - 1]) : ret.push(CHAIN_BLOCK_ID_MAP.input);
        }
    });

    return ret;
}

ChainEffector.prototype.getMovablePositionsDefault = function (selfId, currentBlockIdArray) {
    return currentBlockIdArray.filter(function (blockId, index, array) {
        if (blockId === selfId) {
            return false;
        }
        if (array[index + 1] === selfId) {
            return false;
        }
        if (index === currentBlockIdArray.length - 1) {
            return false;
        }
        return true;
    });
}

// ChainEffector.prototype.getMovablePositionsForAirdPreamp = function (selfId, currentBlockIdArray) {
//     var keyList = Object.keys(CHAIN_SIMULATOR_OUT_PAIR);
//     var unmovablePos = [];
//     var resultArray = currentBlockIdArray;

//     var simulatorId;
//     var simulatorOutIndex;
//     var simulatorIndex;
//     for (var j = 0; j < keyList.length; j++) {
//         simulatorId = CHAIN_SIMULATOR_OUT_PAIR[keyList[j]];
//         simulatorOutIndex = currentBlockIdArray.indexOf(keyList[j]);
//         simulatorIndex = currentBlockIdArray.indexOf(simulatorId);
//         if (simulatorOutIndex === -1 || simulatorIndex === -1) {
//             continue;
//         }

//         for (var k = simulatorIndex; k < simulatorOutIndex; k++) {
//             unmovablePos = unmovablePos.concat(k);
//         }0
//     }
//     unmovablePos = unmovablePos.concat(currentBlockIdArray.indexOf(selfId));
//     unmovablePos = unmovablePos.concat(currentBlockIdArray.indexOf(selfId) - 1);
//     unmovablePos = unmovablePos.concat(currentBlockIdArray.length - 1);
//     resultArray = resultArray.filter(function (chainName, index, array) {
//         return unmovablePos.indexOf(index) === -1
//     });

//     return resultArray;
// };

ChainBlock.prototype.updateEffectType = function () {
    let effectTypeName = '';
    switch (this.id) {
        case CHAIN_BLOCK_ID_MAP.pedalFx:
            effectTypeName = $("#pedalfx-type-select-box>p").text();
            break;
        case CHAIN_BLOCK_ID_MAP.bootster:
            let bstItem = _items['booster-select-watcher'];
            let bstWatcherValue = Parameter.value(bstItem.pid, bstItem.size, bstItem.vofs);
            if(bstWatcherValue == 0) {
                effectTypeName = $("#booster-asgn-grn-select-box>p").text();
            } else if(bstWatcherValue == 1) {
                effectTypeName = $("#booster-asgn-red-select-box>p").text();
            } else {
                effectTypeName = $("#booster-asgn-ylw-select-box>p").text();
            }
            break;
        case CHAIN_BLOCK_ID_MAP.eq: 
            let eqTypeValue = Parameter.value('PATCH%EQ_EACH(1)%2', 65542, 0);
            effectTypeName = $("#eq-type-select-box-box a").eq(eqTypeValue).text();
            break;
        case CHAIN_BLOCK_ID_MAP.eq2: 
            let eqTypeValue2 = Parameter.value('PATCH%EQ_EACH(2)%2', 65542, 0);
            effectTypeName = $("#eq-type-select-box-box a").eq(eqTypeValue2).text();
            break;
        case CHAIN_BLOCK_ID_MAP.mod: 
            let modItem = _items['mod-select-watcher'];
            let modWatcherValue = Parameter.value(modItem.pid, modItem.size, modItem.vofs);
            if(modWatcherValue == 0) {
                effectTypeName = $("#mod-asgn-grn-select-box>p").text();
            } else if(modWatcherValue == 1) {
                effectTypeName = $("#mod-asgn-red-select-box>p").text();
            } else if(modWatcherValue == 2){
                effectTypeName = $("#mod-asgn-ylw-select-box>p").text();
            }
            break;
        case CHAIN_BLOCK_ID_MAP.fx: 
            let fxItem = _items['fx-select-watcher'];
            let fxWatcherValue = Parameter.value(fxItem.pid, fxItem.size, fxItem.vofs);
            if(fxWatcherValue == 0) {
                effectTypeName = $("#fx-asgn-grn-select-box>p").text();
            } else if(fxWatcherValue == 1) {
                effectTypeName = $("#fx-asgn-red-select-box>p").text();
            } else if(fxWatcherValue == 2){
                effectTypeName = $("#fx-asgn-ylw-select-box>p").text();
            }
            break;
        case CHAIN_BLOCK_ID_MAP.delay1: 
            let delayItem = _items['delay-select-watcher'];
            let delayWatcherValue = Parameter.value(delayItem.pid, delayItem.size, delayItem.vofs);
            if(delayWatcherValue == 0) {
                effectTypeName = $("#delay-asgn-grn-select-box>p").text();
            } else if(delayWatcherValue == 1) {
                effectTypeName = $("#delay-asgn-red-select-box>p").text();
            } else {
                effectTypeName = $("#delay-asgn-ylw-select-box>p").text();
            }
            break;
        case CHAIN_BLOCK_ID_MAP.delay2: 
            let delay2Item = _items['reverb-select-watcher'];
            let delay2WatcherValue = Parameter.value(delay2Item.pid, delay2Item.size, delay2Item.vofs);
            if(delay2WatcherValue == 0) {
                effectTypeName = $("#delay2-asgn-grn-select-box>p").text();
            } else if(delay2WatcherValue == 1) {
                effectTypeName = $("#delay2-asgn-red-select-box>p").text();
            } else {
                effectTypeName = $("#delay2-asgn-ylw-select-box>p").text();
            }
            break;
        case CHAIN_BLOCK_ID_MAP.reverb: 
            let reverbItem = _items['reverb-select-watcher'];
            let reverbWatcherValue = Parameter.value(reverbItem.pid, reverbItem.size, reverbItem.vofs);
            if(reverbWatcherValue == 0) {
                effectTypeName = $("#reverb-asgn-grn-select-box>p").text();
            } else if(reverbWatcherValue == 1) {
                effectTypeName = $("#reverb-asgn-red-select-box>p").text();
            } else {
                effectTypeName = $("#reverb-asgn-ylw-select-box>p").text();
            }
        break;
    }

    // get typeColor
    let baseBgrColor = '';
    let chainColorIndex = CHAIN_COLOR_SWITCH.findIndex(item => item.chainId == this.id);
    if(chainColorIndex != -1) {
        let chainColors = CHAIN_COLOR_SWITCH[chainColorIndex].colors;
        let chainColorItemIdex = chainColors.findIndex(item2 => !item2.type || item2.type.includes(effectTypeName));
        if(chainColorItemIdex != -1) {
            baseBgrColor = chainColors[chainColorItemIdex].color;
        }
    }

    effectTypeName = updateAbbreviatedText(effectTypeName);
    this.brgColor = baseBgrColor;
    this.typeName = effectTypeName;

    // CHAIN ICON UPDATE
    let effectIconLists = listTypeEffect.find(item => item.id == this.id);
    this.mainBgr = effectIconLists.defaultImg;
    this.mainWidth = effectIconLists.defaultWidth;
    if(this.typeName) {
        let typeIcon = effectIconLists.typeLists.find(item2 => item2.typeName == this.typeName);
        if(typeIcon && typeIcon.img) {
            this.mainBgr = typeIcon.img.replace(/\\/g, '/');
            this.mainWidth = typeIcon.iconWidth;
        }
    }

}