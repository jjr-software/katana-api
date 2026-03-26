//
//	librarian.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

function Librarian(config) {

	this.timerId = null;
	this.configCommand = null;
	this.configStop = null;
	this.observers = [];

	this.config = config;
	this.rows = this.config.rows;
	this.cells = [];

	var blockSet = config.blockSet;
	for (var row = 0; row < this.rows; row++) {
		this.cells[row] = new LibrarianCell(config);
		for (var n = 0, num = blockSet.length; n < num; n++) {
			var bid = blockSet[n];
			this.cells[row].paramSet[bid] = Parameter.paramSet[_bid(bid, row)];
		}
	}

	this.paramSet0 = {}; /* for factory */
	for (var prop in this.cells[0].paramSet) {
		this.paramSet0[prop] = this.cells[0].paramSet[prop].concat();
	}

	this.cell = function(row) { return this.cells[row]; };

	this.factory = function() {
		var cell = new LibrarianCell(this.config);
		for (var prop in this.paramSet0) {
			cell.paramSet[prop] = this.paramSet0[prop].concat();
		}
		return cell;
	};
}

Librarian.prototype = new ReadWriteLogic();

Librarian.prototype.read = function(rows) {

	if (this.timerId) return;

	var tasks = [], row;
	var blockSet = this.config.blockSet;
	while ((row = rows.shift()) !== undefined) {
		for (var n = 0, num = blockSet.length; n < num; n++) {
			var b = Parameter.getblock(_bid(blockSet[n], row));
			var addr = b.addr, size;
			while ((size = b.size.shift()) !== undefined) {
				tasks.push({ addr:addr, size:size });
				addr += size;
			}
		}
	}
	this.configStop = this.config.readStop;
	this.config.readStart(MIDIController);
	this.readStart(tasks, 'librarian_read');
};

Librarian.prototype.write = function(rows) {

	if (this.timerId) return;

	var tasks = [], row;
	var blockSet = this.config.blockSet;
	while ((row = rows.shift()) !== undefined) {
		for (var n = 0, num = blockSet.length; n < num; n++) {
			var b = Parameter.getblock(_bid(blockSet[n], row));
			var addr = b.addr;
			var str = (b.data.join()).replace(/,/g, '');
			var wait = 0;
			if (b.size < 0) {
				b.size = [ 4 ];
				var len = (str.length / 2) - 4;
				wait = len ? ProductSetting.waitVariable : ProductSetting.waitVariable0;
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
			if (wait) {
				tasks[tasks.length - 1].wait = wait;
			}
		}
	}
	this.configCommand = this.config.writeCommand;
	this.configStop = this.config.writeStop;
	this.config.writeStart(MIDIController);
	this.writeStart(tasks, 'librarian_write',
			ProductSetting.waitStart, ProductSetting.waitStop);
};

Librarian.prototype.temporaryWrite = function(cell, row) {

	if (this.timerId) return;

	var tasks = [];
	var temporarySet = this.config.temporarySet;
	for (var prop in temporarySet) {
		var b = Parameter.getblock(temporarySet[prop]);
		var d = cell.paramSet[prop];
		var addr = b.addr;
		var str = (d.join()).replace(/,/g, '');
		if (b.size < 0) {
			b.size = [ 4 ];
			for (var len = (str.length / 2) - 4, cnt = 0; len > 0; len -= cnt) {
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
	this.configCommand = null;
	this.configStop = this.config.writeTemporaryStop;
	this.config.writeTemporaryStart(MIDIController, row);
	this.writeStart(tasks, 'librarian_temporaryWrite', 0, 0);
};

Librarian.prototype.preview = function() {

	if (this.timerId) return;

	this.config.previewStart(MIDIController);
};

Librarian.prototype.cancel = function() {

	this.abort();
	this.config.previewStop(MIDIController);
	this.broadcast('librarian_cancel', null);
};
