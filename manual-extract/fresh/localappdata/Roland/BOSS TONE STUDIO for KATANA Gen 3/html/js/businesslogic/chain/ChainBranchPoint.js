/* global
ChainBlock ChainBranchPointLine
CHAIN_HTML_ID DIVIDER_MODE_ENUM BRANCH_POINT_LINE_TYPE BLOCK_WIDTH
util
*/

var ChainBranchPoint = function (blockModelMap, id) {
    ChainBlock.call(this, blockModelMap, id, false, true, true, true);
    this.divider = null;
    this.mixer = null;
    this.splitter = null;

    this.mode = DIVIDER_MODE_ENUM.singleA;
    this.aBranchChildIds = [];
    this.bBranchChildIds = [];
    this.aBranchChildDividerIds = [];
    this.bBranchChildDividerIds = [];
    this.isNested = false;
    this.aBranchHeight = 48;
    this.bBranchHeight = 48;
    this.offsetY = 48;
};

ChainBranchPoint.prototype = Object.create(ChainBlock.prototype);
ChainBranchPoint.prototype.constructor = ChainBranchPoint;

ChainBranchPoint.prototype.VERTICAL_LINE = 'line2';
ChainBlock.prototype.SELECTED_HOVER_IMAGE_SUFFIX = '_selected_hover' + ChainCell.prototype.IMAGE_SUFFIX;

ChainBranchPoint.prototype.getImageSuffix = function () {
    if (this.canHover && this.isHovered) {
        if (this.canSelect && this.isSelected) {
            return this.SELECTED_HOVER_IMAGE_SUFFIX;
        } else {
            return this.HOVER_IMAGE_SUFFIX;
        }
    } else if (this.canSelect && this.isSelected) {
        return this.SELECTED_IMAGE_SUFFIX;
    } else {
        return this.IMAGE_SUFFIX;
    }
};

ChainBranchPoint.prototype.getTinyImage = function () {
    return null;
};

ChainBranchPoint.prototype.relate = function (divider, mixer, splitter) {
    this.divider = divider;
    this.mixer = mixer;
    this.splitter = splitter;
};

ChainBranchPoint.prototype.toggleIsMoveSource = function () {
    // for sp
    if (false || !this.canMove) {
        return;
    }
    this.isMoveSource = !this.isMoveSource;
    if (this.isMoveSource) {
        $('#' + this.divider.id).css('background-image', 'url(' + this.IMAGE_DIR_PATH + this.BLOCK_IMAGE_PREFIX + this.divider.id + this.MOVE_SOURCE_IMAGE_SUFFIX + ')');
        $(CHAIN_HTML_ID.chain).append($('<div>').attr('id', this.divider.id + '-' + this.OVERLAY_ID).addClass('overlay-div').css({
            'left': this.divider.x + 'px',
            'top': this.divider.y + 'px'
        }));
        $('#' + this.mixer.id).css('background-image', 'url(' + this.IMAGE_DIR_PATH + this.BLOCK_IMAGE_PREFIX + this.mixer.id + this.MOVE_SOURCE_IMAGE_SUFFIX + ')');
        $(CHAIN_HTML_ID.chain).append($('<div>').attr('id', this.mixer.id + '-' + this.OVERLAY_ID).addClass('overlay-div').css({
            'left': this.mixer.x + 'px',
            'top': this.mixer.y + 'px'
        }));
    } else {
        $('#' + this.divider.id).css('background-image', 'url(' + this.divider.getImage() + ')');
        $('#' + this.mixer.id).css('background-image', 'url(' + this.mixer.getImage() + ')');
        $('#' + this.divider.id + '-' + this.OVERLAY_ID).remove();
        $('#' + this.mixer.id + '-' + this.OVERLAY_ID).remove();
    }
};
ChainBranchPoint.prototype.getNewBlockIdArray = function (currentBlockIdArray, targetId) {
    var dividerIndex = currentBlockIdArray.indexOf(this.divider.id);
    var mixerIndex = currentBlockIdArray.indexOf(this.mixer.id);
    var resultArray = currentBlockIdArray.slice(0, dividerIndex)
        .concat(currentBlockIdArray.slice(mixerIndex + 1));
    var dividerArray = currentBlockIdArray.slice(dividerIndex, mixerIndex + 1);
    var targetIndex = resultArray.indexOf(targetId);
    return resultArray.slice(0, targetIndex + 1)
        .concat(dividerArray, resultArray.slice(targetIndex + 1));
};
ChainBranchPoint.prototype.getMovablePositions = function (currentBlockIdArray) {
    var dividerIndex = currentBlockIdArray.indexOf(this.divider.id);
    var mixerIndex = currentBlockIdArray.indexOf(this.mixer.id);
    return currentBlockIdArray.filter(function (chainName, index, array) {
        if (index >= dividerIndex - 1 && index <= mixerIndex) {
            return false;
        }
        if (index === currentBlockIdArray.length - 1) {
            return false;
        }
        return true;
    });
};

