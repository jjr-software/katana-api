/**
 * [概要]
 * Numpadのエントリポイントとイベント登録
 *
 * [使用箇所]
 * e-builderのdblclick-handlerにnumpadと設定した場合に起動する
 * closeNumpad()は強制的に閉じる場合などで、他ファイルでも使用
 */

$(function() {
  // 1文字消去ボタンの長押しで全てを消去するまでのmsec
  var ALL_CLEAR_MS = 500;
  // 消去ボタンの長押しのためのタイマー
  var clearBtnTimer = null;
  // 現在起動中のnumpad(起動時以外はnullを設定する)
  var currentNumpad = null;
  // キーボード入力によるNumpad操作のための定数(PC特有)
  var KEY_BIND_MAP = {
    zero: 48,
    one: 49,
    two: 50,
    three: 51,
    four: 52,
    five: 53,
    six: 54,
    seven: 55,
    eight: 56,
    nine: 57,
    period: 190,
    hyphen: 189,
    backspace: 8,
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    delete: 46,
    enter: 13,
    numKey_0: 96,
    numKey_1: 97,
    numKey_2: 98,
    numKey_3: 99,
    numKey_4: 100,
    numKey_5: 101,
    numKey_6: 102,
    numKey_7: 103,
    numKey_8: 104,
    numKey_9: 105,
    numKey_minus: 109,
    numKey_period: 110
  }
  function closeNumpad(){
    if (currentNumpad !== null) {
      currentNumpad.close();
    }
    currentNumpad = null;
  }
  /**
   * Numpadを閉じる処理
   * 他ファイルで強制的に呼び出している場所あり
   * midi_connect_controller.js, midi_observe_controller.js
   */
  window.closeNumpad = function() {
    closeNumpad();
  };

  /**
   * ボタンのクリックイベント
   */
  $('#Numpad').on('click', function(e) {
    e.stopPropagation();
  });
  $('#numpad_0').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('0');
    }
  });
  $('#numpad_1').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('1');
    }
  });
  $('#numpad_2').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('2');
    }
  });
  $('#numpad_3').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('3');
    }
  });
  $('#numpad_4').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('4');
    }
  });
  $('#numpad_5').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('5');
    }
  });
  $('#numpad_6').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('6');
    }
  });
  $('#numpad_7').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('7');
    }
  });
  $('#numpad_8').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('8');
    }
  });
  $('#numpad_9').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('9');
    }
  });
  $('#numpad_dot').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('.');
    }
  });
  $('#numpad_plus_minus').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.append('+-');
    }
  });
  $('#numpad_add_1').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.calc(1);
    }
  });
  $('#numpad_sub_1').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.calc(-1);
    }
  });
  $('#numpad_add_10').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.calc(10);
    }
  });
  $('#numpad_sub_10').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.calc(-10);
    }
  });
  $('#numpad_del').on(pointer.down, function(e) {
    e.preventDefault();
    clearBtnTimer = setTimeout(function() {
      clearTimeout(clearBtnTimer);
      clearBtnTimer = null;
      if (currentNumpad !== null) {
        currentNumpad.reset();
      }
    }, ALL_CLEAR_MS);
  });
  $('#numpad_del').on(pointer.up, function(e) {
    e.preventDefault();
    if (clearBtnTimer !== null) {
      clearTimeout(clearBtnTimer);
      clearBtnTimer = null;
      if (currentNumpad !== null) {
        currentNumpad.backSpace();
      }
    }
  });
  $('#numpad_cancel').on(pointer.click, function(e) {
    e.preventDefault();
    closeNumpad();
  });
  $('#numpad_ok').on(pointer.click, function(e) {
    e.preventDefault();
    if (currentNumpad !== null) {
      currentNumpad.updateDialBeforeClose();
      closeNumpad();
    }
  });
  // キー入力のイベント(PC特有)
  document.onkeydown = function(e) {
    
    if (currentNumpad !== null) {
      if (e.keyCode === KEY_BIND_MAP.zero || e.keyCode === KEY_BIND_MAP.numKey_0) {
        currentNumpad.append('0');
      } else if (e.keyCode === KEY_BIND_MAP.one || e.keyCode === KEY_BIND_MAP.numKey_1) {
        currentNumpad.append('1');
      } else if (e.keyCode === KEY_BIND_MAP.two || e.keyCode === KEY_BIND_MAP.numKey_2) {
        currentNumpad.append('2');
      } else if (e.keyCode === KEY_BIND_MAP.three || e.keyCode === KEY_BIND_MAP.numKey_3) {
        currentNumpad.append('3');
      } else if (e.keyCode === KEY_BIND_MAP.four || e.keyCode === KEY_BIND_MAP.numKey_4) {
        currentNumpad.append('4');
      } else if (e.keyCode === KEY_BIND_MAP.five || e.keyCode === KEY_BIND_MAP.numKey_5) {
        currentNumpad.append('5');
      } else if (e.keyCode === KEY_BIND_MAP.six || e.keyCode === KEY_BIND_MAP.numKey_6) {
        currentNumpad.append('6');
      } else if (e.keyCode === KEY_BIND_MAP.seven || e.keyCode === KEY_BIND_MAP.numKey_7) {
        currentNumpad.append('7');
      } else if (e.keyCode === KEY_BIND_MAP.eight || e.keyCode === KEY_BIND_MAP.numKey_8) {
        currentNumpad.append('8');
      } else if (e.keyCode === KEY_BIND_MAP.nine || e.keyCode === KEY_BIND_MAP.numKey_9) {
        currentNumpad.append('9');
      } else if (e.keyCode === KEY_BIND_MAP.period || e.keyCode === KEY_BIND_MAP.numKey_period) {
        currentNumpad.append('.');
      } else if (e.keyCode === KEY_BIND_MAP.enter) {
        currentNumpad.updateDialBeforeClose();
        closeNumpad();
      } else if (e.keyCode === KEY_BIND_MAP.backspace) {
        currentNumpad.backSpace();
      } else if (e.keyCode === KEY_BIND_MAP.delete) {
        currentNumpad.reset();
      } else if (e.keyCode === KEY_BIND_MAP.hyphen || e.keyCode === KEY_BIND_MAP.numKey_minus) {
        currentNumpad.append('+-');
      } else if (e.keyCode === KEY_BIND_MAP.up) {
        currentNumpad.calc(1);
      } else if (e.keyCode === KEY_BIND_MAP.down) {
        currentNumpad.calc(-1);
      }
      return false;
    }
  };

  /**
   * エントリポイント
   */
  window.numpad = function(e, _$) {
    currentNumpad = new NumpadStandard(_$);
    currentNumpad.open();
  };
  window.numpadWithOff = function(e, _$) {
    currentNumpad = new NumpadWithText(_$, [
      {start: -1, texts: ['OFF']}
    ]);
    currentNumpad.open();
  };

  window['disable-tap-step'] = true;
});
