var http = $native.http;
var fs = $native.fs;

var URL_TIPS = null;
var DEFAULT_LANGUAGE = 'en'

//const dirTips = null;//makeDirTips();
var dirTips = null;

var langStr = DEFAULT_LANGUAGE;


var tipsVersion = 1;
var variationCntTemp = [];

function makeDirTips()  {
  try {
    const prefDir = fs.path('library') + 'pref/';
    fs.mkdir(prefDir);
    fs.mkdir(prefDir + "tips/");
    fs.mkdir(prefDir + "tips_image/");

    const _tipsHtmlDir = prefDir + "tips/" + langStr + "/";
    fs.mkdir(_tipsHtmlDir);

    const _tipsImgDir = prefDir + "tips_image/" ;

    return {
      tipsHtmlDir: _tipsHtmlDir,
      tipsImgDir: _tipsImgDir,
    }
  } catch (error) {
    // console.log(error);
    return {
      tipsHtmlDir: '',
      tipsImgDir: '',
    }
  }
}

function BTSTipsController() {
  this.isTipsReady = false;
  this.htmlLoaded = [];
  this.tipsViews = [
    { page: "EDIT", block: "CHAIN",      typeSelect: "",                             contentFrame: "main-chain-frame-1",    multiFrame: false },
    { page: "EDIT", block: "BOOSTER",    typeSelect: "booster-type-select-box",      contentFrame: "booster-content-page",  multiFrame: false },
    { page: "EDIT", block: "FX",         typeSelect: "modfx-mod-type-select-box",    contentFrame: "modfx-content-frame",   multiFrame: true  }, // i.e. MOD
    { page: "EDIT", block: "FX",         typeSelect: "modfx-fx-type-select-box",     contentFrame: "modfx-content-frame",   multiFrame: true  },
    { page: "EDIT", block: "DELAY",      typeSelect: "delay-delay1-type-select-box", contentFrame: "delay-content-frame",   multiFrame: true  },
    { page: "EDIT", block: "DELAY",      typeSelect: "delay-delay2-type-select-box", contentFrame: "delay-content-frame",   multiFrame: true  }, // i.e. DELAY2 
    { page: "EDIT", block: "REVERB",     typeSelect: "reverb-type-select-box",       contentFrame: "reverb-content-frame",  multiFrame: true  },
    { page: "EDIT", block: "SOLO",       typeSelect: "",                             contentFrame: "solo-content-page",     multiFrame: false },
    { page: "EDIT", block: "CONTOUR",    typeSelect: "" ,                            contentFrame: "editor-contour-page",   multiFrame: false },
    { page: "EDIT", block: "PEDAL FX",   typeSelect: "pedalfx-type-select-box",      contentFrame: "pedalfx-content-frame", multiFrame: true  },
    { page: "EDIT", block: "EQ",         typeSelect: "",                             contentFrame: "eq-content-frame",      multiFrame: true  },
    { page: "EDIT", block: "EQ",         typeSelect: "",                             contentFrame: "eq2-content-frame",     multiFrame: true  }, // i.e. EQ2
    { page: "EDIT", block: "NS",         typeSelect: "" ,                            contentFrame: "ns-content-page",       multiFrame: false },
    { page: "EDIT", block: "SEND/RETURN",typeSelect: "",                             contentFrame: "sr-content-page",       multiFrame: false },
  ]
}

const BTS_SERVICE_TIMEOUT_MSEC = 15000;
BTSTipsController.prototype.SortDefTable = function () {
  // sort online TIPS_DEF by variation
  $.each(TIPS_DEF.TIPS_TABLE, function (index, tipDetail) {
    tipDetail[1] = tipDetail[1].sort((a, b) => b[3] - a[3]); // i.e. VARIATION (9 .. 0)
    tipDetail[1] = tipDetail[1].sort((a, b) => { var idx = 2; return a[idx] < b[idx] ? -1 : 1; }); // i.e. TYPE      (a .. b)
    tipDetail[1] = tipDetail[1].sort((a, b) => { var idx = 1; return a[idx] < b[idx] ? -1 : 1; }); // i.e. BLOCK     (a .. b)
    tipDetail[1] = tipDetail[1].sort((a, b) => { var idx = 0; return a[idx] < b[idx] ? -1 : 1; }); // i.e. PAGE      (a .. b)
  });
}
BTSTipsController.prototype.loadTips = function (urlTips, dataType, successFunc, errorFunc, completeFunc) {
  $.ajax({
    url: urlTips,
    type: 'GET',
    timeout: BTS_SERVICE_TIMEOUT_MSEC,
    dataType,
    success: function (obj) {
      if (typeof successFunc == 'function') {
        successFunc(obj);
      }
    },
    error: function () {
      if (typeof errorFunc == 'function') {
        errorFunc();
      }
    },
    complete: function () {
      if (typeof completeFunc == 'function') {
        completeFunc();
      }
    }
  });
};

