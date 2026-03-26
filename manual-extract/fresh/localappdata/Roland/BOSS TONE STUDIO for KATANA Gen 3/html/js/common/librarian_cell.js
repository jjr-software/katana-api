//
//	librarian_cell.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

function LibrarianCell(config) {

	this.get = config.value;
	this.set = config.setValue;

	this.memo = '';
	this.paramSet = {};
}

LibrarianCell.prototype = {

	value: function(columnIndex) {
		return this.get(this.paramSet, columnIndex);
	},

	setValue: function(columnIndex, value) {
		this.set(this.paramSet, columnIndex, value);
	},

	copy: function(cell) {
		this.memo = cell.memo;
		for (var prop in cell.paramSet) {
			var src = cell.paramSet[prop];
			var dst = this.paramSet[prop];
			if (dst === undefined || src === undefined) {
				continue;
			}
			if (dst != src) {
				dst.splice(0, dst.length);
				for (var i = 0; i < src.length; i++) {
					dst[i] = src[i];
				}
			}
		}
	}

};
