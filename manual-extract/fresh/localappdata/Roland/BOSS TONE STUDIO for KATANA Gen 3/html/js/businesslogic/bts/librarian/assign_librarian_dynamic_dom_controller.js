/**
 * [概要]
 * LIBRARIAN画面の動的に生成するDOMの操作及びイベントの紐づけ
 *
 * [使用箇所]
 * LIBRARIAN画面
 *
 * [改善ポイント]
 * ・IDやCLASSを指定する際にLIBRARIANという接頭辞をつけているため、変数名が長くなり、可読性が低くなっている。
 * 
 */

/* To prevent error on ESLint */
/* global util, pointer, popup_open, Parameter,
  LIBRARIAN_ELEMENT_IDS, LIBRARIAN_ELEMENT_CLASSES,
  CREATE_LIVESET_DIALOG, OVERWRITE_PATCH_DIALOG, ERROR_DIALOG_MAP,
  ADDRESS_CONST, 
  librarianCommonInfo, librarianServices, librarianDynamicDOMController, librarianObserver,
  patchModelController, patchMIDIController,
  midiConnectionController, btsDOMController,
 */

 (function () {
  window.assignLibrarianDynamicDOMController = function () {
    var obj = {
      /**
       *  LiveSetテーブルの生成
       */
       createLivesetTable: function () {
        var table = "<div id='librarian-liveset-table' class='librarian-liveset-table-pc'>";
        for (var row = 0, length = librarianCommonInfo.livesetList.length; row < length; row++) {
//          var livesetName = librarianCommonInfo.livesetList[row].name;
//          livesetName = util.convert2AsciiOnlyStr(livesetName).slice(0, 64);
          table += "<div class='librarian-liveset-table-cell-pc' value=" + row + ">";
          table += "<div class='librarian-liveset-info-block-pc'>";
          table += "<div class='librarian-liveset-info-pc'>";
          if (librarianCommonInfo.livesetList[row].name.length < 22) {
            table += "<div class='librarian-liveset-name-pc'>";
          } else {
            table += "<div class='librarian-liveset-name-two-line-pc'>";
          }
          table += 
//            livesetName // append livesetName later to prevent XSS attack
            "</div>";
          table += "<div class='librarian-patch-num-pc'>" + librarianCommonInfo.livesetList[row].rows(librarianCommonInfo.settingMode) + "</div>";
          table += "</div>";
          table += '<input name="rename-liveset-text" class="rename-liveset-input-text" maxlength="64" style="display:none;" type="text" value="' + livesetName + '">';
          table += '<div class="librarian-rename-liveset-check-btn-pc" style="display:none;" ></div>';
          table += '<div class="librarian-delete-liveset-btn-pc" style="display:none;" ></div>';
          table += "<div class='librarian-edit-liveset-btn-pc' title='Edit'></div>";
          table += "</div>";
          table += "<div class='patch-table'></div>";
          table += "</div>";
          table += "</div>";
        }
        table += "</div>";
        $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame).empty();
        $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame).append(table);
        for (var row = 0, length = librarianCommonInfo.livesetList.length; row < length; row++) {
          var livesetName = librarianCommonInfo.livesetList[row].name;
          livesetName = util.convert2AsciiOnlyStr(livesetName).slice(0, 64);
          $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame).find('.librarian-liveset-table-cell-pc').find('.librarian-liveset-name-pc').text(livesetName);
          $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame).find('.librarian-liveset-table-cell-pc').find('.librarian-liveset-name-two-line-pc').text(livesetName);
        }
        librarianEventHandler();
      },
      /**
       *  LiveSetテーブルの更新処理
       */
       updateLivesetTableCell: function () {
        var table = "<div id='librarian-liveset-table' class='librarian-liveset-table-pc'>";
        for (var row = 0, length = librarianCommonInfo.livesetList.length; row < length; row++) {
          var livesetName = librarianCommonInfo.livesetList[row].name;
          livesetName = util.convert2AsciiOnlyStr(livesetName).slice(0, 64);
          table += "<div class='librarian-liveset-table-cell-pc' value=" + row + ">";
          table += "<div class='librarian-liveset-info-block-pc'>";
          table += "<div class='librarian-liveset-info-pc'>";
          if (librarianCommonInfo.livesetList[row].name.length < 22) {
            table += "<div class='librarian-liveset-name-pc'>";
          } else {
            table += "<div class='librarian-liveset-name-two-line-pc'>";
          }
          table +=
//            livesetName
            "</div>";
          table += "<div class='librarian-patch-num-pc'>" + librarianCommonInfo.livesetList[row].rows(librarianCommonInfo.settingMode) + "</div>";
          table += "</div>";
          table += '<input name="rename-liveset-text" class="rename-liveset-input-text" maxlength="64" style="display:none;" type="text" value="' + livesetName + '">';
          table += '<div class="librarian-rename-liveset-check-btn-pc" style="display:none;" ></div>';
          table += '<div class="librarian-delete-liveset-btn-pc" style="display:none;" ></div>';
          table += "<div class='librarian-edit-liveset-btn-pc' title='Edit'></div>";
          table += "</div>";
          table += "<div class='librarian-patch-table-pc'>";
          for (var i = 0, livesetLength = librarianCommonInfo.livesetList[row].rows(librarianCommonInfo.settingMode); i < livesetLength; i++) {
//            var patchName = librarianCommonInfo.livesetList[row].value(librarianCommonInfo.settingMode, i, 0);
//            patchName = util.convert2AsciiOnlyStr(patchName).slice(0, 16);
            var num = (i + 1 > 9) ? i + 1 : "0" + (i + 1);
            table += "<div class='librarian-patch-cell-pc' value=" + i + ">";
            table += "<div class='librarian-serial-num-pc'>" + num + "</div>";
            table += "<div class='librarian-patch-name-pc'>"
//                     + patchName -- comment out to prevent XSS attack
                     + "</div>";
            table += "<div class='librarian-edit-patch-btn-pc' title='Edit'></div>";
            table += '<input name="librarian-rename-patch-text-pc" class="rename-patch-input-text" style="display:none;" type="text" value="' 
//                     + patchName -- comment out to prevent XSS attack
                     + '">';
            table += '<div class="librarian-rename-patch-check-btn-pc" style="display:none;" ></div>';
            table += '<div class="librarian-delete-patch-btn-pc" style="display:none;" ></div>';
            table += "</div>";
          }
          table += "</div>";
          table += "</div>";
        }
        $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame).empty();
        $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame).append(table);
        for (var row = 0, length = librarianCommonInfo.livesetList.length; row < length; row++) {
          livesetName = librarianCommonInfo.livesetList[row].name;
          livesetName = util.convert2AsciiOnlyStr(livesetName).slice(0, 64);
          $('.librarian-liveset-table-cell-pc[value=' + row + ']').find('.librarian-liveset-name-pc').text(livesetName);
          $('.librarian-liveset-table-cell-pc[value=' + row + ']').find('.librarian-liveset-name-two-line-pc').text(livesetName);
          for (var i = 0, livesetLength = librarianCommonInfo.livesetList[row].rows(librarianCommonInfo.settingMode); i < livesetLength; i++) {
            var patchName = librarianCommonInfo.livesetList[row].value(librarianCommonInfo.settingMode, i, 0);
            patchName = util.convert2AsciiOnlyStr(patchName).slice(0, 16);
            var $cellPc = $('.librarian-liveset-table-cell-pc[value=' + row + ']').find('.librarian-patch-cell-pc[value=' + i + ']');
            $cellPc.find('.librarian-patch-name-pc').text(patchName);
            $cellPc.find('.rename-patch-input-text').val(patchName);
          }
        }
        librarianEventHandler();
      },
      /**
       *  Patchテーブルの更新処理
       *  @param livesetCell 更新するLivesetのDOM
       */
       updatePatchTableCell: function (livesetCell) {
        var currentLiveset = librarianCommonInfo.livesetList[livesetCell.index()];
        var cells = [];
        if (currentLiveset) {
          cells = livesetCell.children(LIBRARIAN_ELEMENT_CLASSES.patchTable).children();
        }
        if (cells !== 0) {
          for (var i = 0, length = cells.length; i < length; i++) {
            $(cells[i]).find('.librarian-patch-name-pc').text(currentLiveset.value(librarianCommonInfo.settingMode, i, 0));
          }
        }
      },
      /**
       *  LiveSetのセレクトリスト更新
       */
       updateSelectLivesetList: function () {
        $(LIBRARIAN_ELEMENT_CLASSES.livesetSelectorOption).empty();
        const livesetList = librarianCommonInfo.livesetList.filter(liveset => liveset.rows(librarianCommonInfo.settingMode) > 0);
        var html = '';
        for (var i = 0, length = livesetList.length; i < length; i++) {
          html += ("<a href='#' class='elf-select-list-option-control' msg='' value=" + i + '></a>');
        }
        $(LIBRARIAN_ELEMENT_CLASSES.livesetSelectorOption).html(html);
        for (var i = 0, length = livesetList.length; i < length; i++) {
          $(LIBRARIAN_ELEMENT_CLASSES.livesetSelectorOption).find('.elf-select-list-option-control[value=' + i + ']').text(livesetList[i].title());
        }
      },
      /**
       *  LiveSet番号の更新
       */
       sortableLivesetTableCell: function () {
        var livesetListLength = 0;
        if (librarianCommonInfo.livesetList) {
          livesetListLength = librarianCommonInfo.livesetList.length;
        }
        if (livesetListLength !== 0) {
          var livesetList = $(LIBRARIAN_ELEMENT_IDS.livesetTable).children();
          for (var i = 0; i < livesetList.length; i++) {
            $(livesetList[i]).attr('value', i);
          }
        }
      },
      /**
       *  Patch番号の更新
       *  @param livesetCell 更新するLivesetのDOM
       */
       sortablePatchTableCell: function (livesetCell) {
        var currentLiveset = librarianCommonInfo.livesetList[livesetCell.index()];
        var cells = [];
        if (currentLiveset) {
          cells = livesetCell.children(LIBRARIAN_ELEMENT_CLASSES.patchTable).children();
        }
        if (cells !== 0) {
          for (var i = 0, length = cells.length; i < length; i++) {
            $(cells[i]).attr('value', i);
            var patchNum = i + 1;
            if (patchNum < 10) {
              patchNum = "0" + patchNum;
            } else {
              patchNum = patchNum + "";
            }
            $(cells[i]).find('.librarian-serial-num-pc').text(patchNum);
          }
        }
      },
      /**
       *  userpatchへのイベント着脱
       *  @param isAssigned イベント着脱のフラグ
       */
       assignUserPatchTableEvent: function (isAssigned) {
        var userPatchSelectMenu = $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu);
        var userPatchSelectMenuCells = $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu + '> label');
        if (isAssigned) {
          $(document).on('keydown.librarian', function (e) {
            _librarianKeyDownEventHandler(e);
          });
          $(document).on('keyup.librarian', function (e) {
            _librarianKeyUpEventHandler(e);
          });
          userPatchSelectMenuCells.on('mousedown.librarian', function (e) {
            _librarianSelectUserPatchEvent(e, $(this));
          });
          if (userPatchSelectMenu.hasClass('ui-sortable')) {
            userPatchSelectMenu.sortable('enable');
          }
          $(LIBRARIAN_ELEMENT_IDS.createLivesetTextInput + ' input').on('input',function(){
            var text = $(LIBRARIAN_ELEMENT_IDS.createLivesetTextInput + ' input').val();
            if(text.trim() != ''){
              $(LIBRARIAN_ELEMENT_IDS.createLivesetBtn).removeClass("disabled-blue");
              $(CREATE_LIVESET_DIALOG.mask).css('display', 'none');
              CREATE_LIVESET_DIALOG.status = false;
            }else{
              $(LIBRARIAN_ELEMENT_IDS.createLivesetBtn).addClass("disabled-blue");
              $(CREATE_LIVESET_DIALOG.mask).css('display', 'block');
              CREATE_LIVESET_DIALOG.status = true;
            }
          })
        } else {
          $(document).off('keydown.librarian');
          $(document).off('keyup.librarian');
          userPatchSelectMenuCells.off('mousedown.librarian');
          if (userPatchSelectMenu.hasClass('ui-sortable')) {
            userPatchSelectMenu.sortable('disable');
          }
          userPatchSelectMenu.removeClass(LIBRARIAN_ELEMENT_CLASSES.librarianUserPatchTable.slice(1));
          userPatchSelectMenuCells.removeClass(LIBRARIAN_ELEMENT_CLASSES.selectUserPatch.slice(1));
        }
      },
      idStrings: function(selector) { return selector.replace(/^#/,'');  },
      classStrings: function(selector) { return selector.replace(/^\./,'');  },
    }
    window.librarianDynamicDOMController = obj;
  }
}());

