//
//	model_controller.js
//
//	Copyright 2019 Roland Corporation. All rights reserved.
//

(function() {
	var _code = undefined;
	var _extWidth = 160;
	var _defaultInfo = {
		minClientWidth:		1000,
		naviBtnWidth:		undefined,
		naviBtnsLeft:		[],
		effectAsgnWidth:	[],
		effectAsgnLeft:		[],
		chainWidth:			undefined,
		chainPtnBtnWidth:	undefined
	};
	var paramItemInfo = {
		eq2:		{ navi:  ['EQ2'], asgn: ['EQ2'] },
		solo:		{ frame: ['panel-solo-frame'], asgn: ['SOLO'] },
		contour:	{ frame: ['panel-contour-frame'] },
		toneshape:	{ frame: ['panel-toneshape-frame', 'global-eq-content-toneshape-frame'], asgn: ['GLOBAL EQ'] },
		solodelay:	{ ids:   ['panel-solo-delay-knob', 'panel-solo-delay-label', 'panel-solo-delay-spinner']},
		bloom: 		{ ids:   ['panel-amp-type-bloom-btn', 'panel-amp-type-bloom-label']},
	};
	var effectAsgnIDs = [
		'editor-effects-booster-content-frame',
		'editor-effects-mod-content-frame',
		'editor-effects-fx-content-frame',
		'editor-effects-delay-content-frame',
		'editor-effects-reverb-content-frame'
	];
	var gafcAsgnFsIDs = [
		'asgn-fs1-function-select-box',
		'asgn-fs2-function-select-box'
	];
	function adjustParamSet(info) {
		if (librarianCommonInfo.librarians.length === 0) {
			return;
		}
		var ep = ProductSetting.editor[0].config;
		var lp = librarianCommonInfo.librarians[0].config;
		if (info.config.eq2) {
			appendBlockSet(ep.blockSet, ep.blockSetEq2);
			appendBlockSet(lp.blockSet, lp.blockSetEq2);
		}
		else {
			removeBlockSet(ep.blockSet, ep.blockSetEq2);
			removeBlockSet(lp.blockSet, lp.blockSetEq2);
		}
		ep = ProductSetting.editor[1].config;
		if (info.config.toneshape) {
			appendBlockSet(ep.blockSet, ep.blockSetToneShape);
		}
		else {
			removeBlockSet(ep.blockSet, ep.blockSetToneShape);
		}
		if (_code !== info.code()) {
			_code = info.code();
			for (var i = 0, len = ProductSetting.editor[0].config.blockSet.length; i < len; i++) {
				Parameter.initialize(ProductSetting.editor[0].config.blockSet[i]);
			}
			for (var i = 0, len = ProductSetting.editor[1].config.blockSet.length; i < len; i++) {
				Parameter.initialize(ProductSetting.editor[1].config.blockSet[i]);
			}
		}

		function appendBlockSet(blockSet, appendSet) {
			for (var i = 0, len = appendSet.length; i < len; i++) {
				var n = blockSet.indexOf(appendSet[i]);
				if (n >= 0)	continue;
				blockSet.push(appendSet[i]);
			}
		}
		function removeBlockSet(blockSet, removeSet) {
			for (var i = 0, len = removeSet.length; i < len; i++) {
				var n = blockSet.indexOf(removeSet[i]);
				if (n < 0)	continue;
				blockSet.splice(n, 1);
			}
		}
	}
	function adjustFrameSize(info) {
		var extend = false;
		// window frame
		var minClientWidth = _defaultInfo.minClientWidth;
		if (info.config.solo || info.config.contour || info.config.toneshape) {
			minClientWidth += _extWidth;
			extend = true;
		}
		$native.app.control('set_window_size:'+JSON.stringify({mode:'min', width:minClientWidth}));
		// navi buttons
		var naviBtnIDs = window.effectDOMController.naviBtnIDs;
		if (_defaultInfo.naviBtnWidth === undefined) {
			_defaultInfo.naviBtnWidth = parseInt($('#' + naviBtnIDs[0]).children('.elf-radio-button-item').eq(0).css('width').split('px')[0]);
		}
		if (_defaultInfo.naviBtnsLeft.length === 0) {
			naviBtnIDs.forEach(function(id, i) {
				_defaultInfo.naviBtnsLeft[i] = parseInt($('#' + id).css('left').split('px')[0]);
			});
		}
		var naviBtnsCount = [];
		var naviBtnNum = 0;
		naviBtnIDs.forEach(function(id, i) {
			naviBtnsCount[i] = $('#' + id).children('.elf-radio-button-item').length;
			naviBtnNum += naviBtnsCount[i];
		});
		var naviBtnExtWidth = (extend)? Math.floor((_extWidth - _defaultInfo.naviBtnWidth) / naviBtnNum) : 0;
		naviBtnIDs.forEach(function(id, i) {
			var ofs = 0;
			for (var n = 0; n < i; n++) {
				ofs += naviBtnsCount[n] * naviBtnExtWidth;
			}
			$('#' + id).css('left', _defaultInfo.naviBtnsLeft[i] + ofs + 'px');
			var btnWidth = _defaultInfo.naviBtnWidth + naviBtnExtWidth;
			var btns = $('#' + id).children('.elf-radio-button-item');
			for (var n = 0, num = btns.length; n < num; n++) {
				var style = $(btns[n]).attr('style');
				$(btns[n]).css({'cssText':style + 'width: ' + btnWidth + 'px !important'});
			}
		});
		// effects
		if (_defaultInfo.effectAsgnWidth.length === 0) {
			effectAsgnIDs.forEach(function(id, i) {
				_defaultInfo.effectAsgnWidth[i] = parseInt($('#' + id).css('width').split('px')[0]);
			});
		}
		if (_defaultInfo.effectAsgnLeft.length === 0) {
			effectAsgnIDs.forEach(function(id, i) {
				_defaultInfo.effectAsgnLeft[i] = parseInt($('#' + id).css('left').split('px')[0]);
			});
		}
		var asgnWidthExt = parseInt(((extend)? _extWidth : 0) / effectAsgnIDs.length);
		effectAsgnIDs.forEach(function(id, i) {
			$('#' + id).css('left', (_defaultInfo.effectAsgnLeft[i] + asgnWidthExt * i) + 'px');
			$('#' + id).css('width', (_defaultInfo.effectAsgnWidth[i] + asgnWidthExt) + 'px');
		});

		// chain
		// if (_defaultInfo.chainWidth === undefined) {
		// 	_defaultInfo.chainWidth = parseInt($('#editor-chain-content-frame').css('width').split('px')[0]);
		// }
		// if (_defaultInfo.chainPtnBtnWidth === undefined) {
		// 	_defaultInfo.chainPtnBtnWidth = parseInt($('#chain-ptn-select-btn').css('width').split('px')[0]);
		// }
		// $('#editor-chain-content-frame').css('width', (_defaultInfo.chainWidth + ((extend)? _extWidth:0)) + 'px');
		// $('#chain-ptn-select-btn').css('width', (_defaultInfo.chainPtnBtnWidth + ((extend)? _extWidth:0)) + 'px');
	}
	function updateTopTitle(info) {
		window.btsDOMController.setTopTitle(info.name());
	}
	function updateParamItems(info) {

		var btns = $('#editor-navi-btn-3').children('label');
		for (var prop in paramItemInfo) {
			var items = [];
			items = paramItemInfo[prop].frame;
			if (items) {
				for (var n = 0, num = items.length; n < num; n++) {
					if (info.config[prop])	$('#' + items[n]).show();
					else					$('#' + items[n]).hide();
				}
			}
			items = paramItemInfo[prop].navi;
			if (items) {
				for (var n = 0, num = items.length; n < num; n++) {
					for (var i = 0, len = btns.length; i < len; i++) {
						var text = $(btns[i]).text();
						if (text !== items[n]) continue;
						if (info.config[prop])	$(btns[i]).show();
						else					$(btns[i]).hide();
						break;
					}
				}
			}
			items = paramItemInfo[prop].asgn;
			if (items) {
				for (var n = 0, num = items.length; n < num; n++) {
					for (var i = 0, len = gafcAsgnFsIDs.length; i < len; i++) {
						var list = $('#' + gafcAsgnFsIDs[i]).find('.elf-select-box-option-control');
						for (var l = 0, ln = list.length; l < ln; l++) {
							var label = $(list[l]).text();
							if (label.indexOf(items[n]) !== 0)  continue;
							if (info.config[prop])	$(list[l]).show();
							else					$(list[l]).hide();
							break;
						}
					}
				}
			}
			items = paramItemInfo[prop].ids;
			if (items) {
				for (var n = 0, num = items.length; n < num; n++) {
					if (info.config[prop])	$('#' + items[n]).show();
					else					$('#' + items[n]).hide();
				}
			}
		}
	}
	function updateWritePatchList(info) {
		var lines = $('#write-dialog-patch-select-list').find('a');
		for (var i = 0, len = lines.length; i < len; i++) {
			var item = lines.eq(i);
			if (info.patchExist(i))	item.show();
			else					item.hide();
		}
	}
	function updateMidiRxPcSetting(info) {
		var patchCtrl =  window.patchModelController;
		for (var i = 0, len = patchCtrl.getTotalUserPatch(); i < len; i++) {
			var p = patchCtrl.getPrefix(i);
			var box = $('#midi-setting-rx-pc-p' + i + '-select-box');
			var lbl = $('#midi-setting-rx-pc-p' + i + '-label');
			lbl.find('p').text('RX PC '+ p);
			if (info.patchExist(i)) {
				box.show();
				lbl.show();
			}
			else {
				box.hide();
				lbl.hide();
			}
		}
	}
	function updateMidiRxCcSetting(info) {
		var idTbl = [
			'midi-setting-rx-cc-gafc-exp1-label',	'midi-setting-rx-cc-gafc-exp1-select-box',
			'midi-setting-rx-cc-gafc-exp2-label',	'midi-setting-rx-cc-gafc-exp2-select-box',
			'midi-setting-rx-cc-gafc-exp3-label',	'midi-setting-rx-cc-gafc-exp3-select-box',
			'midi-setting-rx-cc-gafc-fs1-label',	'midi-setting-rx-cc-gafc-fs1-select-box',
			'midi-setting-rx-cc-gafc-fs2-label',	'midi-setting-rx-cc-gafc-fs2-select-box',
			'midi-setting-rx-cc-gafc-fs3-label',	'midi-setting-rx-cc-gafc-fs3-select-box',
			'midi-setting-rx-cc-gafc-ex-fs1-label',	'midi-setting-rx-cc-gafc-ex-fs1-select-box',
			'midi-setting-rx-cc-gafc-ex-fs2-label',	'midi-setting-rx-cc-gafc-ex-fs2-select-box',
			'midi-setting-rx-cc-gafc-ex-fs3-label',	'midi-setting-rx-cc-gafc-ex-fs3-select-box',
			'midi-setting-rx-cc-gafc-ex-exp1-label',	'midi-setting-rx-cc-gafc-ex-exp1-select-box',
			'midi-setting-rx-cc-gafc-ex-exp2-label',	'midi-setting-rx-cc-gafc-ex-exp2-select-box',
			'midi-setting-rx-cc-gafc-ex-exp3-label',	'midi-setting-rx-cc-gafc-ex-exp3-select-box',
		];
		if (info.config.gafc) {
			for (var i = 0, len = idTbl.length; i < len; i++)	$('#' + idTbl[i]).show();
		}
		else {
			for (var i = 0, len = idTbl.length; i < len; i++)	$('#' + idTbl[i]).hide();
		}
	}
	function updateAssignSetting(info) {
		var sel = $('#asgn-page-select-btn');
		if (info.config.gafc) {
			sel.show();
			$('#system-gafc-content-frame-2-mask').hide();
		}
		else {
			sel.trigger('elf-change', 0/* knobs/exp padal */);
			sel.hide();
			$('#system-gafc-content-frame-2-mask').show();
		}
	}
	function updateSoloDelay(info) {
		var sel = $('#solo-delay-content-frame');
		var sel2 = $('#solo-delay-line');
		if (info.config.solodelay) {
			sel.show();
			sel2.show();
		}
		else {
			sel.hide();
			sel2.hide();
		}
	}
	function updatePowerCtrl(info) {
		var sel = $('#system-powercontrol-mask');
		if (!info.config.powerctrl) {
			sel.show();
		}
		else {
			sel.hide();
		}
	}
	function updateExportInstBtnIconImageUrl(info) {
		var disabled = false;
		var exportInstBtnId = LIBRARIAN_ELEMENT_IDS.exportToInstBtn;
		if ($(exportInstBtnId).hasClass('disabled')) disabled = true;
		$(exportInstBtnId).css('background-image', info.exportBtnIconImgUrl(disabled));
	}
	function updateImportInstBtnIconImageUrl(info) {
		var disabled = false;
		var importInstBtnId = LIBRARIAN_ELEMENT_IDS.importFromInstBtn;
		if ($(importInstBtnId).hasClass('disabled')) disabled = true;
		$(importInstBtnId).css('background-image', info.importBtnIconImgUrl(disabled));
	}

	function updateEditorSoloDelay(info) {
		const frames = $('#panel-cab-res-frame, #panel-toneshape-frame');
		if (info.config.solodelay) {
			frames.addClass('custom-distance-cab-frame');
			$('#panel-solo-page').removeClass('custom-solo')
			$('#panel-solo-frame').removeClass('w-74');
		} else {
			frames.removeClass('custom-distance-cab-frame');
			$('#panel-solo-page').addClass('custom-solo');
			$('#panel-solo-frame').addClass('w-74');
		}
	}

	window.modelDOMController = {
		initialize: function() {
			this.update();
		},
		update: function() {
			var info = window.modelInfo.config();
			adjustParamSet(info);
			adjustFrameSize(info);
			updateTopTitle(info);
			updateParamItems(info);
			updateWritePatchList(info);
			updateMidiRxPcSetting(info);
			updateMidiRxCcSetting(info);
			updateAssignSetting(info);
			updateSoloDelay(info);
			updatePowerCtrl(info);
			updateEditorSoloDelay(info);
			updateImportInstBtnIconImageUrl(info);
			updateExportInstBtnIconImageUrl(info);
			window.patchDOMController.updatePatchSelectPage();
		},
		updateIndivisual: function(id) {
			//var info = window.modelInfo.config();
			switch (id) {
			case LIBRARIAN_ELEMENT_IDS.importFromInstBtn:
				updateImportInstBtnIconImageUrl(window.modelInfo.config());
				break;
			case LIBRARIAN_ELEMENT_IDS.exportToInstBtn:
				updateExportInstBtnIconImageUrl(window.modelInfo.config());
				break;
			}
		},
	};

}());