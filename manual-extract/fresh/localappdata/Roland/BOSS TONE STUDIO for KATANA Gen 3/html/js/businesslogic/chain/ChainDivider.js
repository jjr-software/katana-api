/* global
ChainBranchPoint ChainBranchPointLine
DIVIDER_MODE_ENUM BRANCH_POINT_LINE_TYPE
*/

var ChainDivider = function (chainModelMap, id) {
    ChainBranchPoint.call(this, chainModelMap, id);
};

ChainDivider.prototype = Object.create(ChainBranchPoint.prototype);
ChainDivider.prototype.constructor = ChainDivider;

ChainDivider.prototype.A_CORNER = 'corner1';
ChainDivider.prototype.A_SMALL_CORNER = 'corner5';
ChainDivider.prototype.B_CORNER = 'corner4';
ChainDivider.prototype.JUNCTION_6060 = 'line3-0';
ChainDivider.prototype.JUNCTION_3030 = 'line3-3';
ChainDivider.prototype.JUNCTION_6030 = 'line3-2';
ChainDivider.prototype.JUNCTION_3060 = 'line3-1';

ChainDivider.prototype.updateLines = function (blockIdArray) {
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
            this.getBBranchLine()
        );
        this.lines.forEach(function (line, index) {
            line.updateId(index);
        });
    }
};
ChainDivider.prototype.getMovablePositions = function (currentBlockIdArray) {
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
ChainDivider.prototype.getMovablePositionsForBlockContainChainOutside = function (selfId, currentBlockIdArray) {
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
ChainDivider.prototype.updateMode = function (mode) {
    this.mode = mode;
    this.mixer.mode = mode;
    this.turnChildLine();
};
ChainDivider.prototype.turnChildLine = function () {
    var self = this;
    if (!this.isLineOn) {
        this.aBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].turnLineOn(false);
        });
        this.bBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].turnLineOn(false);
        });
    } else if (this.mode === DIVIDER_MODE_ENUM.dual) {
        this.aBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].turnLineOn(true);
        });
        this.bBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].turnLineOn(true);
        });
    } else if (this.mode === DIVIDER_MODE_ENUM.singleA) {
        this.aBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].turnLineOn(true);
        });
        this.bBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].turnLineOn(false);
        });
    } else if (this.mode === DIVIDER_MODE_ENUM.singleB) {
        this.aBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].turnLineOn(false);
        });
        this.bBranchChildIds.forEach(function (blockId) {
            self.blockModelMap[blockId].turnLineOn(true);
        });
    }
    this.aBranchChildDividerIds.forEach(function (blockId) {
        self.blockModelMap[blockId].turnChildLine();
    });
    this.bBranchChildDividerIds.forEach(function (blockId) {
        self.blockModelMap[blockId].turnChildLine();
    });
    this.reDrawLineImage();
    this.mixer.reDrawLineImage();
};