/**
 *  LIBRARIANのLiveSetテーブル内のイベント紐づけ
 */
 function librarianEventHandler() {
  var original = null; // 移動元にあるSortable要素のPATCH
  var before = null; // 移動元にあるSortable要素の前にあるPATCH
  var parent = null; // 移動元にあるSortable要素のPATCHのPATCH TABLE
  var fromLivesetIndex = 0; // PATCHの移動元のLIVESETのIndex
  var toLivesetIndex = 0; // PATCHの移動先のLIVESETのIndex
  var placeholderIndex = 0; // placeholderのindex patchのinsert時に使用する
  var selectCellIndexes = []; // 移動元で選択されたPATCHのIndex番号が格納された配列
  var updateCellIndexes = []; // 移動先で上書き対象のPATCHのIndex番号が格納された配列(空の場合あり)
  var UPDATE_PATCH_OVERLAP_HEIGHT = 10;

  function patchExist(index) {
    if (btsDOMController.getAmpInSlaveMode()) return false;
    return window.modelInfo.config().patchExist(index);
  }

  /**
   *  LiveSetのsortable
   */
   $(LIBRARIAN_ELEMENT_IDS.livesetTable).sortable({
    opacity: 0.8,
    axis: 'x',
    containment: "parent",
    delay: 1,
    scroll: true,
    scrollSensitivity: 100,
    over: function (e, ui) {
      if (ui.sender) {
        $(ui.sender).sortable('instance').scrollParent = $(e.target);
      }
    },
    helper: function (event, ui) {
      return ui.clone().addClass('librarian-select-liveset-pc');
    },
    placeholder: 'sortable-placeholder-pc',
    cancel: LIBRARIAN_ELEMENT_CLASSES.patchCell,
    start: function (event, ui) {
      if (!ui.item.hasClass('librarian-select-liveset-pc')) {
        $(LIBRARIAN_ELEMENT_IDS.livesetTable).children().removeClass('librarian-select-liveset-pc');
        ui.item.addClass('librarian-select-liveset-pc');
      }
      ui.item.show();
    },
    sort: function(event, ui) {
      var livesetTable = ui.placeholder.parents(LIBRARIAN_ELEMENT_IDS.livesetTableFrame);
      var livesetList = librarianCommonInfo.livesetList;
      if (ui.position.left >= livesetTable.width() - 208 && ui.placeholder.index() === livesetList.length - 1) {
        livesetTable.css('padding-right', '210px');
      } else if (ui.placeholder.index() === 0){
        livesetTable.css('padding-left', '210px');
      }
      var scrollWidth = 208 * (librarianCommonInfo.livesetList.length - 1);
      if (ui.position.left + 208 >= window.innerWidth) {
        ui.item.css('left', 208 * (librarianCommonInfo.livesetList.length));
      }
    },
    stop: function (event, ui) {
      ui.item.removeAttr('style');
      ui.item.removeClass('librarian-select-liveset-pc');
      var indexArray = $(LIBRARIAN_ELEMENT_IDS.livesetTable).sortable('toArray', { attribute: 'value' });
      var newLivesetList = [];
      for (var i = 0, length = indexArray.length; i < length; i++) {
        var index = indexArray[i];
        newLivesetList.push(librarianCommonInfo.livesetList[index]);
      }
      librarianCommonInfo.livesetList = newLivesetList;
      librarianServices.saveIdList();
      librarianDynamicDOMController.sortableLivesetTableCell();
      $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame).css('padding', '0px');
    },
    appendTo: LIBRARIAN_ELEMENT_IDS.librarianPage
  });

  /** 
   *  LiveSetのPatchのsortable
   */
   $(LIBRARIAN_ELEMENT_CLASSES.patchTable).sortable({
    opacity: 0.8,
    containment: LIBRARIAN_ELEMENT_IDS.subPage,
    delay: 1,
    scroll: true,
    scrollSensitivity: 100,
    scrollSpeed: 100,
    over: function (e, ui) {
      if (ui.placeholder) {
        ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
        ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
      }
    },
    connectWith: [LIBRARIAN_ELEMENT_CLASSES.patchTable, LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu],
    tolerance: 'pointer',
    helper: function (event, ui) {
      var selectPatches = $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).clone();
      return $('<div>').append(selectPatches);
    },
    placeholder: 'sortable-placeholder-pc',
    cancel: LIBRARIAN_ELEMENT_CLASSES.livesetInfoBlock,
    start: function (event, ui) {
      fromLivesetIndex = ui.item.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).index();
      selectCellIndexes = [];
      var patchCells = ui.item.parent().children().not('.sortable-placeholder-pc');
      for (var i = 0, len = patchCells.length; i < len; i++) {
        if ($(patchCells[i]).hasClass(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell.slice(1))) {
          selectCellIndexes.push(i);
        }
      }
      ui.item.css('display', 'block');
      ui.item.multiple = ui.helper.children().removeClass('librarian-select-patch-cell-pc');
      original = ui.item.clone();
      before = $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).first().prev();
      parent = ui.item.parent();
    },
    sort: function (event, ui) {
      var patchTable = ui.placeholder.parents(LIBRARIAN_ELEMENT_CLASSES.patchTable);
      if (ui.position.top >= patchTable.height() - 40) {
        patchTable.css('padding-bottom', '38px');
      }
      updateCellIndexes = [];
      placeholderIndex = ui.placeholder.index();
      var beforeCell = ui.placeholder.prev();
      var afterCell = ui.placeholder.next();
      var isUserPatch = false;
      var overlapHeight = UPDATE_PATCH_OVERLAP_HEIGHT;
      if (ui.placeholder.parent().attr('id') === LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu.replace('#','')) {
        isUserPatch = true;
        overlapHeight = UPDATE_PATCH_OVERLAP_HEIGHT + 20;
        beforeCell = ui.placeholder.prev('label');
        afterCell = ui.placeholder.next('label');
      }
      var overlapResult = _overlapPatchCell(beforeCell, afterCell, ui.helper, overlapHeight);
      $(LIBRARIAN_ELEMENT_CLASSES.updatePatchCell).removeClass('librarian-update-patch-cell-pc');
      var updatePatchCell = overlapResult.updatePatchCell;
      var updateTop = null;
      var helperTop = null;
      if (updatePatchCell !== null) {
        updateTop = updatePatchCell.offset().top;
        helperTop = ui.helper.offset().top;
      }
      var overlapValid = Math.abs(updateTop - helperTop) < overlapHeight && Math.abs(updateTop - helperTop) > 2;
      if (overlapValid && updateTop && helperTop) {
        var table = updatePatchCell.parent();
        $('.sortable-placeholder-pc').attr('style', 'border-bottom:0.1px solid #000000;');
        var index = overlapResult.index;
        var inc = (isUserPatch)? 2 : 1;
        var helperLength = ui.helper.children().length;
        if (isUserPatch && window.modelInfo) {
          while (updateCellIndexes.length < helperLength) {
            var n = Math.floor(index / 2);
            if (n >= patchModelController.getTotalUserPatch()) {
              break;
            }
            if (patchExist(n)) {
              updateCellIndexes.push(index);
              table.children().not('.sortable-placeholder-pc').eq(index).addClass('librarian-update-patch-cell-pc');
            }
            index += inc;
          }
        } else {
          while (updateCellIndexes.length < helperLength) {
            updateCellIndexes.push(index);
            table.children().not('.sortable-placeholder-pc').eq(index).addClass('librarian-update-patch-cell-pc');
            index += inc;
          }
        }
      }
      if (updatePatchCell === null || !overlapValid) {
        $('.sortable-placeholder-pc').removeAttr('style');
      }
      updatePatchCell = null;
    },
    stop: function (event, ui) {
      toLivesetIndex = ui.item.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).index();
      var updateCell = $(LIBRARIAN_ELEMENT_CLASSES.updatePatchCell);
      var selectCell = $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell);
      var assignEventPatches = [];
      var patches = ui.item.multiple;
      var isExport = false;
      var toLivesetCell = null;
      var fromLivesetCell = null;
      var selectKeyPressed = librarianCommonInfo.selectKeyPressed;
      function domControl(isOriginAdd, isItemRem, isUpdateRem) {
        if (isOriginAdd) {
          if (before.length) {
            $(before).after(original);
          } else {
            $(parent).prepend(original);
          }
        }
        if (isItemRem) {
          ui.item.remove();
        }
        if (isUpdateRem) {
          updateCell.remove();
        }
      }
      if (ui.item.parent().attr('id') === LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu.slice(1)) {
        if (updateCell.length) {
          parent.sortable('cancel');
          assignEventPatches = [original];
          isExport = true;
        } else {
          parent.sortable('cancel');
          return;
        }
      } else if (event.altKey) {
        //TODO
      } else if (updateCell.length && updateCell.parent().is(parent)) { // 同一LIVESET内のPATCH上書き
        parent.sortable('cancel');
      } else if (ui.item.parent().is(parent)) { // 同一LIVESET内のPATCH並び替え
        ui.item.after(patches);
        ui.item.remove();
        $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).remove();
      } else if (updateCell.length && !updateCell.parent().is(parent)) { // 別のLIVESETに対してのPATCH上書き
        parent.sortable('cancel');
      } else if (!ui.item.parent().is(parent)) { // 別のLIVSETに対してのPATCH挿入
        toLivesetIndex = ui.item.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).index();
        updateCellIndexes = [];
        ui.item.after(patches);
        domControl(true, true, false);
      } else {
        ui.item.parent().sortable('cancel');
        return;
      }
      for (var i = 0; i < assignEventPatches.length; i++) {
        _patchCellEventHandler($(assignEventPatches[i]), librarianCommonInfo.patchEditing);
      }
      toLivesetCell = librarianCommonInfo.livesetList[toLivesetIndex];
      fromLivesetCell = librarianCommonInfo.livesetList[fromLivesetIndex];
      function removePatch() {
        if (selectKeyPressed) {
          for (var i = fromLivesetCell.rows(librarianCommonInfo.settingMode) - 1; 0 <= i; i--) {
            for (var j = 0, length = selectCellIndexes.length; j < length; j++) {
              if (i === selectCellIndexes[j]) {
                librarianServices.deletePatch(fromLivesetCell, i);
                selectCellIndexes.slice(j, 1);
                continue;
              }
            }
          }
        }
      }
      function completeFunc() {
        var indexScroll =  $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame+' div').scrollLeft();
        $(LIBRARIAN_ELEMENT_CLASSES.updatePatchCell).removeClass(LIBRARIAN_ELEMENT_CLASSES.updatePatchCell.slice(1));
        librarianServices.saveToStorage2(toLivesetCell);
        if (selectKeyPressed) {
          librarianServices.saveToStorage2(fromLivesetCell);
        }
        librarianDynamicDOMController.updateLivesetTableCell();
        $(LIBRARIAN_ELEMENT_IDS.livesetTableFrame+' div').scrollLeft(indexScroll);
        $('.librarian-patch-table-pc').scrollLeft(0);
      }
      if (isExport) { // Export
        var currentLiveset = librarianCommonInfo.livesetList[fromLivesetIndex];
        var targetPatches = [];
        for (var i = 0, length = selectCellIndexes.length; i < length; i++) {
          targetPatches.push(currentLiveset.cell(librarianCommonInfo.settingMode, selectCellIndexes[i]));
        }
        librarianCommonInfo.export.targetPatches = targetPatches;
        var instPatchIndex = Math.floor($(updateCell[0]).index() / 2); // Labelがある分ずれてしまうため、2で割った値をindexとする
        librarianCommonInfo.export.instPatchIndex = instPatchIndex;
        librarianCommonInfo.librarians[librarianCommonInfo.settingMode].cancel();
        librarianCommonInfo.librarians[librarianCommonInfo.settingMode].observers = [];
        librarianServices.exportInst(
          function () {
            for (var i = 0; i < updateCell.length; i++) {
              var patch = $(patches[i]);
              var newName = patch.children('.librarian-patch-name-pc').text();
              if(newName.trim() == ''){
                newName = patchModelController.getInitUserPatchName(i);
              }
              $('#'+ $(updateCell[i]).attr('for')).next().children('.patch-name').text(newName);
            }
            $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu).children('div').remove();
            $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu + '> label').on('mousedown.librarian', function (e) {
              _librarianSelectUserPatchEvent(e, $(this));
            });
            var currentPatchNum = patchModelController.getCurrentPatchNum();
            if(currentPatchNum == instPatchIndex || (instPatchIndex < currentPatchNum && currentPatchNum <= (instPatchIndex+patches.length -1))){
              patchMIDIController.updateCurrentPatch(currentPatchNum);
            }
          },
          function () {
            $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu + '.librarian-update-patch-cell-pc').removeClass('librarian-update-patch-cell-pc');
          });
      } else if (updateCellIndexes.length && toLivesetIndex === fromLivesetIndex && updateCell[0] !== selectCell[0]) { // 同一LIVESET内のPATCH上書き
        OVERWRITE_PATCH_DIALOG.open(
          function () {
            if(updateCellIndexes[selectCellIndexes.length - 1] >= librarianCommonInfo.maxPatchNum){
              $('.librarian-patch-table-pc').scrollLeft(0);
              ERROR_DIALOG_MAP.libraryFull.open();
              updateCell.removeClass('librarian-update-patch-cell-pc');
              return;
            }
            var copyLiveset = librarianServices.copyLiveset(fromLivesetCell);
            for (var i = 0, len = selectCellIndexes.length; i < len; i++) {
              var currentPatchIndex = updateCellIndexes[i];
              var copiedSelectPatch = librarianServices.copyPatch(copyLiveset.cell(librarianCommonInfo.settingMode, selectCellIndexes[i]));
              if (currentPatchIndex > -1) {
                toLivesetCell.cells[librarianCommonInfo.settingMode][currentPatchIndex] = copiedSelectPatch;
              } else {
                toLivesetCell.cells[librarianCommonInfo.settingMode].push(copiedSelectPatch);
              }
            }
            completeFunc();
          },
          function () {
            updateCell.removeClass('librarian-update-patch-cell-pc');
          },
          librarianCommonInfo.confirmOverwrite
          )
      } else if (placeholderIndex !== undefined && toLivesetIndex === fromLivesetIndex) { // 同一LIVESET内のPATCH並び替え
        var copyLiveset = librarianServices.copyLiveset(fromLivesetCell);
        var indexArray = $(this).sortable("toArray", { attribute: "value" });
        for (var i = 0, len = indexArray.length; i < len; i++) {
          var copyPatch = librarianServices.copyPatch(copyLiveset.cell(librarianCommonInfo.settingMode, indexArray[i]));
          toLivesetCell.cells[librarianCommonInfo.settingMode][i] = copyPatch;
        }
        completeFunc();
      } else if (updateCellIndexes.length && toLivesetIndex !== fromLivesetIndex) { // 別のLIVESETに対してのPATCH上書き
        OVERWRITE_PATCH_DIALOG.open(
          function () {
            if(updateCellIndexes[selectCellIndexes.length - 1] >= librarianCommonInfo.maxPatchNum){
              $('.librarian-patch-table-pc').scrollLeft(0);
              ERROR_DIALOG_MAP.libraryFull.open();
              updateCell.removeClass('librarian-update-patch-cell-pc');
              return;
            }
            for (var i = 0, len = selectCellIndexes.length; i < len; i++) {
              var currentPatchIndex = updateCellIndexes[i];
              var copiedSelectPatch = librarianServices.copyPatch(fromLivesetCell.cell(librarianCommonInfo.settingMode, selectCellIndexes[i]));
              if (currentPatchIndex > -1) {
                toLivesetCell.cells[librarianCommonInfo.settingMode][currentPatchIndex] = copiedSelectPatch;
              } else {
                toLivesetCell.cells[librarianCommonInfo.settingMode].push(copiedSelectPatch);
              }
            }
            if (selectKeyPressed) {
              removePatch();
            }
            completeFunc();
          },
          function () {
            updateCell.removeClass('librarian-update-patch-cell-pc');
          },
          librarianCommonInfo.confirmOverwrite
          );
      } else if (placeholderIndex !== undefined && toLivesetIndex !== fromLivesetIndex) { // 別のLIVSETに対してのPATCH挿入
        if ((toLivesetCell.rows(librarianCommonInfo.settingMode) + selectCellIndexes.length) <= librarianCommonInfo.maxPatchNum) {
          var patchArray = [];
          for (var i = placeholderIndex, len = toLivesetCell.cells[librarianCommonInfo.settingMode].length; i < len; i++) {
            var copiedPatch = librarianServices.copyPatch(toLivesetCell.cell(librarianCommonInfo.settingMode, i));
            patchArray.push(copiedPatch);
          }
          for (var k = placeholderIndex, len = placeholderIndex + selectCellIndexes.length; k < len; k++) {
            var copiedSelectPatch = librarianServices.copyPatch(
              fromLivesetCell.cell(librarianCommonInfo.settingMode, selectCellIndexes[k - placeholderIndex])
              );
            toLivesetCell.cells[librarianCommonInfo.settingMode][k] = copiedSelectPatch;
          }
          for (var j = 0, len = patchArray.length; j < len; j++) {
            var patch = patchArray[j];
            toLivesetCell.cells[librarianCommonInfo.settingMode][j + placeholderIndex + selectCellIndexes.length] = patch;
          }
          if (selectKeyPressed) {
            removePatch();
          }
          
        } else {
          $('.librarian-patch-table-pc').scrollLeft(0);
          ERROR_DIALOG_MAP.libraryFull.open();
        }
        completeFunc();
      }
      $(LIBRARIAN_ELEMENT_CLASSES.patchTable).css('padding', '0px');
    },
    appendTo: LIBRARIAN_ELEMENT_IDS.subPage,
  });
  /** 
   *  User Patchのsortable
   */
   $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu).sortable({
    opacity: 0.8,
    containment: LIBRARIAN_ELEMENT_IDS.subPage,
    delay: 1,
    scroll: true,
    scrollSensitivity: 100,
    connectWith: [LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu, LIBRARIAN_ELEMENT_CLASSES.patchTable],
    tolerance: 'pointer',
    cancel: LIBRARIAN_ELEMENT_CLASSES.livesetInfoBlock,
    over: function (e, ui) {
      if (ui.placeholder) {
        ui.item.data('sortableItem').scrollParent = $(e.target).parent();
        ui.item.data('sortableItem').overflowOffset = $(e.target).parent().offset();
      }
    },
    helper: function (event, ui) {
      var selectPatches = $(LIBRARIAN_ELEMENT_CLASSES.selectUserPatch).filter(':visible').clone();
      var helperChildren = '';
      for (var i = 0, length = selectPatches.length; i < length; i++) {
        var label = $(selectPatches[i]);
        helperChildren += '<div class="librarian-user-patch-helper-child">';
        helperChildren += '<div class="user-patch-helper-num">';
        helperChildren += label.children('.patch-prefix').html()
        helperChildren += '</div>';
        helperChildren += '<div class="user-patch-helper-title">';
        helperChildren += label.children('.patch-name').html();
        helperChildren += '</div>';
        helperChildren += '</div>';
      }
      return $('<div class="librarian-user-patch-helper">').removeAttr('style').append(helperChildren);
    },
    placeholder: {
      element: function () {
        return $('<div>').attr('class', 'ui-sortable-placeholder sortable-placeholder-pc');
      },
      update: function () {
        return;
      }
    },

    start: function (event, ui) {
      ui.item.css('display', 'block');
      ui.item.multiple = $(LIBRARIAN_ELEMENT_CLASSES.selectUserPatch).filter(':visible');
      var patchCells = ui.item.parent().children().not('.sortable-placeholder-pc').not('input');
      selectCellIndexes = [];
      var classSelectUserPatch = librarianDynamicDOMController.classStrings(LIBRARIAN_ELEMENT_CLASSES.selectUserPatch);
      for (var i = 0, len = patchCells.length; i < len; i++) {
        if (! $(patchCells[i]).hasClass(classSelectUserPatch))  continue;
        if (window.modelInfo) {
          if (! patchExist(i))  continue;
        }
        selectCellIndexes.push(i);
      }
      original = ui.item.clone();
      before = $(ui.item).prev('input');
      parent = $(ui.item).parent();
    },
    sort: function (event, ui) {
      var patchTable = ui.placeholder.parents(LIBRARIAN_ELEMENT_CLASSES.patchTable);
      if (ui.position.top >= patchTable.height() - 40) {
        patchTable.css('padding-bottom', '38px');
      }
      updateCellIndexes = [];
      placeholderIndex = ui.placeholder.index();
      var beforeCell = ui.placeholder.prev();
      var afterCell = ui.placeholder.next();
      var helper = ui.helper;
      var updatePatchCell = null;
      var index = 0;
      var overlapHeight = UPDATE_PATCH_OVERLAP_HEIGHT;
      var overlapResult = _overlapPatchCell(beforeCell, afterCell, helper, overlapHeight);
      updatePatchCell = overlapResult.updatePatchCell;
      index = overlapResult.index;
      $(LIBRARIAN_ELEMENT_CLASSES.updatePatchCell).removeClass('librarian-update-patch-cell-pc');
      if (updatePatchCell !== null && helper.offset() !== undefined) {
        var overlapUpdatePatch = Math.abs(updatePatchCell.offset().top - helper.offset().top);
        var parentId = updatePatchCell.parent().attr('id');
        if (overlapUpdatePatch < overlapHeight && overlapUpdatePatch > 2 && parentId !== LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu.replace('#','')) {
          var cell = updatePatchCell.parent();
          $('.sortable-placeholder-pc').attr('style', 'border-bottom:0.1px solid #000000;');
          for (var i = index, length = index + ui.helper.children().length; i < length; i++) {
            updateCellIndexes.push(i);
            cell.children().not('.sortable-placeholder-pc').eq(i).addClass('librarian-update-patch-cell-pc');
          }
        } else {
          $('.sortable-placeholder-pc').removeAttr('style');
        }
      } else {
        $('.sortable-placeholder-pc').removeAttr('style');
      }
      updatePatchCell = null;
    },
    stop: function (event, ui) {
      toLivesetIndex = ui.item.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).index();
      //var assignEventPatches = [];
      var patches = ui.item.multiple;
      var updateCell = $(LIBRARIAN_ELEMENT_CLASSES.updatePatchCell);
      $(LIBRARIAN_ELEMENT_CLASSES.updatePatchCell).removeClass('librarian-update-patch-cell-pc');
      if ('#' + ui.item.parent().attr('id') === LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu) {
        ui.item.parent().sortable('cancel');
        return;
      }
      if (updateCell.length) {
        $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu).sortable('cancel');
        OVERWRITE_PATCH_DIALOG.open(
          function () {
            var targetLiveset = librarianCommonInfo.livesetList[toLivesetIndex];
            if((updateCellIndexes[0]+selectCellIndexes.length) > librarianCommonInfo.maxPatchNum){
              selectCellIndexes = selectCellIndexes.slice(0,librarianCommonInfo.maxPatchNum - updateCellIndexes[0]);
              ERROR_DIALOG_MAP.libraryFull.open();
              return;
            }
            var startIndex = updateCellIndexes[0];
            var overwrite = targetLiveset.rows(librarianCommonInfo.settingMode) - startIndex;
            var selectedCellNum = selectCellIndexes.length;
            librarianServices.importInst(targetLiveset, selectCellIndexes, startIndex, 0,
              function () { // success func
                if (overwrite < selectedCellNum) {
                  var patchArray = [];
                  for (var i = 0; i < selectedCellNum - overwrite; i++) {
                    if((updateCellIndexes[i]+1) == librarianCommonInfo.maxPatchNum){
                      $('.librarian-patch-table-pc').scrollLeft(0);
                      break;
                    }else{
                      var cell = $('<div>');
                      cell.attr('class', 'librarian-patch-cell-pc ui-sortable-handle');
                      //var userPatchName = $(patches[i]).children('.patch-name').html();
                      var patchCell = "<div class='librarian-patch-cell-pc ui-sortable-handle'>";
                      patchCell += "<div class='librarian-serial-num-pc'></div>";
                      patchCell += "<div class='librarian-patch-name-pc'></div>";
                      patchCell += "<div class='librarian-edit-patch-btn-pc' title='Edit'></div>";
                      patchCell += "<input name='librarian-rename-patch-text-pc' ";
                      patchCell += "class='rename-patch-input-text' maxlength='16' type='text' ";
                      patchCell += "value='' style='display:none'/>";
                      patchCell += "<div class='librarian-rename-patch-check-btn-pc' ";
                      patchCell += "style='display:none'></div>";
                      patchCell += "<div class='librarian-delete-patch-btn-pc' ";
                      patchCell += "style='display:none'></div>";
                      cell.append(patchCell);
                      patchArray.push($(patchCell));
                    }
                  }
                  var patchElements = $(LIBRARIAN_ELEMENT_IDS.livesetTable).children().eq(toLivesetIndex).find('.librarian-patch-table-pc').children();
                  var prevElem = patchElements[patchElements.length - 1];
                  for (var i = 0; i < patchArray.length; i++) {
                    var patch = $(patchArray[i]);
                    $(prevElem).after(patch);
                    _patchCellEventHandler(patch, librarianCommonInfo.patchEditing);
                  }
                }
                var currentLivesetCell = $(LIBRARIAN_ELEMENT_IDS.livesetTable).children().eq(toLivesetIndex);
                currentLivesetCell.find('.librarian-patch-num-pc').text(targetLiveset.rows(librarianCommonInfo.settingMode));
                librarianDynamicDOMController.updatePatchTableCell(currentLivesetCell);
                librarianDynamicDOMController.sortablePatchTableCell(currentLivesetCell);
              },
              function () { // error func
                return;
              });
          },
          function () { },
          librarianCommonInfo.confirmOverwrite
          );
      } else {
        var targetLiveset = librarianCommonInfo.livesetList[toLivesetIndex];
        var startIndex = placeholderIndex;
        if (targetLiveset.rows(librarianCommonInfo.settingMode) + selectCellIndexes.length <= librarianCommonInfo.maxPatchNum) {
          librarianServices.importInst(targetLiveset, selectCellIndexes, startIndex, 1,
            function () {
              var patchArray = [];
              for (var i = 0; i < patches.length; i++) {
                var cell = $('<div>');
                cell.attr('class', 'librarian-patch-cell-pc ui-sortable-handle');
                var patchCell = "<div class='librarian-patch-cell-pc ui-sortable-handle'>";
                patchCell += "<div class='librarian-serial-num-pc'></div>";
                patchCell += "<div class='librarian-patch-name-pc'></div>";
                patchCell += "<div class='librarian-edit-patch-btn-pc' title='Edit'></div>";
                patchCell += "<input name='librarian-rename-patch-text-pc' ";
                patchCell += "class='rename-patch-input-text'maxlength='16' type='text' ";
                patchCell += "value='' style='display:none'/>";
                patchCell += "<div class='librarian-rename-patch-check-btn-pc' ";
                patchCell += "style='display:none'></div>";
                patchCell += "<div class='librarian-delete-patch-btn-pc' ";
                patchCell += "style='display:none'></div>";
                cell.append(patchCell);
                patchArray.push($(patchCell));
              }
              patchArray.reverse();
              var patchTable = $(LIBRARIAN_ELEMENT_IDS.livesetTable).children().eq(toLivesetIndex).find(LIBRARIAN_ELEMENT_CLASSES.patchTable);
              var patchElements = patchTable.children();
              var insertIndex = startIndex - 1;
              if (insertIndex > 0) {
                var prevElem = patchElements[insertIndex];
                for (var i = 0; i < patchArray.length; i++) {
                  var patch = $(patchArray[i]);
                  $(prevElem).after(patch);
                  _patchCellEventHandler(patch, librarianCommonInfo.patchEditing);
                }
              } else {
                var nextElem = patchElements[0];
                for (var i = 0; i < patchArray.length; i++) {
                  var patch = $(patchArray[i]);
                  if (nextElem !== undefined) {
                    $(nextElem).before(patch);
                  } else {
                    $(patchTable).append(patch);
                  }
                  _patchCellEventHandler(patch, librarianCommonInfo.patchEditing);
                }
              }
              var currentLivesetCell = $(LIBRARIAN_ELEMENT_IDS.livesetTable).children().eq(toLivesetIndex);
              currentLivesetCell.find('.librarian-patch-num-pc').text(targetLiveset.rows(librarianCommonInfo.settingMode));
              librarianDynamicDOMController.updatePatchTableCell(currentLivesetCell);
              librarianDynamicDOMController.sortablePatchTableCell(currentLivesetCell);
            },
            function () {
              return;
            }
            );
        } else {
          $('.librarian-patch-table-pc').scrollLeft(0);
          ERROR_DIALOG_MAP.libraryFull.open();
        }
        $(LIBRARIAN_ELEMENT_IDS.userPatchSelectMenu).sortable('cancel');
        $(original).on('mousedown.librarian', function (e) {
          _librarianSelectUserPatchEvent(e, $(this));
        });
      }
      $(LIBRARIAN_ELEMENT_CLASSES.patchTable).css('padding', '0px');
    },
    appendTo: LIBRARIAN_ELEMENT_IDS.subPage
  });

  /**
   *  LiveSetのEditボタンhover時の処理
   */
   $(LIBRARIAN_ELEMENT_CLASSES.livesetInfoBlock + ',' + LIBRARIAN_ELEMENT_CLASSES.patchTable).tooltip({
    tooltipClass: "edit-hover"
  });

  /**
   *  LiveSetの名前・Patch数表示エリアを押下時の処理
   */
   $(LIBRARIAN_ELEMENT_CLASSES.livesetInfoBlock).on(pointer.click, function (e) {
    var className = {
      livesetCell: LIBRARIAN_ELEMENT_CLASSES.livesetTableCell,
      selectCell: LIBRARIAN_ELEMENT_CLASSES.livesetTableCellSelect
    }
    $(className.selectCell).removeClass(className.selectCell.slice(1));
    $(this).parents(className.livesetCell).addClass(className.selectCell.slice(1));
  });

  /**
   *  LiveSetのEditボタン押下時の処理
   */
   $(LIBRARIAN_ELEMENT_CLASSES.editLivesetBtn).on(pointer.down, function (e) {
    e.preventDefault();
    e.stopPropagation();
    var selectClassName = LIBRARIAN_ELEMENT_CLASSES.livesetTableCellSelect;
    $(selectClassName).removeClass(selectClassName.slice(1));
    $(this).parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).addClass(selectClassName.slice(1));
    var cell = $(this).parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell);
    _changeLivesetCellMode(1, cell);
  });

  /**
   *  LiveSetのRenameボタン押下時の処理
   */
   $(LIBRARIAN_ELEMENT_CLASSES.renameLivesetCheckBtn).on(pointer.down, function (e) {
    e.preventDefault();
    e.stopPropagation();
    var cell = $(this).parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell);
    _changeLivesetCellMode(0, cell);
  });

  /**
   *  LiveSetのDeleteボタン押下時の処理
   */
   $(LIBRARIAN_ELEMENT_CLASSES.deleteLivesetBtn).on(pointer.down, function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(LIBRARIAN_ELEMENT_CLASSES.patchTable).sortable('enable');
    $(LIBRARIAN_ELEMENT_CLASSES.userPatchTable).sortable('enable');
    $(LIBRARIAN_ELEMENT_IDS.livesetTable).sortable('enable');
    popup_open(LIBRARIAN_ELEMENT_IDS.deleteLivesetDialog.slice(1));
    $(this).parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).addClass('librarian-target-delete-liveset-pc');
  });

  /**
   *   LiveSetのRename InputTextにフォーカスを当てた時の処理
   */
   $(LIBRARIAN_ELEMENT_CLASSES.renameLivesetInputText).on(pointer.down, function (e) {
    e.stopPropagation();
  });

  /**
   *  LiveSetのRename InputTextにフォーカスを当てた状態でEnterを押下時の処理
   */
   $(LIBRARIAN_ELEMENT_CLASSES.renameLivesetInputText).on('keydown', function (e) {
    /** Enterキー押下で変更を確定 */
    if (e.keyCode === 13) {
      var cell = $(this).parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell);
      _changeLivesetCellMode(0, cell);
    }
  });

  /**
   *  Patchテーブル内を押下時の処理
   */
   $(LIBRARIAN_ELEMENT_CLASSES.patchTable).on(pointer.click, function () {
    $(LIBRARIAN_ELEMENT_CLASSES.livesetTableCellSelect).removeClass('librarian-select-liveset-pc');
    var livesetCell = $(this).parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell);
    livesetCell.addClass('librarian-select-liveset-pc');
  });

   _patchCellEventHandler($(LIBRARIAN_ELEMENT_CLASSES.patchCell), librarianCommonInfo.patchEditing);

   _enabledSortable();
 }