ChainBranchPoint.prototype.updateABranchChildIds = function (blockOrder) {
    var dividerIndex = blockOrder.indexOf(this.divider.id);
    var splitterIndex = blockOrder.indexOf(this.splitter.id);
    var aBranchChildIds = blockOrder.filter(function (blockId, index) {
        return dividerIndex < index && index <= splitterIndex;
    });
    this.divider.aBranchChildIds = aBranchChildIds;
    this.mixer.aBranchChildIds = aBranchChildIds;
};
ChainBranchPoint.prototype.updateBBranchChildIds = function (blockOrder) {
    var splitterIndex = blockOrder.indexOf(this.splitter.id);
    var mixerIndex = blockOrder.indexOf(this.mixer.id);
    var bBranchChildIds = blockOrder.filter(function (blockId, index) {
        return splitterIndex < index && index < mixerIndex;
    });
    this.divider.bBranchChildIds = bBranchChildIds;
    this.mixer.bBranchChildIds = bBranchChildIds;
};
ChainBranchPoint.prototype.getChildDividerIds = function (array) {
    var divider = this.divider;
    return array.filter(function (blockId) {
        return divider.blockModelMap[blockId].isDivider() && !divider.blockModelMap[blockId].getIsNested(array);
    });
};
ChainBranchPoint.prototype.updateABranchChildDividerIds = function () {
    var aBranchChildDividerIds = this.getChildDividerIds(this.aBranchChildIds);
    this.divider.aBranchChildDividerIds = aBranchChildDividerIds;
    this.mixer.aBranchChildDividerIds = aBranchChildDividerIds;
};
ChainBranchPoint.prototype.updateBBranchChildDividerIds = function () {
    var bBranchChildDividerIds = this.getChildDividerIds(this.bBranchChildIds);
    this.divider.bBranchChildDividerIds = bBranchChildDividerIds;
    this.mixer.bBranchChildDividerIds = bBranchChildDividerIds;
};
ChainBranchPoint.prototype.getIsNested = function (array) {
    var divider = this.divider;
    var dividerIndex = array.indexOf(this.divider.id);
    return array.some(function (blockId, index) {
        return divider.blockModelMap[blockId].isDivider() && index < dividerIndex && dividerIndex < array.indexOf(divider.blockModelMap[blockId].mixer.id);
    });
};
ChainBranchPoint.prototype.updateIsNested = function (blockOrder) {
    this.isNested = this.getIsNested(blockOrder);
};
ChainBranchPoint.prototype.getOffsetY = function () {
    var divider = this.divider;
    return this.aBranchChildDividerIds.reduce(function (acc, current) {
        return Math.max(acc, divider.blockModelMap[current].getOffsetY());
    }, 0) + this.divider.aBranchHeight;
};
ChainBranchPoint.prototype.updateOffsetY = function () {
    var offsetY = this.divider.getOffsetY();
    this.divider.offsetY = offsetY;
    this.mixer.offsetY = offsetY;
};
ChainBranchPoint.prototype.updateBranchHeight = function () {
    var divider = this.divider;
    if (this.aBranchChildDividerIds.length === 0 && this.bBranchChildDividerIds.length === 0) {
        if (this.isNested) {
            this.divider.aBranchHeight = 24;
            this.mixer.aBranchHeight = 24;
            this.divider.bBranchHeight = 24;
            this.mixer.bBranchHeight = 24;
        } else {
            this.divider.aBranchHeight = 48;
            this.mixer.aBranchHeight = 48;
            this.divider.bBranchHeight = 48;
            this.mixer.bBranchHeight = 48;
        }
    } else if (this.aBranchChildDividerIds.length > 0 && this.bBranchChildDividerIds.length > 0) {
        this.divider.aBranchHeight = 48;
        this.mixer.aBranchHeight = 48;
        this.divider.bBranchHeight = 48;
        this.mixer.bBranchHeight = 48;
    } else if (this.aBranchChildDividerIds.length > 0) {
        if (this.aBranchChildDividerIds.some(function (id) {
            return divider.blockModelMap[id].bBranchChildDividerIds.length > 0;
        })) {
            this.divider.aBranchHeight = 48;
            this.mixer.aBranchHeight = 48;
            this.divider.bBranchHeight = 72;
            this.mixer.bBranchHeight = 72;
        } else {
            this.divider.aBranchHeight = 48;
            this.mixer.aBranchHeight = 48;
            this.divider.bBranchHeight = 24;
            this.mixer.bBranchHeight = 24;
        }
    } else if (this.bBranchChildDividerIds.length > 0) {
        if (this.bBranchChildDividerIds.some(function (id) {
            return divider.blockModelMap[id].aBranchChildDividerIds.length > 0;
        })) {
            this.divider.aBranchHeight = 72;
            this.mixer.aBranchHeight = 72;
            this.divider.bBranchHeight = 48;
            this.mixer.bBranchHeight = 48;
        } else {
            this.divider.aBranchHeight = 24;
            this.mixer.aBranchHeight = 24;
            this.divider.bBranchHeight = 48;
            this.mixer.bBranchHeight = 48;
        }
    }
};

