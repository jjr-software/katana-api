

(function () {
  window.listTypeEffect = [
    {id: 'bst',     label: "BOOSTER",     selectBox: 'booster-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'mod',     label: "MOD",         selectBox: 'modfx-mod-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'fx',      label: "FX",          selectBox: 'modfx-mod-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'dly1',     label: "DELAY",       selectBox: 'delay-delay1-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'dly2',    label: "DELAY2",      selectBox: 'delay-delay2-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'rev',     label: "REVERB",      selectBox: 'reverb-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'pdl',     label: "PEDAL FX",    selectBox: 'pedalfx-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'eq',      label: "EQ",          selectBox: 'eq-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'eq2',     label: "EQ2",         selectBox: 'eq2-type-select-box', defaultWidth: 60, defaultImg: 'images/chain/effectblock_default@2x.png', typeLists: []},
    {id: 'sr',     label:  "SEND RETURN", selectBox: '', defaultWidth: 60, defaultImg: 'images/chain/effectblock_sr@2x.png', typeLists: []},
    {id: 'amp',     label: "AMP",         selectBox: '', defaultWidth: 135, defaultImg: 'images/chain/effectblock_amp@2x.png', typeLists: []}
  ]

  var fs = $native.fs;

  let prefDir;
  let pathDirIcon;
  let pathDirCustom;

  function mkdirIconSetting() {
    try {
      const prefDir = fs.path('library') + 'pref/';
      const pathDirIcon = prefDir + "icon/";
      const pathDirCustom = pathDirIcon + "custom/";
      fs.mkdir(prefDir);
      fs.mkdir(pathDirIcon);
      fs.mkdir(pathDirCustom);

      return {
        prefDir,
        pathDirIcon,
        pathDirCustom
      }
    } catch {
      return {
        prefDir: '',
        pathDirIcon: '',
        pathDirCustom: ''
      }
    }
  }

  const pathsIcon = mkdirIconSetting();
  prefDir = pathsIcon.prefDir;
  pathDirIcon = pathsIcon.pathDirIcon;
  pathDirCustom = pathsIcon.pathDirCustom;

  window.iconSettingController = {
    updateDataIcon: function() {
      let iconData = $native.app.storage2('iconData');
      if(iconData) {
        iconData = JSON.parse(iconData);
        listTypeEffect = listTypeEffect.map(function(item) {
          item.typeLists = iconData.find(iconItem => iconItem.id == item.id).typeLists;
          return item;
        });
      } else {
        $.each(listTypeEffect, function(index, Type) {
          let typeLists = []; 
          $.each($("#" + Type.selectBox + "-box").find("a").map(function(index) {
            typeLists.push({'id': index, 'typeName' : $(this).text().trim(), 'img': null});
          }));
          listTypeEffect[index].typeLists = typeLists;
        });
      }

      setTimeout(function() {
          chainModelController.updateChainList();
      }, 1000);

      setTimeout(function() {
        iconSettingController.createInitDom();
      }, 1000);
    },
    createInitDom: function() {
      $.each(listTypeEffect.filter(item => item.id != "sr" && item.id != "amp"), function(index, Type) {
          let dom = $('<div>')
            .attr('class', 'icon-type-group')
            .attr('id', 'icon-type-' + Type.id)
            .attr('typeId', Type.id)
            .append(`<p class="icon-type-name">${Type.label}</p><div class="icon-type-list" id="icon-type-list-${Type.id}"></div>`);
          let typeLists = Type.typeLists;

          $.each(typeLists, function(i, typeItem) {
            let typeItemDom = $('<div>')
                .attr('class', 'icon-type-item')
                .attr('id', `icon-type-item-${Type.id}-${typeItem.id}`)
                .append(`<div class="icon-item-img"><img src="${typeItem.img ? typeItem.img : Type.defaultImg}" style="background: ${updateBackground(index, typeItem.typeName)}" onerror="updateErrorImg('${Type.defaultImg}', event)" /></div>`)
                .append(`<div class="icon-item-name">${typeItem.typeName}</div>`)
                .append('<input name="icon-item-file" class="icon-item-file" type="text" value="">')
                .append('<div class="icon-item-file-edit-btn" title="Edit">&nbsp;</div>')
                .append(`<div class="icon-item-file-change"><input type="text" readonly class="icon-item-file-name" value="${typeItem.img ? getFileName(typeItem.img) : '(USE DEFAULT)'}"><div class="icon-item-file-confirm-btn" style="display:none;" ></div><div class="icon-item-file-delete-btn" style="display:none;"></div></div>`)
                dom.find('.icon-type-list').append(typeItemDom);
          });

          $("#icon-setting-list-frame").append(dom);
      });
      $native.app.storage2('iconData', JSON.stringify(listTypeEffect));
    },
    assignInitEvent: function() {
      iconSettingController.updateDataIcon();

      $('#app-container').on(pointer.down, ".icon-item-file-edit-btn", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).parents(".icon-type-item").find(".icon-item-file-change").addClass("editMode");
        $(this).hide();
      });

      $('#app-container').on(pointer.click, ".icon-item-file-name", function (e) {
        e.preventDefault();
        let filenameObj = $(this);

        if(filenameObj.parent().hasClass("editMode")) {
          const extension = ProductSetting.extension.iconSetting;
          fs.event.openfilename = function(file) {
            if (file) {
              try {
                try {
                  const fileName = getFileName(file);
                  filenameObj.val(fileName);
                  filenameObj.parents(".icon-type-item").find(".icon-item-img img").attr("src", file);
                  filenameObj.parents(".icon-type-item").find('.icon-item-file').val(file);
                } catch (e) {
                  ERROR_DIALOG_MAP.unsupportedData.open();
                  return;
                }
              } catch (e) {
                ERROR_DIALOG_MAP.fileError.open();
                return;
              }
            }
          };
          fs.openfilename(extension);
        }
      });

      // save image
      $('#app-container').on(pointer.click, ".icon-item-file-confirm-btn", function (e) {
        e.preventDefault();
        let iconItem = $(this).parents(".icon-type-item");
        let from = iconItem.find('.icon-item-file').val();
        let effectId = iconItem.parents(".icon-type-group").attr("typeId");
        let effectIndex = listTypeEffect.findIndex(item => item.id == effectId);
        let typeName = iconItem.find(".icon-item-name").text();
        let typeIndex = listTypeEffect[effectIndex].typeLists.findIndex(item => item.typeName == typeName);
        if (from) {
          try {
            let fileName = getFileName(from);
            deleteImage(effectId, typeName, function (iconDir) {
              const to = formatPath(iconDir + fileName);
              fs.copy(from, to);
              let iconWidth = iconItem.find(".icon-item-img img")[0].naturalWidth * 78 / iconItem.find(".icon-item-img img")[0].naturalHeight;
              listTypeEffect[effectIndex].typeLists[typeIndex].img = to;
              listTypeEffect[effectIndex].typeLists[typeIndex].iconWidth = Math.round(iconWidth + 10);
              $native.app.storage2('iconData', JSON.stringify(listTypeEffect));
              //update chain
              chainModelController.checkUpdateChainIcon(effectId, typeName);

              if (to) {
                iconItem.find(".icon-item-img img").attr("src", to + '?' + new Date().getTime());
              } else {
                iconItem.find(".icon-item-img img").attr("src", listTypeEffect[effectIndex].defaultImg);
              }
            });
          } catch (e) {
            ERROR_DIALOG_MAP.fileError.open();
            return;
          }
        }

        closeEditMode($(this));
      });

      // delete and set to default
      $('#app-container').on(pointer.click, ".icon-item-file-delete-btn", function (e) {
        e.preventDefault();
        //set default image to item
        let iconItem = $(this).parents(".icon-type-item");
        let effectId = iconItem.parents(".icon-type-group").attr("typeId");
        let effectIndex = listTypeEffect.findIndex(item => item.id == effectId);
        let typeName = iconItem.find(".icon-item-name").text();
        let typeIndex = listTypeEffect[effectIndex].typeLists.findIndex(item => item.typeName == typeName);
        listTypeEffect[effectIndex].typeLists[typeIndex].img = null;
        listTypeEffect[effectIndex].typeLists[typeIndex].iconWidth = null;
        iconItem.find(".icon-item-file-name").val("(USE DEFAULT)");
        iconItem.find(".icon-item-img img").attr("src", listTypeEffect[effectIndex].defaultImg);
        try {
          deleteImage(effectId, typeName);
        } catch(e) {
          ERROR_DIALOG_MAP.fileError.open();
          return;
        }
        $native.app.storage2('iconData', JSON.stringify(listTypeEffect));
        chainModelController.checkUpdateChainIcon(effectId, typeName);
        //close editmode
        closeEditMode($(this));
      });
    },
  };

  window.initializeIconSetting = function () {
    iconSettingController.assignInitEvent();
  };

  function getFileName(path, json) {
    // var regex = /\\([^\\]+)$/;  // Match the last part after the last backslash
    // var match = path.match(regex);

    // if (match) {
    //   return match[1];
    // }
    // return undefined;

    const url = path.replace(/\\/g,'/');
    const array = url.split('/');
    // var fileName = array[array.length-1].split(/\.(?=[^.]+$)/)[0];
    const fileName = array[array.length-1];
    // if (! fileName.match(/^[\x20-\x7e]*$/)) return undefined;
    if (!fileName) return undefined;
    return fileName;
  };

  function formatPath(path) {
    const url = path.replace(/\\/g,'/');

    return url;
  }

  function closeEditMode(editObj) {
    editObj.parents(".icon-type-item").find('.icon-item-file').val("");
    editObj.parents(".icon-type-item").find(".icon-item-file-change").removeClass("editMode");
    editObj.parents(".icon-type-item").find(".icon-item-file-edit-btn").show();
  }

  function updateBackground(index, typeName) { 
    if (index < 3) {
      return CHAIN_COLOR_SWITCH[index].colors.find((x) => 
              x.type.includes(typeName)).color;
    } else {
      return CHAIN_COLOR_SWITCH[index].colors[0].color
    }
  }

  function deleteImage(effectId, typeName, callback) {
    try {
      let effectName = listTypeEffect.find(item => item.id == effectId).label;
      fs.mkdir(pathDirCustom + effectName + "/");
      fs.mkdir(pathDirCustom + effectName + "/" + typeName + "/");
  
      let iconDir = pathDirCustom + effectName + "/" + typeName + "/";
      let prefContent = fs.contents(iconDir);
      prefContent.forEach(item => {
        fs.unlink(iconDir + item.name); //delete all image exist
      })

      if (typeof callback == 'function') {
        callback(iconDir);
      }
      return iconDir;
    } catch (error) {
      throw new Error('Operation failed.');
    }
  }

  window.updateErrorImg = function(defaultImg, event) {
    //set default image to item
    let iconItem = $(event.target).closest(".icon-type-item");
    let effectId = iconItem.parents(".icon-type-group").attr("typeId");
    let effectIndex = listTypeEffect.findIndex(item => item.id == effectId);
    let typeName = iconItem.find(".icon-item-name").text();
    let typeIndex = listTypeEffect[effectIndex].typeLists.findIndex(item => item.typeName == typeName);
    listTypeEffect[effectIndex].typeLists[typeIndex].img = null;
    listTypeEffect[effectIndex].typeLists[typeIndex].iconWidth = null;
    iconItem.find(".icon-item-file-name").val("(USE DEFAULT)");
    iconItem.find(".icon-item-img img").attr("src", defaultImg);
    $native.app.storage2('iconData', JSON.stringify(listTypeEffect));
    chainModelController.checkUpdateChainIcon(effectId, typeName);
  }
})();
