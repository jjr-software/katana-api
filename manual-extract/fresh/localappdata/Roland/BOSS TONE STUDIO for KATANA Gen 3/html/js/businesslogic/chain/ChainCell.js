var ChainCell = function (blockModelMap, id) {
	this.blockModelMap = blockModelMap;
	this.id = id;
	this.x = 0;
	this.y = 0;
	this.tinyLineOffset = 0;
};

// constants
ChainCell.prototype.TINY_RATIO = 4;
ChainCell.prototype.TINY_ID_PREFIX = 'tiny-';
ChainCell.prototype.IMAGE_DIR_PATH = './images/chain/';
ChainCell.prototype.IMAGE_SUFFIX = '@2x.png';
ChainCell.prototype.OFF_IMAGE_SUFFIX = '_off' + ChainCell.prototype.IMAGE_SUFFIX;
ChainCell.prototype.HORIZONTAL_LINE = 'line1';

// methods
ChainCell.prototype.getImage = function () {
	return null;
};
ChainCell.prototype.getTinyImage = function () {
	return null;
};
ChainCell.prototype.isEffector = function () {
	return null;
};
ChainCell.prototype.getClassName = function () {
	return '';
};
ChainCell.prototype.getTinyClassName = function () {
	return '';
};
ChainCell.prototype.createDOM = function () {
	// if(this.isEffector()) {
	// 	this.updateEffectType();
	// }
	var dom = $('<div>')
		.attr('id', this.id)
		.addClass(this.getClassName())
		.css({
			'left': this.x + 'px',
			'top': this.y + 'px'
		});

	var image = this.getImage();
	let typeEffect = listTypeEffect.find(item => item.id === this.id);
	let defaultImg = typeEffect ? typeEffect.defaultImg : null;
	if(this.isEffector()) {
		if(this.typeName && image == defaultImg) {
			dom.append('<p class="chainTypeName">' + this.typeName + '</p>');
		}
		dom.append('<div class="bgrMain"></div><div class="bgrBlock"></div><div class="bgrOverlay"></div>');
		if(this.canMove) {
			dom.append('<div class="bgrSelected"></div>');
		}
		
		dom.find('.bgrMain').css({'background-image': 'url("' + image + '")', 'background-color': this.brgColor ? this.brgColor : CHAIN_BASE_BG_COLOR });
		if(this.canMove) {
			dom.find('.bgrSelected').css('background-image', 'url(./images/chain/effectblock_default_selected@2x.png)');
		}
	} else {
		dom.css('background-image', 'url(' + image + ')');
	}

	if(this.mainWidth) {
		dom.css('width', (this.mainWidth) + 'px');
	}
	
	return dom;
};
ChainCell.prototype.updateStateBlock = function () {
	let typeEffect = listTypeEffect.find(item => item.id === this.id);
	let defaultImg = typeEffect ? typeEffect.defaultImg : null;
	if(this.isEffector()) {
		this.updateEffectType();
		var image = this.getImage();
		$('#' + this.id).find('.bgrMain').css({'background-image': 'url(' + image + ')', 'background-color': this.brgColor ? this.brgColor : CHAIN_BASE_BG_COLOR });

		if(this.typeName && image == defaultImg) {
			$('#' + this.id).find('.chainTypeName').text(this.typeName);
		}

		if(this.isHovered) {
			$('#' + this.id).addClass("isHovered");
		} else {
			$('#' + this.id).removeClass("isHovered");
		}

		if(this.isSelected) {
			$('#' + this.id).addClass("isSelected");
		} else {
			$('#' + this.id).removeClass("isSelected");
		}

		if(this.isTurnedOn) {
			$(`#${this.id} , #${this.id+'-blockName'}`).removeClass("isTurnOff");
		} else {
			$(`#${this.id} , #${this.id+'-blockName'}`).addClass("isTurnOff");
		}
	
		if(this.canMove) {
			$('#' + this.id).find('.bgrSelected').css('background-image', 'url(./images/chain/effectblock_default_selected@2x.png)');
		} else {
			$('#' + this.id).find('.bgrSelected').css('background-image', 'none)');
		}
	}
};

ChainCell.prototype.createDOMBlockName = function() {
	let blockNameDom = null;
	if(CHAIN_BLOCK_NAME[this.id]) {
		blockNameDom = $('<div>').attr('id', this.id + "-blockName").text(CHAIN_BLOCK_NAME[this.id])
		.addClass("blockName")
		.css({
			'position': 'absolute',
			'top': (this.y + 130) + 'px',
			'left': this.x + 'px',
		});

		if(this.mainWidth) {
			blockNameDom.css('width', this.mainWidth + 'px');
		}
	}

	return blockNameDom;
}

ChainCell.prototype.createTinyDOM = function () {
	var dom = $('<div>')
		.attr('id', this.TINY_ID_PREFIX + this.id)
		.addClass(this.getTinyClassName())
		.css({
			'left': this.x / this.TINY_RATIO + 'px',
			'top': this.y / this.TINY_RATIO + this.tinyLineOffset + 'px'
		});
	var tinyImage = this.getTinyImage();
	if (tinyImage !== null) {
		dom.css('background-image', 'url(' + tinyImage + ')');
	}
	return dom;
};
ChainCell.prototype.reDrawTinyImage = function () {
	$('#' + this.TINY_ID_PREFIX + this.id).css('background-image', 'url(' + this.getTinyImage() + ')');
};
