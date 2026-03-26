/* global
ChainCell ChainEffector ChainDivider ChainSplitter ChainMixer ChainBranchPoint ChainInput ChainSpeaker ChainStereoLink ChainLine
CHAIN_BLOCK_ID_MAP BLOCK_WIDTH_DEFAULT CHAIN_HTML_ID
util
*/

var ChainBlock = function (blockModelMap, id, canTurnOn, canMove, canSelect, canHover) {
    ChainCell.call(this, blockModelMap, id);
    this.lines = [];
    this.isLineOn = true;
    this.canTurnOn = canTurnOn;
    this.isTurnedOn = canTurnOn;
    this.canMove = canMove;
    this.isMoveSource = false;
    this.canSelect = canSelect;
    this.isSelected = false;
    this.canHover = canHover;
    this.isHovered = false;
};

ChainBlock.prototype = Object.create(ChainCell.prototype);
ChainBlock.prototype.constructor = ChainBlock;

// constants
ChainBlock.prototype.BLOCK_ID_MAP = CHAIN_BLOCK_ID_MAP;
ChainBlock.prototype.BLOCK_IMAGE_PREFIX = 'effectblock_';
ChainBlock.prototype.TINY_BLOCK_IMAGE_PREFIX = ChainBlock.prototype.BLOCK_IMAGE_PREFIX.slice(0, -1) + '-s_';
ChainBlock.prototype.MOVE_SOURCE_IMAGE_SUFFIX = '_move_src' + ChainCell.prototype.IMAGE_SUFFIX;
ChainBlock.prototype.SELECTED_IMAGE_SUFFIX = '_selected' + ChainCell.prototype.IMAGE_SUFFIX;
ChainBlock.prototype.HOVER_IMAGE_SUFFIX = '_hover' + ChainCell.prototype.IMAGE_SUFFIX;
ChainBlock.prototype.OFF_SELECTED_IMAGE_SUFFIX = '_off_selected' + ChainCell.prototype.IMAGE_SUFFIX;
ChainBlock.prototype.OFF_HOVER_IMAGE_SUFFIX = '_off_hover' + ChainCell.prototype.IMAGE_SUFFIX;
ChainBlock.prototype.OVERLAY_ID = 'overlay';

ChainBlock.prototype.getClassName = function () {
    return 'chain-block';
};
ChainBlock.prototype.getTinyClassName = function () {
    return 'tiny-chain-block';
};
ChainBlock.prototype.getImage = function () {
    if(this.mainBgr) {
        return this.mainBgr;
    }

    var suffix = this.getImageSuffix();
    let imgName = '';
    if(this.isEffector()) {
        switch(this.id) {
            case 'in':
            case 'speaker':
            case 'amp':
            case 'sr':
            case 'fv':
                imgName = this.id;
                break;
            default:
                imgName = 'default';
          }
    } else {
        imgName = this.id;
    }
    return this.IMAGE_DIR_PATH + this.BLOCK_IMAGE_PREFIX + imgName + suffix;
};
ChainBlock.prototype.getImageSuffix = function () {
    // if (this.canHover && this.isHovered) {
    //     if (!this.canTurnOn || this.isTurnedOn) {
    //         return this.HOVER_IMAGE_SUFFIX;
    //     } else {
    //         return this.OFF_HOVER_IMAGE_SUFFIX;
    //     }
    // } else if (this.canSelect && this.isSelected) {
    //     if (!this.canTurnOn || this.isTurnedOn) {
    //         return this.SELECTED_IMAGE_SUFFIX;
    //     } else {
    //         return this.OFF_SELECTED_IMAGE_SUFFIX;
    //     }
    // } else {

        if (!this.canTurnOn || this.isTurnedOn) {
            return this.IMAGE_SUFFIX;
        } else {
            return this.OFF_IMAGE_SUFFIX;
        }
    // }
};

ChainBlock.prototype.getTinyImage = function () {
    return this.IMAGE_DIR_PATH + this.TINY_BLOCK_IMAGE_PREFIX + this.getTinyBlockColor() + this.IMAGE_SUFFIX;
};