/**
 *  PatchCellへのイベント紐づけ
 *  @param {*} patchCell 
 *  @param {*} isPatchEditing 
 */
 function _patchCellEventHandler(patchCell, isPatchEditing) {
  patchCell.on(pointer.down, function (e) {
    librarianCommonInfo.lastSelectPatch = $(this).index();
    _selectPatchCell(e, $(this), isPatchEditing);
  });
  patchCell.on(pointer.click, async function (e) {
    var targetPatchCell = $(this);
    if (!targetPatchCell.hasClass('editedPatch')) {
      await patchMIDIController.sendCommandPreviewMute(1)
      var livesetIndex = targetPatchCell.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).index();
      var currentLiveset = librarianCommonInfo.livesetList[livesetIndex];
      var patchIndex = targetPatchCell.index();
      var currentPatch = currentLiveset.cell(librarianCommonInfo.settingMode, patchIndex);
      var observer = librarianObserver.temporaryWrite(
        function(o) {
          // util.waitForRQ1Reply(ADDRESS_CONST.ADDRESS.CURRENT_PATCH_NUMBER, 2, {
          //   error: function () { },
          //   success: function () {
          //   }
          // });
          previewWrite(currentPatch);
        },
        function(o) {
          // util.waitForRQ1Reply(ADDRESS_CONST.ADDRESS.CURRENT_PATCH_NUMBER, 2, {
          //   error: function () { },
          //   success: function () {
          //   }
          // });
          previewWrite(currentPatch);
        });
      librarianCommonInfo.librarians[librarianCommonInfo.settingMode].cancel();
      librarianCommonInfo.librarians[librarianCommonInfo.settingMode].observers = [];
      librarianCommonInfo.librarians[librarianCommonInfo.settingMode].addObserver(observer);
      librarianCommonInfo.librarians[librarianCommonInfo.settingMode].temporaryWrite(currentPatch, 0);
    }
    function previewWrite(cell) {
      var blockSet = librarianCommonInfo.librarians[librarianCommonInfo.settingMode].config.blockSet;
      var temporarySet = librarianCommonInfo.librarians[librarianCommonInfo.settingMode].config.temporarySet;
      for (var i = 0, len = blockSet.length; i < len; i++) {
        var bid = blockSet[i];
        Parameter.setdata(temporarySet[bid], cell.paramSet[bid]);
      }
      midiConnectionController.readEditor([0], function() {
        setupKnobModFxTargetList();
        setTimeout(() => {
          patchMIDIController.sendCommandPreviewMute(0)
        }, 10);
      }, function () {
        setupKnobModFxTargetList();
        setTimeout(() => {
          patchMIDIController.sendCommandPreviewMute(0)
        }, 10);
      });
    }
  });
  patchCell.children(LIBRARIAN_ELEMENT_CLASSES.editPatchBtn).on(pointer.down, function (e) {
    e.preventDefault();
    e.stopPropagation();
    var cell = $(this).parent();
    _changePatchCellMode(1, cell);
  });
  patchCell.children(LIBRARIAN_ELEMENT_CLASSES.renamePatchCheckBtn).on(pointer.down, function (e) {
    e.preventDefault();
    e.stopPropagation();
    var cell = $(this).parent();
    _changePatchCellMode(0, cell);
  });
  patchCell.find(LIBRARIAN_ELEMENT_CLASSES.renamePatchInputText).on(pointer.down, function (e) {
    librarianCommonInfo.patchEditing = false;
    e.stopPropagation();
  });
  patchCell.find(LIBRARIAN_ELEMENT_CLASSES.renamePatchInputText).on('keydown', function (e) {
    if (e.keyCode === 13) {
      var cell = $(this).parent();
      _changePatchCellMode(0, cell);
    }
  });
  patchCell.find(LIBRARIAN_ELEMENT_CLASSES.deletePatchBtn).on(pointer.down, function (e) {
    e.preventDefault();
    e.stopPropagation();
    librarianCommonInfo.editedPatchCell = [$(this).parent()];
    librarianCommonInfo.patchEditing = false;
    popup_open(LIBRARIAN_ELEMENT_IDS.deletePatchDialog.slice(1));
  });
}

