/* global
ChainFV
*/

var ChainFV = function (chainModelMap, mainBgr) {
    ChainBlock.call(this, chainModelMap, this.BLOCK_ID_MAP.fv, false, false, false, false);
    if(!mainBgr) {
        this.mainBgr = 'images/chain/effectblock_fv@2x.png';
    }
    this.mainWidth = 21;
};

ChainFV.prototype = Object.create(ChainBlock.prototype);
ChainFV.prototype.constructor = ChainFV;

ChainFV.prototype.updateLines = function () {
    this.lines = [];
}; 