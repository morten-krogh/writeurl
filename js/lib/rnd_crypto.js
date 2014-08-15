'use strict';

nbe.lib.rnd_crypto = function (n) {
	var chars, buf, i;

	chars = [];

	if ('crypto' in window && 'getRandomValues' in window.crypto) {
		buf = new Uint8Array(n);
		window.crypto.getRandomValues(buf);
		for (i = 0; i < n; i++) {
			chars[i] = buf[i].toString(36).slice(-1);
		}
	}

	return chars.join('');
};
