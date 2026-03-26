//
//	model_info.js
//
//	Copyright 2019 Roland Corporation. All rights reserved.
//

function ModelConfigKtn(code, name) {
	this.modelName = name;
	this.modelCode = code;
	this.config	= {
		gafc:		true,
		solo:		true,
		contour:	true,
		eq2:		true,
		toneshape:	true,
		solodelay:	true,
		powerctrl:  false,
		bloom: 		false 
	};
	ProductSetting.modelNameForAlb = this.modelName;
}

ModelConfigKtn.prototype = {
	code: 		function()	{ return this.modelCode;	},
	name: 		function()	{ return this.modelName;	},
	numOfBank:	function()	{ return 3;	},
	numOfCh: function(bank)	{ return this.numOfFixedCh(bank);	},
	numOfFixedCh: function(bank)	{
		if (bank < 0)					return 0;	// bank 0 means 'PANEL'
		if (bank === 0)					return 1;
		if (bank < this.numOfBank())	return 4;
		return 0;
	},
	bankName: function(bank) {
		if (bank === 0)					return 'PANEL';
		if (bank < this.numOfBank())	return String.fromCharCode('A'.charCodeAt() + bank - 1);
		return '';
	},
	getBankCh: function(index) {
		var ofs = 0;
		for (var bank = 0, len = this.numOfBank(); bank < len; bank++) {
			var top = ofs;
			ofs += this.numOfFixedCh(bank);
			if (index < ofs) {
				var ch = index - top;
				return {
					bank:	bank,
					ch:		(ch < this.numOfCh(bank))? ch : -1
				};
			}
		}
		return null;
	},
	getIndex: function(bank, ch) {
		if (bank >= this.numOfBank())	return -1;
		if (ch >= this.numOfCh(bank))	return -1;
		for (var n = 0; n < bank; n++) {
			ch += this.numOfFixedCh(bank);
		}
		return ch;
	},
	patchExist: function(index) {
		var bankCh = this.getBankCh(index);
		if (bankCh) {
			if (bankCh.ch >= 0)	return true;
		}
		return false;
	},
	transferablePatch: function(index) {
		var bankCh = this.getBankCh(index);
		if (bankCh) {
			return (this.bankName(bankCh.bank) !== "PANEL");
		}
		return true;
	},
	importBtnIconImgUrl: function(disable) {
		if (disable)	return 'url(images/ktn/import_KTN50_PC_disabled@2x.png)';
		return 'url(images/ktn/import_KTN50_PC@2x.png)';
	},
	exportBtnIconImgUrl: function(disable) {
		if (disable)	return 'url(images/ktn/export_KTN50_PC_disabled@2x.png)';
		return 'url(images/ktn/export_KTN50_PC@2x.png)';
	},
}

function ModelConfigKtnMk2(code) {
	ModelConfigKtn.call(this, code, 'KATANA');
	this.config.solodelay	= false;
	this.config.bloom 		= false;

}
ModelConfigKtnMk2.prototype = Object.create(ModelConfigKtn.prototype);

function ModelConfigKtn50Gen3(code) {
	ModelConfigKtn.call(this, code, 'KATANA-50');
	this.config.gafc		= false;
	this.config.solodelay	= false;
	this.config.bloom 		= false;
}
ModelConfigKtn50Gen3.prototype = Object.create(ModelConfigKtn.prototype);
ModelConfigKtn50Gen3.prototype.numOfCh = function(bank) {
	if (bank < 0)					return 0;
	if (bank === 0)					return 1;
	if (bank < this.numOfBank())	return 2;
	return 0;
};
ModelConfigKtn50Gen3.prototype.importBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/import_KTN50_PC_disabled@2x.png)';
	return 'url(images/ktn/import_KTN50_PC@2x.png)';
};
ModelConfigKtn50Gen3.prototype.exportBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/export_KTN50_PC_disabled@2x.png)';
	return 'url(images/ktn/export_KTN50_PC@2x.png)';
};

function ModelConfigKtn100Gen3(code) {
	ModelConfigKtn.call(this, code, 'KATANA-100');
	this.config.solodelay	= false;
	this.config.bloom 		= false;
}
ModelConfigKtn100Gen3.prototype = Object.create(ModelConfigKtn.prototype);
ModelConfigKtn100Gen3.prototype.importBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/import_KTN100_PC_disabled@2x.png)';
	return 'url(images/ktn/import_KTN100_PC@2x.png)';
};
ModelConfigKtn100Gen3.prototype.exportBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/export_KTN100_PC_disabled@2x.png)';
	return 'url(images/ktn/export_KTN100_PC@2x.png)';
};

