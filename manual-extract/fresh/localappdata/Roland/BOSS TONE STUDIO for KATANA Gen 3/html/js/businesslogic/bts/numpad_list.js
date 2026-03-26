/**
 * [概要]
 * Numpad表示時にList表示をするタイプのダイアルの対応
 *
 * [使用箇所]
 * 該当ダイアルにはE-builderのdblclick-handlerに「numpadList」を指定する。
 *
 * closeNumpadList()は強制的に閉じる場合などで、他ファイルでも使用
 *
 * [改善ポイント]
 * この実装方法だと、該当ダイアルにStringerが紐づいており、かつ
 * resource.jsを参照するタイプの場合でないと使えない(formatタイプでは不可)
 */

 $(function() {
  /**
   * NumpadList関連のHTML id, classNameを定義
   */
   var IDS = {
    numpadList: '#NumpadList',
    description: '#numpad_list_description',
    option: '#numpad_list_option',
    close: '#numpad_list_close'
  };
  var CLASS_NAMES = {
    popupWrapper: '.bts-numpad-list-popup-wrapper',
    slideUp: '.bts-numpad-list-slideup-style'
  };
  
  var _$target = '';
  var stringerTexts = '';
  // 一行の高さ(PC特有)
  var ROW_HEIGHT = 28;
  // 何行表示されるか(PC特有)
  var N_ROW = 8;
  var maxMin = [];
  var val = 0;

  /**
   * NumpadList起動時の処理
   * @param e
   * @param _$
   */
   $(document).on('keydown', '.elf-dial-control', function(e) {
    e.stopPropagation();
    if($('#NumpadList').css('display') != 'block') return ;
    if (e.keyCode == 38){
      val = val-1;
    }
    else if (e.keyCode == 40){  val = val+1;  }
    else if (e.keyCode == 9 ) {  closeNumpadList(); return; }
    else if (e.keyCode == 35){ val = maxMin[1]- maxMin[0] - 1; }
    else if (e.keyCode == 36){ val = 0; }
    else if (e.keyCode == 13){  closeNumpadList(); return; }
    if(val < 0){
      val = 0;
      return false;
    }
    if(val >= maxMin[1] - maxMin[0]){
      val = maxMin[1]- maxMin[0] -1;
      return false;
    }
    $(IDS.option).find('a').removeAttr('checked');
    $(IDS.option).find('a').eq(val).attr('checked', 'checked');
    scrollSelectLocation(val);
    _$target.trigger('elf-update', val+maxMin[0]);
    _$target.trigger('elf-change', val+maxMin[0]);
    return false;
  });

   var numpadList = function(e, _$) {
    // Headerの文字列を設定
    var label = _$.attr('description');

    var desc = $('#' + label).find('p').text();
    $(IDS.description).find('p').text(desc);
    // Stringerの文字列を使用してListを生成
    var item = _items[_$.attr('id')];

    var targetId = _$.attr('id');
    var targetStringer = $('#' + item.stringer);
    stringerTexts = targetStringer.children('div').eq(0).children('p');
    
    var min = parseInt($('#'+targetId).attr('min'));
    var max = parseInt($('#'+targetId).attr('max'));
    maxMin = [min,max+1];
    var html = '';
    for (var i = 0; i < maxMin[1]; i++) {
      if(i >= maxMin[0]){
        html += '<a>' + stringerTexts.eq(i).text() + '</a>';
      }
    }
    $(IDS.option).append(html);

    // Listの各要素クリック時のイベントを追加
    $(IDS.option).find('a').on('click', function(e) {
      $(IDS.option).find('a').removeAttr('checked');
      $(this).attr('checked', 'checked');
      val = $(IDS.option).find('a').index(this);
      _$target.trigger('elf-update', val+maxMin[0]);
      _$target.trigger('elf-change', val+maxMin[0]);
      closeNumpadList();
    });

    // チェックマークを現在選択中の値で更新
    _$target = _$;
    val = _$.val() - maxMin[0];

    $(IDS.option).find('a').eq(val).attr('checked', 'checked');
    // 表示位置を算出(PC特有)
    var leftAndTop = calcPosition(_$);
    $('#NumpadList').css({
      'top': leftAndTop[1] + 'px',
      'left': leftAndTop[0] + 'px'
    });
    // NumpadListを開く
    popup_open(IDS.numpadList.slice(1), CLASS_NAMES.popupWrapper.slice(1));

    // 選択中の位置へとスクロール(PC特有)
    scrollSelectLocation(val);

    // 範囲外をクリック時にNumpadListが閉じるように設定(PC特有)
    $(IDS.numpadList).on('click', function(e) {
      e.stopPropagation();
    });
    $(CLASS_NAMES.popupWrapper).on('click', function() {
      closeNumpadList();
    });
  };

  function scrollSelectLocation(val){
    if (stringerTexts.length > N_ROW) {
      if (stringerTexts.length - val < N_ROW) {
        $('#numpad_list_option').scrollTop(ROW_HEIGHT * (stringerTexts.length - N_ROW));
      } else {
        $('#numpad_list_option').scrollTop(ROW_HEIGHT * val);
      }
    }
  }
  /**
   * ListのCloseボタン押下時の処理
   */
   $(IDS.close).on(pointer.click, function(e) {
    e.preventDefault();
    closeNumpadList();
  });
   
   function closeNumpadList() {
    popup_close(IDS.numpadList.slice(1), CLASS_NAMES.popupWrapper.slice(1));
    val = 0;
    $(IDS.option).empty();
  }
  /**
   * Numpadを開く位置を算出
   * @returns {*[]} [left, top]
   */
   function calcPosition(target) {
    if (target.offset().left + 72 + 162 <= $(window).width() &&
      target.offset().top - 162 >= 0
      ) {
      return [target.offset().left + 72, target.offset().top - 162];
  } else if (target.offset().left - 8 - 162 >= 0 &&
    target.offset().top - 162 >= 0
    ) {
    return [target.offset().left - 8 - 162, target.offset().top - 162];
  } else if (target.offset().left + 162 <= $(window).width() &&
    target.offset().top + 66 + 250 <= $(window).height()
    ) {
    return [target.offset().left, target.offset().top + 66];
  } else if (target.offset().left - 98 >= 0 &&
    target.offset().top + 66 + 250 <= $(window).height()
    ) {
    return [target.offset().left - 98, target.offset().top + 66];
  }
}

window['numpadList'] = numpadList;
  // closeNumpadList関数を他ファイルでも使用可能にする
  window.closeNumpadList = closeNumpadList;
});
