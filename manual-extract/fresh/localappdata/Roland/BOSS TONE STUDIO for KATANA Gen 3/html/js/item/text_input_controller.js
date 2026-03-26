//
//	text_input_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	$('#app-container').on('elf-update', '.elf-text-input-control', function(e, v) {
		$(this).children('input').val(v);
		return false;
	});

	$('#app-container').on('change', '.elf-text-input-control', function(e) {
		e.stopPropagation();
		var v = $(this).children('input').val();

		if ($(this).attr('ascii')) {
			var x = '';
			for (var i = 0; i < v.length; i++) {
				var c = v.charCodeAt(i);
				x += ((0x20 <= c && c <= 0x7F) ? v.charAt(i) : '?');
			}
			$(this).children('input').val(v = x);
		}

		$(this).trigger('elf-change', v);
	});

});
