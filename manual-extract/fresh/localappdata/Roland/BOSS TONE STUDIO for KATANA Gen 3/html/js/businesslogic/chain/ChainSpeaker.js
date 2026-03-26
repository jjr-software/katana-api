/* global
ChainBlock
*/

var ChainSpeaker = function (chainModelMap, mainBgr) {
    ChainBlock.call(this, chainModelMap, this.BLOCK_ID_MAP.speaker, false, false, true, true);
    if(!mainBgr) {
        this.mainBgr = 'images/chain/effectblock_speaker@2x.png';
    }
    this.mainWidth = 56;
};

ChainSpeaker.prototype = Object.create(ChainBlock.prototype);
ChainSpeaker.prototype.constructor = ChainSpeaker;

ChainSpeaker.prototype.updateLines = function () {
    this.lines = [
        // new ChainLine(this.blockModelMap, this.id, 0, this.x - BLOCK_SPACE/2, this.y + 30)
    ];
}; 