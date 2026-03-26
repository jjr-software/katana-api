//
//	resource.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

function Resource() {

	var _ = [
		{ icon: "images/bts/menu_editor@2x.png, images/bts/menu_librarian@2x.png, images/bts/menu_toneexchange@2x.png" },
		{ text: "OFF, ON" },
		{ text: "Ch.1, Ch.2, Ch.3, Ch.4, Ch.5, Ch.6, Ch.7, Ch.8, Ch.9, Ch.10, Ch.11, Ch.12, Ch.13, Ch.14, Ch.15, Ch.16" },
		{ text: "LINE OUT SETTING, POWER AMP IN SETTING, GLOBAL EQ, POWER CONTROL, USB SETTING, MIDI SETTING, GA-FC SETTING, ALL DATA BACKUP, ICON SETTING, DEVICE SETTING, OWNER'S MANUAL, VERSION " },
		{ text: "PANEL, A: CH1, A: CH2, A: CH3, A: CH4, B: CH1, B: CH2, B: CH3, B: CH4" },
		{ text: "ACOUSTIC, CLEAN, CRUNCH, LEAD, BROWN" },
		{ text: "MID BOOST, CLEAN BOOST, TREBLE BOOST, CRUNCH OD, NATURAL OD, WARM OD, FAT DS, METAL DS, OCT FUZZ, BLUES DRIVE, OVERDRIVE, T-SCREAM, TURBO OD, DISTORTION, RAT, GUV DS, DST+, METAL ZONE, '60S FUZZ, MUFF FUZZ, HM-2, METAL CORE, CENTA OD" },
		{ text: "MID BST, CLEAN BST, TREBLE BST, CRUNCH OD, NATURAL OD, WARM OD, FAT DS, METAL DS, OCT FUZZ, BLUES DRIVE, OVERDRIVE, T-SCREAM, TURBO OD, DISTORTION, RAT, GUV DS, DST+, METAL ZONE, '60S FUZZ, MUFF FUZZ, HM-2, METAL CORE, CENTA OD" },
		{ text: "T.WAH, AUTO WAH, PEDAL WAH, COMP, LIMITER, GRAPHIC EQ, PARAMETRIC EQ, GUITAR SIM, SLOW GEAR, WAVE SYNTH, OCTAVE, PITCH SHIFTER, HARMONIST, AC.PROCESSOR, PHASER, FLANGER, TREMOLO, ROTARY, UNI-V, SLICER, VIBRATO, RING MOD, HUMANIZER, CHORUS, AC.GUITAR SIM, PHASER 90E, FLANGER 117E, WAH 95E, DC-30, HEAVY OCTAVE, PEDAL BEND" },
		{ text: "T.WAH, AUTO WAH, PEDAL WAH, COMP, LIMITER, GEQ, PEQ, GUITAR SIM, SLOW GEAR, WAVE SYNTH, OCTAVE, PITCH SHIFT, HARMONIST, AC.PROCESS, PHASER, FLANGER, TREMOLO, ROTARY, UNI-V, SLICER, VIBRATO, RING MOD, HUMANIZER, CHORUS, AC.GTR SIM, PHASER 90E, FLNGR 117E, WAH 95E, DC-30, HEAVY OCT, PEDAL BEND" },
		{ text: "DIGITAL, PAN, STEREO, ANALOG, TAPE ECHO, REVERSE, MODULATE, SDE-3000" },
		{ text: "PLATE, ROOM, HALL, SPRING, MODULATE" },
		{ text: "NORMAL, INVERSE" },
		{ text: "DELAY, DLY+REV, REVERB" },
		{ text: "CHAIN1, CHAIN2-1, CHAIN3-1, CHAIN4-1, CHAIN2-2, CHAIN3-2, CHAIN4-2" },
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-blue_on@2x.png" },
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-cyan_on@2x.png" },
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-green_on@2x.png" },
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-orange_on@2x.png" },
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-pink_on@2x.png" },
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-red_on@2x.png" },	// not used
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-skyblue_on@2x.png" },
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-white_on@2x.png" },
		{ icon: "images/bts/switch_effects_off@2x.png, images/bts/switch_effects_bg-yellow_on@2x.png" },	// not used
		{ text: "LPF, BPF" },
		{ text: "DOWN, UP" },
		{ text: "CRY WAH, VO WAH, FAT WAH, LIGHT WAH, 7STRING WAH, RESO WAH" },
		{ text: "BOSS COMP, HI-BAND, LIGHT, D-COMP, ORANGE, FAT, MILD" },
		{ text: "BOSS LIMITER, RACK 160D, VTG RACK U" },
		{ text: "1:1, 1.2:1, 1.4:1, 1.6:1, 1.8:1, 2:1, 2.3:1, 2.6:1, 3:1, 3.5:1, 4:1, 5:1, 6:1, 8:1, 10:1, 12:1, 20:1, INF:1" },
		{ text: "FLAT, 20.0<br>Hz, 25.0<br>Hz, 31.5<br>Hz, 40.0<br>Hz, 50.0<br>Hz, 63.0<br>Hz, 80.0<br>Hz, 100<br>Hz, 125<br>Hz, 160<br>Hz, 200<br>Hz, 250<br>Hz, 315<br>Hz, 400<br>Hz, 500<br>Hz, 630<br>Hz, 800<br>Hz" },
		{ text: "20.0<br>Hz, 25.0<br>Hz, 31.5<br>Hz, 40.0<br>Hz, 50.0<br>Hz, 63.0<br>Hz, 80.0<br>Hz, 100<br>Hz, 125<br>Hz, 160<br>Hz, 200<br>Hz, 250<br>Hz, 315<br>Hz, 400<br>Hz, 500<br>Hz, 630<br>Hz, 800<br>Hz, 1.00<br>kHz, 1.25<br>kHz, 1.60<br>kHz, 2.00<br>kHz, 2.50<br>kHz, 3.15<br>kHz, 4.00<br>kHz, 5.00<br>kHz, 6.30<br>kHz, 8.00<br>kHz, 10.0<br>kHz" },
		{ text: "0.5, 1, 2, 4, 8, 16" },
		{ text: "630<br>Hz, 800<br>Hz, 1.00<br>kHz, 1.25<br>kHz, 1.60<br>kHz, 2.00<br>kHz, 2.50<br>kHz, 3.15<br>kHz, 4.00<br>kHz, 5.00<br>kHz, 6.30<br>kHz, 8.00<br>kHz, 10.0<br>kHz, 12.5<br>kHz, FLAT" },
		{ text: "S->H, H->S, H->HF, S->HOLLOW, H->HOLLOW, S->AC, H->AC, P->AC" },
		{ text: "SAW, SQUARE" },
		{ text: "RANGE1, RANGE2, RANGE3, RANGE4"},
		{ text: "1VOICE, 2VOICE" },
		{ text: "FAST, MEDIUM, SLOW, MONO" },
		{ text: "SMALL, MEDIUM, BRIGHT, POWER" },
		{ text: "4STAGE, 8STAGE, 12STAGE, BiPHASE" },
		{ text: "FLAT, 55<br>Hz, 110<br>Hz, 165<br>Hz, 200<br>Hz, 280<br>Hz, 340<br>Hz, 400<br>Hz, 500<br>Hz, 630<br>Hz, 800<br>Hz" },
		{ text: "P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20"},
		{ text: "NORMAL, INTELLIGENT" },
		{ text: "-2oct, -14th, -13th, -12th, -11th, -10th, -9th, -1oct, -7th, -6th, -5th, -4th, -3rd, -2nd, UNISON, +2nd, +3rd, +4th, +5th, +6th, +7th, +1oct, +9th, +10th, +11th, +12th, +13th, +14th, +2oct, USER" },
		{ text: "C<br>(Am), Db<br>(Bbm), D<br>(Bm), Eb<br>(Cm), E<br>(C#m), F<br>(Dm), F#<br>(D#m), G<br>(Em), Ab<br>(Fm), A<br>(F#m), Bb<br>(Gm), B<br>(G#m)" },
		{ text: "PICKING, AUTO" },
		{ text: "a, e, i, o, u" },
		{ text: "0.0 - 40.0ms"},
		{ text: "CHORUS, ECHO" },
		{ text: "D+E, D/E" },
		{ text: "SERIES, PARALLEL, BRANCH OUT" },
		{ text: "POST FV, POST REV, PRE FV" },
		{ text: "PARAMETRIC EQ, GE-10" },
		{ text: "AMP IN, AMP OUT" },
		{ text: "8kHz, 17kHz" },
		{ text: "PEDAL WAH, PEDAL BEND, WAH 95E" },
		{ text: "REC, LIVE, BLEND" },
		{ text: "VINTAGE, MODERN, DEEP" },
		{ text: "FLAT, -6dB<br>/oct, -12dB<br>/oct, -18dB<br>/oct, -24dB<br>/oct" },
		{ text: "1 - 127, 128" },
		{ text: "CC#1, CC#2, CC#3, CC#4, CC#5, CC#6, CC#7, CC#8, CC#9, CC#10, CC#11, CC#12, CC#13, CC#14, CC#15, CC#16, CC#17, CC#18, CC#19, CC#20, CC#21, CC#22, CC#23, CC#24, CC#25, CC#26, CC#27, CC#28, CC#29, CC#30, CC#31, CC#64, CC#65, CC#66, CC#67, CC#68, CC#69, CC#70, CC#71, CC#72, CC#73, CC#74, CC#75, CC#76, CC#77, CC#78, CC#79, CC#80, CC#81, CC#82, CC#83, CC#84, CC#85, CC#86, CC#87, CC#88, CC#89, CC#90, CC#91, CC#92, CC#93, CC#94, CC#95" },
		{ bgcolor: "gray, #40C057, #E62B0E, #FCC419" },
		{ text: "INPUT, POST AMP" },
		{ text: "STEREO, DUAL" },
		{ text: "INPUT, OUTPUT" },
		{ text: "VOLUME, FOOT VOLUME, PEDAL FX, PEDAL FX/FV, BOOSTER, MOD, FX, DELAY, DELAY2, REVERB" },
		{ text: "BANK A/B, PEDAL FX ON/OFF, SEND/RETURN ON/OFF, EQ ON/OFF, DELAY TAP, DELAY2 TAP, BOOSTER SOLO ON/OFF, SOLO ON/OFF, GLOBAL EQ ON/OFF, EQ2 ON/OFF" },
		{ text: "100<br>Hz, 125<br>Hz, 160<br>Hz, 200<br>Hz, 250<br>Hz, 315<br>Hz, 400<br>Hz, 500<br>Hz, 630<br>Hz, 800<br>Hz, 1.00<br>kHz, 1.25<br>kHz, 1.60<br>kHz, 2.00<br>kHz, 2.50<br>kHz, 3.15<br>kHz, 4.00<br>kHz"},
		{ text: "CH 1/2, BANK A/B, SOLO ON/OFF" },
		{ text: "M1, M2" },
		{ text: "DYN57, DYN421, CND451, CND87, RBN121" },
		{ text: "0cm, 1cm, 2cm, 3cm, 4cm, 5cm, 6cm, 7cm, 8cm, 9cm, 10cm, 11cm, 12cm, 13cm, 14cm, 15cm, 16cm, 17cm, 18cm, 19cm, 20cm" },	
		{ text: "0cm, 1cm, 2cm, 3cm, 4cm, 5cm, 6cm, 7cm, 8cm, 9cm, 10cm"},
		{ text: "INPUT, OUTPUT, LINE OUT, SP OUT" },
		{ text: "OFF, 1, 2, 3" },
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: ""},
		{ text: "OFF, ANA<br>LOG, TAPE<br> ECHO" },
		{ text: "10%, 20%, 30%, 40%, HALF, 60%, 70%, 80%, 90%"},
		{ text: "EFFECTS, CHAIN" },
		{ text: "BOOSTER, MOD, FX, DELAY, DELAY2, REVERB, SOLO, CONTOUR" },
		{ text: "PEDAL FX, EQ, EQ2, NS, SEND /RETURN, ASSIGN" },
		{ text: "GA-FC, GA-FC EXPAND" },
		{ text: "KNOBS/EXP PDL/FC, GA-FC/GA-FC EX, EXPANDED GA-FC/GA-FC EX" },
		{ bgcolor: "#40C057, #E62B0E, #FCC419" },
		{ text: "PROGRAM MAP, CONTROL CHANGE" },
	];

	(function() {

		for (var n = 0, max = _.length; n < max; n++) {

			if (_[n].text !== undefined) {

				_[n].text = _[n].text.replace(/1 - 127/g,
					'  1,   2,   3,   4,   5,   6,   7,   8,   9,  10,' +
					' 11,  12,  13,  14,  15,  16,  17,  18,  19,  20,' +
					' 21,  22,  23,  24,  25,  26,  27,  28,  29,  30,' +
					' 31,  32,  33,  34,  35,  36,  37,  38,  39,  40,' + 
					' 41,  42,  43,  44,  45,  46,  47,  48,  49,  50,' + 
					' 51,  52,  53,  54,  55,  56,  57,  58,  59,  60,' + 
					' 61,  62,  63,  64,  65,  66,  67,  68,  69,  70,' + 
					' 71,  72,  73,  74,  75,  76,  77,  78,  79,  80,' + 
					' 81,  82,  83,  84,  85,  86,  87,  88,  89,  90,' + 
					' 91,  92,  93,  94,  95,  96,  97,  98,  99, 100,' + 
					'101, 102, 103, 104, 105, 106, 107, 108, 109, 110,' + 
					'111, 112, 113, 114, 115, 116, 117, 118, 119, 120,' + 
					'121, 122, 123, 124, 125, 126, 127'
				); 

				_[n].text = _[n].text.replace(/C-1 - G9/g,
					'C -, C#-, D -, Eb-, E -, F -, F#-, G -, G#-, A -, Bb-, B -,' +
					'C 0, C#0, D 0, Eb0, E 0, F 0, F#0, G 0, G#0, A 0, Bb0, B 0,' +
					'C 1, C#1, D 1, Eb1, E 1, F 1, F#1, G 1, G#1, A 1, Bb1, B 1,' +
					'C 2, C#2, D 2, Eb2, E 2, F 2, F#2, G 2, G#2, A 2, Bb2, B 2,' +
					'C 3, C#3, D 3, Eb3, E 3, F 3, F#3, G 3, G#3, A 3, Bb3, B 3,' +
					'C 4, C#4, D 4, Eb4, E 4, F 4, F#4, G 4, G#4, A 4, Bb4, B 4,' +
					'C 5, C#5, D 5, Eb5, E 5, F 5, F#5, G 5, G#5, A 5, Bb5, B 5,' +
					'C 6, C#6, D 6, Eb6, E 6, F 6, F#6, G 6, G#6, A 6, Bb6, B 6,' +
					'C 7, C#7, D 7, Eb7, E 7, F 7, F#7, G 7, G#7, A 7, Bb7, B 7,' +
					'C 8, C#8, D 8, Eb8, E 8, F 8, F#8, G 8, G#8, A 8, Bb8, B 8,' +
					'C 9, C#9, D 9, Eb9, E 9, F 9, F#9, G 9'
				); 

				_[n].text = _[n].text.replace(/CC01 - CC31/g,
					'CC01, CC02, CC03, CC04, CC05, CC06, CC07, CC08, CC09, CC10, CC11, CC12,' +
					'CC13, CC14, CC15, CC16, CC17, CC18, CC19, CC20, CC21, CC22, CC23, CC24,' +
					'CC25, CC26, CC27, CC28, CC29, CC30, CC31'
				); 

				_[n].text = _[n].text.replace(/CC33 - CC95/g,
					'CC33, CC34, CC35, CC36, CC37, CC38, CC39, CC40, CC41, CC42, CC43, CC44,' +
					'CC45, CC46, CC47, CC48, CC49, CC50, CC51, CC52, CC53, CC54, CC55, CC56,' +
					'CC57, CC58, CC59, CC60, CC61, CC62, CC63, CC64, CC65, CC66, CC67, CC68,' + 
					'CC69, CC70, CC71, CC72, CC73, CC74, CC75, CC76, CC77, CC78, CC79, CC80,' +
					'CC81, CC82, CC83, CC84, CC85, CC86, CC87, CC88, CC89, CC90, CC91, CC92,' +
					'CC93, CC94, CC95'
				); 

				_[n].text = _[n].text.replace(/L64 - 63R/g,
					'L64, L63, L62, L61, L60, L59, L58, L57, L56, L55, L54, L53, L52, L51, L50, L49,' +
					'L48, L47, L46, L45, L44, L43, L42, L41, L40, L39, L38, L37, L36, L35, L34, L33,' +
					'L32, L31, L30, L29, L28, L27, L26, L25, L24, L23, L22, L21, L20, L19, L18, L17,' +
					'L16, L15, L14, L13, L12, L11, L10, L09, L08, L07, L06, L05, L04, L03, L02, L01,' +
					'  0,' +
					'01R, 02R, 03R, 04R, 05R, 06R, 07R, 08R, 09R, 10R, 11R, 12R, 13R, 14R, 15R, 16R,' +
					'17R, 18R, 19R, 20R, 21R, 22R, 23R, 24R, 25R, 26R, 27R, 28R, 29R, 30R, 31R, 32R,' +
					'33R, 34R, 35R, 36R, 37R, 38R, 39R, 40R, 41R, 42R, 43R, 44R, 45R, 46R, 47R, 48R,' +
					'49R, 50R, 51R, 52R, 53R, 54R, 55R, 56R, 57R, 58R, 59R, 60R, 61R, 62R, 63R'
				); 

				_[n].text = _[n].text.replace(/0.0 - 40.0ms/g,
					'0.0<br>ms, 0.5<br>ms, 1.0<br>ms, 1.5<br>ms, 2.0<br>ms, 2.5<br>ms, 3.0<br>ms, 3.5<br>ms, 4.0<br>ms, 4.5<br>ms, 5.0<br>ms, 5.5<br>ms, 6.0<br>ms, 6.5<br>ms, 7.0<br>ms, 7.5<br>ms, 8.0<br>ms, 8.5<br>ms, 9.0<br>ms, 9.5<br>ms,' +
					'10.0<br>ms, 10.5<br>ms, 11.0<br>ms, 11.5<br>ms, 12.0<br>ms, 12.5<br>ms, 13.0<br>ms, 13.5<br>ms, 14.0<br>ms, 14.5<br>ms, 15.0<br>ms, 15.5<br>ms, 16.0<br>ms, 16.5<br>ms, 17.0<br>ms, 17.5<br>ms, 18.0<br>ms, 18.5<br>ms, 19.0<br>ms, 19.5<br>ms,' +
					'20.0<br>ms, 20.5<br>ms, 21.0<br>ms, 21.5<br>ms, 22.0<br>ms, 22.5<br>ms, 23.0<br>ms, 23.5<br>ms, 24.0<br>ms, 24.5<br>ms, 25.0<br>ms, 25.5<br>ms, 26.0<br>ms, 26.5<br>ms, 27.0<br>ms, 27.5<br>ms, 28.0<br>ms, 28.5<br>ms, 29.0<br>ms, 29.5<br>ms,' +
					'30.0<br>ms, 30.5<br>ms, 31.0<br>ms, 31.5<br>ms, 32.0<br>ms, 32.5<br>ms, 33.0<br>ms, 33.5<br>ms, 34.0<br>ms, 34.5<br>ms, 35.0<br>ms, 35.5<br>ms, 36.0<br>ms, 36.5<br>ms, 37.0<br>ms, 37.5<br>ms, 38.0<br>ms, 38.5<br>ms, 39.0<br>ms, 39.5<br>ms, 40.0<br>ms'
				);

				var text = _[n].text.split(",");
				for (var i = 0; i < text.length; i++) { text[i] = text[i].trim(); }
				_[n].text = text;

			}

			if (_[n].icon !== undefined) {
				var icon = _[n].icon.split(",");
				for (var i = 0; i < icon.length; i++) { icon[i] = icon[i].trim(); }
				_[n].icon = icon;
			}

			if (_[n].bgcolor !== undefined) {
				var bgcolor = _[n].bgcolor.split(",");
				for (var i = 0; i < bgcolor.length; i++) { bgcolor[i] = bgcolor[i].trim(); }
				_[n].bgcolor = bgcolor;
			}

		}

	})();

	return _;
}
