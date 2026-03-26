//
//	import.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

try  {
	function _load(url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		return xhr.responseText;
	}
	var _ITEM_DATA  = _load('export/item.json');
	var _LAYOUT_DIV = _load('export/layout.div');
	var _LICENSE_DIV = _load('license.div');
	var _INIT_PARAM_SET = _load('js/businesslogic/ktn/ktn_mk2_model_init210.json');
	_items = JSON.parse(_ITEM_DATA);
	_ITEM_DATA = null;
} catch (e) { alert(e); }

window.license_div = _LICENSE_DIV;

$(function() {
	if (!_LAYOUT_DIV) {
		_LAYOUT_DIV = '<p>Chrome needs option "--allow-file-access-from-files"</p>';
	}
	$('#layout-wrapper').append(_LAYOUT_DIV);
	_LAYOUT_DIV = null;
});
