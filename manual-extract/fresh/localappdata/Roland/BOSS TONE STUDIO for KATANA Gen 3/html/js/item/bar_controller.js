//
//	bar_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	$('#app-container').on('elf-update', '.elf-bar-control', function(e, v) {

		var _$ = $(this);

		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		min *= 1; max *= 1; v *= 1;
		if (min >= max) return false;

		if (v < min) v = min;
		if (v > max) v = max;
		var coef = _$.attr('value-coef');
		if (coef === undefined) coef = 1;
		_$.children('p').text(v * coef);
		_$.prop('value', v);
		draw_bar(_$);

		return false;
	});

	var binding = false;
	var v_tap = null;

	$('#app-container').on(pointer.down, '.elf-bar-control', function(e) {

		e.stopPropagation();

		if (e.which > 1) return;
		var touch = (e.which == 0);

		var _$ = $(this);

		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		min *= 1; max *= 1;
		if (min >= max) return;

		if (touch) {
			e.pageX = e.originalEvent.touches[0].pageX;
			e.pageY = e.originalEvent.touches[0].pageY;
		}

		var pair = _$.attr('lower-than') || _$.attr('upper-than');
		if (pair) {
			_$ = which(_$, pair, max - min, e);
		}

		if (touch) {
			var handler = _$.attr('touch-handler');
			if (!handler) handler = 'bar-touch-handler'; /* global handler */
			if (window[handler]) {
				if (window[handler](e, _$)) return;
			}
		}

		if (touch && window['bar-touch-handler']) {
			if (window['bar-touch-handler'](e, _$)); return;
		}

		var v0 = (_$.val() * 1);
		var offset = 0;
		var bar_move;

		if (_$.width() > _$.height()) {
			var lastX = e.pageX;
			var width = _$.width();
			if (pair) {
				if (_$.attr('upper-than')) offset = width;
				width += $('#' + pair).width();
			}
			var step = width / (max - min);
			var rc = _$[0].getBoundingClientRect();
			var tap = e.pageX - (rc.left + window.pageXOffset) + offset;
			if (tap < width / 2) {
				if (v0 > min) v_tap = (v0 - 1);
			} else {
				if (v0 < max) v_tap = (v0 + 1);
			}
			bar_move = function(e) {
				if (touch) { e.pageX = e.originalEvent.touches[0].pageX }
				if (e.pageX != lastX) v_tap = null;
				var dx = Math.floor((e.pageX - lastX) / step);
				var v = v0 + dx;
				if (v < min) v = min;
				if (v > max) v = max;
				return v;
			};
		} else {
			var lastY = e.pageY;
			var height = _$.height();
			if (pair) {
				if (_$.attr('lower-than')) offset = height;
				height += $('#' + pair).height();
			}
			var step = height / (max - min);
			var rc = _$[0].getBoundingClientRect();
			var tap = e.pageY - (rc.top + window.pageYOffset) + offset;
			if (tap > height / 2) {
				if (v0 > min) v_tap = (v0 - 1);
			} else {
				if (v0 < max) v_tap = (v0 + 1);
			}
			bar_move = function(e) {
				if (touch) { e.pageY = e.originalEvent.touches[0].pageY }
				if (e.pageY != lastY) v_tap = null;
				var dy = Math.floor((e.pageY - lastY) / step);
				var v = v0 - dy;
				if (v < min) v = min;
				if (v > max) v = max;
				return v;
			};
		}

		binding = true;
		$('#app-container').bind(pointer.move, function(e) {
			var v = bar_move(e);
			if (v != _$.val()) {
				var coef = _$.attr('value-coef');
				if (coef === undefined) coef = 1;
				_$.children('p').text(v * coef);
				_$.prop('value', v);
				_$.trigger('elf-change', v);
				draw_bar(_$);
			}
		});

	});

	//$('#app-container').on(pointer.up, function(e) {
	$(document).on(pointer.up, function(e) {
		if (binding) {
			$('#app-container').unbind(pointer.move);
			binding = false;
		}
	});

	$('#app-container').on('click', '.elf-bar-control', function(e) {
		e.stopPropagation();
		if (window['disable-tap-step']) v_tap = null; /* global flags */
		if (v_tap !== null) {
			var _$ = $(this);
			var coef = _$.attr('value-coef');
			if (coef === undefined) coef = 1;
			_$.children('p').text(v_tap * coef);
			_$.prop('value', v_tap);
			_$.trigger('elf-change', v_tap);
			draw_bar(_$);
			v_tap = null;
		}
	});

	$('#app-container').on('dblclick', '.elf-bar-control', function(e) {
		e.stopPropagation();
		var handler = $(this).attr('dblclick-handler');
		if (!handler) handler = 'bar-dblclick-handler'; /* global handler */
		if (window[handler]) {
			window[handler](e, $(this));
		}
	});

	function draw_bar(_$, reent) {

		var _$bar = _$.children('div');

		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		var v = _$.val();
		min *= 1; max *= 1; v *= 1;

		var pair = _$.attr('lower-than') || _$.attr('upper-than');

		var center = _$.attr('center');
		if ((center === undefined) && (min < 0 && 0 < max)) center = 0;

		var offset = 0;

		if (_$.width() > _$.height()) {
			var width = _$.width();
			if (pair) { 
				if (_$.attr('upper-than')) offset = width;
				width += $('#' + pair).width();
			}
			var step = width / (max - min);
			var x0 = step * (v - min);
			var x1 = (center !== undefined) ? step * (center - min) : 0;
			if (pair) { x1 = step * ($('#' + pair).val() - min); }
			x0 = Math.floor(x0 - offset);
			x1 = Math.floor(x1 - offset);
			_$bar.css('left',  Math.min(x0,  x1) + 'px');
			_$bar.css('width', Math.abs(x0 - x1) + 'px');
		} else {
			var height = _$.height();
			if (pair) {
				if (_$.attr('lower-than')) offset = height;
				height += $('#' + pair).height();
			}
			var step = height / (max - min);
			var y0 = height - (step * (v - min));
			var y1 = (center !== undefined) ? height - (step * (center - min)) : height;
			if (pair) { y1 = height - (step * ($('#' + pair).val() - min)) }
			y0 = Math.floor(y0 - offset);
			y1 = Math.floor(y1 - offset);
			_$bar.css('top',    Math.min(y0,  y1) + 'px');
			_$bar.css('height', Math.abs(y0 - y1) + 'px');
		}

		if (pair && !reent) { draw_bar($('#' + pair), true); }
	}

	function which(_$, pair, divider, e) {

		var v = _$.val();
		var v_pair = $('#' + pair).val();
		var v_middle = Math.min(v, v_pair) + Math.abs((v - v_pair) / 2);

		var length, position;
		if (_$.width() > _$.height()) {
			var length = _$.width()  + $('#' + pair).width();
			var position = e.pageX - _$.offset().left;
			if (_$.attr('upper-than')) position += $('#' + pair).width();
		} else {
			var length = _$.height() + $('#' + pair).height();
			var position = _$.height() - (e.pageY - _$.offset().top);
			if (_$.attr('upper-than')) position += $('#' + pair).height();
		}

		var _v = position / (length / divider);
		if (_$.attr('lower-than')) {
			if (_v > v_middle) {
				return $('#' + pair);
			}
		} else { /* _$.attr('upper-than') */
			if (_v < v_middle) {
				return $('#' + pair);
			}
		}
		return _$;
	}

});
