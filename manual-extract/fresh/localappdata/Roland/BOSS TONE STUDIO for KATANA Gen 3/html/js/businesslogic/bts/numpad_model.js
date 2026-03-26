/**
 * [概要]
 * Numpad種別のクラス定義
 *
 * [使用箇所]
 * numpad.jsでコンストラクタを呼び出す場所
 */

/**
 * 通常タイプ
 */


var NumpadStandard = function(_$) {
  this.target = _$;
  this.dialId = _$.attr('id');
  var coef = _$.attr('value-coef');
  this.vcoef = (coef !== undefined)? coef : 1;
  this.max = parseInt(_$.attr('max'));
  this.min = parseInt(_$.attr('min'));
  this.hasDecimalValue = 0;
  if (this.vcoef < 1) {
    var a = this.vcoef.toString().split('.').pop();
    this.hasDecimalValue = a.length;
  }
  var value = this.convertNumpadVal(_$.val());
  this.displayVal = this.convert2NumpadVal(value);
  this.updateDisplay(this.displayVal);
  this.hasPushed = false;

  var label = _$.attr('description');
  if (label !== undefined) {
    var desc = $('#' + label + ' p').text();
    $('#numpad_description').find('p').text(desc);
  }
};

NumpadStandard.prototype = {
  MAX_INPUT_LENGTH: 5,  // 入力可能上限
  NUMPAD_WIDTH: 226,    // PC版のnumpadのwidth
  NUMPAD_HEIGHT: 280,   // PC版のnumpadのheight

  /** Numpadの移動量 */
  LEFT:  162,
  RIGHT:  72,
  UP:    154,
  DOWN:   90,
};

// 開く
// (PC版のみ開く際に適切な位置に移動)
NumpadStandard.prototype.open = function() {
  popup_open('Numpad', 'bts-numpad-popup-wrapper');
  var leftAndTop = this.calcPosition();
  $('#Numpad').css({
    'top': leftAndTop[1] + 'px',
    'left': leftAndTop[0] + 'px'
  });
  $('.bts-numpad-popup-wrapper').on('click', function() {
    closeNumpad();
  });
};
/**
 * Numpadを開く位置を算出
 * @returns {*[]} [left, top]
 */
