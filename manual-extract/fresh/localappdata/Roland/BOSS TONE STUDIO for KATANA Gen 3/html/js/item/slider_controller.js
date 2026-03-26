//
//	slider_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	var GUIDE_SIZE = 2;
	const slideDown = ['line-custom-m2-mic-distance-slider', 'line-custom-m1-mic-distance-slider'];
	const slideXCustom = ['line-custom-m1-mic-position-slider', 'line-custom-m2-mic-position-slider'];

	$('#app-container').on('elf-update', '.elf-slider-control', function(e, v) {

		var _$ = $(this);

		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		min *= 1; max *= 1; v *= 1;
		if (min >= max) return false;

		if (v < min) v = min;
		if (v > max) v = max;
		_$.prop('value', v);
		draw_thumb(_$);

		return false;
	});

	var binding = false;

	$('#app-container').on(pointer.down, '.elf-slider-control', function(e) {

		e.stopPropagation();

		if (e.which > 1) return;
		var touch = (e.which == 0);

		var _$ = $(this);

		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		min *= 1; max *= 1;
		if (min >= max) return;

		var _$thumb = _$.children('div');

		var upper = _$.attr('lower-than');
		if (upper) {
			if (_$.width() > _$.height()) {
				if (touch) { e.pageX = e.originalEvent.touches[0].pageX }
				var lower_left = _$thumb.offset().left + _$thumb.width();
				var upper_left = $('#' + upper).children('div').offset().left;
				if (e.pageX > lower_left + (upper_left - lower_left) / 2 ) {
					_$ = $('#' + upper);
				}
			} else {
				if (touch) { e.pageY = e.originalEvent.touches[0].pageY }
				var lower_top = _$thumb.offset().top;
				var upper_top = $('#' + upper).children('div').offset().top + _$thumb.height();
				if (e.pageY < upper_top + (lower_top - upper_top) / 2 ) {
					_$ = $('#' + upper);
				}
			}
		}

		if (touch) {
			var handler = _$.attr('touch-handler');
			if (!handler) handler = 'slider-touch-handler'; /* global handler */
			if (window[handler]) {
				if (window[handler](e, _$)) return;
			}
		}

		var slider_move;

		if (_$.width() > _$.height()) {
			var thumb = _$thumb.width();
			var width = _$.width() - thumb;
			var step = width / (max - min);
			slider_move = function(e) {
				if (touch) { e.pageX = e.originalEvent.touches[0].pageX }
				var rc = _$[0].getBoundingClientRect();
				rc.left += window.pageXOffset;
				var left = e.pageX - rc.left - (thumb / 2);
				if (left < 0) left = 0;
				if (left > width) left = width;
				return Math.round((left / step) + min);
			};
		}  else if (slideDown.includes($(e.currentTarget).attr('id'))) {
			var thumb = _$thumb.height();
			var height = _$.height() - thumb;
			var step = height / (max - min);
			slider_move = function(e) {
				if (touch) { e.pageY = e.originalEvent.touches[0].pageY }
				var rc = _$[0].getBoundingClientRect();
				rc.top += window.pageYOffset;
				var top = e.pageY - rc.top - (thumb / 2);
				if (top < 0) top = 0;
				if (top > height) top = height;
				return Math.round(max - ((height - top) / step) );
			};
		} else {
			var thumb = _$thumb.height();
			var height = _$.height() - thumb;
			var step = height / (max - min);
			slider_move = function(e) {
				if (touch) { e.pageY = e.originalEvent.touches[0].pageY }
				var rc = _$[0].getBoundingClientRect();
				rc.top += window.pageYOffset;
				var top = e.pageY - rc.top - (thumb / 2);
				if (top < 0) top = 0;
				if (top > height) top = height;
				return Math.round(((height - top) / step) + min);
			};
		}

		var v = slider_move(e);
		if (v != _$.val()) {
			_$.prop('value', v);
			_$.trigger('elf-change', v);
			draw_thumb(_$);
		}

		binding = true;
		$('#app-container').bind(pointer.move, function(e) {
			var v = slider_move(e);
			if (v != _$.val()) {
				_$.prop('value', v);
				_$.trigger('elf-change', v);
				draw_thumb(_$);
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

	$('#app-container').on('dblclick', '.elf-slider-control', function(e) {
		e.stopPropagation();
		var handler = $(this).attr('dblclick-handler');
		if (!handler) handler = 'slider-dblclick-handler'; /* global handler */
		if (window[handler]) {
			window[handler](e, $(this));
		}
	});

	function draw_thumb(_$, reent) {

		var _$thumb = _$.children('div');

		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		var v = _$.val();
		min *= 1; max *= 1; v *= 1;

		var color = _$.css('color');
		var bkcolor = _$.css('background-color');
		var gdcolor = _$.children('span').css('border-color');

		var center = _$.attr('center');
		if ((center === undefined) && (min < 0 && 0 < max)) center = 0;
		var pair = _$.attr('lower-than') || _$.attr('upper-than');
		if (pair) center = ($('#' + pair).val() * 1);

		var bar, guide = null; 

		if (_$.width() > _$.height()) {
			
			var thumb = _$thumb.width();
			var width = _$.width() - thumb;
			if (slideXCustom.includes(_$.attr('id'))) {
				thumb = _$thumb.height();
				width = _$.width() - thumb;
			}
			var step = width / (max - min);
			var left = step * (v - min);
			_$thumb.css('left', Math.floor(left) + 'px');

			var x0 = Math.floor((left + (thumb / 2)) * 100 / _$.width());
			var x1 = (center !== undefined) ? step * (center - min) + (thumb / 2) : 0;
			x1 = Math.floor(x1 * 100 / _$.width());
			bar = 'linear-gradient(to right,' +
				bkcolor + ' 0%,' +
				bkcolor + ' ' + Math.min(x0, x1) + '%,' +
				color   + ' ' + Math.min(x0, x1) + '%,' +
				color   + ' ' + Math.max(x0, x1) + '%,' +
				bkcolor + ' ' + Math.max(x0, x1) + '%,' +
				bkcolor + ' 100%)';

			if (_$.attr('step-guide')) {
				var x = (thumb / 2) - 1;
				guide = 'linear-gradient(to right,' +
					'transparent ' + ', ' +
					'transparent ' +  x + 'px, ' +
					gdcolor + ' '  +  x + 'px, ' +
					gdcolor + ' '  + (x + GUIDE_SIZE) + 'px, ' +
					'transparent ' + (x + GUIDE_SIZE) + 'px, ' +
					'transparent ' + step + 'px)';
				_$.children('span').css('background-size', step + 'px 1px');
			}
		} else {
			var thumb = _$thumb.height();
			var height = _$.height() - thumb;
			var step = height / (max - min);
			let top = height - (step * (v - min));
			let y1 = (center !== undefined) ? height - (step * (center - min)) + (thumb / 2) : _$.height();
			if (slideDown.includes(_$.attr('id'))) { 
				top = height - (step * (max - v));
				y1 = (center !== undefined) ? height - (step * (max - center)) + (thumb / 2) : 0;
			}  
			_$thumb.css('top', Math.floor(top) + 'px');

			var y0 = Math.floor((top + (thumb / 2)) * 100 / _$.height());
			y1 = Math.floor(y1 * 100 / _$.height());
			bar = 'linear-gradient(to bottom,' +
				bkcolor + ' 0%,' +
				bkcolor + ' ' + Math.min(y0, y1) + '%,' +
				color   + ' ' + Math.min(y0, y1) + '%,' +
				color   + ' ' + Math.max(y0, y1) + '%,' +
				bkcolor + ' ' + Math.max(y0, y1) + '%,' +
				bkcolor + ' 100%)';

			if (_$.attr('step-guide')) {
				var y = (thumb / 2) - 1;
				guide = 'linear-gradient(to bottom,' +
					'transparent ' + ', ' +
					'transparent ' +  y + 'px, ' +
					gdcolor + ' '  +  y + 'px, ' +
					gdcolor + ' '  + (y + GUIDE_SIZE) + 'px, ' +
					'transparent ' + (y + GUIDE_SIZE) + 'px, ' +
					'transparent ' + step + 'px)';
				_$.children('span').css('background-size', '1px ' + step + 'px');
			}
		}

		_$.css('background-image', bar);

		if (guide) {
			_$.children('span').css('background-image', guide);
		}

		if (pair && !reent) { draw_thumb($('#' + pair), true); }

	}

});
