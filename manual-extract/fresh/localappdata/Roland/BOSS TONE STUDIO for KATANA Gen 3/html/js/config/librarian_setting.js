//
//	librarian_setting.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

function LibrarianSetting(paramSets, rows, bid) {
	var _blockSet = [];
	for (var i = 0, len = paramSets.length; i < len; i++) {
		for (var n = 0, num = paramSets[i].length; n < num; n++) {
			_blockSet.push(paramSets[i][n]);
		}
	}
	this.blockSet = _blockSet;
	this.temporarySet = {};
	(function(blockSet, temporarySet){
		for (var n = 0, max = blockSet.length; n < max; n++) {
			// temporarySet[blockSet[n]] = blockSet[n].replace(bid, 'Temporary');
			temporarySet[blockSet[n]] = blockSet[n].replace(bid, 'PATCH');
		}
	})(this.blockSet, this.temporarySet);
	this.rows = rows;
}

LibrarianSetting.prototype = {
	readStart:	function(midi) {},
	readStop:	function(midi) {},
	writeStart:	function(midi) {},
	writeCommand:function(midi) {},
	writeStop:	function(midi) {},
	writeTemporaryStart:function(midi, row) {},
	writeTemporaryStop:	function(midi) {},
	previewStart:	function(midi) {},
	previewStop:	function(midi) {}
}

