//
//	select_panel_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	$('#app-container').on('elf-update', '.elf-select-panel-control', function(e, v) {
		var all = $('#' + $(this).attr('id') + '-panel img');
		var opt = all.eq(v);
		all.prop('selected', false);
		opt.prop('selected', true);
		$(this).css('background-image', 'url("' + opt.attr('src') + '")');
		return false;
	});

	var parent, panel = null;

	function hide() {
		if (panel) {
			$(panel).unbind('keydown');
			$(panel).hide().unwrap().appendTo($(parent));
			panel = null;
		}
	}

	$('#app-container').on(pointer.click, '.elf-select-panel-control', function(e) {
		e.stopPropagation();
		e.preventDefault();

		hide();

		var _$ = $(this);
		parent = '#' + _$.attr('id');
		panel = parent + '-panel';

		var wrapper = $('<div class="select-popup-wrapper"></div>');
		$('#app-container').append(wrapper);
		$(panel).appendTo(wrapper).show();

		$(panel).bind('keydown', function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
			if (e.keyCode == 27) { hide(); return; } /* esc */ 
		});

		$(panel).focus();

	});

	$('#app-container').on('click', '.elf-select-panel-option-control', function(e) {
		e.stopPropagation();
		var s = $(this).attr('src');
		var v = $(this).index();
		setTimeout(function(){ /* deferred call */
			hide();
			$(parent).css('background-image', 'url("' + s + '")');
			$(parent).trigger('elf-change', v);
		}, 0);
	});

	$(window).resize(function() { hide(); });
	$('#app-container').on(pointer.down, '.select-popup-wrapper', function(e) { hide(); return false;});
	$('#app-container').on(pointer.down, '.elf-select-panel', function(e) { e.stopPropagation(); });
	$('#app-container').on(pointer.click, '.elf-select-panel-close', function(e) { hide(); return false; });

});
