//
//	editor_setting.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

/* データ保存用Key */
var STORAGE_KEY = Object.freeze({
	DO_NOT_SHOW_AGAIN_BTX_WARNING_OF_UNDER_CONSTRUCTION: 'DO_NOT_SHOW_AGAIN_BTX_WARNING_OF_UNDER_CONSTRUCTION',
	DO_NOT_SHOW_AGAIN_BTX_WARNING_OF_LEADING_TO_UPDATE: 'DO_NOT_SHOW_AGAIN_BTX_WARNING_OF_LEADING_TO_UPDATE',
});

function EditorSetting(paramSets) {
	var _blockSet = [];
	for (var i = 0, len = paramSets.length; i < len; i++) {
		for (var n = 0, num = paramSets[i].length; n < num; n++) {
			_blockSet.push(paramSets[i][n]);
		}
	}
	this.blockSet = _blockSet;
	this.parts = 0;
}

EditorSetting.prototype = {
	readStart:		function(midi) {},
	readStop:		function(midi) {},
	syncStart:		function(midi) {},
	syncStop:		function(midi) {},
	previewStart:	function(midi, part) {},
	previewStop:	function(midi) {}
}

function EditorSettingPatch() {

	// this.blockSetCom = [
	// 	'Temporary%PatchName',
	// 	'Temporary%Patch_0',
	// 	'Temporary%Fx(1)',
	// 	'Temporary%Fx(2)',
	// 	'Temporary%Delay(1)',
	// 	'Temporary%Delay(2)',
	// 	'Temporary%Patch_1',
	// 	'Temporary%Patch_2',
	// 	'Temporary%Status',
	// 	'Temporary%KnobAsgn',
	// 	'Temporary%ExpPedalAsgn',
	// 	'Temporary%ExpPedalAsgnMinMax',
	// 	'Temporary%GafcExp1Asgn',
	// 	'Temporary%GafcExp1AsgnMinMax',
	// 	'Temporary%GafcExp2Asgn',
	// 	'Temporary%GafcExp2AsgnMinMax',
	// 	'Temporary%FsAsgn',				//Ver200
	// 	'Temporary%Patch_Mk2V2',		//Ver200
	// 	'Temporary%Contour(1)',			//Ver200
	// 	'Temporary%Contour(2)',			//Ver200
	// 	'Temporary%Contour(3)',			//Ver200
	// 	'Temporary%GafcExp3Asgn',			//Ver201
	// 	'Temporary%GafcExp3AsgnMinMax',		//Ver201
	// 	'Temporary%GafcExExp1Asgn',			//Ver201
	// 	'Temporary%GafcExExp1AsgnMinMax',	//Ver201
	// 	'Temporary%GafcExExp2Asgn',			//Ver201
	// 	'Temporary%GafcExExp2AsgnMinMax',	//Ver201
	// 	'Temporary%GafcExExp3Asgn',			//Ver201
	// 	'Temporary%GafcExExp3AsgnMinMax',	//Ver201
	// 	'Temporary%CtrlAsgn',				//Ver201
	// ];
	// this.blockSetEq2 = [
	// 	'Temporary%Eq(2)'
	// ];
	this.blockSetCom = [
		'PATCH%COM',
		'PATCH%OTHER',
		'PATCH%COLOR',
		'PATCH%PATCH_KNOB_READONLY',
		'PATCH%PATCH_KNOB_SOLO_DELAY_READONLY',
		// 'TEMP%TEMP_COM',
		// 'TEMP%TEMP_KNOB',
		// 'TEMP%TEMP_KNOB_SOLO_DELAY',
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
	this.blockSetEq2 = []

	EditorSetting.call(this, [this.blockSetCom, this.blockSetEq2]);
}
EditorSettingPatch.prototype = Object.create(EditorSetting.prototype);

function EditorSettingSystem() {

	// this.blockSetCom = [
	// 	'System%System',
	// 	'System%Info',
	// 	'System%Midi',
	// 	'System%LineoutCustom',				//Ver200
	// 	'System%LineoutCustomSetting(1)',	//Ver200
	// 	'System%LineoutCustomSetting(2)',	//Ver200
	// 	'System%GafcSetting',				//Ver201
	// 	'System%SysPwrAdj',					//Ver210
	// ];
	// this.blockSetToneShape = [
	// 	'System%SysEqSel',
	// 	'System%SysEq(1)',
	// 	'System%SysEq(2)',
	// 	'System%SysEq(3)'
	// ];

	this.blockSetCom = [
		'SYSTEM%COM',
		'SYSTEM%USB_COM',
		'SYSTEM%GLOBAL_COM',
		'SYSTEM%GLOBAL_EACH(1)',
		'SYSTEM%GLOBAL_EACH(2)',
		'SYSTEM%GLOBAL_EACH(3)',
		'SYSTEM%GLOBAL_PEQ(1)',
		'SYSTEM%GLOBAL_PEQ(2)',
		'SYSTEM%GLOBAL_PEQ(3)',
		'SYSTEM%GLOBAL_GE10(1)',
		'SYSTEM%GLOBAL_GE10(2)',
		'SYSTEM%GLOBAL_GE10(3)',
		'SYSTEM%LINEOUT_COM',
		'SYSTEM%LINEOUT(1)',
		'SYSTEM%LINEOUT(2)',
		'SYSTEM%POWERAMPIN',
		'SYSTEM%POWERADJUST',
		'SYSTEM%GAFC',
		'SYSTEM%MIDI_COM',
		'SYSTEM%MIDI_CC',
		'SYSTEM%MIDI_PC',
	];
	this.blockSetToneShape = [
	];

	EditorSetting.call(this, [this.blockSetCom, this.blockSetToneShape]);
}
EditorSettingSystem.prototype = Object.create(EditorSetting.prototype);

function EditorSettingPatchName() {

	// this.blockSetCom = [
	// 	'UserPatch(1)%PatchName',
	// 	'UserPatch(2)%PatchName',
	// 	'UserPatch(3)%PatchName',
	// 	'UserPatch(4)%PatchName',
	// 	'UserPatch(5)%PatchName',
	// 	'UserPatch(6)%PatchName',
	// 	'UserPatch(7)%PatchName',
	// 	'UserPatch(8)%PatchName',
	// 	'UserPatch(9)%PatchName',
	// ];

	this.blockSetCom = [
		'PATCH(1)%COM',
		'PATCH(2)%COM',
		'PATCH(3)%COM',
		'PATCH(4)%COM',
		'PATCH(5)%COM',
		'PATCH(6)%COM',
		'PATCH(7)%COM',
		'PATCH(8)%COM',
		'PATCH(9)%COM',
		'PATCH(10)%COM',
	];


	EditorSetting.call(this, [this.blockSetCom]);
}
EditorSettingPatchName.prototype = Object.create(EditorSetting.prototype);

function EditorSettingStatus() {

	this.blockSetCom = [
		// 'Status%Status',
		'TEMP%TEMP_COM'
	];

	EditorSetting.call(this, [this.blockSetCom]);
}
EditorSettingStatus.prototype = Object.create(EditorSetting.prototype);

function EditorSettingSetup() {

	this.blockSetCom = [
		'SETUP%COM',
	];

	EditorSetting.call(this, [this.blockSetCom]);
}
EditorSettingSetup.prototype = Object.create(EditorSetting.prototype);
