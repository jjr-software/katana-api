//
//	debug.js
//
//	Copyright 2019 Roland Corporation. All rights reserved.
//

//----------------------------------
//	for MIDI debug
//----------------------------------
/* to prevent error for eslint */
/* global LOG_MIDI_IN:true, LOG_MIDI_OUT:true */
let head = STX + ROLAND + ProductSetting.deviceId + ProductSetting.modelId;
let headLen = head.length;
var _map = new AddressMap();

LOG_MIDI_IN = function (msg) {

	// if (!ProductSetting.developmentMode) {
	// 	return;
	// }

	var _ = '';
	var __ = 'LOG_MIDI_IN ';


	for (var i = 0, len = msg.length; i < len; i += 2) {
		_ += msg.slice(i, i + 2);
		_ += ' ';
	}

	head = STX + ROLAND + ProductSetting.deviceId + ProductSetting.modelId;
	if (msg.slice(0, head.length) == head) {
		__ = addMsgInfo(__, _, msg);
		// console.log(__ + ' : \n' + _);
		$('#debug_label_IN').text(__ + ' : ' + _);
	} else {
		__ = addMsgInfoSystemMsg(__, _, msg);
		// console.log(__ + ' : \n' + _);
		$('#debug_label_IN').text('LOG_MIDI_IN     :  ' + __ + ' : ' + _);
	}
	//console.log(_);
};

LOG_MIDI_OUT = function (msg) {

	// if (!ProductSetting.developmentMode) {
	// 	return;
	// }

	var _ = '';
	var __ = 'LOG_MIDI_OUT';
	for (var i = 0, len = msg.length; i < len; i += 2) {
		_ += msg.slice(i, i + 2);
		_ += ' ';
	}

	head = STX + ROLAND + ProductSetting.deviceId + ProductSetting.modelId;
	if (msg.slice(0, head.length) == head) {
		__ = addMsgInfo(__, _, msg);
		// console.log(__ + ' : \n' + _);
		$('#debug_label_OUT').text(__ + ' : ' + _);
	} else {
		__ = addMsgInfoSystemMsg(__, _, msg);
		// console.log(__ + ' : \n' + _);
		$('#debug_label_OUT').text('LOG_MIDI_OUT     :  ' + __ + ' : ' + _);
	}

};



function addMsgInfoSystemMsg(__, _, msg) {
	switch (msg.slice(0, 2)) {
	case 'F8': __ += '[SYSTEM REALTIME][TIMING  ]'; break;
	case 'FA': __ += '[SYSTEM REALTIME][START   ]'; break;
	case 'FB': __ += '[SYSTEM REALTIME][CONTINUE]'; break;
	case 'FC': __ += '[SYSTEM REALTIME][STOP    ]'; break;
	case 'FE': __ += '[SYSTEM REALTIME][ACT SENS]'; break;
	case 'FF': __ += '[SYSTEM REALTIME][SYS REST]'; break;
	default:
		switch (msg.slice(0, 4) ){
		case 'F07E':
			switch (msg.slice(6, 8) ){
			case '06':
				__ += '[SYSEX][IDENTIRY]';
				switch(msg.slice(8, 10)){
				case '01':	__ += '[REQ]';	break;
				case '02':	__ += '[REP]';	break;
				default:					break;
				}
				break;
			default:
				break;
			}
			break;
		default:
			break;
		}
		break;
	}
	return __;
}
function addMsgInfo(__, _, msg) {
	
	head = STX + ROLAND + ProductSetting.deviceId + ProductSetting.modelId;

	if (msg.slice(headLen, headLen + 2) == '12') {
		__ += '[DT]';
	} else if (msg.slice(headLen, headLen + 2) == '11') {
		__ += '[RQ]';
	} else { }
	switch (msg.slice(headLen + 2, headLen + 4) ){
	case '60':
		switch (msg.slice(headLen + 4, headLen + 10)) {
		case '000720':	__ += '[CHAIN    ]';	break;
		default:
			__ += '[CMD][PRM]';
			__ = pramInfo(__, msg);
			break;
		}
		break;
	case '7F':
		__ += '[CMD]';
		switch (msg.slice(headLen + 4, headLen + 10)) {
		case '000000':	__ += '[COM LEVEL]';	break;
		case '000001':	__ += '[COM MODE ]';	break;
		case '000002':	__ += '[RUN MODE ]';	break;
		case '000003':	__ += '[COM RIVIS]';	break;

		case '000100':	__ += '[PAT SELEC]';	break;
		case '000104':	__ += '[PAT WRITE]';	break;
		case '000106':	__ += '[PAT_INIT ]';	break;
		case '00010E':	__ += '[CMDID_PATCH_CLEAR]';	break;
		case '010003':	__ += '(PAT CLEAR)';	break;
		case '010109':	__ += '[CMDID_PREVIEW_MUTE]';	break;
		case '01010A':	__ += '[CMDID_EXPORT]';	break;

		case '000300':	__ += '[TUN STATE ]';	break;
		// case '000301':	__ += '[TUN PITCH]';	break;
		// case '000305':	__ += '[TUN JUST ]';	break;

		case '000502':	__ += '[BAT STATE]';	break;
		case '000503':	__ += '(RF  STATE)';	break;
		case '010005':	__ += '[USB STATE]';	break;	
		case '010006':	__ += '[RHY PLAY ]';	break;
		
		case '000700':	__ += '[WRLSS C S]';	break;
		case '010007':	__ += '[SESSION C]';	break;
		case '010100':	__ += '[LED BTS M]';	break;
		case '010101':	__ += '[LED DLY M]';	break;
		case '010102':	__ += '[LED REV M]';	break;
		case '010103':	__ += '[DELAY1 SW]';	break;
		case '010104':	__ += '[DELAY2 SW]';	break;
		case '010105':	__ += '[REVERB SW]';	break;
		case '010106':	__ += '[DELAY TAP]';	break;
		case '010107':	__ += '[REVERB TAP]';	break;
		case '010004':	__ += '[MODE SET ]';	break;
		case '000702':	__ += '(PRE DV ID)';	break;
		case '000706':	__ += '(EDTR PAGE)';	break;
		case '000704':	__ += '(LOCK UI)'	 ;	break;

		case '010202': __ += 	'[GAFC TYPE]';	break;

		default:    	__ += '[UNKNOWN  ]';	break;
		}
		break;
	default:
		__ += '[PRM]';
		__ = pramInfo(__, msg);
		break;
	}
	return __;
}


