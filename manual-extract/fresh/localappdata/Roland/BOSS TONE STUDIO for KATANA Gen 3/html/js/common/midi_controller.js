//
//	midi_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

LOG_MIDI_IN  = function() {};
LOG_MIDI_OUT = function() {};

(function(window) {

	var queue = [];
	var list = [];
	var receivers = [];

	var interval = 10; /* timer interval */
	var t0 = 0;

	var addr_len = ProductSetting.lengthOfAddr * 2;
	var size_len = ProductSetting.lengthOfSize * 2;

	var _obj = {

		send: function(msg) { queue.push(msg); },

		dt1: function(addr, data) {
			addr = _7bitize(addr);
			addr = toHexStr(addr, addr_len);

			queue.push(
				STX + ROLAND +
				ProductSetting.deviceId +
				ProductSetting.modelId +
				DT1 +
				addr + data + chksum(addr + data) +
				EOX
			);
		},

		rq1: function(addr, size, transaction) {
			addr = _7bitize(addr);
			size = _7bitize(size);
			addr = toHexStr(addr, addr_len);
			size = toHexStr(size, size_len);

			if (transaction) {
				list.push({ addr: addr, func: transaction });
			}

			queue.push(
				STX + ROLAND +
				ProductSetting.deviceId +
				ProductSetting.modelId +
				RQ1 +
				addr + size + chksum(addr + size) +
				EOX
			);
		},

		clear: function() { queue = []; list = []; },
		fifoIsEmpty: function() { return !queue.length; },

		addReceiver: function(obj) {
			var index = receivers.indexOf(obj);
			if (index < 0) receivers.push(obj);
		},

		removeReceiver: function(obj) {
			var index = receivers.indexOf(obj);
			if (index >= 0) receivers.splice(index, 1);
		}

	};

	var midi = $native.midi;
	midi.event.message = function(msg, timestamp) {

		if (msg == 'F8' || msg == 'FE') return;

		LOG_MIDI_IN(msg);

		if (msg.lastIndexOf(STX, 0) !== 0) {
			broadcast(msg);
			return;
		}

		/* universal sysex message */
		if (msg.lastIndexOf(STX + '7E', 0) === 0) {
			broadcast(msg);
			return;
		}

		/* roland sysex message */
		var header = STX + ROLAND + '7F' + ProductSetting.modelId;
		if (msg.lastIndexOf(header, 0) !== 0) {
			header = STX + ROLAND + ProductSetting.deviceId + ProductSetting.modelId;
			if (msg.lastIndexOf(header, 0) !== 0) return; /* ignore this messag */
		}

		broadcast(msg);

		var s = msg.substring(header.length, msg.length - 4);
		if (s.lastIndexOf(DT1, 0) === 0) {
			var addr = s.substr(2,  addr_len);
			var data = s.substr(2 + addr_len);
			for (var i = 0, num = list.length; i < num; i++) {
				if (list[i].addr === addr) {
					if (!list[i].func(data)) {
						list.splice(i, 1);
					}
					return;
				}
			}
		}
	};

	/* local functions */

	function timerproc() {
		if (queue.length) {
			var t = (new Date()).getTime();
			if (t > t0) {
				var msg = queue.shift();
				LOG_MIDI_OUT(msg);
				midi.send(msg);
				t0 = t + (((msg.length / 2) * 1000) / 3125) + ProductSetting.interval;
			}
		}
	}

	function chksum(msg) {
		var sum = 0;
		for (var i = 0, len = msg.length; i < len; i += 2) {
			sum += parseInt(msg.substr(i, 2), 16);
		}
		sum = (128 - (sum % 128)) & 0x7f;
		return hex2(sum);
	}

	function toHexStr(x, size) {
		var str = x.toString(16).toUpperCase();
		var len = size - str.length;
		var _0 = '';
		while (len-- > 0) _0 += '0';
		return _0 + str;
	}

	function broadcast(msg) {
		var tmp = [].concat(receivers);
		for (var i = 0, num = tmp.length; i < num; i++) {
			var index = receivers.indexOf(tmp[i]);
			if (index >= 0) tmp[i].receive(msg);
		}
	}

	setInterval(timerproc, interval);

	window.MIDIController = _obj; /* export to window object */

})(window);
