//
//	librarian_model.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

function LibrarianModel(title, instrument) {

	this.instrument = instrument;
	this.name = title;
	this.cells = [];

	for (var mode = 0; mode < Librarians.length; mode++) {
		this.cells[mode] = [];
		if (this.instrument) {
			for (var row = 0; row < Librarians[mode].rows; row++) {
				this.cells[mode][row] = Librarians[mode].cell(row);
			}
		}
	}

}

LibrarianModel.prototype = {

	rows: function(mode) {
		return this.cells[mode].length;
	},

	title: function() {
		return this.name;
	},

	setTitle: function(title) {
		this.name = title;
	},

	memo: function(mode, row) {
		return this.cell(mode, row).memo;
	},

	value: function(mode, row, col) {
		return this.cell(mode, row).value(col);
	},

	setValue: function(mode, row, col, v) {
		if (col < 0) {
			this.cell(mode, row).memo = v;
		} else {
			this.cell(mode, row).setValue(col, v);
		}
	},

	append: function(mode) {
		if (this.instrument) return false;
		this.cells[mode].push(Librarians[mode].factory());
		return true;
	},

	remove: function(mode, row) {
		if (this.instrument) return false;
		this.cells[mode].splice(row, 1);
		return true;
	},

	duplicate: function(model) {
		for (var mode = 0; mode < model.cells.length; mode++) {
			for (var i = 0, num = model.cells[mode].length; i < num; i++) {
				this.cells[mode][i] = Librarians[mode].factory();
				this.cells[mode][i].copy(model.cells[mode][i]);
			}
		}
	},

	initialize: function(mode, row) {
		this.cells[mode][row].copy(Librarians[mode].factory());
	},

	copy: function(mode, rows) {
		_copycells = [];
		var row;
		while ((row = rows.shift()) != undefined) {
			var cell = Librarians[mode].factory();
			cell.copy(this.cells[mode][row]);
			_copycells.push(cell);
		}
		return _copycells;
	},

	replace: function(mode, row, _copycells) {
		for (var i = 0, num = _copycells.length; i < num; i++) {
			if (row >= this.rows(mode)) {
				if (!this.append(mode)) return;
			}
			this.cells[mode][row++].copy(_copycells[i]);
		}
	},

	toJSON: function() {
		var o = [];
		for (var mode = 0; mode < Librarians.length; mode++) {
			o[mode] = [];
			for (var row = 0, num = this.cells[mode].length; row < num; row++) {
				o[mode].push({
					memo: this.cells[mode][row].memo,
					paramSet: this.cells[mode][row].paramSet
				});
			}
		}
		return JSON.stringify(o);
	},

	load: function(json) {
		var o = JSON.parse(json);
		for (var mode = 0; mode < o.length; mode++) {
			for (var row = 0, num = o[mode].length; row < num; row++) {
				this.cells[mode][row] = Librarians[mode].factory();
				this.cells[mode][row].memo = o[mode][row].memo;
				this.cells[mode][row].paramSet = o[mode][row].paramSet;
			}
		}
	},

	cell: function(mode, row) {
		return this.cells[mode][row];
	},
}