NumpadStandard.prototype.calcPosition = function() {
  if (this.target.offset().left + this.RIGHT + this.NUMPAD_WIDTH <= $(window).width() &&
    this.target.offset().top - this.UP >= 0
    ) {
    return [this.target.offset().left + this.RIGHT, this.target.offset().top - this.UP];
  } else if (this.target.offset().left - 8 - this.NUMPAD_WIDTH >= 0 &&
    this.target.offset().top - this.UP >= 0
    ) {
    return [this.target.offset().left - 8 - this.NUMPAD_WIDTH, this.target.offset().top - this.UP];
  } else if (this.target.offset().left + this.NUMPAD_WIDTH <= $(window).width() &&
    this.target.offset().top + this.DOWN + this.NUMPAD_HEIGHT <= $(window).height()
    ) {
    return [this.target.offset().left, this.target.offset().top + this.DOWN];
  } else if (this.target.offset().left - this.LEFT >= 0 &&
    this.target.offset().top + this.DOWN + this.NUMPAD_HEIGHT <= $(window).height()
    ) {
    return [this.target.offset().left - this.LEFT, this.target.offset().top + this.DOWN];
  }
};
// 閉じる
NumpadStandard.prototype.close = function() {
  popup_close('Numpad');
  $('#Numpad').removeClass('bts-numpad-slideup-style');
};
// ダイアル値->電卓表示値への変換
NumpadStandard.prototype.convert2NumpadVal = function(v) {
  v *= this.vcoef;
  v = v.toString();
  if (this.hasDecimalValue !== 0) {
    if (v.indexOf('.') < 0) v += '.0';
    var d = v.split('.');
    if (this.hasDecimalValue !== d[1].length) {
      var o = d[1].slice(0, this.hasDecimalValue);
      for (var i = 0; i < this.hasDecimalValue; i++) {
        if (o.charAt(i) === '') {
          o += '0';
        }
      }
      d[1] = o;
      v = d.join('.');
    }
  }
  return v;
};
NumpadStandard.prototype.convertNumpadVal = function(v) {
  return v + '';
};
// 電卓表示値->ダイアル値への変換
NumpadStandard.prototype.convert2DialVal = function(v) {
  return (v === '' || v === '-') ? 0 : Math.round(v / this.vcoef);
};
// 押されたボタンに応じた追加処理
NumpadStandard.prototype.append = function(char) {
  var calcVal = this.convert2CalcVal(char);
  if (!this.canAppend(char, calcVal)) {
    return;
  }
  switch (char) {
    case '+-': {
      if (calcVal.indexOf('-') === 0) {
        this.updateDisplay(calcVal.slice(1));
      } else if (calcVal === '0') {
        this.updateDisplay('-');
      } else {
        this.updateDisplay('-' + calcVal);
      }
      break;
    }
    case '.': {
      var val = calcVal;
      if (calcVal === '-') {
        val = '-0';
      }
      this.updateDisplay(val + char);
      break;
    }
    default: {
      var val = calcVal;
      if (calcVal === '0') {
        val = '';
      }
      else if (calcVal === '-0') {
        val = '-';
      }
      this.updateDisplay(val + char);
      break;
    }
  }
  this.hasPushed = true;
};
// 全消去
NumpadStandard.prototype.reset = function() {
  this.displayVal = '';
  this.updateDisplay('0');
  this.hasPushed = true;
};
// calc()呼び出し前の変換
NumpadStandard.prototype.convert2CalcVal = function(char) {
  return (!this.hasPushed && char !== '+-') ? '' : this.displayVal;
};
// 追加可能か
NumpadStandard.prototype.canAppend = function(char, calcVal) {
  switch (char) {
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9': {
      if (calcVal.charAt(calcVal.length - 2) === '.') {
        return false;
      }
      //if (calcVal.length === 1 && calcVal.charAt(0) === '0') {
      //  return false;
      //}
      return this.getNumberOfDigits(calcVal) < this.MAX_INPUT_LENGTH;
    }
    case '0': {
      if (calcVal.charAt(calcVal.length - 2) === '.') {
        return false;
      }
      return calcVal.length === 0 ||
      (/^[.1-9]$/.test(calcVal.slice(-1)) && this.getNumberOfDigits(calcVal) < this.MAX_INPUT_LENGTH)||
      (/^[0]$/.test(calcVal.slice(-1)) && !/^[0]+$/.test(calcVal) && this.getNumberOfDigits(calcVal) < this.MAX_INPUT_LENGTH);
    }
    case '.': {
      if (this.hasDecimalValue === 0) return false;
      if (calcVal.indexOf('.') !== -1) return false;
      if (/^[\d]$/.test(calcVal.slice(-1)) === false) return false;
      return (this.getNumberOfDigits(calcVal) < this.MAX_INPUT_LENGTH - 1);
    }
    case '+-': {
      return (this.min < 0);
    }
  }
};
// 現在の桁数を返す
NumpadStandard.prototype.getNumberOfDigits = function(calcVal) {
  return calcVal.replace('.', '').replace('-', '').length;
};
// +10, +1, -1, -10系のボタンを押されたときの処理
NumpadStandard.prototype.calc = function(num) {
  var v = this.convert2DialVal(this.displayVal);
  //v = this.roundDialVal(v);
  v = this.roundDialVal(v + num);
  this.updateDial(v);
  this.updateDisplay(this.convert2NumpadVal(v));
  this.hasPushed = true;
};
// max, minに従って値を丸める
NumpadStandard.prototype.roundDialVal = function(v) {
  v = Math.floor(v);
  return (v > this.max) ? this.max : (v < this.min ? this.min : v);
};
// numpadを閉じる前の更新処理
NumpadStandard.prototype.updateDialBeforeClose = function() {
  var dialVal = this.convert2DialVal(this.displayVal);
  var roundedDialVal = this.roundDialVal(dialVal);
  this.updateDial(roundedDialVal);
};
// 全消去
NumpadStandard.prototype.clear = function() {
  this.updateDisplay('0');
  this.hasPushed = true;
};
// 一文字消去
NumpadStandard.prototype.backSpace = function() {
  var str = this.canBack() ? this.displayVal : '';
  str = str.slice(0, -1);
  if (str === '') {
    str = '0';
  }
  this.updateDisplay(str);
  this.hasPushed = true;
};
// 一文字消去が可能か(通常タイプでは常に真)
NumpadStandard.prototype.canBack = function() {
  return true;
};
// Numpadの表示を更新
NumpadStandard.prototype.updateDisplay = function(v) {
  this.displayVal = v;
  $('#numpad_value').find('p').text(v);
};
// ダイアルの表示を変更し、実機を更新
NumpadStandard.prototype.updateDial = function(v) {
  this.target.trigger('elf-update', v);
  this.target.trigger('elf-change', v);
};

/**
 * 小数点入力可能タイプ
 * (Basicを継承)
 */
var NumpadDecimal = function(_$) {
  NumpadStandard.call(this, _$);
};

