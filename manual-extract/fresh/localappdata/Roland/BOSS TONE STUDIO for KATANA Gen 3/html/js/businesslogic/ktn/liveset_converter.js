//
//	liveset_converter.js
//
//	Copyright 2019 Roland Corporation. All rights reserved.
//

/* To prevent error on ESLint */
/* global ProductSetting, Parameter, _bid */

function PatchConverter() {
}

PatchConverter.prototype = {
	create: function(memo) {
		var patch = {
			memo: (memo)? memo : '',
			paramSet: {}
		};
		for (var prop in window.Converter.initParamSet) {
			patch.paramSet[prop] = window.Converter.initParamSet[prop].concat();
		}
		return patch;
	},

	import: function(data, revision) {
		return data;
	},

	export: function (data, revision, order) {
		return data;
	},
}

function LivesetConverter(device, patchConverter, device2) {
	this.device = device;
	this.device2 = device2;
	this.patchConverter = patchConverter;
}

LivesetConverter.prototype = {
	checkFormatWithModelGT: function(data) {
		if (data.device && data.device == this.device2) {
			return true;
		}
		return false;
	},
	checkFormat: function (data) {
		if (this.checkFormatWithModelGT(data)) {
			return true;
		}
		if (data.device !== this.device) return false;
		return true;
	},

	import: function (data) {
		try {
			if (!this.checkFormat(data)) {
				throw new Error('this file is unsupported');
			}
			let ktnConvertToMk2;
			if (this.checkFormatWithModelGT(data)) {
				ktnConvertToMk2 = new KtnMk1LivesetModel();
			}
			var liveset = {
				name:		ktnConvertToMk2 ? ktnConvertToMk2.livesetName(data) : this.livesetName(data),
				formatRev:	this.dstRevision(),
				device:		this.dstDevice(),
				data:		[]
			};
			liveset.data[0] = [];
			let numOfPatch = ktnConvertToMk2 ? ktnConvertToMk2.numOfPatch(data) : this.numOfPatch(data);
			try {
				for (var n = 0, num = numOfPatch; n < num; n++) {
					var patch = ktnConvertToMk2 ? ktnConvertToMk2.patchData(data, n) : this.patchData(data, n);
					let _patch = patch;
					if (ktnConvertToMk2) {
						// Mk1 -> Mk2
						_patch = ktnConvertToMk2.patchConverter.import(patch, ktnConvertToMk2.srcRevision(data));
						data.formatRev = '0002';
					}else{
						// Mk2 (!Mk1 !Gen3 !other)
						// from Mk2 LibrarianModel.read
						if (data.formatRev === '0000') {
							_patch.paramSet['UserPatch%Patch_2'] = _patch.paramSet['UserPatch%Patch_1'].splice(0x60);
							_patch.paramSet['UserPatch%Patch_1'].splice(0x32);
							data.formatRev = '0002';
						}
					}
					// Mk2 -> Gen3
					liveset.data[0].push(this.patchConverter.import(_patch));
				}
			} catch (error) {
				throw new Error(error);
			}
			//$native.app.storage2(liveset.name + '.json', JSON.stringify(liveset));
			return liveset;
		} catch (error) {
			throw new Error('this file is unsupported');
		}
	},

	livesetName:	function(data)	{ return data.name;	},
	numOfPatch:		function(data)			{ return data.data[0].length;	},
	patchData:		function(data, index) 	{ return data.data[0][index];	},
	srcRevision:	function(data)	{ return data.formatRev;	},
	dstRevision:	function()		{ return ProductSetting.livesetFile.formatRev;	},
	dstDevice:		function()		{ return ProductSetting.name;	},

	export: function (liveset) {
		var fmt = this.makeFormat(liveset);
		for (var n = 0, num = liveset.cells[0].length; n < num; n++) {
			var object = this.patchConverter.export(liveset.cells[0][n], ProductSetting.livesetFile.formatRev, n);
			this.appendPatch(fmt, object);
		}
		return fmt;
	},
	makeFormat: function (data) {
		var fmt = {
			name: data.name,
			formatRev: ProductSetting.livesetFile.formatRev,
			device: ProductSetting.name,
			data: []
		};
		fmt.data[0] = [];
		return fmt;
	},

	appendPatch: function (fmt, patch) {
		fmt.data[0].push(patch);
	},
};

(function() {
	var _obj = {
		initParamSet: [],
	};
	window.Converter = _obj;
})();

$(function() {
	var blockSet = ProductSetting.librarian[0].config.blockSet;
	for (var n = 0, num = blockSet.length; n < num; n++) {
		var bid = blockSet[n];
		var b = Parameter.getblock(_bid(bid, 0));
		window.Converter.initParamSet[bid] = b.data.concat();
	}
});
