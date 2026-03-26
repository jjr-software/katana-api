//
//	librarian_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	if (ProductSetting.librarian == null) return;

	var librarians = [];
	for (var i = 0; i < ProductSetting.librarian.length; i++) {
		librarians.push(new Librarian(ProductSetting.librarian[i].config));
	}
	window.Librarians = librarians; /* export for window object */

	var mode = 0;
	var model = new LibrarianModel(ProductSetting.name, true);
	var _tabs = [];
	var _copycells = []; /* for copy & paste operation */

	_tabs.push(model);

	var doc = 'MODE : <select>';
	for (var i = 0; i < ProductSetting.librarian.length; i++) {
		doc += '<option value="' + i + (i == 0 ? '" selected>' : '">') +
				ProductSetting.librarian[i].name + '</option>';
	}
	doc += '</select>';
	$('#librarian_view .mode').append(doc);

	update_tabs();
	update_table();

	$('#librarian_view .load').on('click', function(e) {
		load();
	});

	$('#librarian_view .save').on('click', function(e) {
		save();
	});

	$('#librarian_view .new').on('click', function(e) {
		create();
		update_tabs();
	});

	$('#librarian_view .duplicate').on('click', function(e) {
		duplicate();
	});

	$('#librarian_view .close').on('click', function(e) {
		close();
	});

	$('#librarian_view .tabs').on('click', 'input[type="radio"]', function(e) {
		var index = $('#librarian_view .tabs input[type="radio"]').index(this);
		model = _tabs[index];
		update_table();
	});

	$('#librarian_view .mode').on('change', 'select', function(e) {
		mode = $(this).val();
		update_table();
		_copycells = [];
	});

	$('#librarian_view .selectAll').on('click', function(e) {
		$('#librarian_view input[type="checkbox"]').each(function() {
			$(this).prop('checked', true);
		});
	});

	$('#librarian_view .clear').on('click', function(e) {
		$('#librarian_view input[type="checkbox"]').each(function() {
			$(this).prop('checked', false);
		});
	});

	$('#librarian_view .list').on('click', '.append', function(e) {
		model.append(mode);
		update_table();
	});

	$('#librarian_view .copy').on('click', function(e) {
		var rows = [];
		$('#librarian_view input[type="checkbox"]:checked').each(function() {
			var row = $(this).closest('tr').index();
			rows.push(row);
		});
		$('#librarian_view .clear').trigger('click');
		if (rows.length) _copycells = model.copy(mode, rows);
	});

	$('#librarian_view .paste').on('click', function(e) {
		var row = $('#librarian_view input[type="checkbox"]:checked').closest('tr').index();
		if (row >= 0) {
			model.replace(mode, row, _copycells);
			update_table();
		}
	});

	$('#librarian_view .delete').on('click', function(e) {
		var rows = [];
		$('#librarian_view input[type="checkbox"]:checked').each(function() {
			var row = $(this).closest('tr').index();
			rows.push(row);
		});
		if (rows.length) {
			for (var row; (row = rows.pop()) !== undefined; ) {
				model.remove(mode, row);
			}
			update_table();
		}
	});

	$('#librarian_view .initialize').on('click', function(e) {
		$('#librarian_view input[type="checkbox"]:checked').each(function() {
			var row = $(this).closest('tr').index();
			model.initialize(mode, row);
		});
		update_table();
	});

	$('#librarian_view .list').on('change', 'input[type="text"].title', function(e) {
		var title = $(this).val();
		model.setTitle(title);
		update_tabs();
	});

	$('#librarian_view .list').on('change', 'input[type="text"].column, select', function(e) {
		var row = $(this).closest('tr').index();
		var col = $(this).closest('td').index() - 2;
		var v = $(this).val();
		model.setValue(mode, row, col, v);
	});

	$('#librarian_view .list').on('change', 'input[type="text"].memo', function(e) {
		var row = $(this).closest('tr').index();
		var memo = $(this).val();
		model.setValue(mode, row, -1, memo);
	});

	var fileheader = ProductSetting.name + ':librarian:1.00';
	var untitled = 1;

	function load() {
		var fs = $native.fs;
		fs.event.openfilename = function(file) {
			if (file) {
				var o;
				try {
					o = JSON.parse(fs.readString(file));
				} catch (e) { alert(e); }
				if (o.header != fileheader) {
					alert(MSG('IDM_INVALID_FILE')); return;
				}
				var title = file.substr(file.lastIndexOf(fs.separator()) + 1);

				create();
				_tabs[_tabs.length - 1].load(JSON.stringify(o.data));
				_tabs[_tabs.length - 1].setTitle(title.split('.')[0]);

				update_tabs();
			}
		};
		var filter = [ ProductSetting.livesetFile.extension ];
		fs.openfilename(filter);
	}

	function save() {
		var fs = $native.fs;
		fs.event.savefilename = function(to) {
			if (to) {
				var o = { header:fileheader, data:JSON.parse(model.toJSON()) };
				try {
					fs.writeString(to, JSON.stringify(o));
				} catch (e) { alert(e); }
			}
		};
		var name = model.title();
		var ext = ProductSetting.livesetFile.extension;
		fs.savefilename(name, ext);
	}

	function create() {
		_tabs.push(new LibrarianModel('Untitled' + (untitled++), false));
	}

	function duplicate() {
		create();
		_tabs[_tabs.length - 1].duplicate(model);
		update_tabs();
	}

	function close() {
		var index = _tabs.indexOf(model);
		_tabs.splice(index, 1);
		if (index >= _tabs.length) {
			index = _tabs.length - 1;
		}
		model = _tabs[index];
		update_tabs();
		update_table();
	}

	/* midi operation */

	var observer = {
		notify: function(msg, arg) {
			if (msg == 'librarian_cancel' || arg == 'timeout' || arg == 'end') {
				librarians[mode].removeObserver(observer);
				$('#librarian_view .progress').empty();
				if (arg == 'timeout') alert(MSG('IDM_READ_TIMEOUT'));
				if (msg == 'librarian_temporaryWrite') {
					librarians[mode].preview();
				} else {
					update_table();
				}
			} else {
				$('#librarian_view .progress span').text(arg + '%');
			}
		}
	};

	var cancel = '<span></span><button class="cancel">Cancel</button>';

	$('#librarian_view').on('click', '.cancel', function(e) {
		librarians[mode].cancel();
	});

	$('#librarian_view .list').on('click', '.read', function(e) {
		var rows = [];
		$('#librarian_view input[type="checkbox"]:checked').each(function() {
			var row = $(this).closest('tr').index();
			rows.push(row);
		});
		if (rows.length) {
			$('#librarian_view .progress').empty();
			$('#librarian_view .progress').append('<font color="red">now reading ... </font>' + cancel);

			librarians[mode].addObserver(observer);
			librarians[mode].read(rows);
		}
	});

	$('#librarian_view .list').on('click', '.write', function(e) {
		var rows = [];
		$('#librarian_view input[type="checkbox"]:checked').each(function() {
			var row = $(this).closest('tr').index();
			rows.push(row);
		});
		if (rows.length) {
			$('#librarian_view .progress').empty();
			$('#librarian_view .progress').append('<font color="red">now writing ... </font>' + cancel);

			librarians[mode].addObserver(observer);
			librarians[mode].write(rows);
		}
	});

	$('#librarian_view .list').on('click', 'button.preview', function(e) {
		var row = $(this).closest('tr').index();
		if ($(this).data('state') == 'off') {
			$('#librarian_view .progress').empty();
			$('#librarian_view .progress').append('<font color="red">now writing ... </font>' + cancel);

			librarians[mode].addObserver(observer);
			librarians[mode].temporaryWrite(model.cell(mode, row), row);
			$(this).data('state', 'on');
		} else {
			librarians[mode].cancel();
			$(this).data('state', 'off');
		}
	});

	/* update view */

	function update_tabs() {
		var doc = '';
		for (var i = 0; i < _tabs.length; i++) {
			doc +=
				'<label><input type="radio" name="tab" ' +
				(i == _tabs.indexOf(model) ? 'checked />' : '/>') + 
				'<span class="tab">'+ _tabs[i].title() + '</span>' +
				'</label>';
		}
		$('#librarian_view div.tabs').empty();
		$('#librarian_view div.tabs').append(doc);
	}

	function update_table() {

		var columnInfo = ProductSetting.librarian[mode].config.columnInfo;

		function columns(row, col, v) {
			var doc = '';
			if (columnInfo[col].type == 'picture') {
				doc = '<img src="' + v + '" ' + 'width="' + columnInfo[col].width + '" />';
			} else if (columnInfo[col].type == 'selectbox') {
				doc = '<select>';
				for (var i = 0; i < columnInfo[col].options.length; i++) {
					doc += '<option value="' + i + (i == v ? '" selected>' : '">') +
								columnInfo[col].options[i] + '</option>';
				}
				doc += '</select>';
			} else if (columnInfo[col].type == 'text') {
				doc = '<input type="text" disabled ' +
						'value="' + v + '" ' +
						'size="' + columnInfo[col].width + '" />';
			} else { /* 'text%n' */
				var max = columnInfo[col].type.replace(/text/g, '');
				doc = '<input type="text" class="column" ' +
						'value="' + v + '" ' +
						'size="' + columnInfo[col].width + '" ' +
						'maxlength="' + max + '" />';
			}
			return doc;
		}

		function line(row) {
			var doc = 
				'<td><input type="checkbox" /></td>' +
				'<td align="right">' + (row + 1) + '</td>';

			for (var col = 0; col < columnInfo.length; col++) {
				var v = model.value(mode, row, col);
				doc += '<td>' + columns(row, col, v) + '</td>';
			}

			doc +=
				'<td><input type="text" class="memo" ' +
				'value="' + model.memo(mode, row) + '" /></td>' +
				'<td><button class="preview" data-state="off">Preview</button></td>';
			return doc;
		}

		var table = '<table>';
		for (var row = 0; row < model.rows(mode); row++) {
			table += '<tr>' + line(row) + '</tr>';
		}
		table += '</table>';

		var doc = '';
		if (_tabs.indexOf(model) == 0) {
			doc += '<button class="read">Read</button>';
			doc += '<button class="write">Write</button>';
			doc += table;

			$('#librarian_view .close').prop("disabled", true);
			$('#librarian_view .delete').prop("disabled", true);
		} else {
			doc += 'Title: <input type="text" class="title" value="' + model.title() + '" />';
			doc += table;
			doc += '<button class="append">+</button>';

			$('#librarian_view .close').prop("disabled", false);
			$('#librarian_view .delete').prop("disabled", false);
		}

		$('#librarian_view div.list').empty();
		$('#librarian_view div.list').append(doc);
	}

});
