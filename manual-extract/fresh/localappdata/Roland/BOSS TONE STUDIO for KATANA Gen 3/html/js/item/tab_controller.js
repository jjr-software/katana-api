//
//	tab_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	$('#app-container').on('elf-update', '.elf-tab-control', function(e, v) {
		var _$ = $(this);
		var all = _$.find('label');
		var opt = all.eq(v);
		all.removeAttr('checked');
		opt.attr('checked', 'checked');
		slide(_$, 0, 0, true);
		return false;
	});

	var binding = false;
	var v_label = null;

	$('#app-container').on(pointer.down, '.elf-tab-item', function(e) {
		v_label = $(this);
	});

	$('#app-container').on(pointer.down, '.elf-tab-control', function(e) {
		e.stopPropagation();

		if (e.which > 1) return;
		var touch = (e.which == 0);

		if (touch) { e.pageX = e.originalEvent.touches[0].pageX }
		var lastX = e.pageX;

		var _$ = $(this);

		binding = true;
		$('#app-container').bind(pointer.move, function(e) {
			if (touch) { e.pageX = e.originalEvent.touches[0].pageX }
			if (e.pageX != lastX) v_label = null;
			slide(_$, 0, (e.pageX - lastX), false);
			lastX = e.pageX;
		});

	});

	//$('#app-container').on(pointer.up, function(e) {
	$(document).on(pointer.up, function(e) {
		if (binding) {
			$('#app-container').unbind(pointer.move);
			binding = false;
			if (v_label) {
				var v = v_label.index();
				var _$ = v_label.parent().parent();
				_$.trigger('elf-update', v);
				_$.trigger('elf-change', v);
				v_label = null;
			}
		}
	});

	$('#app-container').on(pointer.click, '.elf-tab-left-control', function(e) {
		e.stopPropagation();
		e.preventDefault();
		slide($(this).parent(),  1, 0, false);
	});

	$('#app-container').on(pointer.click, '.elf-tab-right-control', function(e) {
		e.stopPropagation();
		e.preventDefault();
		slide($(this).parent(), -1, 0, false);
	});

	$(window).resize(function() {
		$('.elf-tab-control').each(function() {
			slide($(this), 0, 0, true);
		});
	});


	function slide(_$, step, dx, force) {
		var _$div = _$.children('div');
		var num = _$.find('label').length;
		if (num == 0) return;

		var limit = _$.width();
		var width = _$div.width();
		var unit  = width / num;

		var left, left0 = _$div.position().left;
		if (step) {
			left = Math.floor((left0 + (unit * step)) / unit) * unit;
		} else {
			left = left0 + dx;
		}

		left = Math.round(left);
		if (left + width < limit) left = limit - width;
		if (left > 0) left = 0;
		if (left == left0 && !force) return;

		_$div.css('left', left + 'px');
		var _$arrow = _$.children('p');
		if (left < 0) {
			_$arrow.eq(0).show();
		} else {
			_$arrow.eq(0).hide();
		}
		if (left + width > limit) {
			_$arrow.eq(1).show();
		} else {
			_$arrow.eq(1).hide();
		}
	}

});