function pramInfo(__, msg) {
	var a = _map.root;
	var root_msg = HEX15toDEC(msg)
	//root
	for (var n = 0, num = a.length; n < num; n++) {
		var root = a[(num - 1) - n];
		if (root.addr <= root_msg) {
			__ += '[' + root.name + ']';
			var child1_msg = root_msg - root.addr;
			var c1 = root.child;

			//名前を取得して親addressを引き、次の操作
			break;
		}
	}


	//Patch System
	if (c1 && c1.length > 0) {
		for (var n = 0, num = c1.length; n < num; n++) {
			var child1 = c1[(num - 1) - n];
			if (child1.addr <= child1_msg) {
				__ += '[' + child1.name + ']';
				var child2_msg = child1_msg - child1.addr;
				var c2 = child1.child;
				//名前を取得して親addressを引き、次の操作
				break;
			}
		}
		if (c2 && c2.length > 0) {
			for (var n = 0, num = c2.length; n < num; n++) {
				var child2 = c2[(num - 1) - n];
				if (child2.addr <= child2_msg) {
					__ += '[' + child2.name + ']';
					var child3_msg = child2_msg - child1.addr;
					var c3 = child1.child;
					//名前を取得して親addressを引き、次の操作
					//console.log(child3_msg);
					break;
				}
			}
		}
	}

	// //
	return __
}



function HEX15toDEC(_msg) {
	var msg1 = parseInt(_msg.slice(headLen + 2, headLen + 4), 16);
	var msg2 = parseInt(_msg.slice(headLen + 4, headLen + 6), 16);
	var msg3 = parseInt(_msg.slice(headLen + 6, headLen + 8), 16);
	var msg4 = parseInt(_msg.slice(headLen + 8, headLen + 10), 16);
	var __msg = '';


	msg1 = HEX15tobin(msg1);
	//console.log(msg1);
	msg2 = HEX15tobin(msg2);
	//console.log(msg2);
	msg3 = HEX15tobin(msg3);
	//console.log(msg3);
	msg4 = HEX15tobin(msg4);
	//console.log(msg4);
	__msg = parseInt(msg1 + msg2 + msg3 + msg4, 2);
	//console.log(__msg);
	return __msg;
}

function HEX15tobin(_msg) {
	_msg_ = _msg.toString(2);
	while (_msg_.length < 7) {
		_msg_ = '0' + _msg_;
	}
	return _msg_
}
