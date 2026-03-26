//
//	editor_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	if (ProductSetting.editor == null) return;

	var editors = [];
	for (var i = 0; i < ProductSetting.editor.length; i++) {
		editors.push(new Editor(ProductSetting.editor[i].config));
	}

	var mode = 0;

	var doc = 'MODE : <select>';
	for (var i = 0; i < ProductSetting.editor.length; i++) {
		doc += '<option value="' + i + (i == 0 ? '" selected>' : '">') +
				ProductSetting.editor[i].name + '</option>';
	}
	doc += '</select>';
	$('#editor_view .mode').append(doc);

	$('#editor_view .mode').on('change', 'select', function(e) {
		mode = $(this).val();
	});

	$('#editor_view .load').on('click', function(e) { load(); });
	$('#editor_view .save').on('click', function(e) { save(); });
	$('#editor_view .read').on('click', function(e) { read(); });
	$('#editor_view .sync').on('click', function(e) { sync(); });

	var fileheader = ProductSetting.name + ':editor:1.00';
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
				for (var i = 0; i < editors.length; i++) {
					editors[i].load(JSON.stringify(o.data[i]));
				}
			}
		};
		var filter = [ ProductSetting.livesetFile.extension ];
		fs.openfilename(filter);
	}

	function save() {
		var fs = $native.fs;
		fs.event.savefilename = function(to) {
			if (to) {
				var o = { header:fileheader, data:[] };
				for (var i = 0; i < editors.length; i++) {
					o.data[i] = JSON.parse(editors[i].toJSON());
				}
				try {
					fs.writeString(to, JSON.stringify(o));
				} catch (e) { alert(e); }
			}
		};
		var name = 'editor' + (untitled++);
		var ext = ProductSetting.livesetFile.extension;
		fs.savefilename(name, ext);
	}

	doc = '<span></span><button class="cancel">Cancel</button>';
	$('#editor_view').on('click', '.cancel', function(e) {
		editors[mode].cancel();
	});

	var observer = {
		notify: function(msg, arg) {
			if (msg == 'editor_cancel' || arg == 'timeout' || arg == 'end') {
				editors[mode].removeObserver(observer);
				$('#editor_view .progress').empty();
				if (arg == 'timeout') alert(MSG('IDM_READ_TIMEOUT'));
			} else {
				$('#editor_view .progress span').text(arg + '%');
			}
		}
	};

	function read() {
		$('#editor_view .progress').empty();
		$('#editor_view .progress').append('<font color="red">now reading ... </font>' + doc);

		editors[mode].addObserver(observer);
		editors[mode].read();
	}

	function sync() {
		$('#editor_view .progress').empty();
		$('#editor_view .progress').append('<font color="red">now syncing ... </font>' + doc);

		editors[mode].addObserver(observer);
		editors[mode].sync();
	}

	$('#editor_view .preview').on('click', function(e) {
		if ($(this).data('state') == 'off') {
			editors[mode].preview(0);
			$(this).data('state', 'on');
		} else {
			editors[mode].cancel();
			$(this).data('state', 'off');
		}
	});

});
