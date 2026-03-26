//
//	readwrite_logic.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

function ReadWriteLogic() {
/*
	this.timerId = null;
	this.configCommand = null;
	this.configStop = null;
	this.observers = [];
*/
};

ReadWriteLogic.prototype = {

	readStart: function(tasks, msg, next) {
		var _this = this;
		var addr, size, vsize = 0;
		var count = 0, total = tasks.length;
		var timeout = 0;
		var timerproc = function() {
			if (timeout) {
				var now = (new Date()).getTime();
				if (now > timeout) {
					_this.abort();
					_this.broadcast(msg, 'timeout');
				}
				return;
			}
			if (vsize > 0) {
				size = (vsize > SYSEX_MAXLEN) ? SYSEX_MAXLEN : vsize;
				vsize -= size;
			} else {
				if (tasks.length == 0) {
					if (next) {
						clearInterval(_this.timerId);
						_this.timerId = null;
						next.call(_this);
					} else {
						_this.stop(msg);
					}
					return;
				}
				var t = tasks.shift();
				addr = t.addr;
				if (t.size < 0) {
					size = 4; vsize = -1;
				} else {
					size = t.size;
				}
				if (!next) {
					_this.broadcast(msg, Math.floor(((++count) * 100) / total));
				}
			}
			timeout = (new Date()).getTime() + (ProductSetting.timeout * 1000);
			MIDIController.rq1(addr, size, function(dt1_data) {
				timeout = 0;
				addr += (dt1_data.length / 2);
				if (vsize < 0) {
					vsize = nibble_le(parseInt(dt1_data, 16)); /* little endian! */
				}
			});
		};
		this.timerId = setInterval(timerproc, 10);
	},

	writeStart: function(tasks, msg, wait, waitStop) {
		var _this = this;
		var count = 0, total = tasks.length;
		if (wait) wait += (new Date()).getTime();
		var timerproc = function() {
			if (!MIDIController.fifoIsEmpty()) return;
			if (wait) {
				var now = (new Date()).getTime();
				if (now < wait) return;
				wait = 0;
			}
			if (tasks.length == 0) {
				clearInterval(_this.timerId);
				if (_this.configCommand) {
					_this.configCommand(MIDIController);
				}
				_this.timerId = setInterval(function() {
					_this.stop(msg);
				}, waitStop);
				return;
			}
			_this.broadcast(msg, Math.floor(((++count) * 100) / total));
			var t = tasks.shift();
			if ('wait' in t) wait = t.wait + (new Date()).getTime();
			MIDIController.dt1(t.addr, t.data);
		};
		if (midiConnectionController.getCurrentMIDI() === null && msg == 'all_data_write') {
			setTimeout(() => {
				_this.broadcast(msg, 'timeout');
			}, ProductSetting.timeout * 1000);
			return;
		} else {
			this.timerId = setInterval(timerproc, 10);
		}
	},

	stop: function(msg) {
		if (this.timerId) {
			clearInterval(this.timerId);
			this.timerId = null;
			this.configStop(MIDIController);
			this.broadcast(msg, 'end');
		}
	},

	abort: function() {
		if (this.timerId) {
			clearInterval(this.timerId);
			this.timerId = null;
			MIDIController.clear();
			this.configStop(MIDIController);
		}
	},

	addObserver: function(obj) {
		var index = this.observers.indexOf(obj);
		if (index < 0) this.observers.push(obj);
	},

	removeObserver: function(obj) {
		var index = this.observers.indexOf(obj);
		if (index >= 0) this.observers.splice(index, 1);
	},

	broadcast: function(msg, arg) {
		var tmp = [].concat(this.observers);
		for (var i = 0, num = tmp.length; i < num; i++) {
			var index = this.observers.indexOf(tmp[i]);
			if (index >= 0) tmp[i].notify(msg, arg);
		}
	}

};
