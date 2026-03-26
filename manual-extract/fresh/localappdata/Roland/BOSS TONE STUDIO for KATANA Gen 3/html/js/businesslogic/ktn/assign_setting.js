//
//	assign_setting.js
//
//	Copyright 2018 Roland Corporation. All rights reserved.
//

function AssignSetting() {

	this.config = {
		booster: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_BOOSTER_PRESET
				{	id: 'booster-drive-dial'				},	// ASSIGN_BOOSTER_DRIVE
				{	id: 'booster-tone-dial'					},	// ASSIGN_BOOSTER_TONE
				{	id: 'booster-bottom-dial'				},	// ASSIGN_BOOSTER_BOTTOM
				{	id: 'booster-effect-level-dial'			},	// ASSIGN_BOOSTER_EFFECT_LEVEL
				{	id: 'booster-solo-sw-dial'				},	// ASSIGN_BOOSTER_SOLO_SW
				{	id: 'booster-solo-level-dial'			},	// ASSIGN_BOOSTER_SOLO_LEVEL
				{	id: 'booster-direct-mix-dial'			},	// ASSIGN_BOOSTER_DIRECT_MIX
			]
		},
		delay: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_DELAY_PRESET
				{	id: 'delay-delay-time-dial'				},	// ASSIGN_DELAY_DELAY_TIME
				{	id: 'delay-delay-feedback-dial'			},	// ASSIGN_DELAY_FEEDBACK
				{	id: 'delay-delay-high-cut-dial', width: 96	},	// ASSIGN_DELAY_HIGH_CUT
				{	id: 'delay-delay-effect-level-dial'		},	// ASSIGN_DELAY_EFFECT_LEVEL
				{	id: 'delay-delay-direct-mix-dial'		},	// ASSIGN_DELAY_DIRECT_MIX
				{	id: 'delay-modulate-mod-rate-dial'		},	// ASSIGN_DELAY_MOD_RATE
				{	id: 'delay-modulate-mod-depth-dial'		},	// ASSIGN_DELAY_MOD_DEPTH
			]
		},
		reverb: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_REVERB_PRESET
				{	id: 'reverb-reverb-time-dial', unformat: "value.replace(/[^0-9^\.]/g,'') * 10"	},	// ASSIGN_REVERB_REVERB_TIME
				{	id: 'reverb-reverb-pre-delay-dial'		},	// ASSIGN_REVERB_PRE_DELAY
				{	id: 'reverb-reverb-low-cut-dial', width: 96	},	// ASSIGN_REVERB_LOW_CUT
				{	id: 'reverb-reverb-high-cut-dial', width: 96	},	// ASSIGN_REVERB_HIGH_CUT
				{	id: 'reverb-reverb-density-dial'		},	// ASSIGN_REVERB_DENSITY
				{	id: 'reverb-reverb-effect-level-dial'	},	// ASSIGN_REVERB_EFFECT_LEVEL
				{	id: 'reverb-reverb-direct-mix-dial'		},	// ASSIGN_REVERB_DIRECT_MIX
				//{	id: 'delay-delay-time-dial'				},	// ASSIGN_REVERB_SPRING_SENS
			],
			// order: [
			// 	0,	// ASSIGN_REVERB_PRESET
			// 	1,	// ASSIGN_REVERB_REVERB_TIME
			// 	2,	// ASSIGN_REVERB_PRE_DELAY
			// 	3,	// ASSIGN_REVERB_LOW_CUT
			// 	4,	// ASSIGN_REVERB_HIGH_CUT
			// 	5,	// ASSIGN_REVERB_DENSITY
			// 	6,	// ASSIGN_REVERB_EFFECT_LEVEL
			// 	7,	// ASSIGN_REVERB_DIRECT_MIX
			// ]
		},
		mod_fx: null
	}

	this.configModFx = {
		chorus: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_CHORUS_PRESET
				{	id: 'modfx-chorus-low-rate-dial'		},	// ASSIGN_CHORUS_LOW_RATE
				{	id: 'modfx-chorus-low-depth-dial'		},	// ASSIGN_CHORUS_LOW_DEPTH
				{	id: 'modfx-chorus-low-pre-delay-dial', width: 96	},	// ASSIGN_CHORUS_LOW_PRE_DELAY
				{	id: 'modfx-chorus-low-level-dial'		},	// ASSIGN_CHORUS_LOW_LEVEL
				{	id: 'modfx-chorus-high-rate-dial'		},	// ASSIGN_CHORUS_HIGH_RATE
				{	id: 'modfx-chorus-high-depth-dial'		},	// ASSIGN_CHORUS_HIGH_DEPTH
				{	id: 'modfx-chorus-high-pre-delay-dial', width: 96	},	// ASSIGN_CHORUS_HIGH_PRE_DELAY
				{	id: 'modfx-chorus-high-level-dial'		},	// ASSIGN_CHORUS_HIGH_LEVEL
				{	id: 'modfx-chorus-xover-freq-dial'		},	// ASSIGN_CHORUS_XOVER_FREQ
				{	id: 'modfx-chorus-direct-mix-dial'		},	// ASSIGN_CHORUS_DIRECT_MIX
			],
			// order: [
			// 	0,	// ASSIGN_CHORUS_PRESET
			// 	1,	// ASSIGN_CHORUS_LOW_RATE
			// 	2,	// ASSIGN_CHORUS_LOW_DEPTH
			// 	3,	// ASSIGN_CHORUS_LOW_PRE_DELAY
			// 	4,	// ASSIGN_CHORUS_LOW_LEVEL
			// 	6,	// ASSIGN_CHORUS_HIGH_RATE
			// 	7,	// ASSIGN_CHORUS_HIGH_DEPTH
			// 	8,	// ASSIGN_CHORUS_HIGH_PRE_DELAY
			// 	9,	// ASSIGN_CHORUS_HIGH_LEVEL
			// 	10,	// ASSIGN_CHORUS_XOVER_FREQ
			// 	5,	// ASSIGN_CHORUS_DIRECT_MIX
			// ],
			ofs_knobs_detail: 3,
			ofs_block_exp_pedal_minmax: {
				addr: 9,
				size: INTEGER1x7
			},
		},
		flanger: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_FLANGER_PRESET
				{	id: 'modfx-flanger-rate-dial'			},	// ASSIGN_FLANGER_RATE
				{	id: 'modfx-flanger-depth-dial'			},	// ASSIGN_FLANGER_DEPTH
				{	id: 'modfx-flanger-resonance-dial'		},	// ASSIGN_FLANGER_RESO
				{	id: 'modfx-flanger-manual-dial'			},	// ASSIGN_FLANGER_MANUAL
				{	id: 'modfx-flanger-low-cut-dial', width: 96	},	// ASSIGN_FLANGER_LOW_CUT
				{	id: 'modfx-flanger-effect-level-dial'	},	// ASSIGN_FLANGER_EFFECT_LEVEL
				{	id: 'modfx-flanger-direct-mix-dial'		},	// ASSIGN_FLANGER_DIRECT_MIX
			],
			// order: [
			// 	0,	// ASSIGN_FLANGER_PRESET
			// 	1,	// ASSIGN_FLANGER_RATE
			// 	2,	// ASSIGN_FLANGER_DEPTH
			// 	3,	// ASSIGN_FLANGER_RESO
			// 	4,	// ASSIGN_FLANGER_MANUAL
			// 	6,	// ASSIGN_FLANGER_LOW_CUT
			// 	5,	// ASSIGN_FLANGER_EFFECT_LEVEL
			// 	7,	// ASSIGN_FLANGER_DIRECT_MIX
			// ],
			ofs_knobs_detail: 4,
			ofs_block_exp_pedal_minmax: {
				addr: 10,
				size: INTEGER1x7
			},
		},
		phaser: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_PHASER_PRESET
				{	id: 'modfx-phaser-rate-dial'			},	// ASSIGN_PHASER_RATE
				{	id: 'modfx-phaser-depth-dial'			},	// ASSIGN_PHASER_DEPTH
				{	id: 'modfx-phaser-resonance-dial'		},	// ASSIGN_PHASER_RESO
				{	id: 'modfx-phaser-manual-dial'			},	// ASSIGN_PHASER_MANUAL
				{	id: 'modfx-phaser-step-rate-dial', unfomat: "(value.toUpperCase() === 'OFF')? -1:value"	},	// ASSIGN_PHASER_STEP_RATE
				{	id: 'modfx-phaser-effect-level-dial'	},	// ASSIGN_PHASER_EFFECT_LEVEL
				{	id: 'modfx-phaser-direct-mix-dial'		},	// ASSIGN_PHASER_DIRECT_MIX
			],
			// order: [
			// 	0,	// ASSIGN_PHASER_PRESET
			// 	1,	// ASSIGN_PHASER_RATE
			// 	2,	// ASSIGN_PHASER_DEPTH
			// 	3,	// ASSIGN_PHASER_RESO
			// 	4,	// ASSIGN_PHASER_MANUAL
			// 	6,	// ASSIGN_PHASER_STEP_RATE
			// 	5,	// ASSIGN_PHASER_EFFECT_LEVEL
			// 	7,	// ASSIGN_PHASER_DIRECT_MIX
			// ],
			ofs_knobs_detail: 5,
			ofs_block_exp_pedal_minmax: {
				addr: 11,
				size: INTEGER1x7
			},
		},
		univ: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_UNI_V_PRESET
				{	id: 'modfx-univ-rate-dial'				},	// ASSIGN_UNI_V_RATE
				{	id: 'modfx-univ-depth-dial'				},	// ASSIGN_UNI_V_DEPTH
				{	id: 'modfx-univ-level-dial'				},	// ASSIGN_UNI_V_LEVEL
			],
			ofs_knobs_detail: 6,
			ofs_block_exp_pedal_minmax: {
				addr: 12,
				size: INTEGER1x7
			},
		},
		tremolo: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_TREMOLO_PRESET
				{	id: 'modfx-tremolo-wave-shape-dial'		},	// ASSIGN_TREMOLO_WAVE_SHAPE
				{	id: 'modfx-tremolo-rate-dial'			},	// ASSIGN_TREMOLO_RATE
				{	id: 'modfx-tremolo-depth-dial'			},	// ASSIGN_TREMOLO_DEPTH
				{	id: 'modfx-tremolo-level-dial'			},	// ASSIGN_TREMOLO_LEVEL
			],
			ofs_knobs_detail: 7,
			ofs_block_exp_pedal_minmax: {
				addr: 13,
				size: INTEGER1x7
			},
		},
		vibrato: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_VIBRATO_PRESET
				{	id: 'modfx-vibrato-rate-dial'			},	// ASSIGN_VIBRATO_RATE
				{	id: 'modfx-vibrato-depth-dial'			},	// ASSIGN_VIBRATO_DEPTH
				{	id: 'modfx-vibrato-level-dial'			},	// ASSIGN_VIBRATO_LEVEL
			],
			ofs_knobs_detail: 8,
			ofs_block_exp_pedal_minmax: {
				addr: 14,
				size: INTEGER1x7
			},
		},
		rotary: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_ROTARY_PRESET
				{	id: 'modfx-rotary-rate-dial'			},	// ASSIGN_ROTARY_RATE	//RATE_FAST
				{	id: 'modfx-rotary-depth-dial'			},	// ASSIGN_ROTARY_DEPTH
				{	id: 'modfx-rotary-level-dial'			},	// ASSIGN_ROTARY_LEVEL
			],
			ofs_knobs_detail: 9,
			ofs_block_exp_pedal_minmax: {
				addr: 15,
				size: INTEGER1x7
			},
		},
		ringmod: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_RING_MOD_PRESET
				{	id: 'modfx-ringmod-freq-dial'			},	// ASSIGN_RING_MOD_FREQUENCY
				{	id: 'modfx-ringmod-effect-level-dial'	},	// ASSIGN_RING_MOD_EFFECT_LEVEL
				{	id: 'modfx-ringmod-direct-mix-dial'		},	// ASSIGN_RING_MOD_DIRECT_MIX
			],
			ofs_knobs_detail: 10,
			ofs_block_exp_pedal_minmax: {
				addr: 16,
				size: INTEGER1x7
			},
		},
		slowgear: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_SLOW_GEAR_PRESET
				{	id: 'modfx-slowgear-sens-dial'			},	// ASSIGN_SLOW_GEAR_SENS
				{	id: 'modfx-slowgear-rise-time-dial'		},	// ASSIGN_SLOW_GEAR_RISE_TIME
				{	id: 'modfx-slowgear-level-dial'			},	// ASSIGN_SLOW_GEAR_LEVEL
			],
			ofs_knobs_detail: 11,
			ofs_block_exp_pedal_minmax: {
				addr: 17,
				size: INTEGER1x7
			},
		},
		slicer: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_SLICER_PRESET
				{	id: 'modfx-slicer-rate-dial'			},	// ASSIGN_SLICER_RATE
				{	id: 'modfx-slicer-trigger-sens-dial'	},	// ASSIGN_SLICER_TRIGGER_SENS
				{	id: 'modfx-slicer-effect-level-dial'	},	// ASSIGN_SLICER_EFFECT_LEVEL
				{	id: 'modfx-slicer-direct-mix-dial'		},	// ASSIGN_SLICER_DIRECT_MIX
			],
			ofs_knobs_detail: 12,
			ofs_block_exp_pedal_minmax: {
				addr: 18,
				size: INTEGER1x7
			},
		},
		comp: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_COMP_PRESET
				{	id: 'modfx-comp-sustain-dial'			},	// ASSIGN_COMP_SUSTAIN
				{	id: 'modfx-comp-attack-dial'			},	// ASSIGN_COMP_ATTACK
				{	id: 'modfx-comp-tone-dial'				},	// ASSIGN_COMP_TONE
				{	id: 'modfx-comp-level-dial'				},	// ASSIGN_COMP_LEVEL
			],
			ofs_knobs_detail: 13,
			ofs_block_exp_pedal_minmax: {
				addr: 19,
				size: INTEGER1x7
			},
		},
		limiter: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_LIMITER_PRESET
				{	id: 'modfx-limiter-threshold-dial'		},	// ASSIGN_LIMITER_THRESHOLD
				{	id: 'modfx-limiter-ratio-dial', width: 96	},	// ASSIGN_LIMITER_RATIO
				{	id: 'modfx-limiter-attack-dial'			},	// ASSIGN_LIMITER_ATTACK
				{	id: 'modfx-limiter-release-dial'		},	// ASSIGN_LIMITER_RELEASE
				{	id: 'modfx-limiter-level-dial'			},	// ASSIGN_LIMITER_LEVEL
			],
			ofs_knobs_detail: 14,
			ofs_block_exp_pedal_minmax: {
				addr: 20,
				size: INTEGER1x7
			},
		},
		twah: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_T_WAH_PRESET
				{	id: 'modfx-twah-sens-dial'				},	// ASSIGN_T_WAH_SENS
				{	id: 'modfx-twah-freq-dial'				},	// ASSIGN_T_WAH_FREQ
				{	id: 'modfx-twah-peak-dial'				},	// ASSIGN_T_WAH_PEAK
				{	id: 'modfx-twah-effect-level-dial'		},	// ASSIGN_T_WAH_EFFECT_LEVEL
				{	id: 'modfx-twah-direct-mix-dial'		},	// ASSIGN_T_WAH_DIRECT_MIX
			],
			ofs_knobs_detail: 15,
			ofs_block_exp_pedal_minmax: {
				addr: 21,
				size: INTEGER1x7
			},
		},
		autowah: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_AUTO_WAH_PRESET
				{	id: 'modfx-autowah-rate-dial'			},	// ASSIGN_AUTO_WAH_RATE
				{	id: 'modfx-autowah-depth-dial'			},	// ASSIGN_AUTO_WAH_DEPTH
				{	id: 'modfx-autowah-freq-dial'			},	// ASSIGN_AUTO_WAH_FREQ
				{	id: 'modfx-autowah-peak-dial'			},	// ASSIGN_AUTO_WAH_PEAK
				{	id: 'modfx-autowah-effect-level-dial'	},	// ASSIGN_AUTO_WAH_EFFECT_LEVEL
				{	id: 'modfx-autowah-direct-mix-dial'		},	// ASSIGN_AUTO_WAH_DIRECT_MIX
			],
			ofs_knobs_detail: 16,
			ofs_block_exp_pedal_minmax: {
				addr: 22,
				size: INTEGER1x7
			},
		},
		pedalwah: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_PEDAL_WAH_PRESET
				{	id: 'modfx-pedalwah-pedal-pos-dial'		},	// ASSIGN_PEDAL_WAH_PEDAL_POS
				{	id: 'modfx-pedalwah-pedal-min-dial'		},	// ASSIGN_PEDAL_WAH_PEDAL_MIN
				{	id: 'modfx-pedalwah-pedal-max-dial'		},	// ASSIGN_PEDAL_WAH_PEDAL_MAX
				{	id: 'modfx-pedalwah-effect-level-dial'	},	// ASSIGN_PEDAL_WAH_EFFECT_LEVEL
				{	id: 'modfx-pedalwah-direct-mix-dial'	},	// ASSIGN_PEDAL_WAH_DIRECT_MIX
			],
			ofs_knobs_detail: 17,
			ofs_block_exp_pedal_minmax: {
				addr: 23,
				size: INTEGER1x7
			},
		},
		geq: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_GEQ_PRESET
				{	id: 'modfx-geq-31hz-slider'				},	// ASSIGN_GEQ_31Hz		//BAND1
				{	id: 'modfx-geq-62hz-slider'				},	// ASSIGN_GEQ_62Hz
				{	id: 'modfx-geq-125hz-slider'			},	// ASSIGN_GEQ_125Hz
				{	id: 'modfx-geq-250hz-slider'			},	// ASSIGN_GEQ_250Hz
				{	id: 'modfx-geq-500hz-slider'			},	// ASSIGN_GEQ_500Hz
				{	id: 'modfx-geq-1khz-slider'				},	// ASSIGN_GEQ_1kHz
				{	id: 'modfx-geq-2khz-slider'				},	// ASSIGN_GEQ_2kHz
				{	id: 'modfx-geq-4khz-slider'				},	// ASSIGN_GEQ_4kHz
				{	id: 'modfx-geq-8khz-slider'				},	// ASSIGN_GEQ_8kHz
				{	id: 'modfx-geq-16khz-slider'			},	// ASSIGN_GEQ_16kHz
				{	id: 'modfx-geq-level-slider'			},	// ASSIGN_GEQ_LEVEL
			],
			ofs_knobs_detail: 18,
			ofs_block_exp_pedal_minmax: {
				addr: 24,
				size: INTEGER1x7
			},
		},
		peq: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_PEQ_PRESET
				{	id: 'modfx-peq-low-gain-dial'			},	// ASSIGN_PEQ_LOW_GAIN
				{	id: 'modfx-peq-low-mid-gain-dial'		},	// ASSIGN_PEQ_LOW_MID_GAIN
				{	id: 'modfx-peq-high-mid-gain-dial'		},	// ASSIGN_PEQ_HIGH_MID_GAIN
				{	id: 'modfx-peq-high-gain-dial'			},	// ASSIGN_PEQ_HIGH_GAIN
				{	id: 'modfx-peq-level-dial'				},	// ASSIGN_PEQ_LEVEL
				{	id: 'modfx-peq-low-mid-freq-dial', width: 96	},	// ASSIGN_PEQ_LOW_MID_FREQ
				{	id: 'modfx-peq-low-mid-q-dial'			},	// ASSIGN_PEQ_LOW_MID_Q
				{	id: 'modfx-peq-high-mid-freq-dial', width: 96	},	// ASSIGN_PEQ_HIGH_MID_FREQ
				{	id: 'modfx-peq-high-mid-q-dial'			},	// ASSIGN_PEQ_HIGH_MID_Q
				{	id: 'modfx-peq-low-cut-dial', width: 96	},	// ASSIGN_PEQ_LOW_CUT
				{	id: 'modfx-peq-high-cut-dial', width: 96	},	// ASSIGN_PEQ_HIGH_CUT
			],
			// order: [
			// 	0,	// ASSIGN_PEQ_PRESET
			// 	1,	// ASSIGN_PEQ_LOW_GAIN
			// 	2,	// ASSIGN_PEQ_LOW_MID_GAIN
			// 	3,	// ASSIGN_PEQ_HIGH_MID_GAIN
			// 	4,	// ASSIGN_PEQ_HIGH_GAIN
			// 	5,	// ASSIGN_PEQ_LEVEL
			// 	6,	// ASSIGN_PEQ_LOW_MID_FREQ
			// 	7,	// ASSIGN_PEQ_LOW_MID_Q
			// 	8,	// ASSIGN_PEQ_HIGH_MID_FREQ
			// 	9,	// ASSIGN_PEQ_HIGH_MID_Q
			// 	10,	// ASSIGN_PEQ_LOW_CUT
			// 	11,	// ASSIGN_PEQ_HIGH_CUT
			// ],
			ofs_knobs_detail: 19,
			ofs_block_exp_pedal_minmax: {
				addr: 25,
				size: INTEGER1x7
			},
		},
		guitarsim: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_GUITAR_SIM_PRESET
				{	id: 'modfx-guitarsim-body-dial'			},	// ASSIGN_GUITAR_SIM_BODY
				{	id: 'modfx-guitarsim-low-dial'			},	// ASSIGN_GUITAR_SIM_LOW
				{	id: 'modfx-guitarsim-high-dial'			},	// ASSIGN_GUITAR_SIM_HIGH
				{	id: 'modfx-guitarsim-level-dial'		},	// ASSIGN_GUITAR_SIM_LEVEL
			],
			// order: [
			// 	0,	// ASSIGN_GUITAR_SIM_PRESET
			// 	3,	// ASSIGN_GUITAR_SIM_BODY
			// 	1,	// ASSIGN_GUITAR_SIM_LOW
			// 	2,	// ASSIGN_GUITAR_SIM_HIGH
			// 	4,	// ASSIGN_GUITAR_SIM_LEVEL
			// ],
			ofs_knobs_detail: 20,
			ofs_block_exp_pedal_minmax: {
				addr: 26,
				size: INTEGER1x7
			},
		},
		acgtrsim: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_AC_GUITAR_SIM_PRESET
				{	id: 'modfx-acgtrsim-body-dial'			},	// ASSIGN_AC_GUITAR_SIM_BODY
				{	id: 'modfx-acgtrsim-low-dial'			},	// ASSIGN_AC_GUITAR_SIM_LOW
				{	id: 'modfx-acgtrsim-high-dial'			},	// ASSIGN_AC_GUITAR_SIM_HIGH
				{	id: 'modfx-acgtrsim-level-dial'			},	// ASSIGN_AC_GUITAR_SIM_LEVEL
			],
			ofs_knobs_detail: 21,
			ofs_block_exp_pedal_minmax: {
				addr: 27,
				size: INTEGER1x7
			},
		},
		acproc: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_AC_PROCESSOR_PRESET
				{	id: 'modfx-acproc-bass-dial'			},	// ASSIGN_AC_PROCESSOR_BASS
				{	id: 'modfx-acproc-middle-dial'			},	// ASSIGN_AC_PROCESSOR_MIDDLE
				{	id: 'modfx-acproc-middle-freq-dial', width: 96	},	// ASSIGN_AC_PROCESSOR_MIDDLE_FREQ
				{	id: 'modfx-acproc-treble-dial'			},	// ASSIGN_AC_PROCESSOR_TREBLE
				{	id: 'modfx-acproc-presence-dial'		},	// ASSIGN_AC_PROCESSOR_PRESENCE
				{	id: 'modfx-acproc-level-dial'			},	// ASSIGN_AC_PROCESSOR_LEVEL
			],
			// order: [
			// 	0,	// ASSIGN_AC_PROCESSOR_PRESET
			// 	1,	// ASSIGN_AC_PROCESSOR_BASS
			// 	2,	// ASSIGN_AC_PROCESSOR_MIDDLE
			// 	6,	// ASSIGN_AC_PROCESSOR_MIDDLE_FREQ
			// 	3,	// ASSIGN_AC_PROCESSOR_TREBLE
			// 	4,	// ASSIGN_AC_PROCESSOR_PRESENCE
			// 	5,	// ASSIGN_AC_PROCESSOR_LEVEL
			// ],
			ofs_knobs_detail: 22,
			ofs_block_exp_pedal_minmax: {
				addr: 28,
				size: INTEGER1x7
			},
		},
		wavesynth: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_WAVE_SYNTH_PRESET
				{	id: 'modfx-wavesynth-cutoff-dial'		},	// ASSIGN_WAVE_SYNTH_CUTOFF
				{	id: 'modfx-wavesynth-resonance-dial'	},	// ASSIGN_WAVE_SYNTH_RESONANCE
				{	id: 'modfx-wavesynth-synth-level-dial'	},	// ASSIGN_WAVE_SYNTH_SYNTH_LEVEL
				{	id: 'modfx-wavesynth-filter-sens-dial'	},	// ASSIGN_WAVE_SYNTH_FILTER_SENS
				{	id: 'modfx-wavesynth-filter-decay-dial'	},	// ASSIGN_WAVE_SYNTH_FILTER_DECAY
				{	id: 'modfx-wavesynth-filter-depth-dial'	},	// ASSIGN_WAVE_SYNTH_FILTER_DEPTH
				{	id: 'modfx-wavesynth-direct-mix-dial'	},	// ASSIGN_WAVE_SYNTH_DIRECT_MIX
			],
			ofs_knobs_detail: 23,
			ofs_block_exp_pedal_minmax: {
				addr: 29,
				size: INTEGER1x7
			},
		},
		octave: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_OCTAVE_PRESET
				{	id: 'modfx-octave-effect-level-dial'	},	// ASSIGN_OCTAVE_EFFECT_LEVEL
				{	id: 'modfx-octave-direct-mix-dial'		},	// ASSIGN_OCTAVE_DIRECT_MIX
			],
			ofs_knobs_detail: 24,
			ofs_block_exp_pedal_minmax: {
				addr: 30,
				size: INTEGER1x7
			},
		},
		heavyoct: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_HEAVY_OCT_PRESET
				{	id: 'modfx-heavyoct-1oct-level-dial'	},	// ASSIGN_HEAVY_OCT_1OCT_LEVEL
				{	id: 'modfx-heavyoct-2cot-level-dial'	},	// ASSIGN_HEAVY_OCT_2OCT_LEVEL
				{	id: 'modfx-heavyoct-direct-mix-dial'	},	// ASSIGN_HEAVY_OCT_DIRECT_LEVEL
			],
			ofs_knobs_detail: 32,
			ofs_block_exp_pedal_minmax: {
				addr: 41,
				size: INTEGER1x7
			},
		},
		pshift: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_PITCH_SHIFTER_PRESET
				{	id: 'modfx-pshift-pitch1-dial'			},	// ASSIGN_PITCH_SHIFTER_PS1_PITCH
				{	id: 'modfx-pshift-fine1-dial'			},	// ASSIGN_PITCH_SHIFTER_PS1_FINE
				{	id: 'modfx-pshift-pre-delay1-dial'		},	// ASSIGN_PITCH_SHIFTER_PS1_PRE_DELAY
				{	id: 'modfx-pshift-level1-dial'			},	// ASSIGN_PITCH_SHIFTER_PS1_LEVEL
				{	id: 'modfx-pshift-feedback-dial'		},	// ASSIGN_PITCH_SHIFTER_PS1_FEEDBACK
				{	id: 'modfx-pshift-pitch2-dial'			},	// ASSIGN_PITCH_SHIFTER_PS2_PITCH
				{	id: 'modfx-pshift-fine2-dial'			},	// ASSIGN_PITCH_SHIFTER_PS2_FINE
				{	id: 'modfx-pshift-pre-delay2-dial'		},	// ASSIGN_PITCH_SHIFTER_PS2_PRE_DELAY
				{	id: 'modfx-pshift-level2-dial'			},	// ASSIGN_PITCH_SHIFTER_PS2_LEVEL
				{	id: 'modfx-pshift-direct-mix-dial'		},	// ASSIGN_PITCH_SHIFTER_DIRECT_MIX
			],
			// order: [
			// 	0,	// ASSIGN_PITCH_SHIFTER_PRESET
			// 	1,	// ASSIGN_PITCH_SHIFTER_PS1_PITCH
			// 	6,	// ASSIGN_PITCH_SHIFTER_PS1_FINE
			// 	7,	// ASSIGN_PITCH_SHIFTER_PS1_PRE_DELAY
			// 	2,	// ASSIGN_PITCH_SHIFTER_PS1_LEVEL
			// 	8,	// ASSIGN_PITCH_SHIFTER_PS1_FEEDBACK
			// 	3,	// ASSIGN_PITCH_SHIFTER_PS2_PITCH
			// 	9,	// ASSIGN_PITCH_SHIFTER_PS2_FINE
			// 	10,	// ASSIGN_PITCH_SHIFTER_PS2_PRE_DELAY
			// 	4,	// ASSIGN_PITCH_SHIFTER_PS2_LEVEL
			// 	5,	// ASSIGN_PITCH_SHIFTER_DIRECT_MIX
			// ],
			ofs_knobs_detail: 25,
			ofs_block_exp_pedal_minmax: {
				addr: 31,
				size: INTEGER4x4
			},
		},
		harmonist: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_HARMONIST_PRESET
				{	id: 'modfx-harmonist-harmony1-dial', width: 96	},	// ASSIGN_HARMONIST_HR1_HARMONY
				{	id: 'modfx-harmonist-level1-dial'		},	// ASSIGN_HARMONIST_HR1_LEVEL
				{	id: 'modfx-harmonist-pre-delay1-dial'	},	// ASSIGN_HARMONIST_HR1_PRE_DELAY
				{	id: 'modfx-harmonist-feedback-dial'		},	// ASSIGN_HARMONIST_HR1_FEEDBACK
				{	id: 'modfx-harmonist-harmony2-dial', width: 96	},	// ASSIGN_HARMONIST_HR2_HARMONY
				{	id: 'modfx-harmonist-level2-dial'		},	// ASSIGN_HARMONIST_HR2_LEVEL
				{	id: 'modfx-harmonist-pre-delay2-dial'	},	// ASSIGN_HARMONIST_HR2_PRE_DELAY
				{	id: 'modfx-harmonist-master-key-dial', width: 96	},	// ASSIGN_HARMONIST_MASTER_KEY	// MASTER パラメータ
				{	id: 'modfx-harmonist-direct-mix-dial'	},	// ASSIGN_HARMONIST_DIRECT_MIX
			],		// User Setting は含めない
			// order: [
			// 	0,	// ASSIGN_HARMONIST_PRESET
			// 	1,	// ASSIGN_HARMONIST_HR1_HARMONY
			// 	7,	// ASSIGN_HARMONIST_HR1_LEVEL
			// 	5,	// ASSIGN_HARMONIST_HR1_PRE_DELAY
			// 	6,	// ASSIGN_HARMONIST_HR1_FEEDBACK
			// 	2,	// ASSIGN_HARMONIST_HR2_HARMONY
			// 	9,	// ASSIGN_HARMONIST_HR2_LEVEL
			// 	8,	// ASSIGN_HARMONIST_HR2_PRE_DELAY
			// 	3,	// ASSIGN_HARMONIST_MASTER_KEY	// MASTER パラメータ
			// 	4,	// ASSIGN_HARMONIST_DIRECT_MIX
			// ],
			ofs_knobs_detail: 26,
			ofs_block_exp_pedal_minmax: {
				addr: 35,
				size: INTEGER4x4
			},
		},
		humanizer: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_HUMANIZER_PRESET
				{	id: 'modfx-humanizer-rate-dial'			},	// ASSIGN_HUMANIZER_RATE
				{	id: 'modfx-humanizer-depth-dial'		},	// ASSIGN_HUMANIZER_DEPTH
				{	id: 'modfx-humanizer-sens-dial'			},	// ASSIGN_HUMANIZER_SENS
				{	id: 'modfx-humanizer-manual-dial'		},	// ASSIGN_HUMANIZER_MANUAL
				{	id: 'modfx-humanizer-level-dial'		},	// ASSIGN_HUMANIZER_LEVEL
			],
			// order: [
			// 	0,	// ASSIGN_HUMANIZER_PRESET
			// 	1,	// ASSIGN_HUMANIZER_RATE
			// 	2,	// ASSIGN_HUMANIZER_DEPTH
			// 	4,	// ASSIGN_HUMANIZER_SENS
			// 	5,	// ASSIGN_HUMANIZER_MANUAL
			// 	3,	// ASSIGN_HUMANIZER_LEVEL
			// ],
			ofs_knobs_detail: 27,
			ofs_block_exp_pedal_minmax: {
				addr: 36,
				size: INTEGER1x7
			},
		},
		phaser90e: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_EVH_PHASER_PRESET
				{	id: 'modfx-phaser90e-speed-dial'		},	// ASSIGN_EVH_PHASER_SPEED
			],
			ofs_knobs_detail: 28,
			ofs_block_exp_pedal_minmax: {
				addr: 37,
				size: INTEGER1x7
			},
		},
		flanger117e: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_EVH_FLANGER_PRESET
				{	id: 'modfx-flanger117e-manual-dial'		},	// ASSIGN_EVH_FLANGER_MANUAL
				{	id: 'modfx-flanger117e-width-dial'		},	// ASSIGN_EVH_FLANGER_WIDTH
				{	id: 'modfx-flanger117e-speed-dial'		},	// ASSIGN_EVH_FLANGER_SPEED
				{	id: 'modfx-flanger117e-regen-dial'		},	// ASSIGN_EVH_FLANGER_REGEN
			],
			ofs_knobs_detail: 29,
			ofs_block_exp_pedal_minmax: {
				addr: 38,
				size: INTEGER1x7
			},
		},
		wah95e: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_EVH_WAH_PRESET
				{	id: 'modfx-wah95e-pedal-pos-dial'		},	// ASSIGN_EVH_WAH_PEDAL_POS
				{	id: 'modfx-wah95e-pedal-min-dial'		},	// ASSIGN_EVH_WAH_PEDAL_MIN
				{	id: 'modfx-wah95e-pedal-max-dial'		},	// ASSIGN_EVH_WAH_PEDAL_MAX
				{	id: 'modfx-wah95e-effect-level-dial'	},	// ASSIGN_EVH_WAH_EFFECT_LEVEL
				{	id: 'modfx-wah95e-direct-mix-dial'		},	// ASSIGN_EVH_WAH_DIRECT_MIX
			],
			ofs_knobs_detail: 30,
			ofs_block_exp_pedal_minmax: {
				addr: 39,
				size: INTEGER1x7
			},
		},
		dc30: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_DC30_PRESET
				{	id: 'modfx-dc30-cho-intensity-dial'		},	// ASSIGN_DC30_CHORUS_INTENSITY
				{	id: 'modfx-dc30-echo-repeat-rate-dial'	},	// ASSIGN_DC30_ECHO_REPEAT_RATE
				{	id: 'modfx-dc30-echo-intensity-dial'	},	// ASSIGN_DC30_ECHO_INTENSITY
				{	id: 'modfx-dc30-echo-volume-dial'		},	// ASSIGN_DC30_ECHO_VOLUME
				{	id: 'modfx-dc30-input-volume-dial'		},	// ASSIGN_DC30_INPUT_VOLUME
				{	id: 'modfx-dc30-tone-dial'				},	// ASSIGN_DC30_ECHO_TONE
			],
			ofs_knobs_detail: 31,
			ofs_block_exp_pedal_minmax: {
				addr: 40,
				size: INTEGER4x4
			},
		},
		pedalbend: {
			param: [
				{	name: 'PRESET',	min: 0,	max: 100		},	// ASSIGN_PEDALBEND_PRESET
				{	id: 'modfx-pedalbend-pedal-pos-dial'	},	// ASSIGN_PEDALBEND_PEDAL_POS
				{	id: 'modfx-pedalbend-pitch-dial'		},	// ASSIGN_PEDALBEND_PITCH
				{	id: 'modfx-pedalbend-effect-level-dial'	},	// ASSIGN_PEDALBEND_EFFECT_LEVEL
				{	id: 'modfx-pedalbend-direct-mix-dial'	},	// ASSIGN_PEDALBEND_DIRECT_MIX
			],
			ofs_knobs_detail: 33,
			ofs_block_exp_pedal_minmax: {
				addr: 41,
				size: INTEGER1x7
			},
		}
	}
}
