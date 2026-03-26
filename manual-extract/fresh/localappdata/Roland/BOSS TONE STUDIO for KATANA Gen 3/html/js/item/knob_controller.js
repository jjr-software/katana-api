//
//	knob_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	var knob = {
		type: 1,
		typeInfo: [
			{	// original method
				LIMIT:	140,	/* -140 ~ 140 degree */
				COEF:	8
			},
			{	// simulation of KATANA knob 
				LIMIT:	150,	/* -150 ~ 150 degree */
				COEF:	8,
				RAVAL:	15,		/* value of -90 degrees (right angle) when reange is 0 to 100 */
			},
		],
		info: function() {
			return this.typeInfo[this.type];
		},
		degree: function(v, min, max) {
			var info = this.info();
			if (info.RAVAL) {
				var dz = info.RAVAL * (max - min) / 100;
				if (v < min + dz) {
					var step = (info.LIMIT - 90) / dz;
					return step * (v - min) - info.LIMIT;
				}
				else if (v > max - dz) {
					var step = (info.LIMIT - 90) / dz;
					return 90 + step * (v - (max - dz));
				}
				else {
					var r = max - min - info.RAVAL * 2;
					return (180 * v - 90 * r - 180 * info.RAVAL) / r;
				}
			}
			else {
				var step = (info.LIMIT * 2) / (max - min);
				return (-1) * info.LIMIT + (step * (v - min));
			}
		},
		calc: function(y, ly, v0, min, max) {
			var step = (this.info().LIMIT * 2) / (max - min);
			return v0 - Math.floor((y - ly) * this.info().COEF / step);
		}
	}

	$('#app-container').on('elf-update', '.elf-knob-control', function(e, v) {

		var _$ = $(this);
		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		min *= 1; max *= 1; v *= 1;
		if (min >= max) return false;

		var degree = eval(_$.attr('degree'));

		if (v < min) v = min;
		if (v > max) v = max;
		var deg = (degree)? degree[v - min] : knob.degree(v, min, max);

		_$.children('div').css('transform', 'rotate(' + deg + 'deg)');
		_$.prop('value', v);

		return false;
	});

	var binding = false;

	$('#app-container').on(pointer.down, '.elf-knob-control', function(e) {

		e.stopPropagation();

		if (e.which > 1) return;
		var touch = (e.which == 0);

		var _$ = $(this);

		var min = _$.attr('min'); if (!min) min = 0;
		var max = _$.attr('max'); if (!max) max = 0;
		min *= 1; max *= 1;
		if (min >= max) return;

		if (touch) {
			var handler = _$.attr('touch-handler');
			if (!handler) handler = 'knob-touch-handler'; /* global handler */
			if (window[handler]) {
				if (window[handler](e, _$)) return;
			}
		}

		var degree = eval(_$.attr('degree'));

		if (touch) { e.pageY = e.originalEvent.touches[0].pageY }
		var lastY = e.pageY;
		var v0 = (_$.val() * 1);

		binding = true;
		$('#app-container').bind(pointer.move, function(e) {
			if (touch) { e.pageY = e.originalEvent.touches[0].pageY }
			var v = knob.calc(e.pageY, lastY, v0, min, max);
			if (v < min) v = min;
			if (v > max) v = max;
			if (v == _$.val()) return;

			var deg = (degree)? degree[v - min] : knob.degree(v, min, max);

			_$.children('div').css('transform', 'rotate(' + deg + 'deg)');
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

	$('#app-container').on('dblclick', '.elf-knob-control', function(e) {
		e.stopPropagation();
		var handler = $(this).attr('dblclick-handler');
		if (!handler) handler = 'knob-dblclick-handler'; /* global handler */
		if (window[handler]) {
			window[handler](e, $(this));
		}
	});

});