BTSTipsController.prototype.loadTipsLocal = function (urlTips) {
  try {
    // ----------------------------------------
    // load tipsdef.js
    // ----------------------------------------
    this.loadTips(

      urlTips.domain + "js/" + urlTips.def,
      'script',

      // success function
      (obj) => {
        this.SortDefTable(); // sort online TIPS_DEF by variation
        let onlineData = TIPS_DEF;
        //load from storage
        let localData = $native.app.storage2('tipsdef');
        if (localData && localData == JSON.stringify(onlineData)) {
          window.TIPS_DEF = JSON.parse(localData);
        } else {
          window.TIPS_DEF = JSON.stringify(onlineData);
          $native.app.storage2('tipsdef', JSON.stringify(onlineData)); // update storage
        }
      },

      // error function
      () => {
      //load from storage if no data on the server
        let localData = $native.app.storage2('tipsdef');
        if (localData) {
          window.TIPS_DEF = JSON.parse(localData);
        }
      },

      // complete function
      () => {
        // ----------------------------------------
        // load tipsapi.js
        // ----------------------------------------
        this.loadTips(
          
          urlTips.domain + "js/" + urlTips.api,
          'text',
        
          // success function
          (obj) => {
            let onlineData = obj;
            var localData = null;

            //load from storage
            try {
              var pathTips = fs.path('library') + 'pref/';
              let tipsContent = fs.contents(pathTips);
              if (tipsContent.findIndex(item => item.name == 'tipsapi.js') != -1) {
                // this.loadTips(pathTips + "tipsapi.js");
                localData = fs.readString(pathTips + "tipsapi.js")
                //$.globalEval(scriptContent);
              }
            } catch (error) {
              // console.log(error);
            }

            if (localData && localData == onlineData) {
              $.globalEval(localData);
            } else {
              $.globalEval(onlineData);
            }

            let tipsApi = new TipsApi();
            langStr = tipsApi.GetLanguageStr();
            tipsVersion = tipsApi.GetVersion();
            dirTips = makeDirTips();

            if (localData && localData == onlineData) {
              
            } else {
              fs.writeString(pathTips + "tipsapi.js", onlineData);
            }
          },
        
          // error
          () => {
            //load from storage if no data on the server
            var localData = null;
            try {
              var pathTips = fs.path('library') + 'pref/';
              let tipsContent = fs.contents(pathTips);
              if (tipsContent.findIndex(item => item.name == 'tipsapi.js') != -1) {
                // this.loadTips(pathTips + "tipsapi.js");
                localData = fs.readString(pathTips + "tipsapi.js")
                //$.globalEval(scriptContent);
              }
            } catch (error) {
              // console.log(error);
            }
            if (localData) {
              $.globalEval(localData);

              let tipsApi = new TipsApi();
              langStr = tipsApi.GetLanguageStr();
              tipsVersion = tipsApi.GetVersion();
              dirTips = makeDirTips();
            }
          }
        );
        
      },
    );

    // ----------------------------------------
  } catch (e) {
    // console.log(e.message);
  }
};

BTSTipsController.prototype.waitForTipsJsLoaded = function (successFunc) {
  var self = this;
  var maxAttempts = 50;
  var attempts = 0;

  function isTipsJsLoaded() {
    return typeof TipsApi === 'function' && typeof TIPS_DEF !== 'undefined' && TIPS_DEF !== null;
  }
  function checkTipsJsLoaded() {
    if (isTipsJsLoaded()) {
      self.isTipsReady = true;
      successFunc();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkTipsJsLoaded, 100);
    } else {
    }
  }
  checkTipsJsLoaded();
}

BTSTipsController.prototype.loadContentHtml = function (url, tipsItemArr, fileName, successFunc, errorFunc) {
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'html',
    timeout: BTS_SERVICE_TIMEOUT_MSEC,
    success: function (data) {
      if (typeof successFunc == 'function') {
        successFunc(data, url, fileName, tipsItemArr);
      }
    },
    error: function (e) {
      if (typeof errorFunc == 'function') {
        errorFunc(fileName, tipsItemArr);
      }
    }
  });
};