function ModelConfigKtn212Gen3(code) {
	ModelConfigKtn.call(this, code, 'KATANA-100/212');
	this.config.solodelay	= false;
	this.config.bloom 		= false;
}
ModelConfigKtn212Gen3.prototype = Object.create(ModelConfigKtn.prototype);
ModelConfigKtn212Gen3.prototype.importBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/import_KTN212_PC_disabled@2x.png)';
	return 'url(images/ktn/import_KTN212_PC@2x.png)';
};
ModelConfigKtn212Gen3.prototype.exportBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/export_KTN212_PC_disabled@2x.png)';
	return 'url(images/ktn/export_KTN212_PC@2x.png)';
};

function ModelConfigKtnHeadGen3(code) {
	ModelConfigKtn.call(this, code, 'KATANA-HEAD');
	this.config.solodelay	= false;
	this.config.bloom 		= true;
}
ModelConfigKtnHeadGen3.prototype = Object.create(ModelConfigKtn.prototype);
ModelConfigKtnHeadGen3.prototype.importBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/import_KTNHD_PC_disabled@2x.png)';
	return 'url(images/ktn/import_KTNHD_PC@2x.png)';
};
ModelConfigKtnHeadGen3.prototype.exportBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/export_KTNHD_PC_disabled@2x.png)';
	return 'url(images/ktn/export_KTNHD_PC@2x.png)';
};

function ModelConfigKtnArtGen3(code) {
	ModelConfigKtn.call(this, code, 'KATANA Artist');
	this.config.solodelay	= true;
	this.config.powerctrl	= true;
	this.config.bloom 		= true;
}
ModelConfigKtnArtGen3.prototype = Object.create(ModelConfigKtn.prototype);
ModelConfigKtnArtGen3.prototype.importBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/import_KTNART_PC_disabled@2x.png)';
	return 'url(images/ktn/import_KTNART_PC@2x.png)';
};
ModelConfigKtnArtGen3.prototype.exportBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/export_KTNART_PC_disabled@2x.png)';
	return 'url(images/ktn/export_KTNART_PC@2x.png)';
};


function ModelConfigKtn50Gen3Ex(code) {
	ModelConfigKtn.call(this, code, 'KATANA-50 EX');
	this.config.solodelay	= false;
	this.config.bloom 		= false;
}
ModelConfigKtn50Gen3Ex.prototype = Object.create(ModelConfigKtn.prototype);
ModelConfigKtn50Gen3Ex.prototype.importBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/import_KTN50_PC_disabled@2x.png)';
	return 'url(images/ktn/import_KTN50_PC@2x.png)';
};
ModelConfigKtn50Gen3Ex.prototype.exportBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/export_KTN50_PC_disabled@2x.png)';
	return 'url(images/ktn/export_KTN50_PC@2x.png)';
};




function ModelConfigKtnArtGen3Head(code) {
	ModelConfigKtn.call(this, code, 'KATANA Artist HEAD');
	this.config.solodelay	= true;
	this.config.powerctrl	= true;
	this.config.bloom 		= true;
}
ModelConfigKtnArtGen3Head.prototype = Object.create(ModelConfigKtn.prototype);
ModelConfigKtnArtGen3Head.prototype.importBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/import_KTNARTHD_PC_disabled@2x.png)';
	return 'url(images/ktn/import_KTNARTHD_PC@2x.png)';
};
ModelConfigKtnArtGen3Head.prototype.exportBtnIconImgUrl = function(disable) {
	if (disable)	return 'url(images/ktn/export_KTNARTHD_PC_disabled@2x.png)';
	return 'url(images/ktn/export_KTNARTHD_PC@2x.png)';
};


(function() {

	var _config = new ModelConfigKtnMk2();

	function getModelConfig(code) {
		switch (code) {
		case '05':	return new ModelConfigKtn50Gen3(code);
		case '06':	return new ModelConfigKtn100Gen3(code);
		case '07':	return new ModelConfigKtn212Gen3(code);
		case '08':	return new ModelConfigKtnHeadGen3(code);
		case '09':	return new ModelConfigKtnArtGen3(code);
		case '0A':	return new ModelConfigKtn50Gen3Ex(code);
		case '0B':	return new ModelConfigKtnArtGen3Head(code);

		}
		return null;
	}

	var _obj = {
		config: function()	{ return _config	},
		setModel: function(code) {
			var info = getModelConfig(code);
			if (info === null)	return false;
			_config = info;
			if (window.modelDOMController)	window.modelDOMController.update();
			return true;
		}
	};

	window.modelInfo = _obj;

})();