/**
 *  LiveSetに含まれるCell選択時の処理
 *  @param {*} event 
 *  @param {*} patchCell 
 *  @param {*} isPatchEditing 
 */
 function _selectPatchCell(event, patchCell, isPatchEditing) {
  $(LIBRARIAN_ELEMENT_CLASSES.selectUserPatch).removeClass('librarian-select-user-patch-cell');
  var selectPatchCell = $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell);
  if (patchCell.parent().children(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).length !== selectPatchCell.length) {
    _resetSelectPatchCell();
    patchCell.addClass('librarian-select-patch-cell-pc');
  }
  if (event[librarianCommonInfo.disContinuitySelectKey()] && patchCell.parent().hasClass('librarian-patch-table-pc')) {
    if(patchCell.hasClass('librarian-select-patch-cell-pc')) {
      patchCell.removeClass('librarian-select-patch-cell-pc');
    } else {
      patchCell.addClass('librarian-select-patch-cell-pc');
    }
  } else if (event.shiftKey && patchCell.parent().hasClass('librarian-patch-table-pc')) {
    var firstElmIndex = $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).first().index() > 0 ? $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).first().index() : 0;
    var lastElmIndex = $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).last().index() > 0 ? $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).last().index() : 0;
    var startIndex = 0;
    var endIndex = 0;
    if (firstElmIndex < patchCell.index()) {
      startIndex = firstElmIndex;
      endIndex = patchCell.index() + 1;
    } else {
      startIndex = patchCell.index() < lastElmIndex ? patchCell.index() : 0;
      endIndex = lastElmIndex + 1;
    }
    var table = patchCell.parent();
    $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).removeClass('librarian-select-patch-cell-pc');
    for (var index = startIndex, length = endIndex; index < length; index++) {
      table.children().eq(index).addClass('librarian-select-patch-cell-pc');
    }
  } else if (patchCell.hasClass('librarian-select-patch-cell-pc')) {
    patchCell.on(pointer.up, function (e) {
      var className = LIBRARIAN_ELEMENT_CLASSES.selectPatchCell;
      $(className).removeClass(className.slice(1));
      $(this).addClass(className.slice(1));
      $(this).off(pointer.up);
    });
  } else if (patchCell.parent().hasClass('librarian-patch-table-pc')) {
    _resetSelectPatchCell();
    patchCell.addClass('librarian-select-patch-cell-pc');
  } else if (isPatchEditing) {
    _resetSelectPatchCell();
  }
  $(LIBRARIAN_ELEMENT_CLASSES.livesetTableCellSelect).removeClass('librarian-select-liveset-pc');
  var livesetCell = patchCell.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell);
  livesetCell.addClass('librarian-select-liveset-pc');
}

