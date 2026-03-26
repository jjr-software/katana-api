/* global
ChainBlock ChainLine
BLOCK_WIDTH
*/

var ChainInput = function (chainModelMap, mainBgr) {
    ChainBlock.call(this, chainModelMap, this.BLOCK_ID_MAP.input, false, false, false, false);
    if(!mainBgr) {
        this.mainBgr = 'images/chain/effectblock_in@2x.png';
    }
    this.mainWidth = 40;
};

ChainInput.prototype = Object.create(ChainBlock.prototype);
ChainInput.prototype.constructor = ChainInput;

ChainInput.prototype.updateLines = function () {
    this.lines = [
        new ChainLine(this.blockModelMap, this.id, 1, this.x + this.mainWidth - BLOCK_SPACE/2, this.y + 30)
    ];
};