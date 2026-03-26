//
//	assign_controller.js
//
//	Copyright 2019 Roland Corporation. All rights reserved.
//

/* To prevent error on ESLint */
/* global _items, AssignSetting */

$(function () {
	const EXP_PEDAL_FUNCTION = {
		VOLUME: 0,
		F_VOLUME: 1,
		PEDAL_FX: 2,
		PEDAL_FX_FV: 3,
		BST: 4,
		MOD: 5,
		FX: 6,
		DELAY: 7,
		DELAY2: 8,
		REVERB: 9,
	}

	const expPedalPage = ['pedal', 'exp1', 'exp2', 'exp3'];

	const asgn = new AssignSetting();
	const typeFx = [];
	window.setupKnobModFxTargetList = () => {
		const { valueFxType, valueModType, ofsOrderFxType, ofsOrderModType } = transformValueModFxType();
		if (valueModType == valueFxType) {
			$('#asgn-knobs-fx-label, #asgn-knobs-fx-select-box').hide();
			setupKnobModFxTarget(true, ofsOrderModType, true);
		} else {
			$('#asgn-knobs-fx-label, #asgn-knobs-fx-select-box').show();
			setupKnobModFxTarget(true, ofsOrderModType, false);
			setupKnobModFxTarget(false, ofsOrderFxType, false);
		}
	}

	const initAssignController = async function () {
		await configDetailMinMax();
		window.setupKnobModFxTargetList();
	}

	initAssignController();

	async function configDetailMinMax() {
		expPedalPage.forEach(async (expPedal, index) => {
			await _configFrameKnobExpGafc(expPedal, true, true);
		})
		for (const prop in asgn.config) {
			const target = asgn.config[prop];
			if (!target) continue;
			const html = createTargetListHtml(target, 'elf-select-box-option-control');
			setupTargetList('asgn-knobs-' + prop + '-select-box', target, html, false);
		}
	}
	/**
	 * Create html for assign target pull-down list (asgn-knobs-booster-select-box, asgn-pedal-booster-select-box, and more)
	 * and min/max value controllers for pedal assign.
	 */
	function _configFrameKnobExpGafc(expPedal, isConfigCss = false, isSetup = false) {
		return new Promise((resolve, reject) => {
			for (const prop in asgn.config) {
				hideItem(expPedal, prop, isConfigCss);
				if (isSetup) {
					const target = asgn.config[prop];
					if (!target) continue;
					const html = createTargetListHtml(target, 'elf-select-box-option-control');
					setupTargetList(`asgn-${expPedal}-${prop}-select-box`, target, html, true);
				}
			}
			for (const prop in asgn.configModFx) {
				hideItem(expPedal, prop, isConfigCss);
				if (isSetup) {
					if (!typeFx.includes(prop)) {
						typeFx.push(prop);
					}
					const target = asgn.configModFx[prop];
					if (!target) continue;
					const html = createTargetListHtml(target, 'elf-select-box-option-control');
					setupTargetList(`asgn-${expPedal}-${prop}-select-box`, target, html, true);
				}
			}
			$(`#asgn-${expPedal}-func-exp-frame`).show();

			resolve();
		})
	}

	function hideItem(expPedal, prop, isConfigCss = false) {
		const label = $(`#asgn-${expPedal}-${prop}-label, #asgn-${expPedal}-${prop}-min-label, #asgn-${expPedal}-${prop}-max-label`);
		const selectBox = $(`#asgn-${expPedal}-${prop}-select-box, #asgn-${expPedal}-${prop}-min-select-box,
												#asgn-${expPedal}-${prop}-max-select-box, #asgn-${expPedal}-${prop}-min-spinner,
												#asgn-${expPedal}-${prop}-max-spinner`);
		label.hide();
		selectBox.hide();

		if (isConfigCss) {
			label.addClass('top-12');
			selectBox.addClass('top-28');
		}
	}

	function createTargetListHtml(target, cls) {
		var html = '';
		for (var n = 0, num = (target.order) ? target.order.length : target.param.length; n < num; n++) {
			var i = (target.order) ? target.order[n] : n;
			html += ('<a href="#" class="' + cls + '" msg>');
			var name = target.param[i].name;
			if (!name) {
				var tid = target.param[i].id;
				if (tid) {
					var desc = $('#' + tid).attr('description');
					if (desc) name = $('#' + desc).text();
				}
			}
			html += name;
			html += ('</a>');
		}
		return html;
	}

	function setupTargetList(id, target, html, minmax) {
		// const value = parseInt($('#' + id).attr('value'), 10);
		const { pidDetail } = toPidDetailMinMax('knobs');
		const ofs = target.ofs_knobs_detail || 0;
		const value = Parameter.value(`PATCH%${pidDetail}%${ofs}`, INTEGER1x7, 0);
		setSelectBoxList(id, html, value, { order: target.order }, true);
		if (minmax) {
			setupMinMaxControllers(id, target.param[value], false, true);
			$('#' + id).on('elf-changed', function (e, v, update_only) {
				let update_val = update_only;
				if (midiConnectionController.getCurrentMIDI() === null) {
					update_val = false
				}
				setupMinMaxControllers(this.id, target.param[v], update_val, update_only);
			});
		}
	}

	function setSelectBoxList(id, html, init, opt, update_only) {
		var item = _items[id];
		if (!item) return;
		delete item.order;
		var _$ = $('#' + id + '-box');
		var _parent = _$.parent();
		var width = _parent.outerWidth();
		if (_parent.attr('box-default-width') !== undefined) {
			width = _parent.attr('box-default-width') * 1;
		}
		else if (_parent.attr('box-width') !== undefined) {
			width = _parent.attr('box-width') * 1;
		}
		_parent.attr('box-default-width', width);
		_parent.attr('box-width', width);
		if (opt) {
			if (opt.order) {
				item.list_order = opt.order;
			}
			if (opt.width) {
				if (opt.width > width) {
					_parent.attr('box-width', opt.width);
				}
			}
		}
		_$.empty().append(html);
		_$.html(html);
		_parent.trigger('elf-change', [init, update_only]);
		if (!update_only) {
			_$.parent().trigger('elf-update', init);
		}
	}

	function isHidden(id) {
		return $('#' + id).css('display') == 'none';
	}

	function setupMinMaxControllers(id, param, update_val, update_only) {
		// if (isHidden(id)) return;
		var min = param.min;
		var max = param.max;
		var prm = null;
		if (param.id) {
			prm = $('#' + param.id);
			min = parseInt(prm.attr('min'), 10);
			max = parseInt(prm.attr('max'), 10);
		}
		if (prm && prm.attr('dblclick-handler') === 'numpadList') {
			setupLists(id, param, min, max, update_val, update_only);
		}
		else {
			setupSpinners(id, param, min, max, update_val, update_only);
		}
	}

	function setupLists(id, param, min, max, update_val, update_only) {
		var item = _items[param.id];
		var stringer = $('#' + item.stringer);
		var list = stringer.children('div').children('p');
		var html = '';
		for (var i = 0, len = max - min + 1; i < len; i++) {
			html += ('<a href="#" class="elf-select-box-option-control" msg>');
			html += list.eq(i).text();
			html += ('</a>');
		}
		const minSelectBox = id.replace('select-box', 'min-select-box');
		const maxSelectBox = id.replace('select-box', 'max-select-box');
		if (update_val) {
			const itemMin = _items[minSelectBox];
			const itemMax = _items[maxSelectBox];
			min = Parameter.value(itemMin.pid, itemMin.size, itemMin.vofs)
			max = Parameter.value(itemMax.pid, itemMax.size, itemMax.vofs)
		}

		setSelectBoxList(minSelectBox, html, min, { width: param.width }, update_only);
		setSelectBoxList(maxSelectBox, html, max, { width: param.width }, update_only);

		if (isHidden(id)) return;
		// Update show/hide spinner and select boxes
		$('#' + minSelectBox).show();
		$('#' + maxSelectBox).show();
		$('#' + id.replace('select-box', 'min-spinner')).hide();
		$('#' + id.replace('select-box', 'max-spinner')).hide();
	}

	function setupSpinners(id, param, min, max, update_val, update_only) {
		var format = param.format;
		var unformat = param.unformat;
		var vofs = param.vofs;
		if (param.id) {
			var item = _items[param.id];
			if (item.stringer && (format === undefined)) {
				format = $('#' + item.stringer).attr('format');
				if (format) {
					format = format.replace('<br>', '');
					if (unformat === undefined) {
						unformat = "value.replace(/[^-^0-9^\.]/g,'')"
					}
				}
			}
			vofs = item.vofs;
		}
		const minSpinner = id.replace('select-box', 'min-spinner');
		const maxSpinner = id.replace('select-box', 'max-spinner');
		let valueMin = min;
		let valueMax = max;
		if (update_val) {
			const itemMin = _items[minSpinner];
			const itemMax = _items[maxSpinner];
			valueMin = Parameter.value(itemMin.pid, itemMin.size, itemMin.vofs)
			valueMax = Parameter.value(itemMax.pid, itemMax.size, itemMax.vofs)
		}

		setupSpinner(minSpinner, min, max, valueMin, vofs, format, unformat, update_only);
		setupSpinner(maxSpinner, min, max, valueMax, vofs, format, unformat, update_only);

		if (isHidden(id)) return;
		// Update show/hide spinner and select boxes
		$('#' + minSpinner).show();
		$('#' + maxSpinner).show();
		$('#' + id.replace('select-box', 'min-select-box')).hide();
		$('#' + id.replace('select-box', 'max-select-box')).hide();

		function setupSpinner(id, min, max, init, vofs, format, unformat, update_only) {
			var item = _items[id];
			if (!item) return;
			item.vofs = (vofs) ? vofs : 0;
			var _$ = $('#' + id).children('input');
			_$.attr('min', min);
			_$.attr('max', max);
			_$.attr('init', init);
			_$.attr('format', format ? format : '');
			_$.attr('unformat', unformat ? unformat : '');
			_$.parent().trigger('elf-change', [init, update_only]);
			if (!update_only) {
				_$.parent().trigger('elf-update', init);
			}
		}
	}

	function toModFxTypeLowerCase(type) {
		return type.replace(/[-. ]/g, "").toLowerCase();
	}

	function toTextModFxType(isMod, eq) {
		const mod = isMod ? 'mod' : 'fx';
		return $(`#modfx-${mod}-type-select-box`).find('a').eq(eq).text();
	}

	function setupKnobModFxTarget(isMod, eq, isSame) {
		const modFx = isMod ? 'mod' : 'fx';
		const label = toStrModFx(isMod, isSame, eq);
		$(`#asgn-knobs-${modFx}-label`).children('p').text(label);
		let _prop = typeFx[eq];
		const target = asgn.configModFx[_prop];
		var html = createTargetListHtml(target, 'elf-select-box-option-control');
		setupParameterTarget(isMod, target.ofs_knobs_detail);
		setupTargetList(`asgn-knobs-${modFx}-select-box`, target, html, false);
	}

	function setupParameterTarget(isMod, ofs) {
		const mod = isMod ? 'mod' : 'fx';
		const _id = `asgn-knobs-${mod}-select-box`;
		const item = _items[_id];
		item.pid = `PATCH%ASSIGN_KNOBS%${ofs}`;

		setTimeout(() => {
			prepare_assign();
		}, 0);
	}

	function toPidDetailMinMax(expPedal) {
		let pidDetail = '';
		let pidMin = '';
		let pidMax = '';
		switch (expPedal) {
			case 'pedal':
				pidDetail = 'ASSIGN_EXPPDL_DETAIL';
				pidMin = 'ASSIGN_EXPPDL_MIN';
				pidMax = 'ASSIGN_EXPPDL_MAX';
				break;
			case 'exp1':
				pidDetail = 'ASSIGN_GAFCEXPPDL1_DETAIL(1)';
				pidMin = 'ASSIGN_GAFCEXPPDL1_MIN(1)';
				pidMax = 'ASSIGN_GAFCEXPPDL1_MAX(1)';
				break;
			case 'exp2':
				pidDetail = 'ASSIGN_GAFCEXPPDL2_DETAIL(1)';
				pidMin = 'ASSIGN_GAFCEXPPDL2_MIN(1)';
				pidMax = 'ASSIGN_GAFCEXPPDL2_MAX(1)';
				break;
			case 'exp3':
				pidDetail = 'ASSIGN_GAFCEXPPDL3_DETAIL(1)';
				pidMin = 'ASSIGN_GAFCEXPPDL3_MIN(1)';
				pidMax = 'ASSIGN_GAFCEXPPDL3_MAX(1)';
				break;
			case 'knobs':
				pidDetail = 'ASSIGN_KNOBS';
				break;
			default:
				break;
		}

		return {
			pidDetail,
			pidMin,
			pidMax,
		}
	}

	function showLabel(expPedal, strFunc) {
		let id = `#asgn-${expPedal}-${strFunc}-label`;
		$(`${id}, ${id.replace('label', 'min-label')}, ${id.replace('label', 'max-label')}`).show();
	}

	function toValueExpPedalFunc(expPedal) {
		const item = _items[`asgn-${expPedal}-function-select-box`]
		return Parameter.value(item.pid, item.size, item.vofs);
	}

	function transformValueModFxType() {
		const itemModType = _items['modfx-mod-type-select-box'];
		const itemFxType = _items['modfx-fx-type-select-box'];

		let modWatcherItem = _items['mod-select-watcher'];
		let modWatcherValue = Parameter.value(modWatcherItem.pid, modWatcherItem.size, modWatcherItem.vofs);

		let fxWatcherItem = _items['fx-select-watcher'];
		let fxdWatcherValue = Parameter.value(fxWatcherItem.pid, fxWatcherItem.size, fxWatcherItem.vofs);

		let pidModType = `PATCH%FX(${modWatcherValue + 1})%0`
		let pidFxType = `PATCH%FX(${fxdWatcherValue + 4})%0`

		const valueModType = Parameter.value(pidModType, itemModType.size, itemModType.vofs);
		const valueFxType = Parameter.value(pidFxType, itemFxType.size, itemFxType.vofs);
		let ofsOrderModType = valueModType;
		let ofsOrderFxType = valueFxType;
		if (itemModType.list_order && itemModType.order) {
			ofsOrderModType = itemModType.order.filter(x => x != -1)[itemModType.list_order.indexOf(valueModType)];
		}
		if (itemFxType.list_order && itemFxType.order) {
			ofsOrderFxType = itemFxType.order.filter(x => x != -1)[itemFxType.list_order.indexOf(valueFxType)];
		}

		return {
			valueModType,
			valueFxType,
			ofsOrderModType,
			ofsOrderFxType,
		}
	}

	function toStrFunction(valueFunc) {
		let strFunc = '';
		let isMod = false;
		switch (valueFunc) {
			case EXP_PEDAL_FUNCTION.BST:
				strFunc = 'booster';
				break;
			case EXP_PEDAL_FUNCTION.DELAY:
			case EXP_PEDAL_FUNCTION.DELAY2:
				strFunc = 'delay';
				break;
			case EXP_PEDAL_FUNCTION.REVERB:
				strFunc = 'reverb';
				break;
			case EXP_PEDAL_FUNCTION.MOD:
				strFunc = 'mod_fx';
				isMod = true;
				break;
			case EXP_PEDAL_FUNCTION.FX:
				strFunc = 'mod_fx';
				isMod = false;
				break;
		}

		return { strFunc, isMod };
	}

	function toStrModFx(isMod, isSame, eq) {
		let str = '';
		if (isSame) {
			str = 'MOD/FX';
		} else {
			str = isMod ? 'MOD' : 'FX'
		}
		const text = toTextModFxType(isMod, eq)
		return `${str}: ${text}`;
	}

	function setupExpPedalGafc(valueFunc) {
		const { strFunc, isMod } = toStrFunction(valueFunc);
		expPedalPage.forEach(async (expPedal) => {
			const funcExpPedal = toValueExpPedalFunc(expPedal);
			const strFunExpPedal = toStrFunction(funcExpPedal);
			if (strFunc == 'mod_fx' && strFunExpPedal.strFunc == 'mod_fx') {
				const { valueFxType, valueModType, ofsOrderFxType, ofsOrderModType } = transformValueModFxType();
				if (valueFunc != funcExpPedal) {
					const modFxLabel = $(`#asgn-${expPedal}-mod_fx-label`).children('p').text();
					const modFxLabelSplit = modFxLabel.split(':');
					if (strFunExpPedal.isMod) {
						modFxLabelSplit[0] = valueFxType != valueModType ? 'MOD' : 'MOD/FX';
					} else {
						modFxLabelSplit[0] = valueFxType != valueModType ? 'FX' : 'MOD/FX';
					}
					$(`#asgn-${expPedal}-mod_fx-label`).children('p').text(modFxLabelSplit.join(':'));
					return;
				}
				await _configFrameKnobExpGafc(expPedal);
				const eq = isMod ? ofsOrderModType : ofsOrderFxType;
				const label = toStrModFx(isMod, valueFxType == valueModType, eq);
				$(`#asgn-${expPedal}-mod_fx-label`).children('p').text(label);

				const _prop = typeFx[eq];

				const idDetail = `asgn-${expPedal}-${_prop}-select-box`;

				$(`#asgn-${expPedal}-func-exp-frame`).hide();
				$('#' + idDetail).show();
				showLabel(expPedal, strFunc);

				const target = asgn.configModFx[_prop];
				if (target) {
					const value = parseInt($('#' + idDetail).attr('value') || 0, 10);
					$('#' + idDetail).trigger('elf-change', [value, true]);
				}
			}
		});
	}

	expPedalPage.forEach((expPedal, index) => {
		$(`#asgn-${expPedal}-function-select-box`).on('elf-changed', async (e, v, update_only) => {
			let strFunc = toStrFunction(v).strFunc;
			let _strFunc = strFunc;
			if (!strFunc) {
				$(`#asgn-${expPedal}-func-exp-frame`).show();
				return;
			}
			let target;
			if (v == EXP_PEDAL_FUNCTION.MOD || v == EXP_PEDAL_FUNCTION.FX) {
				const isMod = v == EXP_PEDAL_FUNCTION.MOD;
				const { valueFxType, valueModType, ofsOrderFxType, ofsOrderModType } = transformValueModFxType();
				const eq = isMod ? ofsOrderModType : ofsOrderFxType;
				const label = toStrModFx(isMod, valueFxType == valueModType, eq);
				$(`#asgn-${expPedal}-mod_fx-label`).children('p').text(label);
				let _prop = typeFx[eq];
				strFunc = _prop;
				target = asgn.configModFx[strFunc];
			} else {
				target = asgn.config[strFunc];
			}

			await _configFrameKnobExpGafc(expPedal);

			const idDetail = `asgn-${expPedal}-${strFunc}-select-box`;

			$(`#asgn-${expPedal}-func-exp-frame`).hide();
			$('#' + idDetail).show();
			showLabel(expPedal, _strFunc);

			if (!update_only || update_only == 'true') {
				let itemDetail = _items[idDetail];
				if (!idDetail) return;
				const value = Parameter.value(itemDetail.pid, itemDetail.size, itemDetail.vofs);
				$('#' + idDetail).trigger('elf-change', [value, true]);
			}
		});
	});

	["#mod-asgn-grn-select-box", "#mod-asgn-red-select-box", "#mod-asgn-ylw-select-box"].forEach((item, index) => {
		$(item).on('elf-changed', (e, v, update_only) => {
			if (update_only) return;
			let modWatcherItem = _items['mod-select-watcher'];
			let modWatcherValue = Parameter.value(modWatcherItem.pid, modWatcherItem.size, modWatcherItem.vofs);
			if (modWatcherValue !== index) return;
			setupKnobModFxTargetList();
			setupExpPedalGafc(EXP_PEDAL_FUNCTION.MOD);
		})
	});

	["#fx-asgn-grn-select-box", "#fx-asgn-red-select-box", "#fx-asgn-ylw-select-box"].forEach((item, index) => {
		$(item).on('elf-changed', (e, v, update_only) => {
			if (update_only) return;
			let fxWatcherItem = _items['fx-select-watcher'];
			let fxWatcherValue = Parameter.value(fxWatcherItem.pid, fxWatcherItem.size, fxWatcherItem.vofs);
			if (fxWatcherValue !== index) return;
			setupKnobModFxTargetList();
			setupExpPedalGafc(EXP_PEDAL_FUNCTION.FX);
		})
	});

	$('#mod-select-watcher, #modfx-mod-type-select-box').on('elf-changed', function (e, v, update_only) {
		if (update_only && window.isReadPatch0) return;
		setupKnobModFxTargetList();
		setupExpPedalGafc(EXP_PEDAL_FUNCTION.MOD);
	});

	$('#fx-select-watcher, #modfx-fx-type-select-box').on('elf-changed', function (e, v, update_only) {
		if (update_only && window.isReadPatch0) return;
		setupKnobModFxTargetList();
		setupExpPedalGafc(EXP_PEDAL_FUNCTION.FX);
	});
});