BTSTipsController.prototype.tipsImgLoaded = function(src, fullPath, fileName, tipsItemArr) {
  const self = this;
  try {
    let tipsImgDir = dirTips.tipsImgDir;
    if (tipsItemArr.length <= 3) return;
    const page = tipsItemArr[0];
    const block = tipsItemArr[1];
    const type = tipsItemArr[2];
    const variation = tipsItemArr[3];
    let imgPageDir = tipsImgDir + page + "/";
    fs.mkdir(imgPageDir);
    let imgBlockDir = block !== "" ? imgPageDir + block + "/" : imgPageDir;
    fs.mkdir(imgBlockDir);
    let imgTypeDir = type !== "" ? imgBlockDir + type + "/" : imgBlockDir;
    fs.mkdir(imgTypeDir);
    let imgVariationDir = variation !== "" ? imgTypeDir + variation + "/" : imgTypeDir;
    fs.mkdir(imgVariationDir);

    let tipsVariationDir = self.createTipsVariationDir(page, block, type, variation);
    let htmlLoadedIndex = self.getTipsContentIndex(this.htmlLoaded, page, block, type, variation);

    let origin = "Local";
    if (fullPath.startsWith("https://")) {
        origin = "HTTPS";
    } else if (fullPath.startsWith("http://")) {
        origin = "HTTP";
    }
    let imgName = fullPath.substring(fullPath.lastIndexOf('/') + 1)
    let imgContent = fs.contents(imgVariationDir);

    var targetPath = urlDefinition.TIPS_DOMAIN;
    if (origin != "Local" || fullPath.includes(targetPath)) {
      if (imgContent.findIndex(item => item.name == imgName) != -1) {
        fs.unlink(imgVariationDir + imgName);
      }

      if(origin != "Local") {
        http.download(src, imgVariationDir + imgName);
      } else {
        fs.copy(fullPath.replace("file:///", ""), imgVariationDir + imgName);
      }

      // update content html
      let htmlContents = fs.contents(tipsVariationDir);
      if (htmlContents.findIndex(item => item.name == fileName) != -1) {
        let localContentHtml = fs.readString(tipsVariationDir + fileName);
        let newContentHtml = localContentHtml.replace(src, imgVariationDir + imgName);
        fs.writeString(tipsVariationDir + fileName, newContentHtml);

        if(htmlLoadedIndex >= 0 && htmlLoadedIndex < self.htmlLoaded.length) {
          self.htmlLoaded[htmlLoadedIndex].content = newContentHtml;
        };
      }
    }
  } catch (error) {
    // console.error("Failed to load image:" + src);
  }
}
BTSTipsController.prototype.tipsImgFailed = function(src, fileName, tipsItemArr) {
  // console.error("Failed to load image:" + src);
}

BTSTipsController.prototype.saveImageToStorage = function (htmlContent, fileName, tipsItemArr) {
  var self = this;
  var regex = /<img([^>]+)src="([^">]+)"/g;
  htmlContent.replace(regex, function(match, attributes, src) {
    let img = new Image();
    img.src = src;
    img.onload = function() {
      self.tipsImgLoaded(src, this.src, fileName, tipsItemArr);
    };
    img.onerror = function() {
      self.tipsImgFailed(src, fileName, tipsItemArr);
    };

    return match;
  });
}

