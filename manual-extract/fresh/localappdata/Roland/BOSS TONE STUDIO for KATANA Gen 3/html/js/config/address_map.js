//
// address_map.js
//
// Copyright 2023 Roland Corporation. All rights reserved.
//
// 20231228_1817
function AddressMap() {

	/* parameter definitions */
	var SETUP_COM = [	// SETUP COM
		{ addr:0x00000000,	size:INTEGER2x4,	ofs:   0,	init:   0,	min:   0,	max:   9,	name:'PRMID_SETUP_COM_PATCH_NUMBER'	},
	];
	var SYSTEM_COM = [	// SYSTEM COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_SYSTEM_COM_STEREOEXPAND_SW'	},
	];
	var SYSTEM_USB_COM = [	// SYSTEM USB_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_SYSTEM_USB_COM_INPUT_LEVEL'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_SYSTEM_USB_COM_OUT_LEV'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:  25,	min:   0,	max: 100,	name:'PRMID_SYSTEM_USB_COM_MIX_LEV'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_SYSTEM_USB_COM_LOOPBACK'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_SYSTEM_USB_COM_2_OUT_LEV'	},
	];
	var SYSTEM_GLOBAL_COM = [	// SYSTEM GLOBAL_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_SYSTEM_GLOBAL_COM_GLOBAL_EQ_SW'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_SYSTEM_GLOBAL_COM_GLOBAL_EQ_SELECT'	},
	];
	var SYSTEM_GLOBAL_EACH = [	// SYSTEM GLOBAL_EACH
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_SYSTEM_GLOBAL_EACH_POSITION'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_SYSTEM_GLOBAL_EACH_TYPE'	},
	];
	var SYSTEM_GLOBAL_PEQ = [	// SYSTEM GLOBAL_PEQ
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  17,	name:'PRMID_SYSTEM_GLOBAL_PEQ_LOW_CUT'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_SYSTEM_GLOBAL_PEQ_LOW_GAIN'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:  14,	min:   0,	max:  27,	name:'PRMID_SYSTEM_GLOBAL_PEQ_LOWMID_FREQ'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   5,	name:'PRMID_SYSTEM_GLOBAL_PEQ_LOWMID_Q'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_SYSTEM_GLOBAL_PEQ_LOWMID_GAIN'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:  23,	min:   0,	max:  27,	name:'PRMID_SYSTEM_GLOBAL_PEQ_HIGHMID_FREQ'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   5,	name:'PRMID_SYSTEM_GLOBAL_PEQ_HIGHMID_Q'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_SYSTEM_GLOBAL_PEQ_HIGHMID_GAIN'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_SYSTEM_GLOBAL_PEQ_HIGH_GAIN'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:  14,	min:   0,	max:  14,	name:'PRMID_SYSTEM_GLOBAL_PEQ_HIGH_CUT'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_SYSTEM_GLOBAL_PEQ_LEVEL'	},
	];
	var SYSTEM_GLOBAL_GE10 = [	// SYSTEM GLOBAL_GE10
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_31Hz'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_62Hz'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_125Hz'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_250Hz'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_500Hz'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_1kHz'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_2kHz'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_4kHz'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_8kHz'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_16kHz'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_SYSTEM_GLOBAL_GE10_LEVEL'	},
	];
	var SYSTEM_LINEOUT_COM = [	// SYSTEM LINEOUT_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_SYSTEM_LINEOUT_COM_SELECT'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_SYSTEM_LINEOUT_COM_LINEOUT_AIRFEEL_MODE'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_SYSTEM_LINEOUT_COM_SW'	},
	];
	var SYSTEM_LINEOUT = [	// SYSTEM LINEOUT
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   4,	name:'PRMID_SYSTEM_LINEOUT_MIC_TYPE'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:  20,	name:'PRMID_SYSTEM_LINEOUT_MIC_DISTANCE'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:  10,	name:'PRMID_SYSTEM_LINEOUT_MIC_POSITION'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_SYSTEM_LINEOUT_AMBIENCE_PRE_DELAY'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_SYSTEM_LINEOUT_AMBIENCE_LEVEL'	},
	];
	var SYSTEM_POWERAMPIN = [	// SYSTEM POWERAMPIN
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_SYSTEM_POWERAMPIN_HPF_TYPE'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:  -1,	init:   1,	min:   1,	max: 100,	name:'PRMID_SYSTEM_POWERAMPIN_FREQUENCY'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_SYSTEM_POWERAMPIN_LEVEL'	},
	];
	var SYSTEM_POWERADJUST = [	// SYSTEM POWERADJUST
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   4,	min:   0,	max:   8,	name:'PRMID_SYSTEM_POWERADJUST_HALF_POWER_ADJUST'	},
	];
	var SYSTEM_GAFC = [	// SYSTEM GAFC
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   6,	min:   0,	max:   9,	name:'PRMID_SYSTEM_GAFC_SW1_FUNCTION'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   9,	name:'PRMID_SYSTEM_GAFC_SW2_FUNCTION'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   9,	name:'PRMID_SYSTEM_GAFC_SW3_FUNCTION'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   4,	min:   0,	max:   9,	name:'PRMID_SYSTEM_GAFC_SW4_FUNCTION'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   5,	min:   0,	max:   9,	name:'PRMID_SYSTEM_GAFC_PANEL_FUNCTION'	},
	];
	var SYSTEM_MIDI_COM = [	// SYSTEM MIDI_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  15,	name:'PRMID_SYSTEM_MIDI_COM_CHANNEL'	},
	];
	var SYSTEM_MIDI_CC = [	// SYSTEM MIDI_CC
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:  15,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:  16,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_MOD'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:  17,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_FX'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:  18,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_DELAY'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:  19,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_REVERB'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:  20,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_SENDRETURN'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:  47,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_EXPPEDAL'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:  48,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPPEDAL1'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:  49,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPPEDAL2'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:  52,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPPEDAL3'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_FS1'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:  51,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_FS2'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:  56,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_FS3'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:  53,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPAND_EXPPEDAL1'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:  54,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPAND_EXPPEDAL2'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:  55,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPAND_EXPPEDAL3'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:  57,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPAND_FS1'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:  58,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPAND_FS2'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:  59,	min:   0,	max:  62,	name:'PRMID_SYSTEM_MIDI_CC_GAFC_EXPAND_FS3'	},
	];
	var SYSTEM_MIDI_PC = [	// SYSTEM MIDI_PC
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   4,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_PANEL'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_CH1A'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_CH2A'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_CH3A'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   3,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_CH4A'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   5,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_CH1B'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   6,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_CH2B'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   7,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_CH3B'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:   8,	min:   0,	max: 127,	name:'PRMID_SYSTEM_MIDI_PC_CH4B'	},
	];
	var PATCH_COM = [	// PATCH COM
		{ addr:0x00000000,	size:        16,	ofs:   0,	init:'KATANA          ',	min:  32,	max: 125,	name:'PRMID_PATCH_COM_NAME'	},
	];
	var PATCH_OTHER = [	// PATCH OTHER
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   8,	name:'PRMID_PATCH_OTHER_CHAIN'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   2,	name:'PRMID_PATCH_OTHER_CABINET_RESONANCE'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_OTHER_MASTER_KEY'	},
	];
	var PATCH_COLOR = [	// PATCH COLOR
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_COLOR_BOOSTER_COLOR'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_COLOR_MOD_COLOR'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_COLOR_FX_COLOR'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_COLOR_DELAY_COLOR'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_COLOR_REVERB_COLOR'	},
	];
	var PATCH_AMP = [	// PATCH AMP
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_AMP_GAIN'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_AMP_VOLUME'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_AMP_BASS'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_AMP_MIDDLE'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_AMP_TREBLE'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_AMP_PRESENCE'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_AMP_POWERAMP_VARIATION'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   5,	name:'PRMID_PATCH_AMP_TYPE'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_AMP_RESONANCE'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_AMP_PREAMP_VARIATION'	},
	];
	var PATCH_SW = [	// PATCH SW
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SW_BOOSTER_SW'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SW_MOD_SW'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SW_FX_SW'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SW_DELAY_SW'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SW_DELAY2_SW'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SW_REVERB_SW'	},
	];
	var PATCH_BOOSTER = [	// PATCH BOOSTER
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   9,	min:   0,	max:  22,	name:'PRMID_PATCH_BOOSTER_TYPE'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 120,	name:'PRMID_PATCH_BOOSTER_DRIVE'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:  50,	init:  10,	min: -50,	max:  50,	name:'PRMID_PATCH_BOOSTER_BOTTOM'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_BOOSTER_TONE'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_BOOSTER_SOLO_SW'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_BOOSTER_SOLO_LEVEL'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:  40,	min:   0,	max: 100,	name:'PRMID_PATCH_BOOSTER_EFFECT_LEVEL'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_BOOSTER_DIRECT_MIX'	},
	];
	var PATCH_FX = [	// PATCH FX
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:  23,	min:   0,	max:  30,	name:'PRMID_PATCH_FX_TYPE'	},
	];
	var PATCH_FX_DETAIL = [	// PATCH FX_DETAIL
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_TWAH_MODE'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_TWAH_POLARITY'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TWAH_SENS'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:  35,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TWAH_FREQ'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:  35,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TWAH_PEAK'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TWAH_DIRECT_MIX'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TWAH_EFFECT_LEVEL'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_AWAH_MODE'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:  35,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_AWAH_FREQ'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_AWAH_PEAK'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_AWAH_RATE'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:  60,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_AWAH_DEPTH'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_AWAH_DIRECT_MIX'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_AWAH_EFFECT_LEVEL'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_FX_DETAIL_PEDALWAH_WAH_TYPE'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PEDALWAH_PEDAL_POSITION'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PEDALWAH_PEDAL_MIN'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PEDALWAH_PEDAL_MAX'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PEDALWAH_EFFECT_LEVEL'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PEDALWAH_DIRECT_MIX'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_FX_DETAIL_COMP_TYPE'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_COMP_SUSTAIN'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_COMP_ATTACK'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_COMP_TONE'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_COMP_LEVEL'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_FX_DETAIL_LIMITER_TYPE'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_LIMITER_ATTACK'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:  30,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_LIMITER_THRESHOLD'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:  11,	min:   0,	max:  17,	name:'PRMID_PATCH_FX_DETAIL_LIMITER_RATIO'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:  10,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_LIMITER_RELEASE'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:  30,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_LIMITER_LEVEL'	},
		{ addr:0x0000001F,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_31Hz'	},
		{ addr:0x00000020,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_62Hz'	},
		{ addr:0x00000021,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_125Hz'	},
		{ addr:0x00000022,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_250Hz'	},
		{ addr:0x00000023,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_500Hz'	},
		{ addr:0x00000024,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_1kHz'	},
		{ addr:0x00000025,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_2kHz'	},
		{ addr:0x00000026,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_4kHz'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_8kHz'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_16kHz'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_GEQ_LEVEL'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  17,	name:'PRMID_PATCH_FX_DETAIL_PEQ_LOW_CUT'	},
		{ addr:0x0000002B,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_PEQ_LOW_GAIN'	},
		{ addr:0x0000002C,	size:INTEGER1x7,	ofs:   0,	init:  13,	min:   0,	max:  27,	name:'PRMID_PATCH_FX_DETAIL_PEQ_LOWMID_FREQ'	},
		{ addr:0x0000002D,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   5,	name:'PRMID_PATCH_FX_DETAIL_PEQ_LOWMID_Q'	},
		{ addr:0x0000002E,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_PEQ_LOWMID_GAIN'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:  23,	min:   0,	max:  27,	name:'PRMID_PATCH_FX_DETAIL_PEQ_HIGHMID_FREQ'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   5,	name:'PRMID_PATCH_FX_DETAIL_PEQ_HIGHMID_Q'	},
		{ addr:0x00000031,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_PEQ_HIGHMID_GAIN'	},
		{ addr:0x00000032,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_PEQ_HIGH_GAIN'	},
		{ addr:0x00000033,	size:INTEGER1x7,	ofs:   0,	init:  14,	min:   0,	max:  14,	name:'PRMID_PATCH_FX_DETAIL_PEQ_HIGH_CUT'	},
		{ addr:0x00000034,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_FX_DETAIL_PEQ_LEVEL'	},
		{ addr:0x00000035,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_FX_DETAIL_GUITARSIM_TYPE'	},
		{ addr:0x00000036,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_GUITARSIM_LOW'	},
		{ addr:0x00000037,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_GUITARSIM_HIGH'	},
		{ addr:0x00000038,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_GUITARSIM_LEVEL'	},
		{ addr:0x00000039,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_GUITARSIM_BODY'	},
		{ addr:0x0000003A,	size:INTEGER1x7,	ofs:   0,	init:  45,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_SLOWGEAR_SENS'	},
		{ addr:0x0000003B,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_SLOWGEAR_RISE_TIME'	},
		{ addr:0x0000003C,	size:INTEGER1x7,	ofs:   0,	init:  60,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_SLOWGEAR_LEVEL'	},
		{ addr:0x0000003D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_WAVESYNTH_WAVE'	},
		{ addr:0x0000003E,	size:INTEGER1x7,	ofs:   0,	init:  40,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_WAVESYNTH_CUTOFF'	},
		{ addr:0x0000003F,	size:INTEGER1x7,	ofs:   0,	init:  30,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_WAVESYNTH_RESONANCE'	},
		{ addr:0x00000040,	size:INTEGER1x7,	ofs:   0,	init:  40,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_WAVESYNTH_FILTER_SENS'	},
		{ addr:0x00000041,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_WAVESYNTH_FILTER_DECAY'	},
		{ addr:0x00000042,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_WAVESYNTH_FILTER_DEPTH'	},
		{ addr:0x00000043,	size:INTEGER1x7,	ofs:   0,	init:  25,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_WAVESYNTH_SYNTH_LEVEL'	},
		{ addr:0x00000044,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_WAVESYNTH_DIRECT_MIX'	},
		{ addr:0x00000045,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_FX_DETAIL_OCTAVE_RANGE'	},
		{ addr:0x00000046,	size:INTEGER1x7,	ofs:   0,	init:  62,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_OCTAVE_EFFECT_LEVEL'	},
		{ addr:0x00000047,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_OCTAVE_DIRECT_MIX'	},
		{ addr:0x00000048,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_VOICE'	},
		{ addr:0x00000049,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   3,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_MODE1'	},
		{ addr:0x0000004A,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_PITCH1'	},
		{ addr:0x0000004B,	size:INTEGER1x7,	ofs:  50,	init:  10,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_FINE1'	},
		{ addr:0x0000004C,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_PRE_DELAY1'	},
		{ addr:0x00000050,	size:INTEGER1x7,	ofs:   0,	init:  70,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_LEVEL1'	},
		{ addr:0x00000051,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   3,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_MODE2'	},
		{ addr:0x00000052,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_PITCH2'	},
		{ addr:0x00000053,	size:INTEGER1x7,	ofs:  50,	init: -10,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_FINE2'	},
		{ addr:0x00000054,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_PRE_DELAY2'	},
		{ addr:0x00000058,	size:INTEGER1x7,	ofs:   0,	init:  70,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_LEVEL2'	},
		{ addr:0x00000059,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_FEEDBACK1'	},
		{ addr:0x0000005A,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PITCHSHIFT_DIRECT_MIX'	},
		{ addr:0x0000005B,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_VOICE'	},
		{ addr:0x0000005C,	size:INTEGER1x7,	ofs:   0,	init:  12,	min:   0,	max:  29,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_HARMONY1'	},
		{ addr:0x0000005D,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_PRE_DELAY1'	},
		{ addr:0x00000061,	size:INTEGER1x7,	ofs:   0,	init:  70,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_LEVEL1'	},
		{ addr:0x00000062,	size:INTEGER1x7,	ofs:   0,	init:   7,	min:   0,	max:  29,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_HARMONY2'	},
		{ addr:0x00000063,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_PRE_DELAY2'	},
		{ addr:0x00000067,	size:INTEGER1x7,	ofs:   0,	init:  80,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_LEVEL2'	},
		{ addr:0x00000068,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_FEEDBACK1'	},
		{ addr:0x00000069,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_DIRECT_MIX'	},
		{ addr:0x0000006A,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_C1'	},
		{ addr:0x0000006B,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Db1'	},
		{ addr:0x0000006C,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_D1'	},
		{ addr:0x0000006D,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Eb1'	},
		{ addr:0x0000006E,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_E1'	},
		{ addr:0x0000006F,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_F1'	},
		{ addr:0x00000070,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Fs1'	},
		{ addr:0x00000071,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_G1'	},
		{ addr:0x00000072,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Ab1'	},
		{ addr:0x00000073,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_A1'	},
		{ addr:0x00000074,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Bb1'	},
		{ addr:0x00000075,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_B1'	},
		{ addr:0x00000076,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_C2'	},
		{ addr:0x00000077,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Db2'	},
		{ addr:0x00000078,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_D2'	},
		{ addr:0x00000079,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Eb2'	},
		{ addr:0x0000007A,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_E2'	},
		{ addr:0x0000007B,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_F2'	},
		{ addr:0x0000007C,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Fs2'	},
		{ addr:0x0000007D,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_G2'	},
		{ addr:0x0000007E,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Ab2'	},
		{ addr:0x0000007F,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_A2'	},
		{ addr:0x00000100,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_Bb2'	},
		{ addr:0x00000101,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_HARMONIST_B2'	},
		{ addr:0x00000102,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   3,	name:'PRMID_PATCH_FX_DETAIL_ACPROCESS_TYPE'	},
		{ addr:0x00000103,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_ACPROCESS_BASS'	},
		{ addr:0x00000104,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_ACPROCESS_MIDDLE'	},
		{ addr:0x00000105,	size:INTEGER1x7,	ofs:   0,	init:  16,	min:   0,	max:  27,	name:'PRMID_PATCH_FX_DETAIL_ACPROCESS_MIDDLE_FREQ'	},
		{ addr:0x00000106,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_ACPROCESS_TREBLE'	},
		{ addr:0x00000107,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_ACPROCESS_PRESENCE'	},
		{ addr:0x00000108,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_ACPROCESS_LEVEL'	},
		{ addr:0x00000109,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_FX_DETAIL_PHASER_TYPE'	},
		{ addr:0x0000010A,	size:INTEGER1x7,	ofs:   0,	init:  70,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PHASER_RATE'	},
		{ addr:0x0000010B,	size:INTEGER1x7,	ofs:   0,	init:  40,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PHASER_DEPTH'	},
		{ addr:0x0000010C,	size:INTEGER1x7,	ofs:   0,	init:  55,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PHASER_MANUAL'	},
		{ addr:0x0000010D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PHASER_RESONANCE'	},
		{ addr:0x0000010E,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PHASER_STEP_RATE'	},
		{ addr:0x0000010F,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PHASER_EFFECT_LEVEL'	},
		{ addr:0x00000110,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_PHASER_DIRECT_MIX'	},
		{ addr:0x00000111,	size:INTEGER1x7,	ofs:   0,	init:  31,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_FLANGER_RATE'	},
		{ addr:0x00000112,	size:INTEGER1x7,	ofs:   0,	init:  40,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_FLANGER_DEPTH'	},
		{ addr:0x00000113,	size:INTEGER1x7,	ofs:   0,	init:  82,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_FLANGER_MANUAL'	},
		{ addr:0x00000114,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_FLANGER_RESONANCE'	},
		{ addr:0x00000115,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_FX_DETAIL_FLANGER_LOW_CUT'	},
		{ addr:0x00000116,	size:INTEGER1x7,	ofs:   0,	init:  60,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_FLANGER_EFFECT_LEVEL'	},
		{ addr:0x00000117,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_FLANGER_DIRECT_MIX'	},
		{ addr:0x00000118,	size:INTEGER1x7,	ofs:   0,	init:  70,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TREMOLO_WAVE_SHAPE'	},
		{ addr:0x00000119,	size:INTEGER1x7,	ofs:   0,	init:  85,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TREMOLO_RATE'	},
		{ addr:0x0000011A,	size:INTEGER1x7,	ofs:   0,	init:  65,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TREMOLO_DEPTH'	},
		{ addr:0x0000011B,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_TREMOLO_LEVEL'	},
		{ addr:0x0000011C,	size:INTEGER1x7,	ofs:   0,	init:  85,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_ROTARY_RATE'	},
		{ addr:0x0000011D,	size:INTEGER1x7,	ofs:   0,	init:  60,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_ROTARY_DEPTH'	},
		{ addr:0x0000011E,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_ROTARY_LEVEL'	},
		{ addr:0x0000011F,	size:INTEGER1x7,	ofs:   0,	init:  70,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_UNIV_RATE'	},
		{ addr:0x00000120,	size:INTEGER1x7,	ofs:   0,	init:  60,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_UNIV_DEPTH'	},
		{ addr:0x00000121,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_UNIV_LEVEL'	},
		{ addr:0x00000122,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  19,	name:'PRMID_PATCH_FX_DETAIL_SLICER_PATTERN'	},
		{ addr:0x00000123,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_SLICER_RATE'	},
		{ addr:0x00000124,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_SLICER_TRIGGER_SENS'	},
		{ addr:0x00000125,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_SLICER_EFFECT_LEVEL'	},
		{ addr:0x00000126,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_SLICER_DIRECT_MIX'	},
		{ addr:0x00000127,	size:INTEGER1x7,	ofs:   0,	init:  80,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_VIBRATO_RATE'	},
		{ addr:0x00000128,	size:INTEGER1x7,	ofs:   0,	init:  45,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_VIBRATO_DEPTH'	},
		{ addr:0x00000129,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_VIBRATO_LEVEL'	},
		{ addr:0x0000012A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_RINGMOD_MODE'	},
		{ addr:0x0000012B,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_RINGMOD_FREQUENCY'	},
		{ addr:0x0000012C,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_RINGMOD_EFFECT_LEVEL'	},
		{ addr:0x0000012D,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_RINGMOD_DIRECT_MIX'	},
		{ addr:0x0000012E,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_HUMANIZER_MODE'	},
		{ addr:0x0000012F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_FX_DETAIL_HUMANIZER_VOWEL1'	},
		{ addr:0x00000130,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   4,	name:'PRMID_PATCH_FX_DETAIL_HUMANIZER_VOWEL2'	},
		{ addr:0x00000131,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HUMANIZER_SENS'	},
		{ addr:0x00000132,	size:INTEGER1x7,	ofs:   0,	init:  80,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HUMANIZER_RATE'	},
		{ addr:0x00000133,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HUMANIZER_DEPTH'	},
		{ addr:0x00000134,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HUMANIZER_MANUAL'	},
		{ addr:0x00000135,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HUMANIZER_LEVEL'	},
		{ addr:0x00000136,	size:INTEGER1x7,	ofs:   0,	init:   4,	min:   0,	max:  16,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_XOVER_FREQUENCY'	},
		{ addr:0x00000137,	size:INTEGER1x7,	ofs:   0,	init:  43,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_LOW_RATE'	},
		{ addr:0x00000138,	size:INTEGER1x7,	ofs:   0,	init:  46,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_LOW_DEPTH'	},
		{ addr:0x00000139,	size:INTEGER1x7,	ofs:   0,	init:   3,	min:   0,	max:  80,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_LOW_PRE_DELAY'	},
		{ addr:0x0000013A,	size:INTEGER1x7,	ofs:   0,	init:  75,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_LOW_LEVEL'	},
		{ addr:0x0000013B,	size:INTEGER1x7,	ofs:   0,	init:  33,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_HIGH_RATE'	},
		{ addr:0x0000013C,	size:INTEGER1x7,	ofs:   0,	init:  48,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_HIGH_DEPTH'	},
		{ addr:0x0000013D,	size:INTEGER1x7,	ofs:   0,	init:   3,	min:   0,	max:  80,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_HIGH_PRE_DELAY'	},
		{ addr:0x0000013E,	size:INTEGER1x7,	ofs:   0,	init:  65,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_HIGH_LEVEL'	},
		{ addr:0x0000013F,	size:INTEGER1x7,	ofs:   0,	init:  80,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_2X2CHORUS_DIRECT_MIX'	},
		{ addr:0x00000140,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_ACSIM_HIGH'	},
		{ addr:0x00000141,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_ACSIM_BODY'	},
		{ addr:0x00000142,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_FX_DETAIL_ACSIM_LOW'	},
		{ addr:0x00000143,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_ACSIM_LEVEL'	},
		{ addr:0x00000144,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_EPHASER_SCRIPT'	},
		{ addr:0x00000145,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EPHASER_SPEED'	},
		{ addr:0x00000146,	size:INTEGER1x7,	ofs:   0,	init:  45,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EFLANGER_MANUAL'	},
		{ addr:0x00000147,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EFLANGER_WIDTH'	},
		{ addr:0x00000148,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EFLANGER_SPEED'	},
		{ addr:0x00000149,	size:INTEGER1x7,	ofs:   0,	init:  80,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EFLANGER_REGEN'	},
		{ addr:0x0000014A,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EWAH_PEDAL_POS'	},
		{ addr:0x0000014B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EWAH_PEDAL_MIN'	},
		{ addr:0x0000014C,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EWAH_PEDAL_MAX'	},
		{ addr:0x0000014D,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EWAH_EFFECT_LEVEL'	},
		{ addr:0x0000014E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_EWAH_DIRECT_MIX'	},
		{ addr:0x0000014F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_DC30_SELECT'	},
		{ addr:0x00000150,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_DC30_INPUT_VOLUME'	},
		{ addr:0x00000151,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_DC30_CHORUS_INTENSITY'	},
		{ addr:0x00000152,	size:INTEGER4x4,	ofs:   0,	init: 400,	min:  40,	max: 600,	name:'PRMID_PATCH_FX_DETAIL_DC30_ECHO_REPEAT_RATE'	},
		{ addr:0x00000156,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_DC30_ECHO_INTENSISTY'	},
		{ addr:0x00000157,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_DC30_ECHO_VOLUME'	},
		{ addr:0x00000158,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_DC30_TONE'	},
		{ addr:0x00000159,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_FX_DETAIL_DC30_OUTPUT'	},
		{ addr:0x0000015A,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HEAVYOCTAVE_1OCT_LEVEL'	},
		{ addr:0x0000015B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HEAVYOCTAVE_2OCT_LEVEL'	},
		{ addr:0x0000015C,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_HEAVYOCTAVE_DIRECT_MIX'	},
		{ addr:0x0000015D,	size:INTEGER1x7,	ofs:  24,	init:  12,	min: -24,	max:  24,	name:'PRMID_PATCH_FX_DETAIL_BEND_PITCH'	},
		{ addr:0x0000015E,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_BEND_PEDAL_POS'	},
		{ addr:0x0000015F,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_BEND_EFFECT_LEVEL'	},
		{ addr:0x00000160,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_FX_DETAIL_BEND_DIRECT_MIX'	},
	];
	var PATCH_DELAY = [	// PATCH DELAY
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_DELAY_TYPE'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init: 400,	min:   1,	max:2000,	name:'PRMID_PATCH_DELAY_TIME'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:  22,	min:   0,	max: 100,	name:'PRMID_PATCH_DELAY_FEEDBACK'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:  10,	min:   0,	max:  14,	name:'PRMID_PATCH_DELAY_HIGH_CUT'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 120,	name:'PRMID_PATCH_DELAY_EFFECT_LEVEL'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_DELAY_DIRECT_LEVEL'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_DELAY_TAP_TIME'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:  40,	min:   0,	max: 100,	name:'PRMID_PATCH_DELAY_MOD_RATE'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:  55,	min:   0,	max: 100,	name:'PRMID_PATCH_DELAY_MOD_DEPTH'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_DELAY_LPF'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_DELAY_FILTER'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_DELAY_FEEDBACK_PHASE'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_DELAY_DELAY_PHASE'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_DELAY_MOD_SW'	},
	];
	var PATCH_REVERB = [	// PATCH REVERB
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   4,	name:'PRMID_PATCH_REVERB_TYPE'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   2,	name:'PRMID_PATCH_REVERB_LAYER_MODE'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:  -1,	init:  30,	min:   1,	max: 100,	name:'PRMID_PATCH_REVERB_TIME'	},
		{ addr:0x00000003,	size:INTEGER4x4,	ofs:   0,	init:  10,	min:   0,	max: 500,	name:'PRMID_PATCH_REVERB_PRE_DELAY'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:  14,	min:   0,	max:  17,	name:'PRMID_PATCH_REVERB_LOW_CUT'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:   8,	min:   0,	max:  14,	name:'PRMID_PATCH_REVERB_HIGH_CUT'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   8,	min:   0,	max:  10,	name:'PRMID_PATCH_REVERB_DENSITY'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:  35,	min:   0,	max: 100,	name:'PRMID_PATCH_REVERB_EFFECT_LEVEL'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_REVERB_DIRECT_LEVEL'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_REVERB_SPRING_COLOR'	},
	];
	var PATCH_SOLO_COM = [	// PATCH SOLO_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SOLO_COM_SW'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_SOLO_COM_EFFECT_LEVEL'	},
	];
	var PATCH_SOLO_EQ = [	// PATCH SOLO_EQ
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SOLO_EQ_POSITION'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SOLO_EQ_SW'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  17,	name:'PRMID_PATCH_SOLO_EQ_LOW_CUT'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_SOLO_EQ_LOW_GAIN'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:  13,	min:   0,	max:  27,	name:'PRMID_PATCH_SOLO_EQ_MID_FREQ'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   5,	name:'PRMID_PATCH_SOLO_EQ_MID_Q'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_SOLO_EQ_MID_GAIN'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_SOLO_EQ_HIGH_GAIN'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:  14,	min:   0,	max:  14,	name:'PRMID_PATCH_SOLO_EQ_HIGH_CUT'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_SOLO_EQ_LEVEL'	},
	];
	var PATCH_SOLO_DELAY = [	// PATCH SOLO_DELAY
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SOLO_DELAY_SW'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_SOLO_DELAY_CARRYOVER'	},
		{ addr:0x00000002,	size:INTEGER4x4,	ofs:   0,	init: 400,	min:   1,	max:2000,	name:'PRMID_PATCH_SOLO_DELAY_TIME'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:  22,	min:   0,	max: 100,	name:'PRMID_PATCH_SOLO_DELAY_FEEDBACK'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 120,	name:'PRMID_PATCH_SOLO_DELAY_EFFECT_LEVEL'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_SOLO_DELAY_DIRECT_LEVEL'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_SOLO_DELAY_FILTER'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:  10,	min:   0,	max:  14,	name:'PRMID_PATCH_SOLO_DELAY_HIGH_CUT'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SOLO_DELAY_MOD_SW'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:  40,	min:   0,	max: 100,	name:'PRMID_PATCH_SOLO_DELAY_MOD_RATE'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:  55,	min:   0,	max: 100,	name:'PRMID_PATCH_SOLO_DELAY_MOD_DEPTH'	},
	];
	var PATCH_CONTOUR_COM = [	// PATCH CONTOUR_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_CONTOUR_COM_KNOB'	},
	];
	var PATCH_CONTOUR = [	// PATCH CONTOUR
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_CONTOUR_TYPE'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:  50,	init:   0,	min: -50,	max:  50,	name:'PRMID_PATCH_CONTOUR_FREQ_SHIFT'	},
	];
	var PATCH_PEDALFX_COM = [	// PATCH PEDALFX_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_PEDALFX_COM_POSITION'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_PEDALFX_COM_SW'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_PEDALFX_COM_TYPE'	},
	];
	var PATCH_PEDALFX = [	// PATCH PEDALFX
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_PEDALFX_PEDALWAH_WAH_TYPE'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_PEDALWAH_PEDAL_POSITION'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_PEDALWAH_PEDAL_MIN'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_PEDALWAH_PEDAL_MAX'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_PEDALWAH_EFFECT_LEVEL'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_PEDALWAH_DIRECT_MIX'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:  24,	init:  12,	min: -24,	max:  24,	name:'PRMID_PATCH_PEDALFX_BEND_PITCH'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_BEND_PEDAL_POS'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_BEND_EFFECT_LEVEL'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_BEND_DIRECT_MIX'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_EWAH_PEDAL_POS'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_EWAH_PEDAL_MIN'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_EWAH_PEDAL_MAX'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init: 100,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_EWAH_EFFECT_LEVEL'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 100,	name:'PRMID_PATCH_PEDALFX_EWAH_DIRECT_MIX'	},
	];
	var PATCH_EQ_EACH = [	// PATCH EQ_EACH
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_EQ_EACH_POSITION'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_EQ_EACH_SW'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_EQ_EACH_TYPE'	},
	];
	var PATCH_EQ_PEQ = [	// PATCH EQ_PEQ
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  17,	name:'PRMID_PATCH_EQ_PEQ_LOW_CUT'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_EQ_PEQ_LOW_GAIN'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:  14,	min:   0,	max:  27,	name:'PRMID_PATCH_EQ_PEQ_LOWMID_FREQ'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   5,	name:'PRMID_PATCH_EQ_PEQ_LOWMID_Q'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_EQ_PEQ_LOWMID_GAIN'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:  23,	min:   0,	max:  27,	name:'PRMID_PATCH_EQ_PEQ_HIGHMID_FREQ'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   5,	name:'PRMID_PATCH_EQ_PEQ_HIGHMID_Q'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_EQ_PEQ_HIGHMID_GAIN'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_EQ_PEQ_HIGH_GAIN'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:  14,	min:   0,	max:  14,	name:'PRMID_PATCH_EQ_PEQ_HIGH_CUT'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:  20,	init:   0,	min: -20,	max:  20,	name:'PRMID_PATCH_EQ_PEQ_LEVEL'	},
	];
	var PATCH_EQ_GE10 = [	// PATCH EQ_GE10
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_31Hz'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_62Hz'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_125Hz'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_250Hz'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_500Hz'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_1kHz'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_2kHz'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_4kHz'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_8kHz'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_16kHz'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:  24,	init:   0,	min: -24,	max:  24,	name:'PRMID_PATCH_EQ_GE10_LEVEL'	},
	];
	var PATCH_NS = [	// PATCH NS
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_NS_SW'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   5,	min:   0,	max: 100,	name:'PRMID_PATCH_NS_THRESHOLD'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_NS_RELEASE'	},
	];
	var PATCH_SENDRETURN = [	// PATCH SENDRETURN
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   1,	name:'PRMID_PATCH_SENDRETURN_SW'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_SENDRETURN_POSITION'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_SENDRETURN_MODE'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_SENDRETURN_SEND_LEVEL'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:  50,	min:   0,	max: 100,	name:'PRMID_PATCH_SENDRETURN_RETURN_LEVEL'	},
	];
	var PATCH_ASSIGN_KNOBS = [	// PATCH ASSIGN_KNOBS
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_KNOBS_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_KNOBS_DELAY'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_KNOBS_REVERB'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_KNOBS_CHORUS'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_KNOBS_FLANGER'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_KNOBS_PHASER'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_KNOBS_UNIV'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_KNOBS_TREMOLO'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_KNOBS_VIBRATO'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_KNOBS_ROTARY'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_KNOBS_RINGMOD'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_KNOBS_SLOWGEAR'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_KNOBS_SLICER'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_KNOBS_COMP'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_KNOBS_LIMITER'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_KNOBS_TWAH'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_KNOBS_AUTO_WAH'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_KNOBS_PEDAL_WAH'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_KNOBS_GEQ'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_KNOBS_PEQ'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_KNOBS_GUITARSIM'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_KNOBS_ACGUITARSIM'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_KNOBS_ACPROCESSOR'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_KNOBS_WAVESYNTH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_ASSIGN_KNOBS_OCTAVE'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_KNOBS_PITCHSHIFTER'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_KNOBS_HARMONIST'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_KNOBS_HUMANIZER'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_ASSIGN_KNOBS_PHASE90E'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_KNOBS_FLANGER117E'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_KNOBS_WAH95E'	},
		{ addr:0x0000001F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_KNOBS_DC30'	},
		{ addr:0x00000020,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_KNOBS_HEAVYOCT'	},
		{ addr:0x00000021,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_KNOBS_PEDALBEND'	},
	];
	var PATCH_ASSIGN_EXPPDL_FUNC = [	// PATCH ASSIGN_EXPPDL_FUNC
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_EXPPDL_FUNC_FUNCTION'	},
	];
	var PATCH_ASSIGN_EXPPDL_DETAIL = [	// PATCH ASSIGN_EXPPDL_DETAIL
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_DELAY'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_REVERB'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_CHORUS'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_FLANGER'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_PHASER'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_UNIV'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_TREMOLO'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_VIBRATO'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_ROTARY'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_RINGMOD'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_SLOWGEAR'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_SLICER'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_COMP'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_LIMITER'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_TWAH'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_AUTO_WAH'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_PEDAL_WAH'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_GEQ'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_PEQ'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_GUITARSIM'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_ACGUITARSIM'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_ACPROCESSOR'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_WAVESYNTH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_OCTAVE'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_PITCHSHIFTER'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_HARMONIST'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_HUMANIZER'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_PHASE90E'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_FLANGER117E'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_WAH95E'	},
		{ addr:0x0000001F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_DC30'	},
		{ addr:0x00000020,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_HEAVYOCT'	},
		{ addr:0x00000021,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_EXPPDL_DETAIL_PEDALBEND'	},
	];
	var PATCH_ASSIGN_EXPPDL_MIN = [	// PATCH ASSIGN_EXPPDL_MIN
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max:2000,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_DELAY'	},
		{ addr:0x00000005,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 500,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_REVERB'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_CHORUS'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_FLANGER'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_PHASER'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_UNIV'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_TREMOLO'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_VIBRATO'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_ROTARY'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_RINGMOD'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_SLOWGEAR'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_SLICER'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_COMP'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_LIMITER'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_TWAH'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_AUTOWAH'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_PEDALWAH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_GEQ'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_PEQ'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_GUITARSIM'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_ACGUITARSIM'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_ACPROCESSOR'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_WAVESYNTH'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_OCTAVE'	},
		{ addr:0x0000001F,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_PITCHSHIFTER'	},
		{ addr:0x00000023,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_HARMONIST'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_HUMANIZER'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_PHASE90E'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_FLANGER117E'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_WAH95E'	},
		{ addr:0x0000002B,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 600,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_DC30'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_HEAVYOCT'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MIN_PEDALBEND'	},
	];
	var PATCH_ASSIGN_EXPPDL_MAX = [	// PATCH ASSIGN_EXPPDL_MAX
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max:2000,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_DELAY'	},
		{ addr:0x00000005,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 500,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_REVERB'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_CHORUS'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_FLANGER'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_PHASER'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_UNIV'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_TREMOLO'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_VIBRATO'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_ROTARY'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_RINGMOD'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_SLOWGEAR'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_SLICER'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_COMP'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_LIMITER'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_TWAH'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_AUTOWAH'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_PEDALWAH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_GEQ'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_PEQ'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_GUITARSIM'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_ACGUITARSIM'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_ACPROCESSOR'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_WAVESYNTH'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_OCTAVE'	},
		{ addr:0x0000001F,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_PITCHSHIFTER'	},
		{ addr:0x00000023,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_HARMONIST'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_HUMANIZER'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_PHASE90E'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_FLANGER117E'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_WAH95E'	},
		{ addr:0x0000002B,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 600,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_DC30'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_HEAVYOCT'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_EXPPDL_MAX_PEDALBEND'	},
	];
	var PATCH_ASSIGN_FS = [	// PATCH ASSIGN_FS
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_ASSIGN_FS_FS1_TIP'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   2,	name:'PRMID_PATCH_ASSIGN_FS_FS1_RING'	},
	];
	var PATCH_ASSIGN_GAFCFS = [	// PATCH ASSIGN_GAFCFS
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCFS_FS1'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   4,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCFS_FS2'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   1,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCFS_FS3'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL1_FUNC = [	// PATCH ASSIGN_GAFCEXPPDL1_FUNC
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_FUNC_FUNCTION'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL1_DETAIL = [	// PATCH ASSIGN_GAFCEXPPDL1_DETAIL
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_DELAY'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_REVERB'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_CHORUS'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_FLANGER'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_PHASER'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_UNIV'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_TREMOLO'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_VIBRATO'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_ROTARY'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_RINGMOD'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_SLOWGEAR'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_SLICER'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_COMP'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_LIMITER'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_TWAH'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_AUTO_WAH'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_PEDAL_WAH'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_GEQ'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_PEQ'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_GUITARSIM'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_ACGUITARSIM'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_ACPROCESSOR'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_WAVESYNTH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_OCTAVE'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_PITCHSHIFTER'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_HARMONIST'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_HUMANIZER'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_PHASE90E'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_FLANGER117E'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_WAH95E'	},
		{ addr:0x0000001F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_DC30'	},
		{ addr:0x00000020,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_HEAVYOCT'	},
		{ addr:0x00000021,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_DETAIL_PEDALBEND'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL1_MIN = [	// PATCH ASSIGN_GAFCEXPPDL1_MIN
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max:2000,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_DELAY'	},
		{ addr:0x00000005,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 500,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_REVERB'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_CHORUS'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_FLANGER'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_PHASER'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_UNIV'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_TREMOLO'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_VIBRATO'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_ROTARY'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_RINGMOD'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_SLOWGEAR'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_SLICER'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_COMP'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_LIMITER'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_TWAH'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_AUTOWAH'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_PEDALWAH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_GEQ'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_PEQ'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_GUITARSIM'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_ACGUITARSIM'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_ACPROCESSOR'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_WAVESYNTH'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_OCTAVE'	},
		{ addr:0x0000001F,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_PITCHSHIFTER'	},
		{ addr:0x00000023,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_HARMONIST'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_HUMANIZER'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_PHASE90E'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_FLANGER117E'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_WAH95E'	},
		{ addr:0x0000002B,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 600,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_DC30'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_HEAVYOCT'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MIN_PEDALBEND'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL1_MAX = [	// PATCH ASSIGN_GAFCEXPPDL1_MAX
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max:2000,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_DELAY'	},
		{ addr:0x00000005,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 500,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_REVERB'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_CHORUS'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_FLANGER'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_PHASER'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_UNIV'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_TREMOLO'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_VIBRATO'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_ROTARY'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_RINGMOD'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_SLOWGEAR'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_SLICER'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_COMP'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_LIMITER'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_TWAH'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_AUTOWAH'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_PEDALWAH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_GEQ'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_PEQ'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_GUITARSIM'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_ACGUITARSIM'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_ACPROCESSOR'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_WAVESYNTH'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_OCTAVE'	},
		{ addr:0x0000001F,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_PITCHSHIFTER'	},
		{ addr:0x00000023,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_HARMONIST'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_HUMANIZER'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_PHASE90E'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_FLANGER117E'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_WAH95E'	},
		{ addr:0x0000002B,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 600,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_DC30'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_HEAVYOCT'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL1_MAX_PEDALBEND'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL2_FUNC = [	// PATCH ASSIGN_GAFCEXPPDL2_FUNC
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_FUNC_FUNCTION'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL2_DETAIL = [	// PATCH ASSIGN_GAFCEXPPDL2_DETAIL
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_DELAY'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_REVERB'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_CHORUS'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_FLANGER'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_PHASER'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_UNIV'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_TREMOLO'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_VIBRATO'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_ROTARY'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_RINGMOD'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_SLOWGEAR'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_SLICER'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_COMP'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_LIMITER'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_TWAH'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_AUTO_WAH'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_PEDAL_WAH'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_GEQ'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_PEQ'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_GUITARSIM'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_ACGUITARSIM'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_ACPROCESSOR'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_WAVESYNTH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_OCTAVE'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_PITCHSHIFTER'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_HARMONIST'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_HUMANIZER'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_PHASE90E'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_FLANGER117E'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_WAH95E'	},
		{ addr:0x0000001F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_DC30'	},
		{ addr:0x00000020,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_HEAVYOCT'	},
		{ addr:0x00000021,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_DETAIL_PEDALBEND'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL2_MIN = [	// PATCH ASSIGN_GAFCEXPPDL2_MIN
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max:2000,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_DELAY'	},
		{ addr:0x00000005,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 500,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_REVERB'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_CHORUS'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_FLANGER'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_PHASER'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_UNIV'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_TREMOLO'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_VIBRATO'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_ROTARY'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_RINGMOD'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_SLOWGEAR'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_SLICER'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_COMP'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_LIMITER'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_TWAH'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_AUTOWAH'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_PEDALWAH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_GEQ'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_PEQ'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_GUITARSIM'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_ACGUITARSIM'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_ACPROCESSOR'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_WAVESYNTH'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_OCTAVE'	},
		{ addr:0x0000001F,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_PITCHSHIFTER'	},
		{ addr:0x00000023,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_HARMONIST'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_HUMANIZER'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_PHASE90E'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_FLANGER117E'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_WAH95E'	},
		{ addr:0x0000002B,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 600,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_DC30'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_HEAVYOCT'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MIN_PEDALBEND'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL2_MAX = [	// PATCH ASSIGN_GAFCEXPPDL2_MAX
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max:2000,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_DELAY'	},
		{ addr:0x00000005,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 500,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_REVERB'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_CHORUS'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_FLANGER'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_PHASER'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_UNIV'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_TREMOLO'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_VIBRATO'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_ROTARY'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_RINGMOD'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_SLOWGEAR'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_SLICER'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_COMP'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_LIMITER'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_TWAH'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_AUTOWAH'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_PEDALWAH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_GEQ'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_PEQ'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_GUITARSIM'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_ACGUITARSIM'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_ACPROCESSOR'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_WAVESYNTH'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_OCTAVE'	},
		{ addr:0x0000001F,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_PITCHSHIFTER'	},
		{ addr:0x00000023,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_HARMONIST'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_HUMANIZER'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_PHASE90E'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_FLANGER117E'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_WAH95E'	},
		{ addr:0x0000002B,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 600,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_DC30'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_HEAVYOCT'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL2_MAX_PEDALBEND'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL3_FUNC = [	// PATCH ASSIGN_GAFCEXPPDL3_FUNC
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   2,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_FUNC_FUNCTION'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL3_DETAIL = [	// PATCH ASSIGN_GAFCEXPPDL3_DETAIL
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_DELAY'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_REVERB'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_CHORUS'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_FLANGER'	},
		{ addr:0x00000005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_PHASER'	},
		{ addr:0x00000006,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_UNIV'	},
		{ addr:0x00000007,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_TREMOLO'	},
		{ addr:0x00000008,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_VIBRATO'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_ROTARY'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_RINGMOD'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_SLOWGEAR'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_SLICER'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_COMP'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_LIMITER'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_TWAH'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_AUTO_WAH'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_PEDAL_WAH'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_GEQ'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  11,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_PEQ'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_GUITARSIM'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_ACGUITARSIM'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_ACPROCESSOR'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   7,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_WAVESYNTH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   2,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_OCTAVE'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:  10,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_PITCHSHIFTER'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   9,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_HARMONIST'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_HUMANIZER'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   1,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_PHASE90E'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_FLANGER117E'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   5,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_WAH95E'	},
		{ addr:0x0000001F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   6,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_DC30'	},
		{ addr:0x00000020,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_HEAVYOCT'	},
		{ addr:0x00000021,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   4,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_DETAIL_PEDALBEND'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL3_MIN = [	// PATCH ASSIGN_GAFCEXPPDL3_MIN
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max:2000,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_DELAY'	},
		{ addr:0x00000005,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 500,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_REVERB'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_CHORUS'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_FLANGER'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_PHASER'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_UNIV'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_TREMOLO'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_VIBRATO'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_ROTARY'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_RINGMOD'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_SLOWGEAR'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_SLICER'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_COMP'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_LIMITER'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_TWAH'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_AUTOWAH'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_PEDALWAH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_GEQ'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_PEQ'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_GUITARSIM'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_ACGUITARSIM'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_ACPROCESSOR'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_WAVESYNTH'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_OCTAVE'	},
		{ addr:0x0000001F,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_PITCHSHIFTER'	},
		{ addr:0x00000023,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_HARMONIST'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_HUMANIZER'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_PHASE90E'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_FLANGER117E'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_WAH95E'	},
		{ addr:0x0000002B,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 600,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_DC30'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_HEAVYOCT'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MIN_PEDALBEND'	},
	];
	var PATCH_ASSIGN_GAFCEXPPDL3_MAX = [	// PATCH ASSIGN_GAFCEXPPDL3_MAX
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_BOOSTER'	},
		{ addr:0x00000001,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max:2000,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_DELAY'	},
		{ addr:0x00000005,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 500,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_REVERB'	},
		{ addr:0x00000009,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_CHORUS'	},
		{ addr:0x0000000A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_FLANGER'	},
		{ addr:0x0000000B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_PHASER'	},
		{ addr:0x0000000C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_UNIV'	},
		{ addr:0x0000000D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_TREMOLO'	},
		{ addr:0x0000000E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_VIBRATO'	},
		{ addr:0x0000000F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_ROTARY'	},
		{ addr:0x00000010,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_RINGMOD'	},
		{ addr:0x00000011,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_SLOWGEAR'	},
		{ addr:0x00000012,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_SLICER'	},
		{ addr:0x00000013,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_COMP'	},
		{ addr:0x00000014,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_LIMITER'	},
		{ addr:0x00000015,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_TWAH'	},
		{ addr:0x00000016,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_AUTOWAH'	},
		{ addr:0x00000017,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_PEDALWAH'	},
		{ addr:0x00000018,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_GEQ'	},
		{ addr:0x00000019,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_PEQ'	},
		{ addr:0x0000001A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_GUITARSIM'	},
		{ addr:0x0000001B,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_ACGUITARSIM'	},
		{ addr:0x0000001C,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_ACPROCESSOR'	},
		{ addr:0x0000001D,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_WAVESYNTH'	},
		{ addr:0x0000001E,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_OCTAVE'	},
		{ addr:0x0000001F,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_PITCHSHIFTER'	},
		{ addr:0x00000023,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 300,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_HARMONIST'	},
		{ addr:0x00000027,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_HUMANIZER'	},
		{ addr:0x00000028,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_PHASE90E'	},
		{ addr:0x00000029,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_FLANGER117E'	},
		{ addr:0x0000002A,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_WAH95E'	},
		{ addr:0x0000002B,	size:INTEGER4x4,	ofs:   0,	init:   0,	min:   0,	max: 600,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_DC30'	},
		{ addr:0x0000002F,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_HEAVYOCT'	},
		{ addr:0x00000030,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max: 127,	name:'PRMID_PATCH_ASSIGN_GAFCEXPPDL3_MAX_PEDALBEND'	},
	];
	var PATCH_PATCH_KNOB_READONLY = [	// PATCH PATCH_KNOB_READONLY
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_PATCH_PATCH_KNOB_READONLY_BOOSTER_KNOB'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_PATCH_PATCH_KNOB_READONLY_MOD_KNOB'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_PATCH_PATCH_KNOB_READONLY_FX_KNOB'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_PATCH_PATCH_KNOB_READONLY_DELAY_KNOB'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_PATCH_PATCH_KNOB_READONLY_REVERB_KNOB'	},
	];
	var PATCH_PATCH_KNOB_SOLO_DELAY_READONLY = [	// PATCH PATCH_KNOB_SOLO_DELAY_READONLY
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_PATCH_PATCH_KNOB_SOLO_DELAY_READONLY_SOLO_DELAY_KNOB'	},
	];
	var TEMP_TEMP_COM = [	// TEMP TEMP_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:   0,	max:   3,	name:'PRMID_TEMP_TEMP_COM_INPUT_MODE'	},
	];
	var TEMP_TEMP_KNOB = [	// TEMP TEMP_KNOB
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_TEMP_TEMP_KNOB_BOOSTER_KNOB'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_TEMP_TEMP_KNOB_MOD_KNOB'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_TEMP_TEMP_KNOB_FX_KNOB'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_TEMP_TEMP_KNOB_DELAY_KNOB'	},
		{ addr:0x00000004,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_TEMP_TEMP_KNOB_REVERB_KNOB'	},
	];
	var TEMP_TEMP_KNOB_SOLO_DELAY = [	// TEMP TEMP_KNOB_SOLO_DELAY
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   1,	init:  -1,	min:  -1,	max: 100,	name:'PRMID_TEMP_TEMP_KNOB_SOLO_DELAY_SOLO_DELAY_KNOB'	},
	];
	var COMMAND_COMMAND_COM = [	// COMMAND_COM
		{ addr:0x00000000,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_EDITOR_LEVEL'	},
		{ addr:0x00000001,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_EDITOR_MODE'	},
		{ addr:0x00000002,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_RUNNING_MODE'	},
		{ addr:0x00000003,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_EDITOR_REVISION'	},
		{ addr:0x00000100,	size:INTEGER2x7,	ofs:   0,	init:   0,	min:  0,	max:16383,	name:'CMDID_PATCH_SELECT'	},
		{ addr:0x00000104,	size:INTEGER2x7,	ofs:   0,	init:   0,	min:  0,	max:16383,	name:'CMDID_PATCH_WRITE'	},
		{ addr:0x00000106,	size:INTEGER2x7,	ofs:   0,	init:   0,	min:  0,	max:16383,	name:'CMDID_PATCH_INIT'	},
		{ addr:0x0000010E,	size:INTEGER2x7,	ofs:   0,	init:   0,	min:  0,	max:16383,	name:'CMDID_PATCH_CLEAR'	},
		{ addr:0x00010005,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_USB_DRIVER_STATE'	},
		{ addr:0x00010202,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_GAFC_TYPE'	},
		{ addr:0x00010101,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_SW_BOOST'	},
		{ addr:0x00010102,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_SW_MOD'	},
		{ addr:0x00010103,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_SW_FX'	},
		{ addr:0x00010104,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_SW_DELAY'	},
		{ addr:0x00010105,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_SW_REVERB'	},
		{ addr:0x00010106,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_SW_TAP'	},
		{ addr:0x00010107,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_SW_TAP2'	},
		{ addr:0x00010108,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_SW_TAP_SOLO'	},
		{ addr:0x00010109,	size:INTEGER1x7,	ofs:   0,	init:   0,	min:  0,	max:127,	name:'CMDID_PREVIEW_MUTE'	},
		{ addr:0x0001010A,	size:INTEGER2x7,	ofs:   0,	init:   0,	min:  0,	max:16383,	name:'CMDID_EXPORT'	},
	];

	/* group definitions */
	var SETUP = [	// SETUP
		{ addr:0x00000000,	size:   0,	child:SETUP_COM,	name:'COM'	},	// SETUP COM
	];
	var SYSTEM = [	// SYSTEM
		{ addr:0x00000000,	size:   0,	child:SYSTEM_COM,	name:'COM'	},	// SYSTEM COM
		{ addr:0x00000200,	size:   0,	child:SYSTEM_USB_COM,	name:'USB_COM'	},	// SYSTEM USB_COM
		{ addr:0x00000400,	size:   0,	child:SYSTEM_GLOBAL_COM,	name:'GLOBAL_COM'	},	// SYSTEM GLOBAL_COM
		{ addr:0x00000600,	size:   0,	child:SYSTEM_GLOBAL_EACH,	name:'GLOBAL_EACH(1)'	},	// SYSTEM GLOBAL_EACH
		{ addr:0x00000800,	size:   0,	child:SYSTEM_GLOBAL_EACH,	name:'GLOBAL_EACH(2)'	},	// SYSTEM GLOBAL_EACH
		{ addr:0x00000A00,	size:   0,	child:SYSTEM_GLOBAL_EACH,	name:'GLOBAL_EACH(3)'	},	// SYSTEM GLOBAL_EACH
		{ addr:0x00000C00,	size:   0,	child:SYSTEM_GLOBAL_PEQ,	name:'GLOBAL_PEQ(1)'	},	// SYSTEM GLOBAL_PEQ
		{ addr:0x00000E00,	size:   0,	child:SYSTEM_GLOBAL_PEQ,	name:'GLOBAL_PEQ(2)'	},	// SYSTEM GLOBAL_PEQ
		{ addr:0x00001000,	size:   0,	child:SYSTEM_GLOBAL_PEQ,	name:'GLOBAL_PEQ(3)'	},	// SYSTEM GLOBAL_PEQ
		{ addr:0x00001200,	size:   0,	child:SYSTEM_GLOBAL_GE10,	name:'GLOBAL_GE10(1)'	},	// SYSTEM GLOBAL_GE10
		{ addr:0x00001400,	size:   0,	child:SYSTEM_GLOBAL_GE10,	name:'GLOBAL_GE10(2)'	},	// SYSTEM GLOBAL_GE10
		{ addr:0x00001600,	size:   0,	child:SYSTEM_GLOBAL_GE10,	name:'GLOBAL_GE10(3)'	},	// SYSTEM GLOBAL_GE10
		{ addr:0x00001800,	size:   0,	child:SYSTEM_LINEOUT_COM,	name:'LINEOUT_COM'	},	// SYSTEM LINEOUT_COM
		{ addr:0x00001A00,	size:   0,	child:SYSTEM_LINEOUT,	name:'LINEOUT(1)'	},	// SYSTEM LINEOUT
		{ addr:0x00001C00,	size:   0,	child:SYSTEM_LINEOUT,	name:'LINEOUT(2)'	},	// SYSTEM LINEOUT
		{ addr:0x00001E00,	size:   0,	child:SYSTEM_POWERAMPIN,	name:'POWERAMPIN'	},	// SYSTEM POWERAMPIN
		{ addr:0x00002000,	size:   0,	child:SYSTEM_POWERADJUST,	name:'POWERADJUST'	},	// SYSTEM POWERADJUST
		{ addr:0x00002200,	size:   0,	child:SYSTEM_GAFC,	name:'GAFC'	},	// SYSTEM GAFC
		{ addr:0x00002400,	size:   0,	child:SYSTEM_MIDI_COM,	name:'MIDI_COM'	},	// SYSTEM MIDI_COM
		{ addr:0x00002600,	size:   0,	child:SYSTEM_MIDI_CC,	name:'MIDI_CC'	},	// SYSTEM MIDI_CC
		{ addr:0x00002800,	size:   0,	child:SYSTEM_MIDI_PC,	name:'MIDI_PC'	},	// SYSTEM MIDI_PC
	];
	var PATCH = [	// PATCH
		{ addr:0x00000000,	size:   0,	child:PATCH_COM,	name:'COM'	},	// PATCH COM
		{ addr:0x00000200,	size:   0,	child:PATCH_OTHER,	name:'OTHER'	},	// PATCH OTHER
		{ addr:0x00000400,	size:   0,	child:PATCH_COLOR,	name:'COLOR'	},	// PATCH COLOR
		{ addr:0x00000600,	size:   0,	child:PATCH_AMP,	name:'AMP'	},	// PATCH AMP
		{ addr:0x00000800,	size:   0,	child:PATCH_SW,	name:'SW'	},	// PATCH SW
		{ addr:0x00000A00,	size:   0,	child:PATCH_BOOSTER,	name:'BOOSTER(1)'	},	// PATCH BOOSTER
		{ addr:0x00000C00,	size:   0,	child:PATCH_BOOSTER,	name:'BOOSTER(2)'	},	// PATCH BOOSTER
		{ addr:0x00000E00,	size:   0,	child:PATCH_BOOSTER,	name:'BOOSTER(3)'	},	// PATCH BOOSTER
		{ addr:0x00001000,	size:   0,	child:PATCH_FX,	name:'FX(1)'	},	// PATCH FX
		{ addr:0x00001200,	size:   0,	child:PATCH_FX,	name:'FX(2)'	},	// PATCH FX
		{ addr:0x00001400,	size:   0,	child:PATCH_FX,	name:'FX(3)'	},	// PATCH FX
		{ addr:0x00001600,	size:   0,	child:PATCH_FX,	name:'FX(4)'	},	// PATCH FX
		{ addr:0x00001800,	size:   0,	child:PATCH_FX,	name:'FX(5)'	},	// PATCH FX
		{ addr:0x00001A00,	size:   0,	child:PATCH_FX,	name:'FX(6)'	},	// PATCH FX
		{ addr:0x00001C00,	size:   0,	child:PATCH_FX_DETAIL,	name:'FX_DETAIL(1)'	},	// PATCH FX_DETAIL
		{ addr:0x00001E00,	size:   0,	child:PATCH_FX_DETAIL,	name:'FX_DETAIL(2)'	},	// PATCH FX_DETAIL
		{ addr:0x00002000,	size:   0,	child:PATCH_FX_DETAIL,	name:'FX_DETAIL(3)'	},	// PATCH FX_DETAIL
		{ addr:0x00002200,	size:   0,	child:PATCH_FX_DETAIL,	name:'FX_DETAIL(4)'	},	// PATCH FX_DETAIL
		{ addr:0x00002400,	size:   0,	child:PATCH_FX_DETAIL,	name:'FX_DETAIL(5)'	},	// PATCH FX_DETAIL
		{ addr:0x00002600,	size:   0,	child:PATCH_FX_DETAIL,	name:'FX_DETAIL(6)'	},	// PATCH FX_DETAIL
		{ addr:0x00002800,	size:   0,	child:PATCH_DELAY,	name:'DELAY(1)'	},	// PATCH DELAY
		{ addr:0x00002A00,	size:   0,	child:PATCH_DELAY,	name:'DELAY(2)'	},	// PATCH DELAY
		{ addr:0x00002C00,	size:   0,	child:PATCH_DELAY,	name:'DELAY(3)'	},	// PATCH DELAY
		{ addr:0x00002E00,	size:   0,	child:PATCH_DELAY,	name:'DELAY(4)'	},	// PATCH DELAY
		{ addr:0x00003000,	size:   0,	child:PATCH_DELAY,	name:'DELAY(5)'	},	// PATCH DELAY
		{ addr:0x00003200,	size:   0,	child:PATCH_DELAY,	name:'DELAY(6)'	},	// PATCH DELAY
		{ addr:0x00003400,	size:   0,	child:PATCH_REVERB,	name:'REVERB(1)'	},	// PATCH REVERB
		{ addr:0x00003600,	size:   0,	child:PATCH_REVERB,	name:'REVERB(2)'	},	// PATCH REVERB
		{ addr:0x00003800,	size:   0,	child:PATCH_REVERB,	name:'REVERB(3)'	},	// PATCH REVERB
		{ addr:0x00003A00,	size:   0,	child:PATCH_SOLO_COM,	name:'SOLO_COM'	},	// PATCH SOLO_COM
		{ addr:0x00003C00,	size:   0,	child:PATCH_SOLO_EQ,	name:'SOLO_EQ'	},	// PATCH SOLO_EQ
		{ addr:0x00003E00,	size:   0,	child:PATCH_SOLO_DELAY,	name:'SOLO_DELAY'	},	// PATCH SOLO_DELAY
		{ addr:0x00004000,	size:   0,	child:PATCH_CONTOUR_COM,	name:'CONTOUR_COM'	},	// PATCH CONTOUR_COM
		{ addr:0x00004200,	size:   0,	child:PATCH_CONTOUR,	name:'CONTOUR(1)'	},	// PATCH CONTOUR
		{ addr:0x00004400,	size:   0,	child:PATCH_CONTOUR,	name:'CONTOUR(2)'	},	// PATCH CONTOUR
		{ addr:0x00004600,	size:   0,	child:PATCH_CONTOUR,	name:'CONTOUR(3)'	},	// PATCH CONTOUR
		{ addr:0x00004800,	size:   0,	child:PATCH_PEDALFX_COM,	name:'PEDALFX_COM'	},	// PATCH PEDALFX_COM
		{ addr:0x00004A00,	size:   0,	child:PATCH_PEDALFX,	name:'PEDALFX'	},	// PATCH PEDALFX
		{ addr:0x00004C00,	size:   0,	child:PATCH_EQ_EACH,	name:'EQ_EACH(1)'	},	// PATCH EQ_EACH
		{ addr:0x00004E00,	size:   0,	child:PATCH_EQ_EACH,	name:'EQ_EACH(2)'	},	// PATCH EQ_EACH
		{ addr:0x00005000,	size:   0,	child:PATCH_EQ_PEQ,	name:'EQ_PEQ(1)'	},	// PATCH EQ_PEQ
		{ addr:0x00005200,	size:   0,	child:PATCH_EQ_PEQ,	name:'EQ_PEQ(2)'	},	// PATCH EQ_PEQ
		{ addr:0x00005400,	size:   0,	child:PATCH_EQ_GE10,	name:'EQ_GE10(1)'	},	// PATCH EQ_GE10
		{ addr:0x00005600,	size:   0,	child:PATCH_EQ_GE10,	name:'EQ_GE10(2)'	},	// PATCH EQ_GE10
		{ addr:0x00005800,	size:   0,	child:PATCH_NS,	name:'NS'	},	// PATCH NS
		{ addr:0x00005A00,	size:   0,	child:PATCH_SENDRETURN,	name:'SENDRETURN'	},	// PATCH SENDRETURN
		{ addr:0x00005C00,	size:   0,	child:PATCH_ASSIGN_KNOBS,	name:'ASSIGN_KNOBS'	},	// PATCH ASSIGN_KNOBS
		{ addr:0x00005E00,	size:   0,	child:PATCH_ASSIGN_EXPPDL_FUNC,	name:'ASSIGN_EXPPDL_FUNC'	},	// PATCH ASSIGN_EXPPDL_FUNC
		{ addr:0x00006000,	size:   0,	child:PATCH_ASSIGN_EXPPDL_DETAIL,	name:'ASSIGN_EXPPDL_DETAIL'	},	// PATCH ASSIGN_EXPPDL_DETAIL
		{ addr:0x00006200,	size:   0,	child:PATCH_ASSIGN_EXPPDL_MIN,	name:'ASSIGN_EXPPDL_MIN'	},	// PATCH ASSIGN_EXPPDL_MIN
		{ addr:0x00006400,	size:   0,	child:PATCH_ASSIGN_EXPPDL_MAX,	name:'ASSIGN_EXPPDL_MAX'	},	// PATCH ASSIGN_EXPPDL_MAX
		{ addr:0x00006600,	size:   0,	child:PATCH_ASSIGN_FS,	name:'ASSIGN_FS'	},	// PATCH ASSIGN_FS
		{ addr:0x00006800,	size:   0,	child:PATCH_ASSIGN_GAFCFS,	name:'ASSIGN_GAFCFS(1)'	},	// PATCH ASSIGN_GAFCFS
		{ addr:0x00006A00,	size:   0,	child:PATCH_ASSIGN_GAFCFS,	name:'ASSIGN_GAFCFS(2)'	},	// PATCH ASSIGN_GAFCFS
		{ addr:0x00006C00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL1_FUNC,	name:'ASSIGN_GAFCEXPPDL1_FUNC(1)'	},	// PATCH ASSIGN_GAFCEXPPDL1_FUNC
		{ addr:0x00006E00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL1_FUNC,	name:'ASSIGN_GAFCEXPPDL1_FUNC(2)'	},	// PATCH ASSIGN_GAFCEXPPDL1_FUNC
		{ addr:0x00007000,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL1_DETAIL,	name:'ASSIGN_GAFCEXPPDL1_DETAIL(1)'	},	// PATCH ASSIGN_GAFCEXPPDL1_DETAIL
		{ addr:0x00007200,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL1_DETAIL,	name:'ASSIGN_GAFCEXPPDL1_DETAIL(2)'	},	// PATCH ASSIGN_GAFCEXPPDL1_DETAIL
		{ addr:0x00007400,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL1_MIN,	name:'ASSIGN_GAFCEXPPDL1_MIN(1)'	},	// PATCH ASSIGN_GAFCEXPPDL1_MIN
		{ addr:0x00007600,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL1_MIN,	name:'ASSIGN_GAFCEXPPDL1_MIN(2)'	},	// PATCH ASSIGN_GAFCEXPPDL1_MIN
		{ addr:0x00007800,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL1_MAX,	name:'ASSIGN_GAFCEXPPDL1_MAX(1)'	},	// PATCH ASSIGN_GAFCEXPPDL1_MAX
		{ addr:0x00007A00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL1_MAX,	name:'ASSIGN_GAFCEXPPDL1_MAX(2)'	},	// PATCH ASSIGN_GAFCEXPPDL1_MAX
		{ addr:0x00007C00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL2_FUNC,	name:'ASSIGN_GAFCEXPPDL2_FUNC(1)'	},	// PATCH ASSIGN_GAFCEXPPDL2_FUNC
		{ addr:0x00007E00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL2_FUNC,	name:'ASSIGN_GAFCEXPPDL2_FUNC(2)'	},	// PATCH ASSIGN_GAFCEXPPDL2_FUNC
		{ addr:0x00010000,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL2_DETAIL,	name:'ASSIGN_GAFCEXPPDL2_DETAIL(1)'	},	// PATCH ASSIGN_GAFCEXPPDL2_DETAIL
		{ addr:0x00010200,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL2_DETAIL,	name:'ASSIGN_GAFCEXPPDL2_DETAIL(2)'	},	// PATCH ASSIGN_GAFCEXPPDL2_DETAIL
		{ addr:0x00010400,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL2_MIN,	name:'ASSIGN_GAFCEXPPDL2_MIN(1)'	},	// PATCH ASSIGN_GAFCEXPPDL2_MIN
		{ addr:0x00010600,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL2_MIN,	name:'ASSIGN_GAFCEXPPDL2_MIN(2)'	},	// PATCH ASSIGN_GAFCEXPPDL2_MIN
		{ addr:0x00010800,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL2_MAX,	name:'ASSIGN_GAFCEXPPDL2_MAX(1)'	},	// PATCH ASSIGN_GAFCEXPPDL2_MAX
		{ addr:0x00010A00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL2_MAX,	name:'ASSIGN_GAFCEXPPDL2_MAX(2)'	},	// PATCH ASSIGN_GAFCEXPPDL2_MAX
		{ addr:0x00010C00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL3_FUNC,	name:'ASSIGN_GAFCEXPPDL3_FUNC(1)'	},	// PATCH ASSIGN_GAFCEXPPDL3_FUNC
		{ addr:0x00010E00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL3_FUNC,	name:'ASSIGN_GAFCEXPPDL3_FUNC(2)'	},	// PATCH ASSIGN_GAFCEXPPDL3_FUNC
		{ addr:0x00011000,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL3_DETAIL,	name:'ASSIGN_GAFCEXPPDL3_DETAIL(1)'	},	// PATCH ASSIGN_GAFCEXPPDL3_DETAIL
		{ addr:0x00011200,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL3_DETAIL,	name:'ASSIGN_GAFCEXPPDL3_DETAIL(2)'	},	// PATCH ASSIGN_GAFCEXPPDL3_DETAIL
		{ addr:0x00011400,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL3_MIN,	name:'ASSIGN_GAFCEXPPDL3_MIN(1)'	},	// PATCH ASSIGN_GAFCEXPPDL3_MIN
		{ addr:0x00011600,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL3_MIN,	name:'ASSIGN_GAFCEXPPDL3_MIN(2)'	},	// PATCH ASSIGN_GAFCEXPPDL3_MIN
		{ addr:0x00011800,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL3_MAX,	name:'ASSIGN_GAFCEXPPDL3_MAX(1)'	},	// PATCH ASSIGN_GAFCEXPPDL3_MAX
		{ addr:0x00011A00,	size:   0,	child:PATCH_ASSIGN_GAFCEXPPDL3_MAX,	name:'ASSIGN_GAFCEXPPDL3_MAX(2)'	},	// PATCH ASSIGN_GAFCEXPPDL3_MAX
		{ addr:0x00011C00,	size:   0,	child:PATCH_PATCH_KNOB_READONLY,	name:'PATCH_KNOB_READONLY'	},	// PATCH PATCH_KNOB_READONLY
		{ addr:0x00011E00,	size:   0,	child:PATCH_PATCH_KNOB_SOLO_DELAY_READONLY,	name:'PATCH_KNOB_SOLO_DELAY_READONLY'	},	// PATCH PATCH_KNOB_SOLO_DELAY_READONLY
	];
	var TEMP = [	// TEMP
		{ addr:0x00000000,	size:   0,	child:TEMP_TEMP_COM,	name:'TEMP_COM'	},	// TEMP TEMP_COM
		{ addr:0x00000200,	size:   0,	child:TEMP_TEMP_KNOB,	name:'TEMP_KNOB'	},	// TEMP TEMP_KNOB
		{ addr:0x00000400,	size:   0,	child:TEMP_TEMP_KNOB_SOLO_DELAY,	name:'TEMP_KNOB_SOLO_DELAY'	},	// TEMP TEMP_KNOB_SOLO_DELAY
	];

	var COMMAND = [	// COMMAND
		{ addr:0x00000000,	size:   0,	child:COMMAND_COMMAND_COM,	name:'COMMAND_COM'	},	// COMMAND COMMAND_COM
	];
	/* root */
	this.root = [
		{ addr:0x00000000,	size:   0,	child:SETUP,	name:'SETUP'	},	// SETUP
		{ addr:0x10000000,	size:   0,	child:SYSTEM,	name:'SYSTEM'	},	// SYSTEM
		{ addr:0x20000000,	size:   0,	child:PATCH,	name:'PATCH'	},	// PATCH
		{ addr:0x20100000,	size:   0,	child:PATCH,	name:'PATCH(1)'	},	// PATCH 1
		{ addr:0x20200000,	size:   0,	child:PATCH,	name:'PATCH(2)'	},	// PATCH 2
		{ addr:0x20300000,	size:   0,	child:PATCH,	name:'PATCH(3)'	},	// PATCH 3
		{ addr:0x20400000,	size:   0,	child:PATCH,	name:'PATCH(4)'	},	// PATCH 4
		{ addr:0x20500000,	size:   0,	child:PATCH,	name:'PATCH(5)'	},	// PATCH 5
		{ addr:0x20600000,	size:   0,	child:PATCH,	name:'PATCH(6)'	},	// PATCH 6
		{ addr:0x20700000,	size:   0,	child:PATCH,	name:'PATCH(7)'	},	// PATCH 7
		{ addr:0x21000000,	size:   0,	child:PATCH,	name:'PATCH(8)'	},	// PATCH 8
		{ addr:0x21100000,	size:   0,	child:PATCH,	name:'PATCH(9)'	},	// PATCH 9
		{ addr:0x21200000,	size:   0,	child:PATCH,	name:'PATCH(10)'	},	// PATCH 10
		{ addr:0x30000000,	size:   0,	child:TEMP,	name:'TEMP'	},	// TEMP
		{ addr:0x7F000000,	size:   0,	child:COMMAND,	name:'COMMAND'	},	// COMMAND
	];






	/* construction */
	(function(root){

		/* calucrate size */
		(function(a) {
			for (var n = a.length - 1; n >= 0; n--) {
				var b = a[n];
				if ('child' in b) {
					b.size = arguments.callee(b.child);
				} else {
					var bytes = 0;
					switch (b.size) {
						case INTEGER1x1: case INTEGER1x2: case INTEGER1x3: case INTEGER1x4:
						case INTEGER1x5: case INTEGER1x6: case INTEGER1x7:
							bytes = 1; break;
						case INTEGER2x4:
						case INTEGER2x7:
							bytes = 2; break;
						case INTEGER4x4:
							bytes = 4; break;
						default:
							bytes = b.size; break;
					}
					return b.addr + bytes;
				}
			}
			return 0;
		})(root);

		/* all addr and size is nibbled. */
		(function(a) {
			for (var n = 0, max = a.length; n < max; n++) {
				var b = a[n];
				if (!('nibbled' in b)) {
					b.nibbled = true;
					b.addr = nibble(b.addr);
					b.size = (0 < b.size && b.size < INTEGER1x1) ? nibble(b.size) : b.size;
					if ('child' in b) arguments.callee(b.child);
				}
			}
		})(root);

	})(this.root);

	this.layout = [ /* for layout tool */
		{ addr:0x00000000,	size:   0,	child:SETUP,	name:'SETUP'	},
		{ addr:0x10000000,	size:   0,	child:SYSTEM,	name:'SYSTEM'	},
		{ addr:0x20000000,	size:   0,	child:PATCH,	name:'PATCH'	},
		{ addr:0x30000000,	size:   0,	child:TEMP,	name:'TEMP'	},
		{ addr:0x7F000000,	size:   0,	child:COMMAND,	name:'COMMAND'	},
	];
}
