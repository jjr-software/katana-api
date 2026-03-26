//
//	system_controller.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

$(function() {

	(function info() {
		var doc = '';
		doc += '<table>';
		doc += '<tr><td>name</td><td>'         + ProductSetting.name + '</td>';
		doc += '<tr><td>version</td><td>'      + ProductSetting.version + '</td>';
		doc += '<tr><td>copyright</td><td>'    + ProductSetting.copyright + '</td>';
		doc += '<tr><td>modelId</td><td>'      + ProductSetting.modelId + '</td>';
		doc += '<tr><td>deviceId</td><td>'     + ProductSetting.deviceId + '</td>';
		doc += '<tr><td>lengthOfAddr</td><td>' + ProductSetting.lengthOfAddr + '</td>';
		doc += '<tr><td>lengthOfsize</td><td>' + ProductSetting.lengthOfSize + '</td>';
		doc += '<tr><td>interval</td><td>'     + ProductSetting.interval + '(ms) </td>';
		doc += '<tr><td>timeout</td><td>'      + ProductSetting.timeout + '(s) </td>';
		doc += '<tr><td>extension</td><td>'    + ProductSetting.livesetFile.extension + '</td>';
		doc += '<tr><td>manual</td><td>' + JSON.stringify(ProductSetting.manual) + '</td>';
		doc += '</table>'
		$('#system_view div.info').append(doc);
	})();

	var midi = $native.midi;
	midi.event.changed = function() {
		list(); /* update */
	};
	midi.event.connectfailed = function(ep) {
		ep = JSON.parse(ep);
		alert('connectfailed: ' + ep.MIDIDeviceNameKey);
	};
	midi.event.error = function(code) {
		alert('error (' + code + ')');
	};

	var inputs = [];
	var outputs = [];

	$('#inputs').on('click', '.connect', function() {
		var i = $(this).closest('tr').index() - 1;
		midi.input.connect(inputs[i]);
	});
	$('#inputs').on('click', '.disconnect', function() {
		var i = $(this).closest('tr').index() - 1;
		midi.input.disconnect(inputs[i]);
	});

	$('#outputs').on('click', '.connect', function() {
		var i = $(this).closest('tr').index() - 1;
		midi.output.connect(outputs[i]);
	});
	$('#outputs').on('click', '.disconnect', function() {
		var i = $(this).closest('tr').index() - 1;
		midi.output.disconnect(outputs[i]);
	});

	function list() {
		var doc = '';

		function header() {
			return (
				'<table><tr>' +
				'<th>Device</th>' +
				'<th>Entity</th>' +
				'<th>UID</th>' +
				'<th>Index</th>' +
				'<th>Action</th>' +
				'</tr>'
			);
		}

		function data(ep) {
			return (
				'<tr>' +
				'<td>' + ep.MIDIDeviceNameKey + '</td>' +
				'<td>' + ep.MIDIEntityNameKey + '</td>' +
				'<td>' + ep.MIDIEndpointUIDKey + '</td>' +
				'<td>' + ep.MIDIEndpointIndexKey + '</td>' +
				'<td><button class="connect">CONNECT</button>' +
				'<button class="disconnect">DISCONNECT</button></td>' +
				'</tr>'
				);
		}

		inputs = midi.input.endpoints();
		outputs = midi.output.endpoints();

		doc = header();
		for (var i = 0, num = inputs.length; i < num; i++) {
			doc += data(inputs[i]);
		}
		doc += '</table>'
		$('#inputs').empty();
		$('#inputs').append(doc);

		doc = header();
		for (var i = 0, num = outputs.length; i < num; i++) {
			doc += data(outputs[i]);
		}
		$('#outputs').empty();
		$('#outputs').append(doc);
	}

	window.onbeforeunload = function() {
		midi.input.disconnect();
		midi.output.disconnect();
	}
	window.onpagehide = window.onbeforeunload; /* for iOS Safari */

	list();

	/* for development */
	$('#system_view').on('click', '.log_midi_in', function() {
		if ($(this).prop('checked')) {
			LOG_MIDI_IN = function(msg){ $('#log').append('<li>I: ' + msg + '</li>'); }
		} else {
			LOG_MIDI_IN = function(){};
		}
	});

	$('#system_view').on('click', '.log_midi_out', function() {
		if ($(this).prop('checked')) {
			LOG_MIDI_OUT = function(msg){ $('#log').append('<li>O: ' + msg + '</li>'); }
		} else {
			LOG_MIDI_OUT = function(){};
		}
	});

	$('#clear_log').on('click', function() {
		$('#log').empty();
	});

});