BTSTipsController.prototype.updateContentHtml = function () { // called from URLDefinition.prototype._updateTipsApi()
  var self = this;
  let updateHtmlToStorage = (htmlContent, url, fileName, _tipDetail) => {
    if (_tipDetail.length <=3) return;
    const page = _tipDetail[0];
    const block = _tipDetail[1];
    const type = _tipDetail[2];
    const variation = _tipDetail[3];

    let tipsVariationDir = self.createTipsVariationDir(page, block, type, variation);
    let tipsVariationContents = fs.contents(tipsVariationDir);
    if (tipsVariationContents.findIndex(item => item.name == fileName) != -1) {
      fs.unlink(tipsVariationDir + fileName); //file exist
    }
    fs.writeString(tipsVariationDir + fileName, htmlContent); // create html file
    let htmlLoadedIndex = self.getTipsContentIndex(this.htmlLoaded, page, block, type, variation);
    if (htmlLoadedIndex >= 0 && htmlLoadedIndex < self.htmlLoaded.length) {
      self.htmlLoaded[htmlLoadedIndex] = {
        page,
        block,
        type,
        variation,
        url: tipsVariationDir + fileName,
        content: htmlContent
      };
    };

    //check and update image
    setTimeout(() => {
      self.saveImageToStorage(htmlContent, fileName, _tipDetail);
    }, 500);
  }

  let updateHtmlFail = (fileName, _tipDetail) => {
    if (_tipDetail.length <=3) return;
    const page = _tipDetail[0];
    const block = _tipDetail[1];
    const type = _tipDetail[2];
    const variation = _tipDetail[3];
    let tipsVariationDir = self.createTipsVariationDir(page, block, type, variation);
    let tipsVariationContents = fs.contents(tipsVariationDir);
    let htmlLoadedIndex = self.getTipsContentIndex(this.htmlLoaded, page, block, type, variation);
    if (htmlLoadedIndex >= 0 && htmlLoadedIndex < self.htmlLoaded.length) {
      self.htmlLoaded[htmlLoadedIndex] = {
        page,
        block,
        type,
        variation,
        url: tipsVariationDir + fileName,
        content: tipsVariationContents.findIndex(item => item.name == fileName) >= 0 ? fs.readString(tipsVariationContents + fileName) : null,
      };
    };
  }

  let successFunc = () => {
    let tipsApi = new TipsApi();
    $.each(TIPS_DEF.TIPS_TABLE[tipsApi.GetLanguageIndex('')][1], function (index, tipDetail) {
      if (tipDetail.length <=3) return;
      const page = tipDetail[0];
      const block = tipDetail[1];
      const type = tipDetail[2];
      const variation = tipDetail[3];
      let htmlPath = tipDetail[4];
      //let htmlPath = tipsApi.GetUrl(page, block, type, variation);
      // if html file exist in storage then load from storage, if not then call by ajax
      // const listHtmlLoaded = self.filterHtmlLoaded(page, block, type, variation);
      if (htmlPath) {
        // if (listHtmlLoaded.filter(x => x.htmlPath === htmlPath) > 0) {
        //   return;
        // }
        self.htmlLoaded.push({
          page,
          block,
          type,
          variation,
          htmlPath,
        });

        let fileName = htmlPath.substring(htmlPath.lastIndexOf('/') + 1);
        var targetPath = urlDefinition.TIPS_DOMAIN;
        var fullPath = targetPath + 'html/' + langStr + '/' + htmlPath;
        self.loadContentHtml(fullPath, tipDetail, fileName, updateHtmlToStorage, updateHtmlFail);
      }
    });

    setTimeout(function () {
      self.showTips();
      //console.log(self.htmlLoaded);
    }, 3000);
  }

  this.waitForTipsJsLoaded(successFunc);
};

BTSTipsController.prototype.showTipsByTab = function (tipsElement) {

  var self = this;
  let typeSelectedTemp = tipsElement.typeSelect ? $("#" + tipsElement.typeSelect + ">p").text() : "";
  let variationTemp = self.getStorageVariationCnt(tipsElement.page, tipsElement.block, typeSelectedTemp);

  let contentIndexTemp = -1;
  if (self.isTipsReady) {
    contentIndexTemp = self.getTipsContentIndex(this.htmlLoaded, tipsElement.page, tipsElement.block, typeSelectedTemp, variationTemp);
  }
  if (contentIndexTemp >= 0){//} && self.htmlLoaded.length > 0) {
    let contentTemp = self.htmlLoaded[contentIndexTemp].content;
    let domTemp = $('<div>').attr('class', 'tips-content-block').css({"width": "400px", "height": "100px"}).html(contentTemp);

      if(tipsElement.multiFrame && !typeSelectedTemp) {
        $("#" + tipsElement.contentFrame + '>div').find(".tips-content-block").remove();
        $("#" + tipsElement.contentFrame + '>div').append(domTemp);
      } else if(tipsElement.multiFrame) {
        $("#" + tipsElement.contentFrame + '>div[displayed != none]').find(".tips-content-block").remove();
        $("#" + tipsElement.contentFrame + '>div[displayed != none]').append(domTemp);
      } else {
        $("#" + tipsElement.contentFrame).find(".tips-content-block").remove();
        $("#" + tipsElement.contentFrame).append(domTemp);
      }

      self.countVariation(tipsElement.page, tipsElement.block, typeSelectedTemp, variationTemp);
      
  } else {
    $("#" + tipsElement.contentFrame).find(".tips-content-block").remove();
  }
};

BTSTipsController.prototype.showTips = function () {
  var self = this;
  $.each(this.tipsViews, function (index, tipsElement) {
    // self.showTipsByTab(tipsElement);

    //effect type selectbox changed
    if(tipsElement.typeSelect) {
      $("#" + tipsElement.typeSelect).on('elf-changed', function(e, v) {
        setTimeout(() => {
          self.showTipsByTab(tipsElement);
        }, 500);
      });
    }
  });
};

