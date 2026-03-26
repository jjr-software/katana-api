/**
 * [概要]
 * Effectorに関連する処理を定義
 *
 * [使用箇所]
 * initializeEffect, assignEffectEvents.jsから呼び出す
 * その他下記参照
 */

/* To prevent error on ESLint */
/* global _items, effectDOMController, Parameter, MIDIController, pointer, midiConnectionController */

(function() {
  var panelActionBtnInfo = {
    'panel-booster-btn':        { addr: 0x7F010101, trigger: 'booster-select-watcher',  min: 0, max: 2, ofs: -1, effect: true },
    'panel-mod-btn':            { addr: 0x7F010102, trigger: 'mod-select-watcher',      min: 0, max: 2, ofs: -1, effect: true },
    'panel-fx-btn':             { addr: 0x7F010103, trigger: 'fx-select-watcher',       min: 0, max: 2, ofs: -1, effect: true },
    'panel-delay-btn':          { addr: 0x7F010104, trigger: 'delay-select-watcher',    min: 0, max: 2, ofs: -1, effect: true },
    'panel-reverb-btn':         { addr: 0x7F010105, trigger: 'reverb-select-watcher',   min: 0, max: 2, ofs: -1, effect: true },
    'delay-tap-btn':            { addr: 0x7F010106 },
    'delay2-tap-btn':           { addr: 0x7F010107 },
    'solo-tap-btn':             { addr: 0x7F010108 },
  };

  const PANEL_KNOB_WATCHER = ['booster', 'mod', 'fx', 'delay', 'reverb', 'solo-delay']

  var panelEffectsSelClassInfo = [
    'ktn-bg-led-grn',
    'ktn-bg-led-red',
    'ktn-bg-led-ylw',
    'ktn-bg-led-off',
  ];
  var panelEffectsSelInfo = {
    'booster-select-watcher': [
      'booster-select-grn-btn',
      'booster-select-red-btn',
      'booster-select-ylw-btn'
    ],
    'mod-select-watcher': [
      'mod-select-grn-btn',
      'mod-select-red-btn',
      'mod-select-ylw-btn'
    ],
    'fx-select-watcher': [
      'fx-select-grn-btn',
      'fx-select-red-btn',
      'fx-select-ylw-btn'
    ],
    'delay-select-watcher': [
      'delay-select-grn-btn',
      'delay-select-red-btn',
      'delay-select-ylw-btn'
    ],
    'reverb-select-watcher': [
      'reverb-select-grn-btn',
      'reverb-select-red-btn',
      'reverb-select-ylw-btn'
    ],
  };

  var panelEffectsSwitcher = {
    'mod-select-watcher': { switcher: '#modfx-type-switcher-parameter, #modfx-content-switcher-parameter', tabIndex: 1, isPlus: false},
    'fx-select-watcher': { switcher: '#modfx-type-switcher-parameter, #modfx-content-switcher-parameter', tabIndex: 2, isPlus: true },
    'delay-select-watcher': { switcher: '#delay-type-switcher-parameter, #delay-content-switcher-parameter', tabIndex: 3, isPlus: false, isDelay: true, isTabSwitcher: "#delay-tap-content-switcher" },
    'reverb-select-watcher': { switcher: '#delay-type-switcher-parameter, #delay-content-switcher-parameter', tabIndex: 4, isPlus: true, isDelay: true, isTabSwitcher: "#delay2-tap-content-switcher" }
  };

  var panelAmpTypeInfo = [
    { indicator: 'amp-type-acoustic-indicator', label: 'amp-type-acoustic-label'  },
    { indicator: 'amp-type-clean-indicator',    label: 'amp-type-clean-label'     },
    { indicator: 'amp-type-pushed-indicator',   label: 'amp-type-pushed-label'   },
    { indicator: 'amp-type-crunch-indicator',   label: 'amp-type-crunch-label'    },
    { indicator: 'amp-type-lead-indicator',     label: 'amp-type-lead-label'      },
    { indicator: 'amp-type-brown-indicator',    label: 'amp-type-brown-label'     },
  ];
  var panelContourTypeInfo = [
    'panel-contour-off-label',
    'panel-contour-1-label',
    'panel-contour-2-label',
    'panel-contour-3-label',
  ];
  var toneShapeSelInfo = [
    'toneshape-grn-btn',
    'toneshape-red-btn',
    'toneshape-ylw-btn'
  ];

  const panelActionOffEffectBtn = {
    'booster-sw-btn':         { btn:  'panel-booster-btn-off'                 },
    'modfx-mod-sw-btn':       { btn:  'panel-mod-btn-off'                     },
    'modfx-fx-sw-btn':        { btn:  'panel-fx-btn-off'                      },
    'delay-delay1-sw-btn':    { btn:  'panel-delay-btn-off'                   },
    'delay-delay2-sw-btn':    { btn:  'panel-reverb-btn-off',   effect: true  },
    'reverb-sw-btn':          { btn:  'panel-reverb-btn-off',   effect: true  },
  }

  const reverbSelectMode = [
    'reverb-layer-mode-grn-select-box',
    'reverb-layer-mode-red-select-box',
    'reverb-layer-mode-ylw-select-box',
  ]

  const positionSlider = {
    'slider-1': {icon: 'image-mic-distance',    position: 'line-custom-m1-mic-position-slider', distance: 'line-custom-m1-mic-distance-slider'  },
    'slider-2': {icon: 'image-m2-mic-distance', position: 'line-custom-m2-mic-position-slider', distance: 'line-custom-m2-mic-distance-slider'  },
  }

  var keyLabelString = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  var curEditorLowerPage = -1;

  const effectTabVal = {
    1: "CHAIN",
    2: "PEDAL FX",
    3: "BOOSTER",
    4: "FX",    // i.e. "MOD",
    5: "FX",
    6: "DELAY",
    7: "DELAY", // i.e. "DELAY2",
    8: "REVERB",
    9: "EQ",
    10: "NS",
    11: "SEND/RETURN",
    13: "EQ",   // i.e. "EQ2"
    14: "SOLO",
    15: "CONTOUR",
  }

  /**
   * DOM操作に関係する関数を定義
   * [使用箇所]
   * chain_controller.jsファイルから呼び出し
   */
  window.effectDOMController = {
    naviBtnIDs: [
      'editor-navi-btn-1',
      'editor-navi-btn-2',
      'editor-navi-btn-3'
    ],
    updateEditorLowerPage: function(v, id) {
      var editNaviBtnIDs = this.naviBtnIDs;
      function searchTargetPos(v) {
        var count = 0;
        for (var i = 0, l = editNaviBtnIDs.length; i < l; i++) {
          var item = _items[editNaviBtnIDs[i]];
          var o = -1;
          if (item.order) {
            o = item.order.indexOf(v);
          }
          else {
            var subs = $('#' + editNaviBtnIDs[i]).children('input');
            if (v < count + subs.length) {
              o = v - count;
            }
            count += subs.length;
          }
          if (o >= 0) {
            $('#' + editNaviBtnIDs[i]).children('input:eq(' + o + ')').prop('checked', true);
            break;
          }
        }
      }
      if (v === undefined) v = curEditorLowerPage;
      editNaviBtnIDs.forEach(function (_id) {
        if (_id !== id) {
          $('#' + _id).children('input').prop('checked', false);
        }
      });
      if (id === undefined) {
        searchTargetPos(v);
      }
      switch (v) {
        case 4: // MOD
          $('#modfx-header-switcher, #modfx-type-switcher').trigger('elf-change', v - 4);
          let modWatcherItem = _items['mod-select-watcher'];
          let modWatcherValue = Parameter.value(modWatcherItem.pid, modWatcherItem.size, modWatcherItem.vofs);
          $('#modfx-type-switcher-parameter, #modfx-content-switcher-parameter').trigger('elf-change', modWatcherValue);
          break;
        case 5: // FX
          $('#modfx-header-switcher, #modfx-type-switcher').trigger('elf-change', v - 4);
          let fxWatcherItem = _items['fx-select-watcher'];
          let fxWatcherValue = Parameter.value(fxWatcherItem.pid, fxWatcherItem.size, fxWatcherItem.vofs);
          $('#modfx-type-switcher-parameter, #modfx-content-switcher-parameter').trigger('elf-change', fxWatcherValue + 3);
          break;
        case 6: // DELAY
          $('#delay-header-switcher, #delay-type-switcher').trigger('elf-change', v - 6);
          let dlyWatcherItem = _items['delay-select-watcher'];
          let dlyWatcherValue = Parameter.value(dlyWatcherItem.pid, dlyWatcherItem.size, dlyWatcherItem.vofs);
          $('#delay-type-switcher-parameter, #delay-content-switcher-parameter').trigger('elf-change', dlyWatcherValue);
          break;
        case 7: // DELAY2
          $('#delay-header-switcher, #delay-type-switcher').trigger('elf-change', v - 6);
          let rebWatcherItem = _items['reverb-select-watcher'];
          let rebWatcherValue = Parameter.value(rebWatcherItem.pid, rebWatcherItem.size, rebWatcherItem.vofs);
          $('#delay-type-switcher-parameter, #delay-content-switcher-parameter').trigger('elf-change', rebWatcherValue + 3);
          break;
      }
      $('#editor-navi-page-switcher').trigger('elf-change', v);
      if (v >= 0) {
        curEditorLowerPage = v;
      }

      //update chain
      if(effectTabVal[v]) {
        setTimeout(() => {
          btsTipsController.updateTipsChangeTab(effectTabVal[v]);
        }, 300);
      }
    },
    getCurEditorLowerPage: function() {
      return curEditorLowerPage;
    },
    // CHAIN on/off block
    turnOn: function (id, v) {
        let chainSwitch = CHAIN_ON_OFF_SWITCH.find(chainItem => chainItem.chainId == id).switch;
        $('#' + chainSwitch).trigger('elf-change', v ? 1 : 0);
        $('#' + chainSwitch).trigger('elf-update', v ? 1 : 0);
    },
  };

  /**
   * 初期表示
   * [使用箇所] index.jsで呼び出し
   */
  window.initializeEffect = function() {
    effectDOMController.updateEditorLowerPage(1); /* 初期表示はCHAINとする */
  };

  /**
   * イベントリスナーを登録
   * [使用箇所] index.jsで呼び出し
   */
  window.assignEffectEvents = function() {
    effectDOMController.naviBtnIDs.forEach(function(id) {
      $('#' + id).on('elf-changed', function(e, v) {
        var item = _items[$(this).attr('id')];
        if (item.order && (v < item.order.length)) { v = item.order[v]; }
        effectDOMController.updateEditorLowerPage(v, item.id);
      });
    });

    // Panel controllers
    $('#panel-amp-type-knob').on('elf-changed', function(e, v) {
      for (var i = 0, len = panelAmpTypeInfo.length; i < len; i++) {
        $('#' + panelAmpTypeInfo[i].indicator).attr('state','');
      }
      $('#' + panelAmpTypeInfo[v].indicator).attr('state','on');
    });
    adjustItemStatus('panel-amp-type-knob'); // 表示初期化

    // EFFECT COLOR BUTTON 
    for (var key in panelActionBtnInfo) {
      // Buttons
      $('#' + key).on(pointer.click, function(e) {
        e.preventDefault();
        e.stopPropagation();
        var id = $(this).attr('id');
        var info = panelActionBtnInfo[id];
        MIDIController.dt1(nibble(info.addr), '00');
        if (midiConnectionController.getCurrentMIDI() === null) {
          // for offline edit (demo) 
          if (info.trigger) {
            var item = _items[id];
            var v = Parameter.value(item.pid, item.size, item.vofs);
            if (v >= info.min) {
              if (++v > info.max) v = info.min;
              $('#' + info.trigger).trigger('elf-update', v);
              $('#' + info.trigger).trigger('elf-change', v);
            }
          }
        }
      });
      // Knobs/Spinners
      if (panelActionBtnInfo[key].effect) {
        $('#' + key.replace('btn', 'knob') + ', #' + key.replace('btn', 'spinner')).on('elf-changed', function(e, v) {
            var btn = $(this).attr('id').replace('knob', 'btn').replace('spinner', 'btn');
            var info = panelActionBtnInfo[btn];
            if (info) {
              if ((v >= 0) && info.trigger) $('#' + btn +'-off').hide();
              else                          $('#' + btn +'-off').show();
            }
        });
      }
    }
    for (var i = 0, len = panelAmpTypeInfo.length; i < len; i++) {
      $('#' + panelAmpTypeInfo[i].indicator).on(pointer.click, function(e) {
        var id = $(this).attr('id');
        for (var n = 0, num = panelAmpTypeInfo.length; n < num; n++) {
          if (panelAmpTypeInfo[n].indicator === id) {
            $('#panel-amp-type-knob').trigger('elf-update', n);
            $('#panel-amp-type-knob').trigger('elf-change', n);
            break;
          }
        }
      });
      $('#' + panelAmpTypeInfo[i].label).on(pointer.click, function(e) {
        var id = $(this).attr('id');
        for (var n = 0, num = panelAmpTypeInfo.length; n < num; n++) {
          if (panelAmpTypeInfo[n].label === id) {
            $('#panel-amp-type-knob').trigger('elf-update', n);
            $('#panel-amp-type-knob').trigger('elf-change', n);
            break;
          }
        }
      });
    }
    for (var i = 0, len = panelContourTypeInfo.length; i < len; i++) {
      $('#' + panelContourTypeInfo[i]).on(pointer.click, function(e) {
        var v = panelContourTypeInfo.indexOf($(this).attr('id'));
        if (v >= 0) {
          $('#panel-contour-knob').trigger('elf-update', v);
          $('#panel-contour-knob').trigger('elf-change', v);
          $('#contour-main-stringer').trigger('elf-update', v);
          $('#contour-main-dial').trigger('elf-update', v);
        }
      });
    }

    // Knob select button
    for (const key in panelEffectsSelInfo) {
      $('#' + key).on('elf-changed', function (e, v) {
        const btns = panelEffectsSelInfo[$(this).attr('id')];
        for (let i = 0, len = btns.length; i < len; i++) {
          if (v === i) {
            $('#' + btns[i]).addClass(panelEffectsSelClassInfo[i]);
          }
          else {
            $('#' + btns[i]).removeClass(panelEffectsSelClassInfo[i]);
          }
        }


        if (panelEffectsSwitcher[key]) {
          let tabNaviValue = $("#editor-navi-btn-2 input:checked").val();
          if (tabNaviValue == panelEffectsSwitcher[key].tabIndex) {
            if (panelEffectsSwitcher[key].isPlus) {
              $(panelEffectsSwitcher[key].switcher).trigger('elf-change', v + 3);
            } else {
              $(panelEffectsSwitcher[key].switcher).trigger('elf-change', v);
            }
          }
          if (panelEffectsSwitcher[key].isDelay) {
            $(panelEffectsSwitcher[key].isTabSwitcher).trigger('elf-change', v);
          }
        }
      });

      for (var i = 0, len = panelEffectsSelInfo[key].length; i < len; i++) {
        $('#' + panelEffectsSelInfo[key][i]).on('elf-changed', function (e, v) {
          for (var prop in panelEffectsSelInfo) {
            var n = panelEffectsSelInfo[prop].indexOf($(this).attr('id'));
            if (n >= 0) {
              $('#' + prop).trigger('elf-change', n);
              break;
            }
          }
        });
      }
      adjustItemStatus(key);  // 表示初期化
    }

    //EDITOR EFFECT BTN - COLOR
    for (let key in panelActionOffEffectBtn) {
      $('#' + key).on('elf-changed', function(e, v) {
        if (!panelActionOffEffectBtn[key].effect) {
          toggleButtonOff(panelActionOffEffectBtn[key].btn, v);
        } else {
          let watcher = _items['reverb-select-watcher'];
          let valWatcher = Parameter.value(watcher.pid, watcher.size, watcher.vofs);
          let select = _items[reverbSelectMode[valWatcher]];
          let valSelect = Parameter.value(select.pid, select.size, select.vofs);
          if (((valSelect == 0 || valSelect == 1) && key == 'delay-delay2-sw-btn') || key == 'reverb-sw-btn' && (valSelect == 2 || valSelect == 1)) {
            toggleButtonOff(panelActionOffEffectBtn[key].btn, v);
          }
        }
      })
    }

    for (let layerMode = 0; layerMode < 3; layerMode++) {
      $('#' + reverbSelectMode[layerMode]).on('elf-changed', function(e, v, update_only) {
        if (update_only) {
          let swReverb = _items['reverb-sw-btn'];
          let swDelay2 = _items['delay-delay2-sw-btn'];
          let swValReverb = Parameter.value(swReverb.pid, swReverb.size, swReverb.vofs);
          let swValDly = Parameter.value(swDelay2.pid, swDelay2.size, swDelay2.vofs);
          if (swValDly || swValReverb) {
            toggleButtonOff(panelActionOffEffectBtn['reverb-sw-btn'].btn, 1);
          } else {
            toggleButtonOff(panelActionOffEffectBtn['reverb-sw-btn'].btn, 0);
          }
        }
      });
    }

    for (const obj of PANEL_KNOB_WATCHER) {
      $(`#panel-${obj}-watcher`).on('elf-changed', function(e, v, update_only) {
        if (update_only && !window.isReadPatch0) {
          return;
        }
        $(`#panel-${obj}-knob`).trigger('elf-change', [v, true]);
        $(`#panel-${obj}-spinner`).trigger('elf-change', [v, true]);
      });
    }

    // CONTOUR
    $('#contour-main-dial').on('elf-changed', function(e, v) {
      if (v !== 0) {
        $('#contour-page-on-off-button-dummy').trigger('elf-change', 1);
        $('#contour-page-button-dummy').trigger('elf-change', v - 1);
      } else {
        $('#contour-page-on-off-button-dummy').trigger('elf-change', 0);
      }

    });
    $('#panel-amp-type-contour-btn').on('elf-changed', function(e, v) {
      $('#contour-main-dial').trigger('elf-change', [v, true]);
    })

    adjustItemStatus('contour-main-dial');

    // TONE SHAPE
    $('#panel-toneshape-btn').on('elf-changed', function(e, v) {
      $('#toneshape-switcher').trigger('elf-change', (v > 0)? (v-1):0);
      var item = _items['toneshape-sw-btn'];
      var vv = Parameter.value(item.pid, item.size, item.vofs);
      var sw = (v > 0)? 1:0;
      if (sw !== vv) {
        $('#' + item.id).trigger('elf-change', sw);
        $('#' + item.id).trigger('elf-update', sw);
      }
    });
    $('#toneshape-switcher').on('elf-changed', function(e, v) {
      for (var i = 0, len = toneShapeSelInfo.length; i < len; i++) {
        if (v === i) {
          $('#' + toneShapeSelInfo[i]).addClass(panelEffectsSelClassInfo[i]);
        }
        else {
          $('#' + toneShapeSelInfo[i]).removeClass(panelEffectsSelClassInfo[i]);
        }
      }
      var item = _items['toneshape-sw-btn'];
      var vv = (Parameter.value(item.pid, item.size, item.vofs) !== 0)? (v+1):0;
      $('#panel-toneshape-btn').trigger('elf-update', vv);
    });
    $('#toneshape-sw-btn').on('elf-changed', function(e, v) {
      if (v > 0) {
        var item = _items['toneshape-switcher'];
        v = Parameter.value(item.pid, item.size, item.vofs) + 1;
      }
      $('#panel-toneshape-btn').trigger('elf-update', v);
    });
    for (var i = 0, len = toneShapeSelInfo.length; i < len; i++) {
      $('#' + toneShapeSelInfo[i]).on('elf-changed', function(e, v) {
        var n = toneShapeSelInfo.indexOf($(this).attr('id'));
        $('#toneshape-switcher').trigger('elf-change', n);
        var item = _items['toneshape-sw-btn'];
        var vv = (Parameter.value(item.pid, item.size, item.vofs) !== 0)? (n+1):0;
        $('#panel-toneshape-btn').trigger('elf-update', vv);
      });
    }
    adjustItemStatus('toneshape-sw-btn');  // 表示初期化
    adjustItemStatus('toneshape-switcher');  // 表示初期化

    // GUITAR SIM
    $('#modfx-guitarsim-type-select-box').on('elf-changed elf-update', function(e, v) {
      disableDialStatus('modfx-guitarsim-body-dial', (v < 3));
    });
    adjustItemStatus('modfx-guitarsim-type-select-box');  // 表示初期化

    // PITCH SHIFTER
    $('#modfx-pshift-voice-select-box').on('elf-changed elf-update', function(e, v) {
      var disable = (v === 0);
      disableDialStatus('modfx-pshift-mode2-dial', disable);
      disableDialStatus('modfx-pshift-pitch2-dial', disable);
      disableDialStatus('modfx-pshift-fine2-dial', disable);
      disableDialStatus('modfx-pshift-pre-delay2-dial', disable);
      disableDialStatus('modfx-pshift-level2-dial', disable);
    });
    adjustItemStatus('modfx-pshift-voice-select-box');  // 表示初期化
    
    // HARMONIST
    $('#modfx-harmonist-voice-select-box').on('elf-changed elf-update', function(e, v) {
      // 0: 1VOICE
      disableDialStatus('modfx-harmonist-harmony2-dial', (v === 0));
      disableDialStatus('modfx-harmonist-level2-dial', (v === 0));
      disableDialStatus('modfx-harmonist-pre-delay2-dial', (v === 0));
      for (var i = 1; i <= 12; i++) {
        disableDialStatus('modfx-harmonist-v2-harm' + i + '-dial', (v === 0));
      }
    });
    $('#modfx-harmonist-harmony1-dial, #modfx-harmonist-harmony2-dial').on('elf-changed elf-update', function(e, v) {
      var harm1 = _items['modfx-harmonist-harmony1-dial'];
      var harm2 = _items['modfx-harmonist-harmony2-dial'];
      var v1 = Parameter.value(harm1.pid, harm1.size, harm1.vofs);
      var v2 = Parameter.value(harm2.pid, harm2.size, harm2.vofs);
      if ((v1 !== 29) && (v2 !== 29)) {  // 29: USER
        $('#modfx-harmonist-user-frame').hide();
      }
      else {
        $('#modfx-harmonist-user-frame').show();
      }
      for (var i = 1; i <= 12; i++) {
        disableDialStatus('modfx-harmonist-v1-harm' + i + '-dial', (v1 !== 29));
        disableDialStatus('modfx-harmonist-v2-harm' + i + '-dial', (v2 !== 29));
      }
    });
    $('#modfx-harmonist-master-key-dial').on('elf-changed elf-update', function(e, v) {
      for (var i = 1; i <= 12; i++) {
        var n = i + v - 1;
        if (n >= 12)  n -= 12;
        setLabelString('modfx-harmonist-v1-harm' + i + '-label', n);
        setLabelString('modfx-harmonist-v2-harm' + i + '-label', n);
      }
      function setLabelString(id, key) {
        var _$ = $('#' + id);
        var label = _$.find('p').text().split(': ');
        label.pop();
        label.push(keyLabelString[key]);
        _$.find('p').text(label.join(': '));
      }
    });
    adjustItemStatus('modfx-harmonist-voice-select-box');  // 表示初期化
    adjustItemStatus('modfx-harmonist-harmony1-dial');  // 表示初期化
    adjustItemStatus('modfx-harmonist-harmony2-dial');  // 表示初期化
    adjustItemStatus('modfx-harmonist-master-key-dial');  // 表示初期化

    // HUMANIZER
    $('#modfx-humanizer-mode-select-box').on('elf-changed elf-update', function(e, v) {
      // 0: PICKING, 1: AUTO
      disableDialStatus('modfx-humanizer-sens-dial', (v !== 0));
      disableDialStatus('modfx-humanizer-manual-dial', (v === 0));
    });
    adjustItemStatus('modfx-humanizer-mode-select-box');  // 表示初期化

    // DC-30
    $('#modfx-dc30-type-select-box').on('elf-changed elf-update', function(e, v) {
      // 0: CHORUS, 1: ECHO
      disableDialStatus('modfx-dc30-cho-intensity-dial', (v !== 0));
      disableDialStatus('modfx-dc30-echo-repeat-rate-dial', (v === 0));
      disableDialStatus('modfx-dc30-echo-intensity-dial', (v === 0));
      disableDialStatus('modfx-dc30-echo-volume-dial', (v === 0));
    });
    adjustItemStatus('modfx-dc30-type-select-box');  // 表示初期化

    //LINE OUT AIR FEEL
    $('#line-out-sw-btn').on('elf-changed', function (e, v) {
      if (v === 0) {
        $('#line-out-setting-line-out-mode-select-box').removeClass("disabled");
      } else {
        $('#line-out-setting-line-out-mode-select-box').addClass("disabled");
      }
    });

    // Assign controllers
    $('#asgn-gafc-type-switcher').on('elf-changed', function(e, v) {
      switch (v) {
        case 1:
          //direct:GA-FC
          $('#asgn-gafc-exp1-label, #asgn-gafc-exp2-label, #asgn-fs1-function-label, #asgn-fs2-function-label').removeClass('disabled');
          $('#asgn-gafc-exp3-label, #asgn-fs3-function-label').addClass('disabled');
          //expand:未接続
          $('#asgn-expand-gafc-exp1-label, #asgn-expand-gafc-exp2-label, #asgn-expand-fs1-function-label, #asgn-expand-fs2-function-label').addClass('disabled');
          $('#asgn-expand-gafc-exp3-label, #asgn-expand-fs3-function-label').addClass('disabled');
          break;
        case 3:
          //direct:GA-FC EX
          $('#asgn-gafc-exp1-label, #asgn-gafc-exp2-label, #asgn-fs1-function-label, #asgn-fs2-function-label').removeClass('disabled');
          $('#asgn-gafc-exp3-label, #asgn-fs3-function-label').removeClass('disabled');
          //expand:未接続
          $('#asgn-expand-gafc-exp1-label, #asgn-expand-gafc-exp2-label, #asgn-expand-fs1-function-label, #asgn-expand-fs2-function-label').addClass('disabled');
          $('#asgn-expand-gafc-exp3-label, #asgn-expand-fs3-function-label').addClass('disabled');
          break;
        case 7:
          //direct:GA-FC EX EXPAND接続中 GA-FC同等
          $('#asgn-gafc-exp1-label, #asgn-gafc-exp2-label, #asgn-fs1-function-label, #asgn-fs2-function-label').removeClass('disabled');
          $('#asgn-gafc-exp3-label, #asgn-fs3-function-label').addClass('disabled');
          //expand:GA-FC
          $('#asgn-expand-gafc-exp1-label, #asgn-expand-gafc-exp2-label, #asgn-expand-fs1-function-label, #asgn-expand-fs2-function-label').removeClass('disabled');
          $('#asgn-expand-gafc-exp3-label, #asgn-expand-fs3-function-label').addClass('disabled');
          break;
        case 15:
          //direct:GA-FC EX EXPAND接続中 GA-FC同等
          $('#asgn-gafc-exp1-label, #asgn-gafc-exp2-label, #asgn-fs1-function-label, #asgn-fs2-function-label').removeClass('disabled');
          $('#asgn-gafc-exp3-label, #asgn-fs3-function-label').addClass('disabled');
          //Gexpand:A-FC EX
          $('#asgn-expand-gafc-exp1-label, #asgn-expand-gafc-exp2-label, #asgn-expand-fs1-function-label, #asgn-expand-fs2-function-label').removeClass('disabled');
          $('#asgn-expand-gafc-exp3-label, #asgn-expand-fs3-function-label').removeClass('disabled');
          break;
        default:
          //direct:未接続
          $('#asgn-gafc-exp1-label, #asgn-gafc-exp2-label, #asgn-fs1-function-label, #asgn-fs2-function-label').addClass('disabled');
          $('#asgn-gafc-exp3-label, #asgn-fs3-function-label').addClass('disabled');
          //expand:未接続
          $('#asgn-expand-gafc-exp1-label, #asgn-expand-gafc-exp2-label, #asgn-expand-fs1-function-label, #asgn-expand-fs2-function-label').addClass('disabled');
          $('#asgn-expand-gafc-exp3-label, #asgn-expand-fs3-function-label').addClass('disabled');
          break;
      }
    });
    window.GAFC_TYPE = 1;
		$('#asgn-page-select-btn').on('elf-changed', function(e, v) {
      let pid = '';
			switch (v) {
				case 1:
					//GAFC
					$('#asgn-gafc-exp-header-select-btn, #asgn-gafc-exp-content-switcher, #asgn-gafc-fs-content-select-btn').trigger('elf-change', 0);
          $('#asgn-gafc-func1-content-switcher, #asgn-gafc-func2-content-switcher, #asgn-gafc-func3-content-switcher').trigger('elf-change', 0);
          pid = 'PATCH%ASSIGN_GAFCEXPPDL1_FUNC(1)%0';
          GAFC_TYPE = v;
					break;
				case 2:
					//GAFC Expand
          $('#asgn-gafc-exp-header-select-btn, #asgn-gafc-exp-content-switcher, #asgn-gafc-fs-content-select-btn').trigger('elf-change', 1);
          $('#asgn-gafc-func1-content-switcher, #asgn-gafc-func2-content-switcher, #asgn-gafc-func3-content-switcher').trigger('elf-change', 1);
          pid = 'PATCH%ASSIGN_GAFCEXPPDL1_FUNC(2)%0';
          GAFC_TYPE = v;
					break;			
				default:
					break;
			}
      let exp1 = Parameter.value(pid, INTEGER1x7, 0);
      let exp2 = Parameter.value(pid.replace('ASSIGN_GAFCEXPPDL1', 'ASSIGN_GAFCEXPPDL2'), INTEGER1x7, 0);
      let exp3 = Parameter.value(pid.replace('ASSIGN_GAFCEXPPDL1', 'ASSIGN_GAFCEXPPDL3'), INTEGER1x7, 0);

      $('#asgn-exp1-function-select-box').trigger('elf-change', [exp1, 'true']);
      $('#asgn-exp2-function-select-box').trigger('elf-change', [exp2, 'true']);
      $('#asgn-exp3-function-select-box').trigger('elf-change', [exp3, 'true']);
      util.waitForRQ1Reply(ADDRESS_CONST.COMMAND.GAFC_TYPE, 1, {
        error: function () { },
        success: function (msg) {
          $('#asgn-gafc-type-switcher').trigger('elf-update', parseInt(msg));
        }
      });
		});
  
    for (let slider in positionSlider) {
      $('#' + positionSlider[slider].position).on('elf-changed', function (e, v) {
        $('#' + positionSlider[slider].icon).css({'left': `${v * 3.9 + 126}px`});
      });

      $('#' + positionSlider[slider].distance).on('elf-changed', function (e, v) {
        $('#' + positionSlider[slider].icon).css({'top': `${106 + v * 4.1}px`});
      });
      
      adjustItemStatus(positionSlider[slider].position);
      adjustItemStatus(positionSlider[slider].distance);
    }
  };


  function disableDialStatus(id, disable) {
    var _$ = $('#' + id);
    _$.attr('disabled', disable);
    var label = _$.attr('description');
    if (label) {
      $('#' + label).attr('disabled', disable);
    }
  }

  function hideItem(id, hide) {
    if (hide) $('#' + id).hide();
    else      $('#' + id).show();
  }

  function adjustItemStatus(id) {
    var item = _items[id];
    if (item && item.pid) {
      var v = Parameter.value(item.pid, item.size, item.vofs);
      $('#' + id).trigger('elf-change', [v, true]);
    }
  }

  function toggleButtonOff(id, state) {
    state === 0 ? hideItem(id, false) : hideItem(id, true);
  } 
})();
