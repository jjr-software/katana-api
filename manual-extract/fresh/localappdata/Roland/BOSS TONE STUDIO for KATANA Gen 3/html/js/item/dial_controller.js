//
//	dial_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	var LIMIT = 136; /* -136 ~ 136 degree */
	var GAP   = 2;   /* degree of center gap */
	var COEF  = 8;

	function draw_arc(_$canvas, degree, center) {

		var thickness = _$canvas.prev().css('border-radius').replace('px', '');
		var fgcolor   = _$canvas.prev().css('color');
		var bgcolor   = _$canvas.prev().css('background-color');
		var gpcolor   = _$canvas.prev().css('border-top-color');
		var nacolor   = _$canvas.prev().css('border-bottom-color');

		var style = _$canvas.prev().css('border-style');

		var canvas = _$canvas[0];
		var x = (canvas.width  / 2);
		var y = (canvas.height / 2);
		var r = Math.min(x, y) - (thickness / 2);

		var deg  = (degree - 90) * Math.PI / 180;
		var arc0 = (-LIMIT - 90) * Math.PI / 180;
		var arc1 = ( LIMIT - 90) * Math.PI / 180;
		var gap0 = (center !== undefined) ? (center - GAP - 90) * Math.PI / 180 : arc0;
		var gap1 = (center !== undefined) ? (center + GAP - 90) * Math.PI / 180 : arc0;

		if (arc0 > gap0) arc0 = gap0;
		if (arc1 < gap1) arc1 = gap1;

		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

			function _arc(deg0, deg1, color) {
				if (deg0 == deg1) return;
				ctx.beginPath();
				ctx.lineWidth = thickness;
				ctx.strokeStyle = color;
				ctx.arc(x, y, r, deg0, deg1, false);
				ctx.stroke();
				ctx.closePath();
			}

		_arc(gap0, gap1, gpcolor);

		if (degree < center) {
			var col;
			if (style == 'double') {
				col = [ fgcolor, bgcolor, nacolor ]; /* 2-way type */
			} else if (center !== undefined) {
				col = [ bgcolor, fgcolor, bgcolor ]; /* center type */
			} else {
				col = [ fgcolor, bgcolor, bgcolor ]; /* basic type */
			}
			if (deg > gap0) deg = gap0;
			_arc(arc0, deg,  col[0]);
			_arc(deg,  gap0, col[1]);
			_arc(gap1, arc1, col[2]);
		} else {
			var col;
			if (style == 'double') {
				col = nacolor; /* 2-way type */
			} else if (center !== undefined) {
				col = bgcolor; /* center type */
			} else {
				col = fgcolor; /* basic type */
			}
			if (deg  < gap1) deg  = gap1;
			_arc(arc0, gap0, col);
			_arc(gap1, deg,  fgcolor);
			_arc(deg,  arc1, bgcolor);
		}

	}

	$('#app-container').on('elf-update', '.elf-dial-control', function(e, v) {

		var _$ = $(this);
		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		min *= 1; max *= 1; v *= 1;
		if (min >= max) return false;

		var step = (LIMIT * 2) / (max - min);
		if (v < min) v = min;
		if (v > max) v = max;

		var center = _$.attr('center');
		if (center !== undefined) {
			center = -LIMIT + (step * (center - min));
		} else if (min < 0 && 0 < max) {
			center = -LIMIT + (step * (0 - min));
		}

		var deg = -LIMIT + (step * (v - min));
		draw_arc(_$.children('canvas'), deg, center);
		var coef = _$.attr('value-coef');
		if (coef === undefined) coef = 1;
		_$.children('p').text(v * coef);
		_$.prop('value', v);

		return false;
	});

	var binding = false;
	var v_tap = null;

	$('#app-container').on(pointer.down, '.elf-dial-control', function(e) {

		e.stopPropagation();

		if (e.which > 1) return;
		var touch = (e.which == 0);

		var _$ = $(this);

		if (_$.attr('disabled')) return;
		
		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		min *= 1; max *= 1;
		if (min >= max) return;

		if (touch) {
			var handler = _$.attr('touch-handler');
			if (!handler) handler = 'dial-touch-handler'; /* global handler */
			if (window[handler]) {
				if (window[handler](e, _$)) return;
			}
		}

		var step = (LIMIT * 2) / (max - min);
		var v0 = (_$.val() * 1);

		var center = _$.attr('center');
		if (center !== undefined) {
			center = -LIMIT + (step * (center - min));
		} else if (min < 0 && 0 < max) {
			center = -LIMIT + (step * (0 - min));
		}

		if (touch) { e.pageY = e.originalEvent.touches[0].pageY }
		var lastY = e.pageY;

		if (touch) { e.pageX = e.originalEvent.touches[0].pageX }
		var rc = _$[0].getBoundingClientRect();
		var tap = e.pageX - (rc.left + window.pageXOffset);
		if (tap < _$.width() / 2) { v_tap = (v0 - 1); } else { v_tap = (v0 + 1); }

		binding = true;
		$('#app-container').bind(pointer.move, function(e) {
			if (touch) { e.pageY = e.originalEvent.touches[0].pageY }
			if (e.pageY != lastY) v_tap = null;
			var dy = Math.floor((e.pageY - lastY) * COEF / step);
			var v = v0 - dy;
			if (v < min) v = min;
			if (v > max) v = max;
			if (v == _$.val()) return;

			var deg = -LIMIT + (step * (v - min));
			draw_arc(_$.children('canvas'), deg, center);
			var coef = _$.attr('value-coef');
			if (coef === undefined) coef = 1;
			_$.children('p').text(v * coef);
			_$.prop('value', v);
			_$.trigger('elf-change', v);
		});

	});

	//$('#app-container').on(pointer.up, function(e) {
	$(document).on(pointer.up, function(e) {
		if (binding) {
			$('#app-container').unbind(pointer.move);
			binding = false;
		}
	});

	$('#app-container').on('click', '.elf-dial-control', function(e) {
		e.stopPropagation();
		if (window['disable-tap-step']) v_tap = null; /* global flags */
		if (v_tap !== null) {
			var _$ = $(this);
			_$.trigger('elf-update', v_tap);
			if (v_tap == _$.val()) {
				_$.trigger('elf-change', v_tap);
			}
			v_tap = null;
		}
	});

	$('#app-container').on('dblclick', '.elf-dial-control', function(e) {
		e.stopPropagation();

		var _$ = $(this);
		if (_$.attr('disabled')) return;
		
		var handler = _$.attr('dblclick-handler');
		if (!handler) handler = 'dial-dblclick-handler'; /* global handler */
		if (window[handler]) {
			window[handler](e, _$);
		}
	});

});
