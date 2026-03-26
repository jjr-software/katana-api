//
//	item_logic.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

pointer = {
	down:  'mousedown touchstart',
	move:  'mousemove touchmove',
	up:    'mouseup touchend',
	click: 'click touchstart'
};
if (navigator.userAgent.indexOf('Chrome') > 0 ||
	navigator.userAgent.indexOf('Android') > 0) {
	pointer.click = 'click touchstart:withPreventDefault';
}
if (navigator.userAgent.indexOf('Apple') >= 0 &&
	navigator.vendor && navigator.vendor.indexOf('Google') >= 0) {
	/* runnnig in chrome developer tools */
	pointer.click = 'click touchstart:withPreventDefault';
}

$(function() {

	/* parameter logics */

	var Parameter = null;

	if (window.Parameter === undefined && window.parent.Parameter) {
		window.Parameter = window.parent.Parameter;
	}
	if (window.Parameter) {
		Parameter = window.Parameter;
	}

	if (Parameter) {
		var observer = {
			notify: function(bid, start, end) {
				var addrs = __fast[bid];
				if (addrs) {
					for (var n = start; n < end; n++) {
						var params = addrs[n];
						if (params) {
							for (var i = 0, num = params.length; i < num; i++) {
								parameter_update(_items[params[i]]);
							}
						}
					}
				}
			}
		};
		Parameter.addObserver(observer);
		window.onbeforeunload = function() {
			Parameter.removeObserver(observer);
		}
		window.onpagehide = window.onbeforeunload; /* for iOS Safari */
	}

	function parameter_load(item) {
		if (item.deferred) delete item.deferred;
		var v;
		if (item.opt) {
			var pid = item.pid + ('=' + item.opt_type);
			if (window.__opt === undefined) { __opt = {}; }
			if (__opt[pid] === undefined) { __opt[pid] = item.init; }
			v = __opt[pid];
			if (Parameter) {
				var oid = pid.substring(0, pid.lastIndexOf('%') + 1) + item.opt_addr;
				var type = Parameter.value(oid, INTEGER1x7, 0);
				if (type == item.opt_type) {
					v = Parameter.value(item.pid, item.size, item.vofs);
					__opt[pid] = v;
				}
			}
		} else if (Parameter) {
			v = Parameter.value(item.pid, item.size, item.vofs);
		} else {
			v = item.init;
		}
		update_item(item, v);
	}

	function parameter_change(item, v) {
		if (item.deferred) return;
		var pid = item.pid;
		if (item.opt)  { pid += ('=' + item.opt_type); __opt[pid] = v; }
		if (Parameter) { Parameter.setValue(item.pid, item.size, item.vofs, v); }
		if (__bind[pid]) {
			var bind = __bind[pid];
			for (var i = 0, num = bind.length; i < num; i++) {
				if (bind[i] == item.id) continue;
				update_item(_items[bind[i]], v);
			}
		}
	}

	function parameter_update(item) {
		if (item.deferred) return;
		if (item.opt) {
			var pid = item.pid;
			var oid = pid.substring(0, pid.lastIndexOf('%') + 1) + item.opt_addr;
			var type = Parameter.value(oid, INTEGER1x7, 0);
			if (type != item.opt_type) return;
		}
		var v = Parameter.value(item.pid, item.size, item.vofs);
		if (item.opt) { __opt[item.pid + ('=' + item.opt_type)] = v; }
		$('#' + item.id).trigger('elf-change', [v, true]);
	}

	/* item logics */

	var controls = [
		'.elf-check-box-control',
		'.elf-radio-button-control',
		'.elf-text-input-control',
		'.elf-tab-control',
		'.elf-toggle-button-control',
		'.elf-select-box-control',
		'.elf-select-list-control',
		'.elf-select-panel-control',
		'.elf-spinner-control',
		'.elf-spinner-up-control',
		'.elf-spinner-down-control',
		'.elf-knob-control',
		'.elf-slider-control',
		'.elf-dial-control',
		'.elf-bar-control',
	];
	controls = controls.join();

	$('#app-container').on('elf-change', controls, function(e, v, update_only, reent) {
		var item = _items[$(this).attr('id')];
		if (update_only) {
			update_item(item, v)
		} else {
			if (!reent) {
				if (item.lower) { $('#' + item.lower).trigger('elf-constraint', [v, true ]); }
				if (item.upper) { $('#' + item.upper).trigger('elf-constraint', [v, false]); }
			}
			item_logic(item, v);
			if (item.pid)  { parameter_change(item, v); }
		}
		if (item.trig) { $('#' + item.id).trigger('elf-changed', [v, update_only]); }
		return false;
	});

	var responders = [
		'.elf-knob-control',
		'.elf-slider-control',
		'.elf-dial-control',
		'.elf-bar-control',
		'.elf-spinner-control',
	];
	responders = responders.join();

	$('#app-container').on('keydown', responders, function(e) {
		e.stopPropagation();
		if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
		var _$ = $(this);
		var v = _$.val();
		     if (e.keyCode == 37) { v--; } /* right arrow */
		else if (e.keyCode == 38) { v++; } /* up    arrow */
		else if (e.keyCode == 39) { v++; } /* left  arrow */
		else if (e.keyCode == 40) { v--; } /* down  arrow */
		else return;
		_$.trigger('elf-update', v);
		if (v == _$.val()) {
			_$.trigger('elf-change', v);
		}
	});

	$('#app-container').on(pointer.click, '.elf-step-value', function(e) {
		e.stopPropagation();
		e.preventDefault();
		var item = _items[$(this).attr('id')];
		var e = new $.Event('keydown');
		if (item.inc) { e.keyCode = 38; $('#' + item.inc).trigger(e); return; }
		if (item.dec) { e.keyCode = 37; $('#' + item.dec).trigger(e); return; }
	});

	var constraints = [
		'.elf-spinner-control',
		'.elf-knob-control',
		'.elf-slider-control',
		'.elf-dial-control',
		'.elf-bar-control',
	];
	constraints = constraints.join();

	$('#app-container').on('elf-constraint', constraints, function(e, v, lower) {
		var _$ = $(this);
		if (lower) {
			if (v <= _$.val()) return false;
		} else {
			if (v >= _$.val()) return false;
		}
		_$.trigger('elf-update', v);
		if (v == _$.val()) {
			_$.trigger('elf-change', [v, false, true]);
		}
		return false;
	});

	$('#app-container').on(pointer.click, '.elf-popup', function(e) {
		e.stopPropagation();
		e.preventDefault();
		var item = _items[$(this).attr('id')];
		if (item.popup == '--close') {
			var wrapper = $(this).closest('.elf-popup-wrapper');
			wrapper.find('input').each(function(){ $(this).blur() });
			popup_close(wrapper.children('div').attr('id'));
		} else {
			popup_open(item.popup, $('#'+ item.popup).attr('wrapper-style'));
		}
	});

	function update_item(item, v) {
		$('#' + item.id).trigger('elf-update', v);
		item_logic(item, v);
	}

	function item_logic(item, v) {
		if (item.stringer) { stringer($('#' + item.stringer), v); }
		if (item.replace && item.block) {
			if(!(item.block == "ASSIGN_GAFCEXPPDL")){
				replace_pid(item, v);
			}else{
				replace_pid_assign(item, v);
			}	
		}
		if (item.frame) {
			if (item.order && v < item.order.length) { v = item.order[v]; }
			var $page = $('#'+ item.frame).children().eq(v);
			if (!$page.attr('displayed')) {
				$page.attr('displayed', 'true');
				$page.children('.elf-parameter').each(function(index, elm) {
					var id = $(elm).attr('id');
					if (_items[id].deferred) {
						parameter_load(_items[id]);
					}
				});
			}
			if (window['page-transition']) {
				window['page-transition'](item, v);
			} else {
				$('#'+ item.frame).children().hide();
				$page.show();
			}
		}
	}

	function replace_pid(item, v) {
		var key = item.block.split(/[0-9]+\)$/g)[0];
		var num = item.block.match(/[0-9]+\)$/g);
		if (!num) return;

		var shift = (key == '+(');
		if (shift) { /* replace parameter addr to { addr0 + (num * v) } */
			num = (num[0].slice(0, -1) * v);
		} else { /* replace block name to ( num + v ) */
			num = (num[0].slice(0, -1) * 1) + (v * 1);
		}

		$('#'+ item.replace).find('.elf-parameter').each(function() {
			var target = _items[$(this).attr('id')];
			var token = target.pid.split('%');
			if (shift) {
				var _ = token.pop();
				if (target.addr0 === undefined) target.addr0 = (_ * 1);
				target.pid = token.join('%') + '%' + (target.addr0 + num);
			} else {
				for (var i = 0, len = token.length - 1; i < len; i++) {
					var b = token[i];
					if (b.lastIndexOf(key, 0) == 0) {
						token[i] = key + num + ')';
						target.pid = token.join('%');
						return;
					}
				}
			}
		});

		__prepare();

		$('#'+ item.replace).find('.elf-parameter').each(function() {
			var item = _items[$(this).attr('id')];
			if (!item.deferred) parameter_load(item);
		});
	}

	function replace_pid_assign(item, v) {
		var keyFrom = "";
		var keyTo = "";
		switch (item.id) {
			case "asgn-gafc-exp-content-switcher":
			case "asgn-gafc-func1-content-switcher":
			case "asgn-gafc-func2-content-switcher":
			case "asgn-gafc-func3-content-switcher":
				if (v == 0) {
					keyFrom = "(2)";
					keyTo = "(1)";
				} else {
					keyFrom = "(1)";
					keyTo = "(2)";
				}
				break;
			default:
				return;
		}

		$('#'+ item.replace).find('.elf-parameter').each(function() {
			var target = _items[$(this).attr('id')];
			var token = target.pid.split('%');
			for (var i = 0, len = token.length - 1; i < len; i++) {
				var b = token[i];
				if (b.includes(keyFrom)) {
					token[i] = b.replace(keyFrom,keyTo);
					target.pid = token.join('%');
					return;
				}
			}
		});

		__prepare();

		$('#'+ item.replace).find('.elf-parameter').each(function() {
			var item = _items[$(this).attr('id')];
			if (!item.deferred) parameter_load(item);
		});
	}

	window.prepare_assign = __prepare;

	function __prepare() {
		window.__fast = {};
		window.__bind = {};
		for (var n in _items) {
			if (!_items[n].pid) continue;
			var item = _items[n];
			var pid  = item.pid;
			var _ = pid.split('%');
			var addr = parseInt(_.pop(), 10);
			var bid  = _.join('%');
			/* for fast update */
			if (__fast[bid] === undefined) { __fast[bid] = []; }
			if (__fast[bid][addr] === undefined) { __fast[bid][addr] = []; }
			__fast[bid][addr].push(item.id);
			/* bind items */
			if (item.opt) { pid += ('=' + item.opt_type); }
			if (__bind[pid] === undefined) { __bind[pid] = []; }
			__bind[pid].push(item.id);
		}
	}

	window.stringer = function(_$, v) {
		var format = _$.attr('format');
		if (format) {
			var value = (v * 1);
			var str = eval(format);
			_$.children('p').html(str);
		} else {
			_$.children('p').remove();
			_$.find('div p:eq(' + (v * 1) + ')').clone().appendTo(_$);
		}
	}

	window.popup_open = function(id, wrapper_style) {
		if ($('#' + id).is(':hidden')) {
			ProductSetting.dialogOpeningCount++;
			if (wrapper_style === undefined) wrapper_style = 'page-popup-wrapper';
			var wrapper = $('<div class="elf-popup-wrapper ' + wrapper_style + '"></div>');
			$('#app-container').append(wrapper);
			$('#' + id).appendTo(wrapper).show();
		}
	}

	window.popup_close = function(id) {
		if ($('#' + id).is(':visible')) {
			ProductSetting.dialogOpeningCount--
			$('#' + id).hide().unwrap().appendTo('#layout-wrapper');
		}
	}

	window.update_language = function() {
		$('p[msg^="IDM"],label[msg^="IDM"],a[msg^="IDM"]').each(function() {
			var idm = $(this).attr('msg');
			if (idm) { $(this).html(MSG(idm)); }
		});
	};

	update_language();

	__prepare();

	/* load all pamameters */
	for (var n in _items) {
		if (_items[n].pid) {
			if (!_items[n].deferred) {
				parameter_load(_items[n]);
			}
		} else if (_items[n].init !== undefined ){
			update_item(_items[n], _items[n].init);
		}
	}

});
