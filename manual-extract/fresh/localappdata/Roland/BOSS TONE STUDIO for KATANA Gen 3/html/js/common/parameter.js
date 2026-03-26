//
//	parameter.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

(function(window) {

	var map = new AddressMap();

	var paramSet = {};
	var observers = [];

	var _obj = {

		paramSet: paramSet,

		getblock: function(bid) {
			var bi = blockinfo(bid);
			return {
				addr: bi.addr,
				data: paramSet[bid],
				size: ((bi.block.size > SYSEX_MAXLEN) ?
					dividesize(bi.block.child, SYSEX_MAXLEN) : [ bi.block.size ])
			};
		},

		initialize: function(bid) {
			var bi = blockinfo(bid);
			this.setdata(bid, bi.block.data0);
		},

		copyblock: function(target, source) {
			if (target != source) {
				this.setdata(target, paramSet[source]);
			}
		},

		initblock: function(bid) {
			var bi = blockinfo(bid);
			return bi.block.data0.concat();
		},

		setdata: function(bid, data) {
			var dst = paramSet[bid];
			dst.splice(0, dst.length);
			for (var i = 0, num = data.length; i < num; i++) {
				dst[i] = data[i];
			}
			broadcast(bid);
		},

		value: function(pid, size, ofs) {
			var _ = pid.split('%');
			var addr = parseInt(_.pop(), 10);
			var bid  = _.join('%');
			var data = paramSet[bid];
			if (data === undefined) return 0;
			return toValue(data, addr, size, ofs);
		},

		setValue: function(pid, size, ofs, value, dt1) {
			if (dt1 === undefined) dt1 = true;
			var _ = pid.split('%');
			var addr = parseInt(_.pop(), 10);
			var bid  = _.join('%');
			if (size >= INTEGER1x1) {
				var fctr = 1;
				if (Array.isArray(ofs)) { fctr = ofs[1]; ofs = ofs[0]; }
				value = ((value * fctr) | 0) + ofs;
			}
			var v = toHexArray(value, size);
			var data = paramSet[bid];
			if (data === undefined) return;
			for (var i = 0; i < v.length; i++) {
				data[addr + i] = v[i];
			}
			if (dt1) {
				/* send dt1 message */
				var b = this.getblock(bid);
				MIDIController.dt1(b.addr + addr, (v.join()).replace(/,/g, ''));
			}
		},

		flush: function(pid, bytes) {
			var _ = pid.split('%');
			var addr = parseInt(_.pop(), 10);
			var bid  = _.join('%');
			var data = paramSet[bid];
			if (data === undefined) return;
			if (addr + bytes > data.length) {
				bytes = data.length - addr;
			}
			if (bytes <= 0) return;
			var v = data.slice(addr, addr + bytes);
			/* send dt1 message */
			var b = this.getblock(bid);
			MIDIController.dt1(b.addr + addr, (v.join()).replace(/,/g, ''));
		},

		toJSON: function() { return JSON.stringify(paramSet); },
		load: function(json) { paramSet = JSON.parse(json); },

		addObserver: function(obj) {
			var index = observers.indexOf(obj);
			if (index < 0) observers.push(obj);
		},

		removeObserver: function(obj) {
			var index = observers.indexOf(obj);
			if (index >= 0) observers.splice(index, 1);
		}
		,
		convToValue: function (data, addr, size, ofs) {
			return toValue(data, addr, size, ofs);
		}
		,
		convToHexArray: function (value, size) {
			return toHexArray(value, size);
		}

	};

	var addr_len = ProductSetting.lengthOfAddr * 2;

	var _receiver = {

		receive: function(msg) {

			var s = STX + ROLAND + ProductSetting.deviceId + ProductSetting.modelId + DT1;
			if (msg.lastIndexOf(s, 0) !== 0) return; /* not dt1 */

			var dt1_addr = msg.substr(s.length, addr_len);
			var dt1_data = msg.substring(s.length + addr_len, msg.length - 4);

			var addr = nibble(parseInt(dt1_addr, 16));
			var top = addr;
			var size = dt1_data.length / 2;
			var next = null;

			while (size) {
				var bid = '';
				var block = null;

				var a = map.root;
				loop: while (true) {
					for (var n = a.length - 1; n >= 0; n--) {
						next = block;
						block = a[n];
						if (addr >= block.addr) {
							bid  += block.name;
							addr -= block.addr;
							if (block.size != 0) {
								break loop;
							}
							bid += "%";
							a = block.child;
							break;
						}
						if (n == 0) break loop;
					}
				}
				if (bid == '') return;

				var data = paramSet[bid];
				if (data === undefined) return;

				if (block.size < 0) {
					data.splice(addr + size, data.length - (addr + size));
				} else if (addr + size > data.length) {
					size = data.length - addr;
				}
				if (size > 0) {
					for (var i = 0; i < size; i++) {
						data[addr + i] = dt1_data.substr(i * 2, 2);
					}
					/* broadcast */
					var tmp = [].concat(observers);
					for (var i = 0, num = tmp.length; i < num; i++) {
						var index = observers.indexOf(tmp[i]);
						if (index >= 0) tmp[i].notify(bid, addr, addr + size);
					}
				} else if (next && (next.size != 0)) {
					size = next.addr - (block.addr + addr);
				} else {
					return;
				}
				top += size;
				addr = top;
				dt1_data = dt1_data.slice(size * 2);
				size = dt1_data.length / 2;
			}
		}
	};

	/* local functions */

	function blockinfo(bid) {
		var token = bid.split('%');
		var addr = 0;
		var block = null;

		var a = map.root;
		loop: while (token.length) {
			var name = token.shift();
			for (var n = 0, num = a.length; n < num; n++) {
				var b = a[n];
				if (b.name == name) {
					addr += b.addr;
					block = b;
					a = b.child;
					continue loop;
				}
			}
			alert('block not found : ' + bid);
			throw '';
		}
		return { addr: addr, block: block };
	}

	function dividesize(a, limit) {
		var set = [];
		var cnt = 0, size, offset = 0;
		for (var n = 0, num = a.length; n < num; n++) {
			var p = a[n];
			switch (p.size) {
				case INTEGER1x1: case INTEGER1x2: case INTEGER1x3: case INTEGER1x4:
				case INTEGER1x5: case INTEGER1x6: case INTEGER1x7:
					size = 1; break;
				case INTEGER2x4: case INTEGER2x7:
					size = 2; break;
				case INTEGER4x4:
					size = 4; break;
				default:
					size = (p.size & PADDING) ? (p.size & ~PADDING) : p.size; break;
			}
			cnt = (p.addr + size) - offset;
			if (cnt >= limit) {
				set.push(cnt);
				cnt = 0; offset = p.addr + size;
			}
		}
		if (cnt) set.push(cnt);
		return set;
	}

	function toHexArray(v, size) {
		var _ = [];
		switch (size) {
			case INTEGER1x1: case INTEGER1x2: case INTEGER1x3: case INTEGER1x4:
			case INTEGER1x5: case INTEGER1x6: case INTEGER1x7:
				_[0] = hex2((v & 0x007f));
				break;
			case INTEGER2x4:
				_[0] = hex2((v & 0x00f0) >>  4);
				_[1] = hex2((v & 0x000f));
				break;
			case INTEGER2x7:
				_[0] = hex2((v & 0x3f80) >>  7);
				_[1] = hex2((v & 0x007f));
				break;
			case INTEGER4x4:
				_[0] = hex2((v & 0xf000) >> 12);
				_[1] = hex2((v & 0x0f00) >>  8);
				_[2] = hex2((v & 0x00f0) >>  4);
				_[3] = hex2((v & 0x000f));
				break;
			default:
				if (size & PADDING) {
					size = (size & ~PADDING);
					v = hex2(v & 0x7f);
					for (var i = 0; i < size; i++) {
						_[i] = v;
					}
				} else { /* ASCII */
					var len = v.length;
					for (var i = 0; i < size; i++) {
						_[i] = (i < len) ? hex2(v.charCodeAt(i) & 0x7f) : '20';
					}
				}
				break;
		}
		return _;
	}

	function toValue(data, addr, size, ofs) {
		var fctr = 0;
		if (Array.isArray(ofs)) { fctr = ofs[1]; ofs = ofs[0]; }

		var v = 0;
		switch (size) {
			case INTEGER1x1: case INTEGER1x2: case INTEGER1x3: case INTEGER1x4:
			case INTEGER1x5: case INTEGER1x6: case INTEGER1x7:
				v = parseInt(data[addr], 16) - ofs;
				if (fctr) v = (v / fctr) | 0;
				break;
			case INTEGER2x4:
				var v1 = (parseInt(data[addr + 0], 16) <<  4);
				var v0 = (parseInt(data[addr + 1], 16));
				v = (v1 | v0) - ofs;
				if (fctr) v = (v / fctr) | 0;
				break;
			case INTEGER2x7:
				var v1 = (parseInt(data[addr + 0], 16) <<  7);
				var v0 = (parseInt(data[addr + 1], 16));
				v = (v1 | v0) - ofs;
				if (fctr) v = (v / fctr) | 0;
				break;
			case INTEGER4x4:
				var v3 = (parseInt(data[addr + 0], 16) << 12);
				var v2 = (parseInt(data[addr + 1], 16) <<  8);
				var v1 = (parseInt(data[addr + 2], 16) <<  4);
				var v0 = (parseInt(data[addr + 3], 16) <<  0);
				v = (v3 | v2 | v1 | v0) - ofs;
				if (fctr) v = (v / fctr) | 0;
				break;
			default:
				if (size & PADDING) {
					/* notthing to do */
				} else {
					v = '';
					for (var i = 0; i < size; i++) {
						v += String.fromCharCode(parseInt(data[addr + i], 16));
					}
				}
				break;
		}
		return v;
	}

	function broadcast(bid) {
		var len = paramSet[bid].length;
		var tmp = [].concat(observers);
		for (var i = 0, num = tmp.length; i < num; i++) {
			var index = observers.indexOf(tmp[i]);
			if (index >= 0) tmp[i].notify(bid, 0, len);
		}
	}

	/* construction */

	function init(a, size) {
		var _ = [];
		for (var n = 0; n < size; n++) _[n] = '00';
		for (var n = 0, num = a.length; n < num; n++) {
			var p = a[n];
			if (p.init === 0 && p.ofs === 0) continue;
			var _init = p.init;
			if (p.size >= INTEGER1x1) { _init += p.ofs; }
			var v = toHexArray(_init, p.size);
			for (var i = 0; i < v.length; i++) {
				_[p.addr + i] = v[i];
			}
		}
		return _;
	}

	(function(a, id) {
		for (var n = 0, num = a.length; n < num; n++) {
			var b = a[n];
			var bid = id + b.name;
			if (b.size == 0) {
				arguments.callee(b.child, bid + '%');
			} else if (b.size < 0) {
				paramSet[bid] = [ '00', '00', '00', '00' ];
			} else {
				if (!('data0' in b)) {
					b.data0 = init(b.child, b.size);
				}
				paramSet[bid] = b.data0.concat();
			}
		}
	})(map.root, '');

	window.Parameter = _obj; /* export window object */

	MIDIController.addReceiver(_receiver);

})(window);
