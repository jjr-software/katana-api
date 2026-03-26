//
//	native.js
//
//	Copyright 2015 Roland Corporation. All rights reserved.
//

(function(window) {

	var _  = function() { return 0 };
	var _1 = function() { return 0 };
	var _2 = function() {};

	var native = {

		app: {
			ready: function() { _('$$app_ready'); },
			storage: function(data) { if (data !== undefined) _('$$app_storage', data); else return _('$$app_storage'); },
			storage2: function(key, data) { if (data !== undefined) _('$$app_storage2', key, data); else return _('$$app_storage2', key); },
			clipboard: function(data) { if (data !== undefined) _('$$app_clipboard', data); else return _('$$app_clipboard'); },
			importfile: function(filter) { _('$$app_importfile', (filter ? JSON.stringify(filter) : undefined)); },
			exportfile: function(file) { _('$$app_exportfile', file); },
			control: function(req) { _('$$app_control', req); },
			locate: function(url) { _('$$app_locate', url); },
			dragdrop: function(enable) { _('$$app_dragdrop', enable); },
			dropfiles: function() { return JSON.parse(_('$$app_dropfiles')); },
			exit: function() { _('$$app_exit'); },

			event: {
				command: function(param1, param2) {}
			}
		},

		midi: {
			input: {
				endpoints: function() { return JSON.parse(_('$$midi_inendpoints')); },
				connect: function(ep) { _('$$midi_inconnect', (ep ? JSON.stringify(ep) : undefined)); },
				disconnect: function(ep) { _('$$midi_indisconnect', (ep ? JSON.stringify(ep) : undefined)); }
			},
			output: {
				endpoints: function() { return JSON.parse(_('$$midi_outendpoints')); },
				connect: function(ep) { _('$$midi_outconnect', (ep ? JSON.stringify(ep) : undefined)); },
				disconnect: function(ep) { _('$$midi_outdisconnect', (ep ? JSON.stringify(ep) : undefined)); }
			},
			send: function(msg) { _2('$$midi_send', msg); },
			panel: function() { _('$$midi_panel'); },

			event: {
				message: function(msg, timestamp) {},
				changed: function() {},
				connectfailed: function(ep) {},
				error: function(code) {}
			}
		},

		midix: {
			client: function(count) { _('$$midix_client', count * 1); },
			input: {
				endpoints: function() { return JSON.parse(_('$$midix_inendpoints')); },
				connect: function(cid, ep) { _('$$midix_inconnect', cid * 1, (ep ? JSON.stringify(ep) : undefined)); },
				disconnect: function(cid, ep) { _('$$midix_indisconnect', cid * 1, (ep ? JSON.stringify(ep) : undefined)); }
			},
			output: {
				endpoints: function() { return JSON.parse(_('$$midix_outendpoints')); },
				connect: function(cid, ep) { _('$$midix_outconnect', cid * 1, (ep ? JSON.stringify(ep) : undefined)); },
				disconnect: function(cid, ep) { _('$$midix_outdisconnect', cid * 1, (ep ? JSON.stringify(ep) : undefined)); }
			},
			send: function(cid, msg) { _2('$$midix_send', cid * 1, msg); },
			thru: function(cid, enable) { _('$$midix_thru', cid * 1, enable); },
			panel: function() { _('$$midix_panel'); },

			event: {
				changed: function() {},
				message: function(cid, msg, timestamp) {},
				connectfailed: function(cid, ep) {},
				error: function(cid, code) {}
			}
		},

		tgif: {
			param: function(pid, val) { if (val !== undefined) _('$$tgif_param', pid, val * 1); else return _('$$tgif_param', pid); },
			send: function(msg) { _2('$$tgif_send', msg); },
			thru: function(enable) { _('$$tgif_thru', enable); },
			buffer: function(num) { if (num !== undefined) _('$$tgif_buffer', num * 1); else return _('$$tgif_buffer'); }
		},

		player: {
			device: function(uid) { return _('$$player_device', uid); },
			open: function(file) { return _('$$player_open', file); },
			play: function() { _('$$player_play'); },
			pause: function() { _('$$player_pause'); },
			stop: function() { _('$$player_stop'); },
			locate: function(time) { _('$$player_locate', time * 1.0); delete window['$$player_time']; },
			volume: function(gain) { return _('$$player_volume', gain); },
			file: function() { return _('$$player_file'); },
			totaltime: function() { return _('$$player_totaltime'); },
			status: function() { return _1('$$player_status'); },
			channels: function() { return _1('$$player_channels'); },
			peakpower: function(cahnnel) { return _1('$$player_peakpower', cahnnel); },
			time: function() { return _1('$$player_time'); },

			event: {
				eof: function(file) {},
				stop: function(file) {},
				error: function(file) {}
			}
		},

		btx: {
            viewPositionConfig: function(rect) { _('$$btx_viewPositionConfig', rect); },
            show: function() { _('$$btx_show'); },
            hide: function() { _('$$btx_hide'); },
            openPage: function(url) { _('$$btx_openPage', url); },
            sendMsgToBTX: function(msg) { _('$$btx_sendMsgToBTX', msg); },

            event: {
                onSendMsgToBTS: function(msg) {},
                onBtxWebViewNotify: function(result) {}
            },
            NotifyResult: {
                /* Info (0x000 ~ 0x0FF) */
                PageLoaded: 0x000,

                /* Error (0x100 ~ 0x1FF) */
                UnknownError: 0x100,
                ConnectionTimeout: 0x101,
                ConnectionError: 0x102,
            }
        },

		recorder: {
			device: function(uid) { return _('$$recorder_device', uid); },
			create: function(file, format) { return _('$$recorder_create', file, format * 1); },
			record: function() { _('$$recorder_record'); },
			pause: function() { _('$$recorder_pause'); },
			stop: function() { _('$$recorder_stop'); },
			volume: function(gain) { return _('$$recorder_volume', gain); },
			file: function() { return _('$$recorder_file'); },
			status: function() { return _1('$$recorder_status'); },
			channels: function() { return _1('$$recorder_channels'); },
			peakpower: function(cahnnel) { return _1('$$recorder_peakpower', cahnnel); },
			time: function() { return _1('$$recorder_time'); },

			event: {
				stop: function(file) {},
				error: function(file) {}
			}
		},

		sampler: {
			create: function(num) { _('$$sampler_create', num); },
			device: function(id, uid) { return _('$$sampler_device', id * 1, uid); },
			open: function(id, file) { return _('$$sampler_open', id * 1, file); },
			close: function(id) { return _('$$sampler_close', id * 1); },
			play: function(id) { _('$$sampler_play', id * 1); },
			pause: function(id) { _('$$sampler_pause', id * 1); },
			stop: function(id, force) { if (id !== undefined) _('$$sampler_stop', id * 1, force); else _('$$sampler_stop'); },
			locate: function(id, time) { _('$$sampler_locate', id * 1, time * 1.0); },
			begin: function(id, time) { return _('$$sampler_begin', id * 1, time); },
			end: function(id, time) { return _('$$sampler_end', id * 1, time); },
			volume: function(id, gain) { return _('$$sampler_volume', id * 1, gain); },
			repeat: function(id, count) { return _('$$sampler_repeat', id * 1, count); },
			speed: function(id, rate) { return _('$$sampler_speed', id * 1, rate); },
			pitch: function(id, cent) { return _('$$sampler_pitch', id * 1, cent); },
			fadein: function(id, time) { return _('$$sampler_fadein', id * 1, time); },
			fadeout: function(id, time) { return _('$$sampler_fadeout', id * 1, time); },
			file: function(id) { return _('$$sampler_file', id * 1); },
			totaltime: function(id) { return _('$$sampler_totaltime', id * 1); },
			status: function() { return JSON.parse( _('$$sampler_status')); },

			event: {
				eof: function(id, file) {}
			}
		},

		audio: {
			inputs: function() { return JSON.parse(_('$$audio_inputs')); },
			outputs: function() { return JSON.parse(_('$$audio_outputs')); },
			format: function(file) { return JSON.parse(_('$$audio_format', file)); },
			convert: function(file, out) { _2('$$audio_convert', file, JSON.stringify(out)); },
			split: function(file, wavs) { _2('$$audio_split', file, JSON.stringify(wavs)); },
			reverse: function(file, wav) { _2('$$audio_reverse', file, wav); },

			event: {
				changed: function() {},
				converted: function(file, outputs) {},
				convertfailed: function(file) {}
			}
		},

		rwc: {
			discovery: function() { _2('$$rwc_discovery'); },
			connect: function(dev) { _('$$rwc_connect', JSON.stringify(dev)); },
			disconnect: function() { _('$$rwc_disconnect'); },
			device: function() { var dev = _('$$rwc_device'); return (dev ? JSON.parse(dev) : null); },
			send: function(msg) { _2('$$rwc_send', msg); },
			inputmode: function(mode) { _('$$rwc_inputmode', mode); },
			timeout: function(sec) { return _('$$rwc_timeout', sec); },
			keepalive: function(sec) { return _('$$rwc_keepalive', sec); },

			event: {
				found: function(dev) {},
				connected: function(dev) {},
				connectfailed: function(dev) {},
				closed: function(dev) {},
				message: function(msg, timestamp) {},
				error: function(dev) {}
			}
		},

		http: {
			download: function(url, to) { return _('$$http_download', url, to); },
			upload: function(url, file) { return _('$$http_upload', url, file); },
			cancel: function(id) { _('$$http_cancel', id * 1); },

			event: {
				progress: function(id, total, amount) {},
				completed: function(id, file) {},
				error: function(id, url) {}
			}
		},

		tcpip: {
			connect: function(addr, port) { return _('$$tcpip_connect', addr, port * 1); },
			close: function(fd) { _2('$$tcpip_close', fd * 1); },
			write: function(fd, data) { _2('$$tcpip_write', fd * 1, data); },

			event: {
				closed: function(fd) {},
				read: function(fd, data) {}
			}
		},

		netservice: {
			search: function(type) { return _('$$netservice_search', type); },
			stop: function() { _2('$$netservice_stop'); },

			event: {
				resolved: function(serveice) {},
				lost: function(name) {},
				stopped: function(error) {}
			}
		},

		fs: {
			separator: function() { return _('$$fs_separator'); },
			path: function(where) { return _('$$fs_path', where); },
			volumes: function() { return JSON.parse(_('$$fs_volumes')); },
			contents: function(path) { return JSON.parse(_('$$fs_contents', path)); },
			stat: function(path) { return JSON.parse(_('$$fs_stat', path)); },
			exec: function(file) { _('$$fs_exec', file); },
			mkdir: function(path) { _('$$fs_mkdir', path); },
			unlink: function(path) { _('$$fs_unlink', path); },
			copy: function(from, to) { _('$$fs_copy', from, to); },
			move: function(from, to) { _('$$fs_move', from, to); },
			unzip: function(zip, folder) { _('$$fs_unzip', zip, folder); },
			readString: function(file) { return _('$$fs_readString', file); },
			readData: function(file, opt) { return _('$$fs_readData', file, (opt ? JSON.stringify(opt) : undefined)); },
			writeString: function(file, text) { _('$$fs_writeString', file, text); },
			writeData: function(file, data) { _('$$fs_writeData', file, data); },
			appendString: function(file, text) { _('$$fs_appendString', file, text); },
			appendData: function(file, data) { _('$$fs_appendData', file, data); },
			openfilename: function(filter, path) { _('$$fs_openfilename', (filter ? JSON.stringify(filter) : undefined), path); },
			savefilename: function(name, ext)  { _('$$fs_savefilename', name, ext); },
			choosefolder: function(path)  { _('$$fs_choosefolder', path); },
			unmount: function(path) { _('$$fs_unmount', path); },
			opendirname: function(dir, filter) { _('$$fs_openfilename', (filter ? JSON.stringify(filter) : undefined), dir); },		// "opendirname" is deprecated, It is recommended to implement using "openfilename".
			openmediafile: function(dir) { _('$$fs_openmediafile', dir); },
			importmediafile: function(file) { _('$$fs_importmediafile', file); },
			deletemediafile: function(file) { _('$$fs_deletemediafile', file); },
			mediafileinfo: function(file) { return _('$$fs_mediafileinfo', file); },

			event: {
				openfilename: function(file) {},
				savefilename: function(file) {},
				choosefolder: function(path) {},
				unmounted: function(path) {},
				unmountfailed: function(path, reason) {},
				openmediafile: function(file) {},
				importmediafile: function(data) {}
			}
		},

		security: {
			kiv: function(salt) { return _('$$security_kiv', salt); },
			uuidgen: function() { return _('$$security_uuidgen'); },
			md5: function(data) { return _('$$security_md5', data); },
			encipher: function(text) { return _('$$security_encipher', text); },
			decipher: function(data) { return _('$$security_decipher', data); },
			aes: {
				encrypt: function(data, key) { return _('$$security_aesencrypt', data, (key ? key : undefined)); },
				decrypt: function(data, key) { return _('$$security_aesdecrypt', data, (key ? key : undefined)); }
			},
			des: {
				encrypt: function(data, key) { return _('$$security_desencrypt', data, (key ? key : undefined)); },
				decrypt: function(data, key) { return _('$$security_desdecrypt', data, (key ? key : undefined)); }
			}
		},

		ble: {
			scan : {
				start: function(services) { _2('$$ble_scanstart', JSON.stringify(services)); },
				stop: function() { _2('$$ble_scanstop'); },
			},
			connect: function(id) { _2('$$ble_connect', id); },
			disconnect: function(id) { _2('$$ble_disconnect', id); },
			discover: function(id, service) { _2('$$ble_discover', id, service); },
			properties: function(ep) { return _('$$ble_properties', JSON.stringify(ep)); },
			notify: function(ep, enabled) { _2('$$ble_notify', JSON.stringify(ep), enabled); },
			read: function(ep) { _2('$$ble_read', JSON.stringify(ep)); },
			write: function(ep, value) { _2('$$ble_write', JSON.stringify(ep), value); },
			writewithoutresponse: function(ep, value) { _2('$$ble_writewithoutresponse', JSON.stringify(ep), value); },

			event: {
				unauthorized: function() {},
				found: function(id, name, rssi) {},
				connected: function(id, name) {},
				connectfailed: function(id, name) {},
				disconnected: function(id, name) {},
				discovered: function() {id, service, characteristics},
				discoverfailed: function(id, reason) {},
				write: function(ep, error) {},
				changed: function(ep, value, error) {}
			}
		},

		store: {
			query: function(products) {_2('$$store_query', JSON.stringify(products)); },
			purchased: function() { return _('$$store_purchased'); },
			launchflow: function(params) { _2('$$store_launchflow', JSON.stringify(params)); },
			accept: function(receipt) { _2('$$store_accept', JSON.stringify(receipt)); },
			restore: function() { _2('$$store_restore'); },
			event: {
				reply: function(details) {},
				changed: function(id, state) {},
				payment: function(receipt, signature) {},
				restored: function(receipt, signature) {},
				restorefailed: function() {},
				revoked: function(products) {}
			}
		},

		notification: {
			token: function() { return _('$$notification_token'); },
			badge: function(count) { _('$$notification_badge', count); },

			event: {
				refresh: function(token) {},
				received: function(params) {}
			}
		},

		recognizer: {
			start: function() { _('$$recognizer_start'); },
			stop: function() { _('$$recognizer_stop'); },

			event: {
				partial: function(text) {},
				final: function(text) {},
				error: function(reason) {}
			}
		},

		barcode: {
			read: function(type) { _('$$barcode_read', type); },

			event: {
				detected: function(data) {}
			}
		},

		sh: {
			exec: function(argv) { return _('$$sh_exec', JSON.stringify(argv)); },
			kill: function(pid) { _('$$sh_kill', pid); },

			event: {
				stdout: function(pid, output) {}
			}
		},

		util: {
			bytes: function(text) { return _('$$util_bytes', text); },
			text: function(bytes) { return _('$$util_text', bytes); }
		},

		stop: function() {},    /* iOS: applicationDidEnterBackground,  Android: onStop() */
		restart: function() {}, /* iOS: applicationWillEnterForeground, Android: onRestart() */

	};

	var pumpevent = function() {
		var ev;
		while (ev = _('$$app_getevent')) { dispatch(ev); }
	};

	var dispatch = function(ev) {
		var args = ev.split('\f');
		var prop = args.shift();
		var type = args.shift();
		if (native[prop] && native[prop].event[type]) {
			native[prop].event[type].apply(native, args);
		}
	};

	window.$native = native; /* export window object */
	window.$event = { start: function(delay) { window.setInterval(pumpevent, delay ? delay : 50); } };

	if (typeof window.$$app !== 'undefined') {
		_ = _1 = _2 = function() {
			var a = arguments[0].split('_');
			var o = a[0]; var f = a[1];
			if (typeof arguments[2] !== 'undefined')
				return window[o][f](arguments[1], arguments[2]);
			if (typeof arguments[1] !== 'undefined')
				return window[o][f](arguments[1]);
			return window[o][f]();
		}
		if (typeof window.$$app.startevent !== 'undefined') {
 			window.$event.trigger = function() { window.setTimeout(pumpevent, 0) };
			window.$event.start = function() {
				window.addEventListener('beforeunload', function(){
					_('$$app_startevent', false); /* stop event */
				});
				_('$$app_startevent', true);
			}
			if (navigator.userAgent.indexOf('roland.quattro(Android)') > 0) {
				window.$event.trigger = pumpevent;
			}
		}
	} else if (navigator.userAgent.indexOf('roland.quattro') != -1) {
		if (typeof window.$$prompt !== 'undefined') {
			_ = _1 = _2 = function() {
				var req = arguments[0];
				if (typeof arguments[1] !== 'undefined')
					req += ('\f' + encodeURIComponent(arguments[1]));
				if (typeof arguments[2] !== 'undefined')
					req += ('\f' + encodeURIComponent(arguments[2]));
				var res = prompt(req);
				if (res) { return decode(res) }
				webkit.messageHandlers.prompt.postMessage(req);
			}
		} else if (typeof window.$$xhrport !== 'undefined') {
			_ = function() {
				var xhr = new XMLHttpRequest();
				var url = 'http://localhost:' + window.$$xhrport + '/' + arguments[0];
				if (typeof arguments[1] !== 'undefined')
					url += '?' + encodeURIComponent(arguments[1]);
				if (typeof arguments[2] !== 'undefined')
					url += ',' + encodeURIComponent(arguments[2]);
				xhr.open('GET', url, false);
				xhr.send(null);
				return decode(xhr.responseText);
			}
			_1 = function() {
				var req = arguments[0];
				if (typeof arguments[1] !== 'undefined')
					req += ('\f' + arguments[1]);
				if (typeof arguments[2] !== 'undefined')
					req += ('\f' + arguments[2]);
				webkit.messageHandlers.quattro1.postMessage(req);
				if (window[req] === undefined) {
					return _.apply(this, arguments);
				}
				return decode(window[req]);
			}
			_2 = function() {
				var req = arguments[0];
				if (typeof arguments[1] !== 'undefined')
					req += ('\f' + arguments[1]);
				if (typeof arguments[2] !== 'undefined')
					req += ('\f' + arguments[2]);
				webkit.messageHandlers.quattro2.postMessage(req);
			}
		} else {
			_ = _1 = _2 = function() {
				var res;
				if (typeof arguments[2] !== 'undefined') {
					res = chrome.webview.hostObjects.sync.native(arguments[0], '' + arguments[1], '' + arguments[2]);
				} else if (typeof arguments[1] !== 'undefined') {
					res = chrome.webview.hostObjects.sync.native(arguments[0], '' + arguments[1]);
				} else {
					res = chrome.webview.hostObjects.sync.native(arguments[0]);
				}
				return decode(res);
			}
		}
		if (_('$$app_startevent') !== undefined) {
			window.$event.dispatch = function(ev) { window.setTimeout(function(){ dispatch(ev) }, 0) };
			window.$event.start = function() {
				_('$$app_startevent', true);
			}
		}
	}

	function decode(str) {
		var x = str.slice(1);
		switch (str.charAt(0)) {
			case 'v': return undefined;
			case 'b': return Boolean(x);
			case 'd': return parseInt(x);
			case 'f': return parseFloat(x);
			case 's': return x;
		}
		throw new Error(x);
	}

	window.$load = function(url) {
		try  {
			var path = decodeURIComponent(window.location.href.replace('file://', ''));
			if (path.match(/^\/[a-zA-Z]:\//)) { path = path.substr(1); }
			var str = path.substring(0, path.lastIndexOf('/') + 1) + url;
			var file = str.replace(/\//g, $native.fs.separator());
			var data = $native.fs.readData(file);
			if (data.substring(0, 16) == '53616C7465645F5F') {
				var salt = data.substring(16, 32);
				var kiv = $native.security.kiv(salt);
				data = $native.security.aes.decrypt(data.substring(32), kiv);
			}
			var script = document.createElement('script');
			script.innerHTML = $native.util.text(data);
			document.head.appendChild(script);
		} catch (e) { alert(e); }
	}

})(window);
