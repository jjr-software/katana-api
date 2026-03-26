//
//	editor.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

function Editor(config) {

	this.timerId = null;
	this.configCommand = null;
	this.configStop = null;
	this.observers = [];

	this.config = config;
}

Editor.prototype = new ReadWriteLogic();

Editor.prototype.read = function() {

	if (this.timerId) return;

	function createtask(tasks, blockSet) {
		for (var n = 0, num = blockSet.length; n < num; n++) {
			var bid = blockSet[n];
			var b = Parameter.getblock(bid);
			var addr = b.addr, size;
			while ((size = b.size.shift()) !== undefined) {
				tasks.push({ addr:addr, size:size });
				addr += size;
			}
		}
	}

	var tasks = [];
	createtask(tasks, this.config.blockSet);

	function parts() {
		var tasks = [];
		for (var part = 0; part < this.config.parts; part++) {
			createtask(tasks, this.config.partSet(part));
		}
		this.readStart(tasks, 'editor_read');
	}

	this.configStop = this.config.readStop;
	this.config.readStart(MIDIController);
	this.readStart(tasks, 'editor_read', this.config.parts ? parts : null);
}

Editor.prototype.sync = function() {

	if (this.timerId) return;

	function createtask(tasks, blockSet) {
		for (var n = 0, num = blockSet.length; n < num; n++) {
			var bid = blockSet[n];
			var b = Parameter.getblock(bid);
			var addr = b.addr;
			var str = (b.data.join()).replace(/,/g, '');
			if (b.size < 0) {
				b.size = [ 4 ];
				var len = (str.length / 2) - 4;
				for (var cnt = 0; len > 0; len -= cnt) {
					cnt = (len < SYSEX_MAXLEN) ? len : SYSEX_MAXLEN;
					b.size.push(cnt);
				}
			}
			var size, i = 0;
			while ((size = b.size.shift()) !== undefined) {
				var data = str.substr(i * 2, size * 2);
				tasks.push({ addr:addr, data:data });
				addr += size; i += size;
			}
		}
	}

	var tasks = [];

	createtask(tasks, this.config.blockSet);
	for (var part = 0; part < this.config.parts; part++) {
		createtask(tasks, this.config.partSet(part));
	}

	this.configStop = this.config.syncStop;
	this.config.syncStart(MIDIController);
	this.writeStart(tasks, 'editor_sync', 0, 0);
}

Editor.prototype.preview = function(part) {

	if (this.timerId) return;

	this.config.previewStart(MIDIController, part);
}

Editor.prototype.cancel = function() {

	this.abort();
	this.config.previewStop(MIDIController);
	this.broadcast('editor_cancel', null);
}

Editor.prototype.toJSON = function() {

	var blockSet, bid, o = {};

	blockSet = this.config.blockSet;
	for (var n = 0, num = blockSet.length; n < num; n++) {
		bid = blockSet[n];
		o[bid] = Parameter.paramSet[bid];
	}

	for (var part = 0; part < this.config.parts; part++) {
		blockSet = this.config.partSet(part);
		for (var n = 0, num = blockSet.length; n < num; n++) {
			bid = blockSet[n];
			o[bid] = Parameter.paramSet[bid];
		}
	}

	return JSON.stringify(o);
}

Editor.prototype.load = function(json) {

	var o = JSON.parse(json);
	for (var bid in o) {
		Parameter.setdata(bid, o[bid]);
	}
}
