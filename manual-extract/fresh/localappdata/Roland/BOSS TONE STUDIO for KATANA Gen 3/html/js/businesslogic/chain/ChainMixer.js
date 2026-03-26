/* global
ChainBranchPoint ChainBranchPointLine
BLOCK_WIDTH_DEFAULT BRANCH_POINT_LINE_TYPE
*/


var ChainMixer = function (chainModelMap, id) {
    ChainBranchPoint.call(this, chainModelMap, id);
};

ChainMixer.prototype = Object.create(ChainBranchPoint.prototype);
ChainMixer.prototype.constructor = ChainMixer;

ChainMixer.prototype.A_CORNER = 'corner2';
ChainMixer.prototype.A_SMALL_CORNER = 'corner6';
ChainMixer.prototype.B_CORNER = 'corner3';
ChainMixer.prototype.JUNCTION_6060 = 'line4-0';
ChainMixer.prototype.JUNCTION_3030 = 'line4-3';
ChainMixer.prototype.JUNCTION_6030 = 'line4-2';
ChainMixer.prototype.JUNCTION_3060 = 'line4-1';
ChainMixer.prototype.LAST_JUNCTION_6060 = 'line4-0-1';
ChainMixer.prototype.LAST_JUNCTION_3030 = 'line4-3-1';
ChainMixer.prototype.LAST_JUNCTION_6030 = 'line4-2-1';
ChainMixer.prototype.LAST_JUNCTION_3060 = 'line4-1-1';

ChainMixer.prototype.updateLines = function (currentX, splitterX, blockIdArray) {
    var dividerIndex = blockIdArray.indexOf(this.divider.id);
    var splitterIndex = blockIdArray.indexOf(this.splitter.id);
    var mixerIndex = blockIdArray.indexOf(this.mixer.id);
    if (dividerIndex + 1 === splitterIndex && splitterIndex + 1 === mixerIndex) {
        this.lines = [
            new ChainBranchPointLine(this.blockModelMap, this.id, 0, this.x, this.y, this.HORIZONTAL_LINE, BRANCH_POINT_LINE_TYPE.horizontal)
        ];
    } else {
        this.lines = [].concat(
            this.getABranchLine(),
            this.getJunctionLine(blockIdArray),
            this.getBBranchLine(),
            this.getPaddingLines(currentX, splitterX)
        );
        this.lines.forEach(function (line, index) {
            line.updateId(index);
        });
    }
};
ChainMixer.prototype.getMovablePositions = function (currentBlockIdArray) {
    var selfId = this.id;
    var divPos = currentBlockIdArray.indexOf(this.divider.id);
    var mixPos = currentBlockIdArray.indexOf(this.mixer.id);

    var chainOutsideArray = [];
    CHAIN_OUTSIDE_SPEAKER_SIMULATOR.forEach(function (value) {
        chainOutsideArray.push(currentBlockIdArray.indexOf(value))
    });

    var isBlockContainChainOutside = false;
    for (var i = divPos; i <= mixPos; i++) {
        if (chainOutsideArray.indexOf(i) !== -1) {
            isBlockContainChainOutside = true;
            break
        }
    }

    var movablePositions = [];
    if (isBlockContainChainOutside) {
        movablePositions = this.getMovablePositionsForBlockContainChainOutside(selfId, currentBlockIdArray);
    } else {
        movablePositions = ChainBranchPoint.prototype.getMovablePositions.call(this, currentBlockIdArray);
    }
    return movablePositions;
};
ChainMixer.prototype.getMovablePositionsForBlockContainChainOutside = function (selfId, currentBlockIdArray) {
    var keyList = Object.keys(CHAIN_SIMULATOR_OUT_PAIR);
    var unmovablePos = [];
    var resultArray = currentBlockIdArray;

    var simulatorId;
    var simulatorOutIndex;
    var simulatorIndex;

    var divPos = currentBlockIdArray.indexOf(this.divider.id);
    var mixPos = currentBlockIdArray.indexOf(this.mixer.id);
    for (var i = divPos - 1; i <= mixPos; i++) {
        unmovablePos = unmovablePos.concat(i);
    }

    for (var j = 0; j < keyList.length; j++) {
        simulatorId = CHAIN_SIMULATOR_OUT_PAIR[keyList[j]];
        simulatorOutIndex = currentBlockIdArray.indexOf(keyList[j]);
        simulatorIndex = currentBlockIdArray.indexOf(simulatorId);
        if (simulatorOutIndex === -1 || simulatorIndex === -1) {
            continue;
        }

        for (var k = simulatorIndex; k < simulatorOutIndex; k++) {
            unmovablePos = unmovablePos.concat(k);
        }
    }

    unmovablePos = unmovablePos.concat(currentBlockIdArray.length - 1);
    resultArray = resultArray.filter(function (chainName, index, array) {
        return unmovablePos.indexOf(index) === -1
    });

    return resultArray;
};


ChainMixer.prototype.getPaddingLines = function (currentX, splitterX) {
    var diff = currentX - splitterX;
    var x;
    var y;
    var lineType;
    if (diff < 0) {
        x = currentX;
        y = this.y + this.bBranchHeight;
        lineType = BRANCH_POINT_LINE_TYPE.bBranch;
    } else {
        x = splitterX;
        y = this.y - this.aBranchHeight;
        lineType = BRANCH_POINT_LINE_TYPE.aBranch;
    }
    var result = [];
    for (var i = 0; i < Math.abs(diff) / BLOCK_WIDTH; i++) {
        result.push(new ChainBranchPointLine(this.blockModelMap, this.id, i, x + i * BLOCK_WIDTH, y, this.HORIZONTAL_LINE, lineType));
    }
    return result;
};