//
//	chain_controller.js
//
//	Copyright 2020 Roland Corporation. All rights reserved.
//

(function () {
    let blockModelMap = getInitialBlockModelMap();
    let blockNumOrder = [];
    let blockPatchChainVal = 0;
    let blockEq1Val = 0;
    let blockEq2Val = 0;
    let blockPdlVal = 0;
    let blockSrVal = 0;

    let selectedBlock = null;
    let hoveredBlockId = null;
    let maxWidth = 0;
    let maxHeight = 0;
    let canDragBlock = true;

    let lastestSeleted = null;

    window.chainModelController = {
        disableDraggingBlock: function (disabled) {
            canDragBlock = !disabled;
        },

        updateChainBlockNumOrder: function (val) {
            if(val) {
                blockNumOrder = val;
            }
            let blockIdOrder = this.convert2ChainBlockIdOrder(blockNumOrder);
            this._resetBlockLine(blockIdOrder);
            this._updateBlockPosition(blockIdOrder);
            chainDOMController.updateChain(blockIdOrder);
        },

        _resetBlockLine: function (blockIdOrder) {
            blockIdOrder.forEach(function (blockId) {
                let blockModel = blockModelMap[blockId];
                blockModel.isLineOn = true;
            });
        },

        _updateBlockPosition: function (blockIdOrder) {
            let currentX = 20;
            let currentY = 0;

            blockIdOrder.forEach(function (blockId) {
                let blockModel = blockModelMap[blockId];
                if(blockModel.isEffector()) {
                    blockModel.updateEffectType();
                }
                blockModel.x = currentX;
                blockModel.y = currentY;
                blockModel.updateLines(blockIdOrder);
                if(blockId == CHAIN_BLOCK_ID_MAP.fv) {
                    blockModel.x = blockModel.x - 10;
                    currentX += (blockModel.mainWidth);
                } else {
                    currentX += (blockModel.mainWidth + BLOCK_SPACE);
                }
            });
        },

        move: function (targetId, destinationId) {
            let newBlockIdArray = blockModelMap[targetId].getNewBlockIdArray(this.convert2ChainBlockIdOrder(blockNumOrder), destinationId);
            let newBlockNumArray = this.convert2ChainBlockNumOrder(newBlockIdArray);
            // this.updateChainBlockNumOrder(newBlockNumArray);

            let ampIndex = newBlockIdArray.findIndex(item => item == CHAIN_BLOCK_ID_MAP.amp);
            let eqIndex = newBlockIdArray.findIndex(item => item == CHAIN_BLOCK_ID_MAP.eq);
            let eq2Index = newBlockIdArray.findIndex(item => item == CHAIN_BLOCK_ID_MAP.eq2);
            let eqPos1New = eqIndex < ampIndex ? 0 : 1;
            let eqPos2New = eq2Index < ampIndex ? 0 : 1;
            let baseFlowNew = newBlockIdArray.filter(item => item != "eq" && item != "eq2");
            let pdlNew;
            let srNew;
            let patchChainNew;

            jQuery.each(CHAIN_BASE_FLOW, (index, baseFlow) => {
                let patchIndex = baseFlow.list.findIndex(item => CHAIN_BLOCK_ID_MAP.input + item.join('') + CHAIN_BLOCK_ID_MAP.speaker == baseFlowNew.join(''));
                if(patchIndex != -1) {
                    pdlNew = baseFlow.pdlVal;
                    srNew = baseFlow.srVal;
                    patchChainNew = patchIndex;
                    return false;
                }
            });

            chainDOMController.updateChainParam(patchChainNew, pdlNew, srNew, eqPos1New, eqPos2New);
        },

        turnOn: function (id, isTurnedOn) {
            blockModelMap[id].turnOn(isTurnedOn);
        },

        updateMode: function (id, mode) {
            // update Mode Div-Mix
            // blockModelMap[id].updateMode(mode);
        },

        clearFlash: function () {
            if (selectedBlock !== null) {
                blockModelMap[selectedBlock].toggleIsMoveSource();
                selectedBlock = null;
                chainDOMController.removeFlash();
            }
        },

        flash: function (id) {
            if (!blockModelMap[id].canMove) {
                return;
            }
            blockModelMap[id].toggleIsMoveSource();
            selectedBlock = id;
            chainDOMController.startFlash(id);
        },

        convert2ChainBlockIdOrder: function (blockNumOrder) {
            return [].concat(
                blockNumOrder.map(function (blockNum) {
                    return CHAIN_BLOCK_NUM_RELATION[blockNum];
                })
            );
        },

        convert2ChainBlockNumOrder: function (chainBlockIdOrder) {
            return chainBlockIdOrder.flatMap(function (blockId) {
                return [CHAIN_BLOCK_NUM_RELATION.indexOf(blockId)];
            });
        },

        updateChainList() {
            let patchChainItem = _items['patch_other_chain_switcher'];
            blockPatchChainVal = Parameter.value(patchChainItem.pid, patchChainItem.size, patchChainItem.vofs);
            let pdlItem = _items['pedalfx-position-select-box'];
            blockPdlVal = Parameter.value(pdlItem.pid, pdlItem.size, pdlItem.vofs);
            let srItem = _items['sr-position-select-box'];
            blockSrVal = Parameter.value(srItem.pid, srItem.size, srItem.vofs);
            let eqItem = _items['eq-position-select-box'];
            blockEq1Val = Parameter.value(eqItem.pid, eqItem.size, eqItem.vofs);
            let eq2Item = _items['eq2-position-select-box'];
            blockEq2Val = Parameter.value(eq2Item.pid, eq2Item.size, eq2Item.vofs);

            let nextEqFlow = CHAIN_EQ_FLOW.find(item => item.eqPos1 == blockEq1Val && item.eqPos2 == blockEq2Val);
            let targetBaseFlow = CHAIN_BASE_FLOW.find(item => item.pdlVal == blockPdlVal && item.srVal == blockSrVal).list[blockPatchChainVal];
            let ampIndex = targetBaseFlow.findIndex(item => item == "amp");
            let targetFullFlow = [CHAIN_BLOCK_ID_MAP.input, ...targetBaseFlow.slice(0, ampIndex), ...nextEqFlow.list, ...targetBaseFlow.slice(ampIndex + 1), CHAIN_BLOCK_ID_MAP.speaker];
            let newBlockNumArray = chainModelController.convert2ChainBlockNumOrder(targetFullFlow);

            if(blockNumOrder.join('') != newBlockNumArray.join('')) {
                chainModelController.updateChainBlockNumOrder(newBlockNumArray);
            }
        },

        checkUpdateChainIcon: function(effectId, typeName) {
            let blockIdOrder = this.convert2ChainBlockIdOrder(blockNumOrder);
            blockIdOrder.forEach(function (blockId) {
                let blockModel = blockModelMap[blockId];
                if(blockModel.isEffector() && blockModel.id == effectId && blockModel.typeName == typeName) {
                    chainModelController.updateChainBlockNumOrder();
                    return;
                }
            });
        }
    };

    window.chainDOMController = {
        updateChain: function (blockIdOrder) {
            $(CHAIN_HTML_ID.chain).empty();
            const indexOfFv = blockIdOrder.indexOf(CHAIN_BLOCK_ID_MAP.fv);
            const ifPrevIsFv = blockIdOrder[indexOfFv -1];
            blockIdOrder.forEach(function (blockId) {
                var blockModel = blockModelMap[blockId];
                $(CHAIN_HTML_ID.chain).append(blockModel.createDOM());

                if(CHAIN_BLOCK_NAME[blockModel.id]) {
                    $(CHAIN_HTML_ID.chain).append(blockModel.createDOMBlockName());
                }

                blockModel.lines.forEach(function (line) {
                    $(CHAIN_HTML_ID.chain).append(line.createDOM());
                });
            });
            $(`#line-${ifPrevIsFv}-1`).css('width', '60px');
            
            chainDOMController.updateWrapperSize(blockIdOrder);
            chainDOMController.assignBlockClickEvent();
            chainDOMController.updateStateBlockEvent(blockIdOrder);
            btsTipsController.showTipsChain(CHAIN_TIPS_RELATION[lastestSeleted] ? CHAIN_TIPS_RELATION[lastestSeleted] : "");
        },
        assignBlockClickEvent: function () {
            $(CHAIN_HTML_CLASSNAME.chainBlock).on('click', function () {
                let id = $(this).attr('id');
                if(id != lastestSeleted) {
                    btsTipsController.showTipsChain(CHAIN_TIPS_RELATION[id] ? CHAIN_TIPS_RELATION[id] : "");
                    lastestSeleted = id;
                }
                if(blockModelMap[id].canTurnOn) {
                    blockModelMap[id].toggleOnOff();
                    effectDOMController.turnOn(id, blockModelMap[id].isTurnedOn);
                }
            });

            // $(CHAIN_HTML_CLASSNAME.chainBlock).on('mouseenter', function () {
            //     if (hoveredBlockId === null) {
            //         hoveredBlockId = $(this).attr('id');
            //         blockModelMap[hoveredBlockId].hover(true);
            //     }
            // });

            // $(CHAIN_HTML_CLASSNAME.chainBlock).on('mouseleave', function () {
            //     if (hoveredBlockId !== null) {
            //         blockModelMap[hoveredBlockId].hover(false);
            //         hoveredBlockId = null;
            //     }
            // });

            $(".bgrSelected").on('mouseenter', function () {
                if (hoveredBlockId === null) {
                    hoveredBlockId = $(this).parents('.chain-block').attr('id');
                    blockModelMap[hoveredBlockId].hover(true);
                }
            });

            $(".bgrSelected").on('mouseleave', function () {
                if (hoveredBlockId !== null) {
                    blockModelMap[hoveredBlockId].hover(false);
                    hoveredBlockId = null;
                }
            });

            $(CHAIN_HTML_CLASSNAME.chainBlock).draggable({
                helper: 'clone',
                opacity: 0.8,
                revert: true,
                scroll: true,
                handle: ".bgrSelected",
                start: function (event, ui) {
                    var id = $(this).attr('id');
                    chainDOMController.startFlash(id);
                },
                drag: function (event, ui) {
                    let left = ui.position.left;
                    if (left > maxWidth - 48) {
                        ui.position.left = maxWidth - 48;
                    } else if (left < 0) {
                        ui.position.left = 0;
                    }
                    let top = ui.position.top;
                    if (top > maxHeight - 48) {
                        ui.position.top = maxHeight - 48;
                    } else if (top < -2) {
                        ui.position.top = -2;
                    }
                },
                stop: function (event, ui) {
                    chainDOMController.removeFlash();
                }
            });

            $(CHAIN_HTML_CLASSNAME.chainBlock).droppable({
                over: function (event, ui) {
                    // if (chainDOMController.hasAlreadyHovered()) {
                    //     $(CHAIN_HTML_CLASSNAME.flashing).css('display', 'none')
                    // }
                    var id = $(this).attr('id');
                    $('#' + id + '_flash').css('display', 'block');
                    $('#' + id + '_flash').addClass("droppable_out");
                },
                out: function (event, ui) {
                    var id = $(this).attr('id');
                    $(CHAIN_HTML_CLASSNAME.flashing).removeClass("droppable_out");
                },
                drop: function (event, ui) {
                    var id = $(this).attr('id');
                    if ($('#' + id + '_flash').css('display') === 'block') {
                        chainModelController.move($(ui.draggable).attr('id'), id);
                    }
                }
            });

            $('#' + CHAIN_BLOCK_ID_MAP.input).draggable('disable');
            $('#' + CHAIN_BLOCK_ID_MAP.speaker).draggable('disable').droppable('disable');

            if (!canDragBlock) {
                setTimeout(function () {
                    chainDOMController.disableDraggingBlock(true);
                });
            }
        },
        disableDraggingBlock: function (disabled) {
            $(CHAIN_HTML_CLASSNAME.chainBlock).draggable(disabled ? 'disable' : 'enable');
            if (!disabled) {
                $('#' + CHAIN_BLOCK_ID_MAP.input).draggable('disable');
                $('#' + CHAIN_BLOCK_ID_MAP.speaker).draggable('disable').droppable('disable');
            }
        },
        startFlash: function (id) {
            let idOrder = chainModelController.convert2ChainBlockIdOrder(blockNumOrder);
            blockModelMap[id].getMovablePositions(idOrder, blockPatchChainVal, blockEq1Val, blockEq2Val, blockPdlVal, blockSrVal).forEach(function (blockId) {
                let target = $('#' + blockId);
                let x = target.css('left').slice(0, -2);
                let y = target.css('top').slice(0, -2);
                $(CHAIN_HTML_ID.chain).append(
                    $('<div>')
                        .css('left', (blockId == CHAIN_BLOCK_ID_MAP.fv ? (parseInt(x) + target.width() + BLOCK_SPACE/2 - 34) : (parseInt(x) + target.width() + BLOCK_SPACE/2 - 24)) + 'px')
                        .css('top', (parseInt(y) + 30) + 'px')
                        .addClass(CHAIN_HTML_CLASSNAME.flashing.slice(1))
                        .attr('id', blockId + '_flash')
                );
            });
            $(CHAIN_HTML_CLASSNAME.flashing).on('click', function (e) {
                chainModelController.clearFlash();
                let targetId = $(this).attr('id').slice(0, -6);
                chainModelController.move(id, targetId);
            });
        },
        removeFlash: function () {
            $(CHAIN_HTML_CLASSNAME.flashing).remove();
        },
        findLeftEndBlockId: function () {
            var x = $(CHAIN_HTML_ID.chainParent).scrollLeft();
            return $.makeArray($(CHAIN_HTML_ID.chain + ' ' + CHAIN_HTML_CLASSNAME.chainBlock)).filter(function (dom) {
                return $(dom).hasClass(CHAIN_HTML_CLASSNAME.chainBlock.slice(1)) &&
                    parseInt($(dom).css('left').slice(0, -2)) > x && blockModelMap[$(dom).attr('id')].canMove;
            }).map(function (dom) {
                return $(dom).attr('id');
            });
        },
        updateWrapperSize: function (blockIdOrder) {
            let masterLeft = blockModelMap[CHAIN_BLOCK_ID_MAP.speaker].x;
            let maxY = blockIdOrder.reduce(function (acc, current) {
                return Math.max(acc, blockModelMap[current].y);
            }, 0);
            $(CHAIN_HTML_ID.chain).css({
                'margin-top': 36 + 'px'
            });
            maxWidth = masterLeft + 48 + 8;
            maxHeight = maxY + 48 + 48;
        },
        resetChainScroll: function () {
            $(CHAIN_HTML_ID.chainParent).scrollLeft(0);
        },
        hasAlreadyHovered: function () {
            var hasAlreadyHovered = false;
            $(CHAIN_HTML_CLASSNAME.flashing).each(function (index, element) {
                if ($(element).css('display') === 'block') {
                    hasAlreadyHovered = true;
                }
            });
            return hasAlreadyHovered;
        },
        updateStateBlockEvent: function(blockIdOrder) {
            blockIdOrder.forEach(function (blockId) {
                var blockModel = blockModelMap[blockId];
                blockModel.updateStateBlock();
            });
        },
        updateChainParam: function (patchChainNew, pdlNew, srNew, eqPos1New, eqPos2New) {
            if(patchChainNew != blockPatchChainVal) {
                $("#patch_other_chain_switcher").trigger('elf-change', patchChainNew);
                $("#patch_other_chain_switcher").trigger('elf-update', patchChainNew);
                blockPatchChainVal = patchChainNew;
            } 
            if(pdlNew != blockPdlVal) {
                $("#pedalfx-position-select-box").trigger('elf-change', pdlNew);
                $("#pedalfx-position-select-box").trigger('elf-update', pdlNew);
                
                blockPdlVal = pdlNew;
            }
            if(srNew != blockSrVal) {
                $("#sr-position-select-box").trigger('elf-change', srNew);
                $("#sr-position-select-box").trigger('elf-update', srNew);
                blockSrVal = srNew;
            }
            if(eqPos1New != blockEq1Val) {
                $("#eq-position-select-box").trigger('elf-change', eqPos1New);
                $("#eq-position-select-box").trigger('elf-update', eqPos1New);
                blockEq1Val = eqPos1New;
            }
            if(eqPos2New != blockEq2Val) {
                $("#eq2-position-select-box").trigger('elf-change', eqPos2New);
                $("#eq2-position-select-box").trigger('elf-update', eqPos2New);
                blockEq2Val = eqPos2New;
            }
            // MIDIController.dt1(nibble(ADDRESS_CONST.ADDRESS.CHAIN), '000104080A0E11' + value + '12031310');
        },
        assignBlockInitEvent: function () {
            CHAIN_CHANGE_ORDER_BY_EFFECT.forEach(chainItem => {
                _items[chainItem].deferred = false;
            });

            // Update State block on/off
            CHAIN_ON_OFF_SWITCH.forEach(chainItem => {
                _items[chainItem.switch].deferred = false;
                $('#' + chainItem.switch).on('elf-changed', function(e, v) {
                    blockModelMap[chainItem.chainId].turnOn(v);
                });
            });

            // Update type name
            CHAIN_TYPE_NAME_SWITCH.forEach(chainItem => {
                chainItem.switch.forEach(switchItem => {
                    $('#' + switchItem).on('elf-changed', function(e, v) {
                        // blockModelMap[chainItem.chainId].updateStateBlock();
                        chainModelController.updateChainBlockNumOrder(blockNumOrder);
                    });
                });
            });

            // Update Chain by effect change 
            CHAIN_CHANGE_ORDER_BY_EFFECT.forEach(effectItem => {
                $('#' + effectItem).on('elf-changed', function(e, v) {
                    chainModelController.updateChainList();
                });
            });
        }
    };

    window.chainMIDIController = {
        blockChain: new Array(11),
        convertFromRawOrderValue: function (value) {
            let arr = [];
            for (let i = 0; i < this.blockChain.length; i++) {
                arr.push(parseInt(value.slice(i * 2, (i + 1) * 2), 16));
            }
            return arr;
        },
        convert2RawOrderValue: function (value) {
            return value.map(function (num) {
                return hex2(num);
            }).join('');
        },
        receiveOrderChange: function (value, index) {
            let indexOfBlockChain = index - nibble(ADDRESS_CONST.ADDRESS.CHAIN_START);
            this.blockChain.splice(indexOfBlockChain + 1, 1, value);
            if (index === nibble(ADDRESS_CONST.ADDRESS.CHAIN_END)) {
                // add chain in-master
                this.blockChain.splice(0, 1, 0);
                this.blockChain.splice(10, 1, 16);
                chainModelController.updateChainBlockNumOrder(this.blockChain);
            }
        }
    };

    window.initializeChain = function () {
        chainDOMController.assignBlockInitEvent();
    };

    function getInitialBlockModelMap() {
        let result = {};
        /**
         * Chain Effector
         */
        result[CHAIN_BLOCK_ID_MAP.pedalFx] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.pedalFx, true);
        result[CHAIN_BLOCK_ID_MAP.bootster] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.bootster, true);
        result[CHAIN_BLOCK_ID_MAP.eq] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.eq, true);
        result[CHAIN_BLOCK_ID_MAP.amp] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.amp, false);
        result[CHAIN_BLOCK_ID_MAP.eq2] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.eq2, true);
        result[CHAIN_BLOCK_ID_MAP.mod] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.mod, true);
        result[CHAIN_BLOCK_ID_MAP.fx] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.fx, true);
        result[CHAIN_BLOCK_ID_MAP.delay1] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.delay1, true);
        result[CHAIN_BLOCK_ID_MAP.delay2] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.delay2, true);
        result[CHAIN_BLOCK_ID_MAP.reverb] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.reverb, true);
        result[CHAIN_BLOCK_ID_MAP.sendreturn] = new ChainEffector(result, CHAIN_BLOCK_ID_MAP.sendreturn, true);
        result[CHAIN_BLOCK_ID_MAP.fv] = new ChainFV(result);
        /**
         * Input & Master
         */
        result[CHAIN_BLOCK_ID_MAP.input] = new ChainInput(result);
        result[CHAIN_BLOCK_ID_MAP.speaker] = new ChainSpeaker(result);

        // Update init status of Chain EFFECT
        result[CHAIN_BLOCK_ID_MAP.amp].canSelect = false; 
        result[CHAIN_BLOCK_ID_MAP.amp].canMove = false; 
        result[CHAIN_BLOCK_ID_MAP.amp].canTurnOn = false; 
        result[CHAIN_BLOCK_ID_MAP.amp].isTurnedOn = true; 
        result[CHAIN_BLOCK_ID_MAP.amp].canHover = false; 

        result[CHAIN_BLOCK_ID_MAP.delay2].canSelect = false; 
        result[CHAIN_BLOCK_ID_MAP.delay2].canMove = false;
        result[CHAIN_BLOCK_ID_MAP.delay2].canHover = false; 
        result[CHAIN_BLOCK_ID_MAP.reverb].canSelect = false; 
        result[CHAIN_BLOCK_ID_MAP.reverb].canMove = false; 
        result[CHAIN_BLOCK_ID_MAP.reverb].canHover = false; 

        return result;
    }

    // window.effectDOMController = {
    //     turnOn: function (id, v) {
    //         let switchElm = $('#' + id + '-switch');
    //         switchElm.trigger('elf-update', v ? 1 : 0);
    //         switchElm.trigger('elf-change', v ? 1 : 0);
    //     },

    //     event: function () {
    //         BTN_SWITCH_DEFAULT_OFF.forEach(element => {
    //             chainModelController.turnOn(element, false);
    //         });

    //         BTN_SWITCH.forEach(ele => {
    //             $(`#${ele}-switch`).on('elf-changed', function (e, v) {
    //                 chainModelController.turnOn(ele, v !== 0);
    //             });
    //         });
    //     }
    // };
})();
