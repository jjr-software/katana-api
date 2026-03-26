/* global
ChainCell
*/

var ChainLine = function (blockModelMap, blockId, index, x, y) {
    ChainCell.call(this, blockModelMap, this.createLineId(blockId, index));
    this.blockId = blockId;
    this.x = x;
    this.y = y;
    this.tinyLineOffset = 1;
};

ChainLine.prototype = Object.create(ChainCell.prototype);
ChainLine.prototype.constructor = ChainLine;

ChainLine.prototype.LINE_IMAGE_PREFIX = 'effectpath_';
ChainLine.prototype.TINY_LINE_IMAGE_PREFIX = ChainLine.prototype.LINE_IMAGE_PREFIX.slice(0, -1) + '-s_';

ChainLine.prototype.getImage = function () {
    var suffix = this.blockModelMap[this.blockId].isLineOn ? this.IMAGE_SUFFIX : this.OFF_IMAGE_SUFFIX;
    return this.IMAGE_DIR_PATH + this.LINE_IMAGE_PREFIX + this.HORIZONTAL_LINE + suffix;
};
ChainLine.prototype.getTinyImage = function () {
    return this.IMAGE_DIR_PATH + this.TINY_LINE_IMAGE_PREFIX + this.HORIZONTAL_LINE + this.IMAGE_SUFFIX;
};
ChainLine.prototype.getClassName = function () {
    return 'chain-line';
};
ChainLine.prototype.getTinyClassName = function () {
    return 'tiny-chain-line';
};

ChainLine.prototype.createLineId = function (blockId, index) {
    return 'line-' + blockId + '-' + index;
};
ChainLine.prototype.updateId = function (index) {
    this.id = this.createLineId(this.blockId, index);
};