BTSTipsController.prototype.showTipsChain = function (typeSelectedTemp) {
  var self = this;
  let tipsElement = self.tipsViews.find(item => item.block == "CHAIN");
  let contentIndexTemp = -1;
  if (self.isTipsReady) {
    contentIndexTemp = self.getTipsContentIndex(this.htmlLoaded, tipsElement.page, tipsElement.block, typeSelectedTemp, tipsElement['variation']);
  }
  if(contentIndexTemp >= 0) {
    let contentTemp = self.htmlLoaded[contentIndexTemp].content;
    let domTemp = $('<div>').attr('class', 'tips-content-block').css({"width": "400px", "height": "100px"}).html(contentTemp);
    $("#" + tipsElement.contentFrame).find(".tips-content-block").remove();
    $("#" + tipsElement.contentFrame).append(domTemp);
  } else {
    $("#" + tipsElement.contentFrame).find(".tips-content-block").remove();
  }
};

BTSTipsController.prototype.getTipsContentIndex = function (table, page, block, type, variation) {
  if (table != undefined && this != undefined && this.isTipsReady) {
    let tipsApi = new TipsApi();
    //console.log(tipsApi);
    return tipsApi.GetUrlIndex(table, page, block, type, variation);
  } else {
    return -1;
  }
};

BTSTipsController.prototype.updateTipsChangeTab = function (typeSelectedTemp) {
  var self = this;
  let tipsElement = this.tipsViews.find(item => item.block == typeSelectedTemp);
  self.showTipsByTab(tipsElement);
};

BTSTipsController.prototype.createTipsVariationDir = function (page, block, type, variation) {
  try {
    if (variation == undefined) {
      variation = TIPS_VARIATION;
    }
    let tipsHtmlDir = dirTips.tipsHtmlDir;
    let tipsPageDir = tipsHtmlDir + page + "/";
    fs.mkdir(tipsPageDir);
    let tipsBlockDir = block !== "" ? tipsPageDir + block + "/" : tipsPageDir;
    fs.mkdir(tipsBlockDir);
    let tipsTypeDir = type !== "" ? tipsBlockDir + type + "/" : tipsBlockDir;
    fs.mkdir(tipsTypeDir);
    let tipsVariationDir = variation !== "" ? tipsTypeDir + variation + "/" : tipsTypeDir;
    fs.mkdir(tipsVariationDir);

    return tipsVariationDir;
  } catch (error) {
    // console.log(error);
    return ""
  }
};

BTSTipsController.prototype.countVariation = function (page, block, type, variation) {
  let tipsApi = new TipsApi();
  let tbl = TIPS_DEF.TIPS_TABLE[tipsApi.GetLanguageIndex('')][1]; 
  let tblindex = tipsApi.GetUrlIndex(tbl, page, block, type, variation);
  if(variationCntTemp.findIndex(item => item.page == tbl[tblindex][0] && item.block == tbl[tblindex][1] && item.type == tbl[tblindex][2]) == -1){
      var displayedInfo = {page: tbl[tblindex][0], block: tbl[tblindex][1],  type: tbl[tblindex][2]};
      variationCntTemp.push(displayedInfo); 
      let storageCntArray = $native.app.storage2('tipsVariationCnt');
      if(storageCntArray){
        let loadArray = JSON.parse(storageCntArray);
        let tempIndex = loadArray.findIndex(item => item.page == page && item.block == block && item.type == type);
        // console.log(loadArray);
        if(tempIndex != -1){
          loadArray[tempIndex].variationCnt++;
          $native.app.storage2('tipsVariationCnt', JSON.stringify(loadArray));
        }else{
          displayedInfo.variationCnt = 0;
          loadArray.push(displayedInfo);
          $native.app.storage2('tipsVariationCnt', JSON.stringify(loadArray));
        }
      }else{
        displayedInfo.variationCnt = 0;
        let newArray = [];
        newArray.push(displayedInfo);
        // console.log(displayedInfo);
        $native.app.storage2('tipsVariationCnt', JSON.stringify(newArray));
      }
    }
  };

BTSTipsController.prototype.getStorageVariationCnt = function(page, block, type){
    var storageCntArray = $native.app.storage2('tipsVariationCnt');
    if(storageCntArray){
      var loadArray = JSON.parse(storageCntArray);
      var variationIndex = loadArray.findIndex(element => element.page == page && element.block == block && element.type == type);
      if(variationIndex != -1){
        return curVariationCnt = loadArray[variationIndex].variationCnt;
      }else{
        return curVariationCnt = 0;
      }
    }else{
      return curVariationCnt = 0;
    }
  };

(function () {
  window.btsTipsController = new BTSTipsController();
})();