ChainBlock.prototype.updateLines = function (blockIdArray) {
        this.lines = [
            // new ChainLine(this.blockModelMap, this.id, 0, this.x - BLOCK_SPACE/2, this.y + 30),
            new ChainLine(this.blockModelMap, this.id, 1, this.x + this.mainWidth - BLOCK_SPACE/2, this.y + 30)
        ];
        // if (blockIdArray.indexOf(this.id) === blockIdArray.length - 2) {
        //     return;
        // } else {
        //     this.lines.push(
        //         new ChainLine(this.blockModelMap, this.id, 1, this.x + BLOCK_WIDTH_DEFAULT / 2, this.y + 47)
        //     );
        // }
};
ChainBlock.prototype.turnOn = function (isTurnedOn) {
    if (!this.canTurnOn) {
        return;
    }
    this.isTurnedOn = isTurnedOn;
    this.updateStateBlock();
    // this.reDrawTinyImage();
};
ChainBlock.prototype.toggleOnOff = function () {
    if (!this.canTurnOn) {
        return;
    }
    this.turnOn(!this.isTurnedOn);
};
ChainBlock.prototype.turnLineOn = function (isLineOn) {
    this.isLineOn = isLineOn;
    this.reDrawLineImage();
};
ChainBlock.prototype.resetLine = function (isLineOn) {
    this.isLineOn = isLineOn;
};
ChainBlock.prototype.reDrawLineImage = function () {
    this.lines.forEach(function (line) {
        line.updateStateBlock();
    });
};
ChainBlock.prototype.toggleIsMoveSource = function () {
    // for sp
    if (false || !this.canMove) {
        return;
    }
    this.isMoveSource = !this.isMoveSource;
    var overlayClassName = (this.id === CHAIN_BLOCK_ID_MAP.footVolume || this.id === CHAIN_BLOCK_ID_MAP.pedalFx) ? 'overlay-fv' : 'overlay';
    if (this.isMoveSource) {
        $('#' + this.id).css('background-image', 'url(' + this.IMAGE_DIR_PATH + this.BLOCK_IMAGE_PREFIX + this.id + this.MOVE_SOURCE_IMAGE_SUFFIX + ')');
        $(CHAIN_HTML_ID.chain).append($('<div>').attr('id', this.id + '-' + this.OVERLAY_ID).addClass(overlayClassName).css({
            'left': this.x + 'px',
            'top': this.y + 'px'
        }));
    } else {
        $('#' + this.id).css('background-image', 'url(' + this.getImage() + ')');
        $('#' + this.id + '-' + this.OVERLAY_ID).remove();
    }
};
ChainBlock.prototype.select = function (isSelected) {
    // for pc
    if (false || !this.canSelect) {
        return;
    }
    this.isSelected = isSelected;
    this.updateStateBlock();
};
ChainBlock.prototype.hover = function (isHovered) {
    // for pc
    if (false || !this.canHover) {
        return;
    }
    this.isHovered = isHovered;
    this.updateStateBlock();
};
ChainBlock.prototype.getTinyBlockColor = function () {
    if (this.canTurnOn && !this.isTurnedOn) {
        return 'off';
    }

    switch (this.id) {
        case this.BLOCK_ID_MAP.input: return 'gray';
        case this.BLOCK_ID_MAP.fx1:
        case this.BLOCK_ID_MAP.fx2: return 'purple';
        case this.BLOCK_ID_MAP.pedalFx: return 'pink';
        case this.BLOCK_ID_MAP.odds: return 'orange';
        case this.BLOCK_ID_MAP.amp: return 'yellow';
        case this.BLOCK_ID_MAP.speaker:
        case this.BLOCK_ID_MAP.noiseSuppressor: return 'green';
        case this.BLOCK_ID_MAP.footVolume: return 'gray';
        case this.BLOCK_ID_MAP.delay: return 'white';
        case this.BLOCK_ID_MAP.reverb: return 'cyan';
        default: return 'other';
    }
};
ChainBlock.prototype.isDivider = function () {
    return this instanceof ChainDivider;
};
ChainBlock.prototype.isSplitter = function () {
    return this instanceof ChainSplitter;
};
ChainBlock.prototype.isMixer = function () {
    return this instanceof ChainMixer;
};
ChainBlock.prototype.isBranchPoint = function () {
    return this instanceof ChainBranchPoint;
};
ChainBlock.prototype.isEffector = function () {
    return this instanceof ChainEffector;
};
ChainBlock.prototype.isInput = function () {
    return this instanceof ChainInput;
};
ChainBlock.prototype.isMaster = function () {
    return this instanceof ChainSpeaker;
};
ChainBlock.prototype.isStereoLink = function () {
    return this instanceof ChainStereoLink;
};
ChainBlock.prototype.isChainSpeakerOut = function () {
    return this instanceof ChainSpeakerOut;
};
ChainBlock.prototype.isChainSpeakerSimulator = function () {
    return this instanceof ChainSpeakerSimulator;
};
