'use strict';

nbe.lib.rnd_math_random = function (n) {
	var chars, i;

	chars = [];

	for (i = 0; i < n; i++) {
		chars[i] = Math.floor(36 * Math.random()).toString(36);
	}

	return chars.join('');
};
