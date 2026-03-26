//
//	toggle_button_controller.js
//
//	Copyright 2017 Roland Corporation. All rights reserved.
//

$(function() {

	$('#app-container').on('elf-update', '.elf-toggle-button-control', function(e, v) {
		$(this).prop('value', v);
		$(this).children('p').hide();
		$(this).children('p').eq(v).show();
		return false;
	});

	$('#app-container').on(pointer.click, '.elf-toggle-button-control', function(e) {
		e.stopPropagation();
		e.preventDefault();
		var v = $(this).val();
		if (++v >= $(this).children('p').length) v = 0;
		$(this).val(v);
		$(this).children('p').hide();
		$(this).children('p').eq(v).show();
		$(this).trigger('elf-change', v);
	});

});