function LibrarianSettingUserPatch() {

	// this.blockSetCom = [
	// 	'UserPatch%PatchName',
	// 	'UserPatch%Patch_0',
	// 	'UserPatch%Fx(1)',
	// 	'UserPatch%Fx(2)',
	// 	'UserPatch%Delay(1)',
	// 	'UserPatch%Delay(2)',
	// 	'UserPatch%Patch_1',
	// 	'UserPatch%Patch_2',
	// 	'UserPatch%Status',
	// 	'UserPatch%KnobAsgn',
	// 	'UserPatch%ExpPedalAsgn',
	// 	'UserPatch%ExpPedalAsgnMinMax',
	// 	'UserPatch%GafcExp1Asgn',
	// 	'UserPatch%GafcExp1AsgnMinMax',
	// 	'UserPatch%GafcExp2Asgn',
	// 	'UserPatch%GafcExp2AsgnMinMax',
	// 	'UserPatch%FsAsgn',				//Ver200
	// 	'UserPatch%Patch_Mk2V2',		//Ver200
	// 	'UserPatch%Contour(1)',			//Ver200
	// 	'UserPatch%Contour(2)',			//Ver200
	// 	'UserPatch%Contour(3)',			//Ver200
	// 	'UserPatch%GafcExp3Asgn',			//Ver201
	// 	'UserPatch%GafcExp3AsgnMinMax',		//Ver201
	// 	'UserPatch%GafcExExp1Asgn',			//Ver201
	// 	'UserPatch%GafcExExp1AsgnMinMax',	//Ver201
	// 	'UserPatch%GafcExExp2Asgn',			//Ver201
	// 	'UserPatch%GafcExExp2AsgnMinMax',	//Ver201
	// 	'UserPatch%GafcExExp3Asgn',			//Ver201
	// 	'UserPatch%GafcExExp3AsgnMinMax',	//Ver201
	// 	'UserPatch%CtrlAsgn',				//Ver201
	// ];
	this.blockSetCom = [
		'PATCH%COM',
		'PATCH%OTHER',
		'PATCH%COLOR',
		'PATCH%PATCH_KNOB_READONLY',
		'PATCH%PATCH_KNOB_SOLO_DELAY_READONLY',
		'PATCH%AMP',
		'PATCH%SW',
		'PATCH%BOOSTER(1)',
		'PATCH%BOOSTER(2)',
		'PATCH%BOOSTER(3)',
		'PATCH%FX(1)',
		'PATCH%FX(2)',
		'PATCH%FX(3)',
		'PATCH%FX(4)',
		'PATCH%FX(5)',
		'PATCH%FX(6)',
		'PATCH%FX_DETAIL(1)',
		'PATCH%FX_DETAIL(2)',
		'PATCH%FX_DETAIL(3)',
		'PATCH%FX_DETAIL(4)',
		'PATCH%FX_DETAIL(5)',
		'PATCH%FX_DETAIL(6)',
		'PATCH%DELAY(1)',
		'PATCH%DELAY(2)',
		'PATCH%DELAY(3)',
		'PATCH%DELAY(4)',
		'PATCH%DELAY(5)',
		'PATCH%DELAY(6)',
		'PATCH%REVERB(1)',
		'PATCH%REVERB(2)',
		'PATCH%REVERB(3)',
		'PATCH%SOLO_COM',
		'PATCH%SOLO_EQ',
		'PATCH%SOLO_DELAY',
		'PATCH%CONTOUR_COM',
		'PATCH%CONTOUR(1)',
		'PATCH%CONTOUR(2)',
		'PATCH%CONTOUR(3)',
		'PATCH%PEDALFX_COM',
		'PATCH%PEDALFX',
		'PATCH%EQ_EACH(1)',
		'PATCH%EQ_EACH(2)',
		'PATCH%EQ_PEQ(1)',
		'PATCH%EQ_PEQ(2)',
		'PATCH%EQ_GE10(1)',
		'PATCH%EQ_GE10(2)',
		'PATCH%NS',
		'PATCH%SENDRETURN',
		'PATCH%ASSIGN_KNOBS',
		'PATCH%ASSIGN_EXPPDL_FUNC',
		'PATCH%ASSIGN_EXPPDL_DETAIL',
		'PATCH%ASSIGN_EXPPDL_MIN',
		'PATCH%ASSIGN_EXPPDL_MAX',
		'PATCH%ASSIGN_FS',
		'PATCH%ASSIGN_GAFCFS(1)',
		'PATCH%ASSIGN_GAFCFS(2)',
		'PATCH%ASSIGN_GAFCEXPPDL1_FUNC(1)',
		'PATCH%ASSIGN_GAFCEXPPDL1_FUNC(2)',
		'PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(1)',
		'PATCH%ASSIGN_GAFCEXPPDL1_DETAIL(2)',
		'PATCH%ASSIGN_GAFCEXPPDL1_MIN(1)',
		'PATCH%ASSIGN_GAFCEXPPDL1_MIN(2)',
		'PATCH%ASSIGN_GAFCEXPPDL1_MAX(1)',
		'PATCH%ASSIGN_GAFCEXPPDL1_MAX(2)',
		'PATCH%ASSIGN_GAFCEXPPDL2_FUNC(1)',
		'PATCH%ASSIGN_GAFCEXPPDL2_FUNC(2)',
		'PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(1)',
		'PATCH%ASSIGN_GAFCEXPPDL2_DETAIL(2)',
		'PATCH%ASSIGN_GAFCEXPPDL2_MIN(1)',
		'PATCH%ASSIGN_GAFCEXPPDL2_MIN(2)',
		'PATCH%ASSIGN_GAFCEXPPDL2_MAX(1)',
		'PATCH%ASSIGN_GAFCEXPPDL2_MAX(2)',
		'PATCH%ASSIGN_GAFCEXPPDL3_FUNC(1)',
		'PATCH%ASSIGN_GAFCEXPPDL3_FUNC(2)',
		'PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(1)',
		'PATCH%ASSIGN_GAFCEXPPDL3_DETAIL(2)',
		'PATCH%ASSIGN_GAFCEXPPDL3_MIN(1)',
		'PATCH%ASSIGN_GAFCEXPPDL3_MIN(2)',
		'PATCH%ASSIGN_GAFCEXPPDL3_MAX(1)',
		'PATCH%ASSIGN_GAFCEXPPDL3_MAX(2)',
	]
	this.blockSetEq2 = [
		// 'UserPatch%Eq(2)'
	];
	this.ExclusionSet = [
		// 'UserPatch%Status'
	];

	LibrarianSetting.call(this, [this.blockSetCom, this.blockSetEq2], 10, 'PATCH');

	this.columnInfo = [
		{ type: 'text16', width: '16' },
	];
	this.value = function(paramSet, column) {
		var text = '';
		// var data = paramSet['UserPatch%PatchName'];
		var data = paramSet['PATCH%COM'];
		for (var i = 0; i < 16; i++) {
			text += String.fromCharCode(parseInt(data[i], 16));
		}
		return text;
	}
	this.setValue = function(paramSet, column, value) {
		// var data = paramSet['UserPatch%PatchName'];
		var data = paramSet['PATCH%COM'];
		for (var i = 0; i < 16; i++) {
			var code = (i < value.length) ? value.charCodeAt(i) : 32;
			if (code < 32 || code > 127) code = 32;
			data[i] = code.toString(16);
		}
	}
}
LibrarianSettingUserPatch.prototype = Object.create(LibrarianSetting.prototype);
