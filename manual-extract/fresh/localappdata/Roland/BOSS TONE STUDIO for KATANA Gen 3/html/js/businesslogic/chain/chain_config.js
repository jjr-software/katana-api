//
//	chain_config.js
//
//	Copyright 2020 Roland Corporation. All rights reserved.
//

(function () {
    window.CHAIN_BLOCK_ID_MAP = {
        input: 'in',
        pedalFx: 'pdl',
        bootster: 'bst',
        eq: 'eq',
        amp: 'amp',
        eq2: 'eq2',
        mod: 'mod',
        fx: 'fx',
        delay1: 'dly1',
        delay2: 'dly2',
        reverb: 'rev',
        sendreturn: 'sr',
        speaker: 'speaker',
        fv: 'fv',
    };

    window.CHAIN_BLOCK_NAME = {};
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.pedalFx] = 'PEDAL FX';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.bootster] = 'BOOSTER';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.eq] = 'EQ';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.eq2] = 'EQ2';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.mod] = 'MOD';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.fx] = 'FX';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.delay1] = 'DLY1';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.delay2] = 'DLY2';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.reverb] = 'REVERB';
    CHAIN_BLOCK_NAME[CHAIN_BLOCK_ID_MAP.fv] = 'FV';

    window.CHAIN_TIPS_RELATION = {
        "pdl" : "PEDAL FX",
        "bst" : "BOOSTER",
        "mod" : "MOD",
        "fx" : "FX",
        "eq" : "EQ",
        "eq2" : "EQ2",
        "sr" : "SEND/RETURN",
        "dly1" : "DELAY",
        "dly2" : "DELAY2",
        "rev" : "REVERB",
    }

    window.CHAIN_BLOCK_NUM_RELATION = [
        CHAIN_BLOCK_ID_MAP.input,
        CHAIN_BLOCK_ID_MAP.pedalFx,
        CHAIN_BLOCK_ID_MAP.bootster,
        CHAIN_BLOCK_ID_MAP.mod,
        CHAIN_BLOCK_ID_MAP.eq,
        CHAIN_BLOCK_ID_MAP.eq2,
        CHAIN_BLOCK_ID_MAP.fv,
        CHAIN_BLOCK_ID_MAP.amp,
        CHAIN_BLOCK_ID_MAP.fx,
        CHAIN_BLOCK_ID_MAP.sendreturn,
        CHAIN_BLOCK_ID_MAP.delay1,
        CHAIN_BLOCK_ID_MAP.delay2,
        CHAIN_BLOCK_ID_MAP.reverb,
        CHAIN_BLOCK_ID_MAP.speaker,
    ];

    window.CHAIN_ON_OFF_SWITCH = [
        {switch: 'booster-sw-btn', chainId: 'bst'}, 
        {switch: 'modfx-mod-sw-btn', chainId: 'mod'}, 
        {switch: 'modfx-fx-sw-btn', chainId: 'fx'}, 
        {switch: 'delay-delay1-sw-btn', chainId: 'dly1'}, 
        {switch: 'delay-delay2-sw-btn', chainId: 'dly2'}, 
        {switch: 'reverb-sw-btn', chainId: 'rev'}, 
        {switch: 'pedalfx-sw-btn', chainId: 'pdl'}, 
        {switch: 'sr-sw-btn', chainId: 'sr'}, 
        {switch: 'eq-sw-btn', chainId: 'eq'}, 
        {switch: 'eq2-sw-btn', chainId: 'eq2'}
    ];

    window.CHAIN_CHANGE_ORDER_BY_EFFECT = [
        'patch_other_chain_switcher',
        'pedalfx-position-select-box',
        'sr-position-select-box',
        'eq-position-select-box',
        'eq2-position-select-box'
    ];

    window.CHAIN_TYPE_NAME_SWITCH = [
        {switch: ['booster-select-watcher', 'booster-asgn-grn-select-box', 'booster-asgn-red-select-box', 'booster-asgn-ylw-select-box', 'booster-type-select-box'], chainId: 'bst'}, 
        {switch: ['mod-select-watcher', 'mod-asgn-grn-select-box', 'mod-asgn-red-select-box', 'mod-asgn-ylw-select-box', 'modfx-mod-type-select-box'], chainId: 'mod'}, 
        {switch: ['fx-select-watcher', 'fx-asgn-grn-select-box', 'fx-asgn-red-select-box', 'fx-asgn-ylw-select-box', 'modfx-fx-type-select-box'], chainId: 'fx'}, 
        {switch: ['delay-select-watcher', 'delay-asgn-grn-select-box', 'delay-asgn-red-select-box', 'delay-asgn-ylw-select-box', 'delay-delay1-type-select-box'], chainId: 'dly1'}, 
        {switch: ['reverb-select-watcher', 'delay2-asgn-grn-select-box', 'delay2-asgn-red-select-box', 'delay2-asgn-ylw-select-box', 'delay-delay2-type-select-box'], chainId: 'dly2'}, 
        {switch: ['reverb-select-watcher', 'reverb-asgn-grn-select-box', 'reverb-asgn-red-select-box', 'reverb-asgn-ylw-select-box', 'reverb-type-select-box'], chainId: 'rev'}, 
        {switch: ['pedalfx-type-select-box'], chainId: 'pdl'}, 
        {switch: ['eq-type-select-box'], chainId: 'eq'}, 
        {switch: ['eq2-type-select-box'], chainId: 'eq2'}
    ];

    window.CHAIN_COLOR_SWITCH = [
        {chainId: 'bst', colors: 
            [
                {type: ['MID BOOST', 'CLEAN BOOST', 'TREBLE BOOST', 'OCT FUZZ', "'60S FUZZ", 'MUFF FUZZ'], color: '#BFBFBF'},
                {type: ['CRUNCH OD', 'NATURAL OD', 'WARM OD', 'OVERDRIVE', 'T-SCREAM', 'TURBO OD', 'CENTA OD'], color: '#FFFF00'},
                {type: ['FAT DS', 'METAL DS', 'DISTORTION', 'RAT', 'GUV DS', 'DST+'], color: '#FFC000'},
                {type: ['BLUES DRIVE'], color: '#1F4E79'},
                {type: ['METAL ZONE', 'HM-2', 'METAL CORE'], color: '#404040'},
            ]
        },
        {chainId: 'mod', colors: 
            [
                {type: ['CHORUS', 'DC-30'], color: '#9DC3E6'},
                {type: ['FLANGER', 'FLANGER 117E'], color: '#7030A0'},
                {type: ['PHASER', 'PHASER 90E'], color: '#92D050'},
                {type: ['TREMOLO', 'UNI-V'], color: '#009999'},
                {type: ['LIMITER', 'PITCH SHIFTER', 'HARMONIST', 'HUMANIZER'], color: '#0D97FF'},
                {type: ['RING MOD'], color: '#3333FF'},
                {type: ['OCTAVE', 'HEAVY OCTAVE'], color: '#503B00'},
                {type: ['WAVE SYNTH', 'ROTARY'], color: '#7F6000'},
                {type: ['SLOW GEAR'], color: '#5F5F5F'},
                {type: ['SLICER'], color: '#195A61'},
                {type: ['GUITAR SIM', 'AC.PROCESSOR', 'AC.GUITAR SIM'], color: '#CDB18F'},
                {type: ['GRAPHIC EQ', 'PARAMETRIC EQ'], color: '#FFE699'},
                {type: ['COMP', 'VIBRATO'], color: '#0070C0'},
                {type: ['T.WAH', 'AUTO WAH', 'PEDAL WAH', 'WAH 95E', 'PEDAL BEND'], color: '#CAAF6C'},
            ]
        },
        {chainId: 'fx', colors: 
            [
                {type: ['CHORUS', 'DC-30'], color: '#9DC3E6'},
                {type: ['FLANGER', 'FLANGER 117E'], color: '#7030A0'},
                {type: ['PHASER', 'PHASER 90E'], color: '#92D050'},
                {type: ['TREMOLO', 'UNI-V'], color: '#009999'},
                {type: ['LIMITER', 'PITCH SHIFTER', 'HARMONIST', 'HUMANIZER'], color: '#0D97FF'},
                {type: ['RING MOD'], color: '#3333FF'},
                {type: ['OCTAVE', 'HEAVY OCTAVE'], color: '#503B00'},
                {type: ['WAVE SYNTH', 'ROTARY'], color: '#7F6000'},
                {type: ['SLOW GEAR'], color: '#5F5F5F'},
                {type: ['SLICER'], color: '#195A61'},
                {type: ['GUITAR SIM', 'AC.PROCESSOR', 'AC.GUITAR SIM'], color: '#CDB18F'},
                {type: ['GRAPHIC EQ', 'PARAMETRIC EQ'], color: '#FFE699'},
                {type: ['COMP', 'VIBRATO'], color: '#0070C0'},
                {type: ['T.WAH', 'AUTO WAH', 'PEDAL WAH', 'WAH 95E', 'PEDAL BEND'], color: '#CAAF6C'},
            ]
        },
        {chainId: 'dly1', colors: 
            [
                {type: null, color: '#F2F2F2'},
            ]
        },
        {chainId: 'dly2', colors: 
            [
                {type: null, color: '#F2F2F2'},
            ]
        },
        {chainId: 'rev', colors: 
            [
                {type: null, color: '#8F8F8F'}
            ]
        },
        {chainId: 'pdl', colors: 
            [
                {type: null, color: '#CAAF6C'}
            ]
        },
        {chainId: 'eq', colors: 
            [
                {type: null, color: '#FFE699'}
            ]
        },
        {chainId: 'eq2', colors: 
            [
                {type: null, color: '#FFE699'}
            ]
        }
        
    ];

    window.CHAIN_BASE_BG_COLOR = '#828282';

    // DIVIDERのMODEのenum
    window.DIVIDER_MODE_ENUM = {
        dual: 0,
        singleA: 1,
        singleB: 2
    };

    // DIVIDERに結びつくLineのタイプ
    window.BRANCH_POINT_LINE_TYPE = {
        junction: 0,
        aBranch: 1,
        bBranch: 2,
        horizontal: 3
    };

    // Effectブロックのサイズ
    window.BLOCK_WIDTH_DEFAULT = 60;
    window.BLOCK_WIDTH_AMP = 135;
    window.BLOCK_SPACE = 20;

    window.INITIAL_BLOCK_NUM_ORDER = [
        0,5,6,7,8,1,2,3,4,9,10,11,12
    ];

    window.CHAIN_HTML_ID = {
        chain: '#main-chain-frame-1',
        tinyChain: '#tiny-chain-frame-1',
        chainParent: '#main-chain',
        tinyChainParent: '#tiny-chain',
        chainSquare: '#chain-square',
        tinyChainClickArea: '#tiny-chain-click-area',
        effectSettingPage: '#effects-setting',
        effectSettingPageEffectWrapperFrame: '#effects-setting-frame-2'
    };

    window.CHAIN_HTML_CLASSNAME = {
        chainBlock: '.chain-block',
        chainLine: '.chain-line',
        flashing: '.flashing',
        overlay: '.overlay',
        overlayFV: '.overlay-fv',
        overlayDiv: '.overlay-div'
    };

    CHAIN_BASE_FLOW = [
        { pdlVal: 0, srVal: 0, list: 
            [
                ['pdl','bst','amp','mod','fx','fv','sr','dly1','dly2','rev'],
                ['pdl','bst','mod','amp','fx','fv','sr','dly1','dly2','rev'],
                ['pdl','bst','mod','fx','amp','fv','sr','dly1','dly2','rev'],
                ['pdl','bst','mod','fx','dly1','amp','fv','sr','dly2','rev'],
                ['pdl','mod','bst','amp','fx','fv','sr','dly1','dly2','rev'],
                ['pdl','mod','bst','fx','amp','fv','sr','dly1','dly2','rev'],
                ['pdl','mod','bst','fx','dly1','amp','fv','sr','dly2','rev'],
                ['pdl','mod','fx','bst','amp','fv','sr','dly1','dly2','rev'],
                ['pdl','mod','fx','bst','dly1','amp','fv','sr','dly2','rev']
            ] 
        },
        { pdlVal: 0, srVal: 1, list: 
            [
                ['pdl','bst','amp','mod','fx','fv','dly1','dly2','rev','sr'], 
                ['pdl','bst','mod','amp','fx','fv','dly1','dly2','rev','sr'], 
                ['pdl','bst','mod','fx','amp','fv','dly1','dly2','rev','sr'], 
                ['pdl','bst','mod','fx','dly1','amp','fv','dly2','rev','sr'], 
                ['pdl','mod','bst','amp','fx','fv','dly1','dly2','rev','sr'], 
                ['pdl','mod','bst','fx','amp','fv','dly1','dly2','rev','sr'], 
                ['pdl','mod','bst','fx','dly1','amp','fv','dly2','rev','sr'], 
                ['pdl','mod','fx','bst','amp','fv','dly1','dly2','rev','sr'], 
                ['pdl','mod','fx','bst','dly1','amp','fv','dly2','rev','sr'] 
            ] 
        },
        { pdlVal: 0, srVal: 2, list: 
            [
                ['pdl','bst','amp','sr','mod','fx','fv','dly1','dly2','rev'], 
                ['pdl','bst','mod','amp','sr','fx','fv','dly1','dly2','rev'], 
                ['pdl','bst','mod','fx','amp','sr','fv','dly1','dly2','rev'], 
                ['pdl','bst','mod','fx','dly1','amp','sr','fv','dly2','rev'], 
                ['pdl','mod','bst','amp','sr','fx','fv','dly1','dly2','rev'], 
                ['pdl','mod','bst','fx','amp','sr','fv','dly1','dly2','rev'], 
                ['pdl','mod','bst','fx','dly1','amp','sr','fv','dly2','rev'], 
                ['pdl','mod','fx','bst','amp','sr','fv','dly1','dly2','rev'], 
                ['pdl','mod','fx','bst','dly1','amp','sr','fv','dly2','rev']
            ] 
        },
        { pdlVal: 1, srVal: 0, list: 
            [
                ['bst','amp','pdl','mod','fx','fv','sr','dly1','dly2','rev'], 
                ['bst','mod','amp','pdl','fx','fv','sr','dly1','dly2','rev'], 
                ['bst','mod','fx','amp','pdl','fv','sr','dly1','dly2','rev'], 
                ['bst','mod','fx','dly1','amp','pdl','fv','sr','dly2','rev'], 
                ['mod','bst','amp','pdl','fx','fv','sr','dly1','dly2','rev'], 
                ['mod','bst','fx','amp','pdl','fv','sr','dly1','dly2','rev'], 
                ['mod','bst','fx','dly1','amp','pdl','fv','sr','dly2','rev'], 
                ['mod','fx','bst','amp','pdl','fv','sr','dly1','dly2','rev'], 
                ['mod','fx','bst','dly1','amp','pdl','fv','sr','dly2','rev']
            ] 
        },
        { pdlVal: 1, srVal: 1, list: 
            [
                ['bst','amp','pdl','mod','fx','fv','dly1','dly2','rev','sr'], 
                ['bst','mod','amp','pdl','fx','fv','dly1','dly2','rev','sr'], 
                ['bst','mod','fx','amp','pdl','fv','dly1','dly2','rev','sr'], 
                ['bst','mod','fx','dly1','amp','pdl','fv','dly2','rev','sr'], 
                ['mod','bst','amp','pdl','fx','fv','dly1','dly2','rev','sr'], 
                ['mod','bst','fx','amp','pdl','fv','dly1','dly2','rev','sr'], 
                ['mod','bst','fx','dly1','amp','pdl','fv','dly2','rev','sr'], 
                ['mod','fx','bst','amp','pdl','fv','dly1','dly2','rev','sr'], 
                ['mod','fx','bst','dly1','amp','pdl','fv','dly2','rev','sr']
            ] 
        },
        { pdlVal: 1, srVal: 2, list: 
            [
                ['bst','amp','pdl','sr','mod','fx','fv','dly1','dly2','rev'], 
                ['bst','mod','amp','pdl','sr','fx','fv','dly1','dly2','rev'], 
                ['bst','mod','fx','amp','pdl','sr','fv','dly1','dly2','rev'], 
                ['bst','mod','fx','dly1','amp','pdl','sr','fv','dly2','rev'], 
                ['mod','bst','amp','pdl','sr','fx','fv','dly1','dly2','rev'], 
                ['mod','bst','fx','amp','pdl','sr','fv','dly1','dly2','rev'], 
                ['mod','bst','fx','dly1','amp','pdl','sr','fv','dly2','rev'], 
                ['mod','fx','bst','amp','pdl','sr','fv','dly1','dly2','rev'], 
                ['mod','fx','bst','dly1','amp','pdl','sr','fv','dly2','rev'], 
            ] 
        }, 
    ];

    CHAIN_BASE_TRANSITION = [
        {patchVal: 0, 'mod': [1,4]}, 
        {patchVal: 1, 'bst': [4], 'mod': [0, 4], 'fx': [2]}, 
        {patchVal: 2, 'bst': [5,7], 'mod': [5], 'fx': [1], 'dly1': [3]}, 
        {patchVal: 3, 'bst': [6,8], 'mod': [6], 'dly1': [2]}, 
        {patchVal: 4, 'bst': [1], 'mod': [1, 0], 'fx':[5, 7]}, 
        {patchVal: 5, 'bst': [2,7], 'mod': [2], 'fx': [4, 7], 'dly1': [6]}, 
        {patchVal: 6, 'bst': [3,8], 'mod': [3], 'fx': [8], 'dly1': [5]}, 
        {patchVal: 7, 'bst': [2,5], 'fx': [4,5], 'dly1': [8]}, 
        {patchVal: 8, 'bst': [3,6], 'fx': [6], 'dly1': [7]}, 
    ];

    CHAIN_EQ_FLOW = [
        {eqPos1: 0, eqPos2: 0, list: ['eq', 'eq2', 'amp']},
        {eqPos1: 1, eqPos2: 1, list: ['amp', 'eq', 'eq2']},
        {eqPos1: 0, eqPos2: 1, list: ['eq', 'amp', 'eq2']},
        {eqPos1: 1, eqPos2: 0, list: ['eq2', 'amp', 'eq']},
    ];
})();