/**
 *  LiveSetセルの選択状態の解除
 */
 function _resetSelectLivesetCell() {
  $(LIBRARIAN_ELEMENT_CLASSES.livesetTableCellSelect).removeClass('librarian-select-liveset-pc');
}

/**
 *  Patchセルの選択状態の解除
 */
 function _resetSelectPatchCell() {
  $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell).removeClass('librarian-select-patch-cell-pc');
}

/**
 *  Sortableの無効化
 */
 function _disabledSortable() {
  $(LIBRARIAN_ELEMENT_CLASSES.patchTable).sortable('disable');
  $(LIBRARIAN_ELEMENT_CLASSES.userPatchTable).sortable('disable');
  $(LIBRARIAN_ELEMENT_IDS.livesetTable).sortable('disable');
}

/**
 *  Sortableの有効化
 */
 function _enabledSortable() {
  $(LIBRARIAN_ELEMENT_CLASSES.patchTable).sortable('enable');
  $(LIBRARIAN_ELEMENT_CLASSES.userPatchTable).sortable('enable');
  $(LIBRARIAN_ELEMENT_IDS.livesetTable).sortable('enable');
}

/**
 *  Liveset Cell の通常モード、編集モード切替
 *  @param {int} mode 0: normal, 1: edit
 *  @param {*} cell モード切り替える要素
 */
 function _changeLivesetCellMode(mode, cell) {
  _resetSelectPatchCell();
  _disabledSortable();
  var cellName = LIBRARIAN_ELEMENT_CLASSES.livesetName;
  var editBtn = LIBRARIAN_ELEMENT_CLASSES.editLivesetBtn;
  var renameInputText = LIBRARIAN_ELEMENT_CLASSES.renameLivesetInputText;
  var checkBtn = LIBRARIAN_ELEMENT_CLASSES.renameLivesetCheckBtn;
  var deleteBtn = LIBRARIAN_ELEMENT_CLASSES.deleteLivesetBtn;
  var livesetIndex = cell.index();
  var currentLiveset = librarianCommonInfo.livesetList[livesetIndex];
  if (mode === 0) {
    var inputText = cell.find(renameInputText).val();
    inputText = util.convert2AsciiOnlyStr(inputText).slice(0, 64);
    if(inputText.trim() == ''){
      return;
    }
    currentLiveset.setTitle(inputText.trim());
    librarianServices.saveToStorage2(currentLiveset);
    cell.find(cellName).text(inputText);
    cell.removeClass('editedLiveset');
    _enabledSortable();
    cell.children(LIBRARIAN_ELEMENT_CLASSES.livesetInfo).show();
    _changeCellStatus(cell, cellName, editBtn, renameInputText, checkBtn, deleteBtn, mode);
    librarianDynamicDOMController.updateLivesetTableCell();
  } else {
    var editedPatchCell = cell.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTable).find('.editedLiveset');
    if (editedPatchCell !== undefined) {
      editedPatchCell.removeClass('editedLiveset');
      editedPatchCell.find(LIBRARIAN_ELEMENT_CLASSES.livesetInfo).show();
      _changeCellStatus(editedPatchCell, cellName, editBtn, renameInputText, checkBtn, deleteBtn, 0);
    }
    cell.addClass('editedLiveset');
    cell.find(LIBRARIAN_ELEMENT_CLASSES.livesetInfo).hide();
    cell.find(renameInputText).val(currentLiveset.title());
    _changeCellStatus(cell, cellName, editBtn, renameInputText, checkBtn, deleteBtn, mode);
  }
}

