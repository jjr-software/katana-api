/**
 * librarian.js
 * 
 * The function overriding definition to adjust to device parameter specifications
 */
Librarian.prototype.temporaryWrite = function(cell, row) {

	if (this.timerId) return;

	var tasks = [];
	var temporarySet = this.config.temporarySet;
	for (var prop in temporarySet) {
		if (this.config.ExclusionSet) {
			if (this.config.ExclusionSet.indexOf(prop) >= 0) {
				continue;
			}
		}
		var b = Parameter.getblock(temporarySet[prop]);
		var d = cell.paramSet[prop];
		var addr = b.addr;
		var str = (d.join()).replace(/,/g, '');
		if (b.size < 0) {
			b.size = [ 4 ];
			for (var len = (str.length / 2) - 4, cnt = 0; len > 0; len -= cnt) {
				cnt = (len < SYSEX_MAXLEN) ? len : SYSEX_MAXLEN;
				b.size.push(cnt);
			}
		}
		var size, i = 0;
		while ((size = b.size.shift()) !== undefined) {
			var data = str.substr(i * 2, size * 2);
			tasks.push({ addr:addr, data:data });
			addr += size; i += size;
		}
	}
	this.configCommand = null;
	this.configStop = this.config.writeTemporaryStop;
	this.config.writeTemporaryStart(MIDIController, row);
	this.writeStart(tasks, 'librarian_temporaryWrite', 0, 0);
};
