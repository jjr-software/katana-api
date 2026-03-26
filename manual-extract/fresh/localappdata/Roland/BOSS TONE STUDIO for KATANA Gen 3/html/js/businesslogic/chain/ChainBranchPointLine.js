/* global
ChainBlock ChainLine
BRANCH_POINT_LINE_TYPE DIVIDER_MODE_ENUM
*/

var ChainBranchPointLine = function (blockModelMap, blockId, index, x, y, lineImageName, lineType) {
    ChainLine.call(this, blockModelMap, blockId, index, x, y);
    this.lineImageName = lineImageName;
    this.lineType = lineType;
};

ChainBranchPointLine.prototype = Object.create(ChainLine.prototype);
ChainBranchPointLine.prototype.constructor = ChainBranchPointLine;

ChainBranchPointLine.prototype.DUAL_OFF_IMAGE_SUFFIX = '_off0' + ChainBlock.prototype.IMAGE_SUFFIX;
ChainBranchPointLine.prototype.SINGLE_A_MODE_IMAGE_SUFFIX = '_off1' + ChainBlock.prototype.IMAGE_SUFFIX;
ChainBranchPointLine.prototype.SINGLE_B_MODE_IMAGE_SUFFIX = '_off2' + ChainBlock.prototype.IMAGE_SUFFIX;

ChainBranchPointLine.prototype.getImage = function () {
    return this.IMAGE_DIR_PATH + this.LINE_IMAGE_PREFIX + this.lineImageName + this.getImageSuffix();
};
ChainBranchPointLine.prototype.getTinyImage = function () {
    return this.IMAGE_DIR_PATH + this.TINY_LINE_IMAGE_PREFIX + this.lineImageName + this.IMAGE_SUFFIX;
};
ChainBranchPointLine.prototype.getClassName = function () {
    var branchLineTypeClass = '';
    if (this.blockModelMap[this.blockId].isDivider()) {
        switch (this.lineType) {
            case BRANCH_POINT_LINE_TYPE.aBranch: {
                branchLineTypeClass = ' a-branch-line';
                break;
            }
            case BRANCH_POINT_LINE_TYPE.bBranch: {
                branchLineTypeClass = ' b-branch-line';
                break;
            }
            case BRANCH_POINT_LINE_TYPE.junction: {
                branchLineTypeClass = ' junction-branch-line';
                break;
            }
            case BRANCH_POINT_LINE_TYPE.horizontal: {
                branchLineTypeClass = ' horizontal-branch-line';
                break;
            }
        }
    }
    return 'chain-line' + branchLineTypeClass;
};


ChainBranchPointLine.prototype.getImageSuffix = function () {
    if (this.lineType === BRANCH_POINT_LINE_TYPE.junction) {
        if (!this.blockModelMap[this.blockId].isLineOn) {
            return this.DUAL_OFF_IMAGE_SUFFIX;
        }
        switch (this.blockModelMap[this.blockId].mode) {
            case DIVIDER_MODE_ENUM.dual: return this.IMAGE_SUFFIX;
            case DIVIDER_MODE_ENUM.singleA: return this.SINGLE_A_MODE_IMAGE_SUFFIX;
            case DIVIDER_MODE_ENUM.singleB: return this.SINGLE_B_MODE_IMAGE_SUFFIX;
        }
    } else {
        if (
            !this.blockModelMap[this.blockId].isLineOn ||
            (this.blockModelMap[this.blockId].mode === DIVIDER_MODE_ENUM.singleA && this.lineType === BRANCH_POINT_LINE_TYPE.bBranch) ||
            (this.blockModelMap[this.blockId].mode === DIVIDER_MODE_ENUM.singleB && this.lineType === BRANCH_POINT_LINE_TYPE.aBranch)) {
            return this.OFF_IMAGE_SUFFIX;
        }
        return this.IMAGE_SUFFIX;
    }
};