/**
 *  Patch Cell の通常モード、編集モード切替
 *  @param {int} mode 0: normal, 1: edit
 *  @param {*} cell モード切り替える要素
 */
 function _changePatchCellMode(mode, cell) {
  _resetSelectPatchCell();
  _disabledSortable();
  var cellName = LIBRARIAN_ELEMENT_CLASSES.patchName;
  var editBtn = LIBRARIAN_ELEMENT_CLASSES.editPatchBtn;
  var renameInputText = LIBRARIAN_ELEMENT_CLASSES.renamePatchInputText;
  var checkBtn = LIBRARIAN_ELEMENT_CLASSES.renamePatchCheckBtn;
  var deleteBtn = LIBRARIAN_ELEMENT_CLASSES.deletePatchBtn;
  var livesetIndex = cell.parents(LIBRARIAN_ELEMENT_CLASSES.livesetTableCell).index();
  var currentLiveset = librarianCommonInfo.livesetList[livesetIndex];
  var patchIndex = cell.index();
  if (mode === 0) {
    var inputText = cell.children(renameInputText).val();
    inputText = util.convert2AsciiOnlyStr(inputText).slice(0, 16);
    currentLiveset.setValue(librarianCommonInfo.settingMode, patchIndex, 0, inputText);
    librarianServices.saveToStorage2(currentLiveset);
    cell.find(cellName).text(inputText);
    cell.removeClass('editedPatch');
    librarianCommonInfo.patchEditing = false;
    _enabledSortable();
    _changeCellStatus(cell, cellName, editBtn, renameInputText, checkBtn, deleteBtn, mode);
  } else {
    librarianCommonInfo.patchEditing = true;
    var editedLivesetCell = cell.parents(LIBRARIAN_ELEMENT_IDS.livesetTable).find('.editedPatch');
    if (editedLivesetCell.length) {
      _changeCellStatus(editedLivesetCell, cellName, editBtn, renameInputText, checkBtn, deleteBtn, 0);
    }
    cell.addClass('editedPatch');
    cell.children(renameInputText).val(currentLiveset.value(librarianCommonInfo.settingMode, patchIndex, 0).trim());
    _changeCellStatus(cell, cellName, editBtn, renameInputText, checkBtn, deleteBtn, mode);
  }
}