ChainBranchPoint.prototype.getABranchLine = function () {
    switch (this.aBranchHeight) {
        case 72: {
            return [
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y - 72 / 48 * BLOCK_WIDTH, this.A_CORNER, BRANCH_POINT_LINE_TYPE.aBranch),
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y - 48 / 48 * BLOCK_WIDTH, this.VERTICAL_LINE, BRANCH_POINT_LINE_TYPE.aBranch)
            ];
        }
        case 48: {
            return [
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y - 48 / 48 * BLOCK_WIDTH, this.A_CORNER, BRANCH_POINT_LINE_TYPE.aBranch)
            ];
        }
        case 24: {
            return [
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y - 48 / 48 * BLOCK_WIDTH, this.A_SMALL_CORNER, BRANCH_POINT_LINE_TYPE.aBranch)
            ];
        }
    }
};
ChainBranchPoint.prototype.getBBranchLine = function () {
    switch (this.bBranchHeight) {
        case 72: {
            return [
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y + 24 / 48 * BLOCK_WIDTH, this.VERTICAL_LINE, BRANCH_POINT_LINE_TYPE.bBranch),
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y + 72 / 48 * BLOCK_WIDTH, this.B_CORNER, BRANCH_POINT_LINE_TYPE.bBranch)
            ];
        }
        case 48: {
            return [
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y + 48 / 48 * BLOCK_WIDTH, this.B_CORNER, BRANCH_POINT_LINE_TYPE.bBranch)
            ];
        }
        case 24: {
            return [];
        }
    }
};
ChainBranchPoint.prototype.getJunctionLine = function (blockIdArray) {
    var isLastBlock = false;
    if (blockIdArray.indexOf(this.id) === blockIdArray.length - 2) {
        isLastBlock = true;
    }
    var lineImage;
    if (this.aBranchHeight === 72 || this.bBranchHeight === 72) {
        lineImage = isLastBlock ? this.LAST_JUNCTION_6060 : this.JUNCTION_6060;
        return [
            new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y, lineImage, BRANCH_POINT_LINE_TYPE.junction)
        ];
    } else if (this.aBranchHeight === this.bBranchHeight) {
        if (this.aBranchHeight === 48) {
            lineImage = isLastBlock ? this.LAST_JUNCTION_6060 : this.JUNCTION_6060;
            return [
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y, lineImage, BRANCH_POINT_LINE_TYPE.junction)
            ];
        } else {
            lineImage = isLastBlock ? this.LAST_JUNCTION_3030 : this.JUNCTION_3030;
            return [
                new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y, lineImage, BRANCH_POINT_LINE_TYPE.junction)
            ];
        }
    } else if (this.aBranchHeight > this.bBranchHeight) {
        lineImage = isLastBlock ? this.LAST_JUNCTION_6030 : this.JUNCTION_6030;
        return [
            new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y, lineImage, BRANCH_POINT_LINE_TYPE.junction)
        ];
    } else if (this.aBranchHeight < this.bBranchHeight) {
        lineImage = isLastBlock ? this.LAST_JUNCTION_3060 : this.JUNCTION_3060;
        return [
            new ChainBranchPointLine(this.blockModelMap, this.id, 1, this.x, this.y, lineImage, BRANCH_POINT_LINE_TYPE.junction)
        ];
    }
};
ChainBranchPoint.prototype.resetChildLine = function () {
    var self = this;
    if (!this.isLineOn) {
        this.aBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].resetLine(false);
        });
        this.bBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].resetLine(false);
        });
    } else if (this.mode === DIVIDER_MODE_ENUM.dual) {
        this.aBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].resetLine(true);
        });
        this.bBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].resetLine(true);
        });
    } else if (this.mode === DIVIDER_MODE_ENUM.singleA) {
        this.aBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].resetLine(true);
        });
        this.bBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].resetLine(false);
        });
    } else if (this.mode === DIVIDER_MODE_ENUM.singleB) {
        this.aBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].resetLine(false);
        });
        this.bBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].resetLine(true);
        });
    }
    this.aBranchChildDividerIds.forEach(function (blockId) {
        self.blockModelMap[blockId].resetChildLine();
    });
    this.bBranchChildDividerIds.forEach(function (blockId) {
        self.blockModelMap[blockId].resetChildLine();
    });
};
