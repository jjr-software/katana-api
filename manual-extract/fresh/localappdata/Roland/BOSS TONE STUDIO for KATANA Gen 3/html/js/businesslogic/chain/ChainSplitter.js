/* global
ChainBlock
*/

var ChainSplitter = function (chainModelMap, id) {
    ChainBlock.call(this, chainModelMap, id, false, false, false, false);

    this.divider = null;
    this.mixer = null;
    this.splitter = null;
};

ChainSplitter.prototype = Object.create(ChainBlock.prototype);
ChainSplitter.prototype.constructor = ChainSplitter;

ChainSplitter.prototype.getImage = function () {
    return null;
};
ChainSplitter.prototype.getTinyImage = function () {
    return null;
};
ChainSplitter.prototype.updateLines = function () {
    this.lines = [];
};

ChainSplitter.prototype.relate = function (divider, mixer, splitter) {
    this.divider = divider;
    this.mixer = mixer;
    this.splitter = splitter;
};