/**
 *  Cellの状態の変更
 *  @param {*} cell 対象のDOM
 *  @param {string} cellName 対象セルの名前要素のid
 *  @param {string} editBtn 対象セルのeditボタンのid
 *  @param {string} renameInputText 対象セルのrename input textのid
 *  @param {string} checkBtn 対象セルのチェックボタンのid
 *  @param {string} deleteBtn 対象セルのdeleteボタンのid
 *  @param {int} mode 0: normal, 1: edit
 */
 function _changeCellStatus(cell, cellName, editBtn, renameInputText, checkBtn, deleteBtn, mode) {
  if (mode === 0) {
    cell.find(cellName).show();
    cell.find(editBtn).show();
    cell.find(renameInputText).hide();
    cell.find(checkBtn).hide();
    cell.find(deleteBtn).hide();
  } else {
    cell.find(cellName).hide();
    cell.find(editBtn).hide();
    cell.find(renameInputText).show();
    cell.find(checkBtn).show();
    cell.find(deleteBtn).show();
  }
}

/**
 *  Librarian キーボード押下時のイベント
 *  @param {*} event
 */
 function _librarianKeyDownEventHandler(event) {
  event.stopPropagation();
  var selectPatches = $(LIBRARIAN_ELEMENT_CLASSES.selectPatchCell);
  var selectClassName = LIBRARIAN_ELEMENT_CLASSES.selectPatchCell.slice(1);
  var num = 1;
  if (!selectPatches.length) {
    selectPatches = $(LIBRARIAN_ELEMENT_CLASSES.selectUserPatch).not('input');
    selectClassName = LIBRARIAN_ELEMENT_CLASSES.selectUserPatch.slice(1);
    num = 2
  }
  var editMode = librarianCommonInfo.patchEditing;
  if (event.shiftKey) {
    var patchTable = selectPatches.parent();
    var index = librarianCommonInfo.lastSelectPatch ? librarianCommonInfo.lastSelectPatch : null;
    var valid = false;
    var targetIndex = null;
    var prevPatchIndex = null;
    var nextSelectIndex = null;
    var remSelectIndex = index;
    if (event.keyCode === 38 && selectPatches.length > 0) { //↑押下時
      targetIndex = index - num;
      valid = index > -1;
      nextSelectIndex = index - num;
      prevPatchIndex = index + num;
      event.keyCode = 0;
    } else if (event.keyCode === 40 && selectPatches.length > 0) { //↓押下時
      targetIndex = index + num;
      valid = index < (patchTable.children().length);
      nextSelectIndex = index + num;
      prevPatchIndex = index - num;
      event.keyCode = 0;
    }
    if (valid && nextSelectIndex > -1 && nextSelectIndex < patchTable.children().length) {
      librarianCommonInfo.lastSelectPatch = targetIndex;
      var targetPatch = patchTable.children().eq(targetIndex);
      var prevPatch = patchTable.children().eq(prevPatchIndex);
      var nextSelectPatch = null;
      var remSelectPatch = null;
      if (nextSelectIndex !== null && remSelectIndex > -1) {
        nextSelectPatch = patchTable.children().eq(nextSelectIndex);
        remSelectPatch = patchTable.children().eq(remSelectIndex);
      }
      if (nextSelectPatch !== null && nextSelectPatch.hasClass(selectClassName) && !prevPatch.hasClass(selectClassName)) {
        remSelectPatch.removeClass(selectClassName);
      }
      if (targetIndex !== null && !targetPatch.hasClass(selectClassName)) {
        targetPatch.addClass(selectClassName);
      }
    }
  } else if (!editMode && (event.keyCode === 8 || event.keyCode === 46) && selectPatches.length > 0) {
    if ($(document.activeElement).parent().hasClass('elf-text-input-control')) {
      return;
    }
    if (!$(LIBRARIAN_ELEMENT_CLASSES.selectUserPatch).length) {
      var patchArray = [];
      for (var i = 0; i < selectPatches.length; i++) {
        patchArray.push($(selectPatches[i]));
      }
      librarianCommonInfo.editedPatchCell = patchArray;
      popup_open(LIBRARIAN_ELEMENT_IDS.deletePatchDialog.slice(1));
    }
  } else if (event['altKey']) {
    librarianCommonInfo.selectKeyPressed = true;
  }
  return false;
}