NumpadDecimal.prototype = Object.create(NumpadStandard.prototype);
NumpadDecimal.prototype.convert2NumpadVal = function(v) {
  v = v * 1;
  return Math.floor(parseFloat(v) / 10) + '.' + (v) % 10;
};
NumpadDecimal.prototype.convert2DialVal = function(v) {
  return (v === '' || v === '-') ? 0 : (Math.floor(parseFloat(v) * 10));
};

/**
 * 倍表示タイプ
 * (Basicを継承)
 */
var NumpadDouble = function(_$) {
  NumpadStandard.call(this, _$);
};

NumpadDouble.prototype = Object.create(NumpadStandard.prototype);
NumpadDouble.prototype.convert2NumpadVal = function(v) {
  return v * 2;
};
NumpadDouble.prototype.convert2DialVal = function(v) {
  return (v === '' || v === '-') ? 0 : (v / 2);
};
NumpadDouble.prototype.roundDialVal = function(v) {
  v = Math.floor(v);
  return (v > this.max) ? this.max : (v < this.min ? this.min : v);
};

/**
 * 文字が表示されるタイプ
 * (Basicを継承)
 */
/*
 * textInfoArr = [
 *   { start: index, texts: []},
 *   ...
 * ]
 */
 var NumpadWithText = function(_$, textInfoArr) {
  this.textInfoArr = textInfoArr;
  NumpadStandard.call(this, _$);
};

NumpadWithText.prototype = Object.create(NumpadStandard.prototype);
NumpadWithText.prototype.convert2NumpadVal = function(v) {
  var result = this.textInfoArr.filter(function(textInfo) {
    return textInfo.start <= v && v < textInfo.start + textInfo.texts.length;
  }).map(function(textInfo) {
    return textInfo.texts[v - textInfo.start];
  });
  return result[0] !== undefined ? result[0] : parseInt(v) + '';
};
NumpadWithText.prototype.convert2DialVal = function(v) {
  var result = this.textInfoArr.map(function(textInfo) {
    var index = textInfo.texts.findIndex(function(value) {
      return value === v;
    });
    return index !== -1 ? textInfo.start + index : null;
  }).filter(function(text) {
    return text !== null;
  });
  if (result[0] !== undefined) {
    return result[0];
  } else {
    return (v === '' || v === '-') ? 0 : parseInt(v);
  }
};
NumpadWithText.prototype.reset = function() {
  this.displayVal = '';
  this.updateDisplay('');
  this.hasPushed = true;
};
NumpadWithText.prototype.backSpace = function() {
  var str = this.canBack() ? this.displayVal : '';
  str = str.slice(0, -1);
  this.updateDisplay(str);
  this.hasPushed = true;
};
NumpadWithText.prototype.canBack = function() {
  var self = this;
  return !this.textInfoArr.some(function(textInfo) {
    return textInfo.texts.some(function(text) {
      return text === self.displayVal;
    });
  });
};
NumpadWithText.prototype.convert2CalcVal = function(char) {
  var self = this;
  return this.textInfoArr.some(function(textInfo) {
    return textInfo.texts.some(function(text) {
      return text === self.displayVal;
    });
  }) ? '' : NumpadStandard.prototype.convert2CalcVal.call(this, char);
};
NumpadWithText.prototype.updateDialBeforeClose = function() {
  var self = this;
  var dialVal = this.convert2DialVal(this.displayVal);
  var hasTextShown = this.textInfoArr.some(function(textInfo) {
    return textInfo.texts.some(function(text) {
      return text === self.displayVal;
    });
  });
  if (hasTextShown) {
    return dialVal;
  }
  var roundedDialVal = this.roundDialVal(dialVal);
  var result = this.textInfoArr.filter(function(textInfo) {
    return textInfo.start === self.min ||
    textInfo.start + textInfo.texts.length - 1 === self.max;
  }).filter(function(textInfo) {
    return textInfo.start <= roundedDialVal && roundedDialVal < textInfo.start + textInfo.texts.length;
  }).map(function(textInfo) {
    return textInfo.start === self.min ? textInfo.start + textInfo.texts.length : textInfo.start - 1;
  });
  this.updateDial(result[0] !== undefined ? result[0] : roundedDialVal);
};
NumpadWithText.prototype.calc = function(num) {
  var dialVal = this.convert2DialVal(this.displayVal);
  var roundedDialVal = this.roundDialVal(dialVal);
  var addedDialVal = roundedDialVal + num;
  var roundedAddedDialVal = this.roundDialVal(addedDialVal);
  this.updateDial(roundedAddedDialVal);

  this.updateDisplay(this.convert2NumpadVal(roundedAddedDialVal));
  this.hasPushed = true;
};