/**
 *  LIBRARIAN画面 キーボードから手を離した時のイベント
 *  @param {*} event 
 */
 function _librarianKeyUpEventHandler(event) {
  event.stopPropagation();
  if (!event['altKey']) {
    librarianCommonInfo.selectKeyPressed = false;
  }
}

/**
 *  Patchの上書き判定
 *  @param {*} before palceholderの前のcell
 *  @param {*} after palceholderの後のcell
 *  @param {*} helper helper要素
 *  @param {int} overlapHeight overlap判定の高さ
 *  @return {object} updatePatchCell: update対象のcell, index: update対象のcellのindex
 */
 function _overlapPatchCell(before, after, helper, overlapHeight) {
  var result = { updatePatchCell: null, index: null };

  if (before.offset() !== undefined && after.offset() !== undefined) {
    var beforeTop = before.offset().top;
    var afterTop = after.offset().top;
    var helperTop = helper.offset().top;

    var beforeCellOverlap = Math.abs(beforeTop - helperTop);
    var afterCellOverlap = Math.abs(afterTop - helperTop);

    if (beforeCellOverlap < afterCellOverlap) {
      result.updatePatchCell = before;
      result.index = before.index();
    } else {
      result.updatePatchCell = after;
      result.index = after.index() - 1;
    }
  } else if (before.offset() !== undefined) {
    result.updatePatchCell = before;
    result.index = before.index();
  } else if (after.offset() !== undefined) {
    result.updatePatchCell = after;
    result.index = after.index() - 1;
  }
  return result;
}

/**
 *  選択されたUSER PATCHに関するイベント
 *  @param {*} userPatchCell 選択されたUserPatch
 *  @return {*}
 */
 function _librarianSelectUserPatch(e, userPatchCell) {
  var selectClassName = {
    userPatch: LIBRARIAN_ELEMENT_CLASSES.selectUserPatch,
    patch: LIBRARIAN_ELEMENT_CLASSES.selectPatchCell,
    liveset: LIBRARIAN_ELEMENT_CLASSES.livesetTableCellSelect
  };
  $(selectClassName.patch).removeClass(selectClassName.patch.slice(1));
  $(selectClassName.liveset).removeClass(selectClassName.liveset.slice(1));
  if (event[librarianCommonInfo.disContinuitySelectKey()]) {
    if(userPatchCell.hasClass(selectClassName.userPatch.slice(1))) {
      userPatchCell.removeClass(selectClassName.userPatch.slice(1));
    } else {
      userPatchCell.addClass(selectClassName.userPatch.slice(1));
    }
  } else if (e.shiftKey) {
    userPatchCell.addClass(selectClassName.userPatch.slice(1));
    var firstElmIndex = $(selectClassName.userPatch).first().index() > 0 ? $(selectClassName.userPatch).first().index() : 0;
    var lastElmIndex = $(selectClassName.userPatch).last().index() > 0 ? $(selectClassName.userPatch).last().index() : 0;
    var startIndex = 0;
    var endIndex = 0;
    if (firstElmIndex < userPatchCell.index()) {
      startIndex = firstElmIndex;
      endIndex = userPatchCell.index() + 1;
    } else {
      startIndex = userPatchCell.index() < lastElmIndex ? userPatchCell.index() : 0;
      endIndex = lastElmIndex + 1;
    }
    var table = userPatchCell.parent();
    $(selectClassName.userPatch).removeClass(selectClassName.userPatch.slice(1));
    for (var index = startIndex, length = endIndex; index < length; index++) {
      table.children().eq(index).addClass(selectClassName.userPatch.slice(1));
    }
  } else if (userPatchCell.hasClass(selectClassName.userPatch.slice(1))) {
    userPatchCell.on(pointer.up, function(e) {
      $(selectClassName.userPatch).removeClass(selectClassName.userPatch.slice(1));
      $(this).addClass(selectClassName.userPatch.slice(1));
      $(this).off(pointer.up);
    });
  } else {
    $(selectClassName.userPatch).removeClass(selectClassName.userPatch.slice(1));
    userPatchCell.addClass(selectClassName.userPatch.slice(1));
  }
}

/**
 *  選択されたUSER PATCHに対する処理
 *  @param {*} userPatch 
 */
 function _librarianSelectUserPatchEvent(e, userPatch) {
  librarianCommonInfo.lastSelectPatch = userPatch.index();
  _librarianSelectUserPatch(e, userPatch);
}