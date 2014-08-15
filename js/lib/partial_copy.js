'use strict';

nbe.lib.partial_copy = function (src, dst, keys) {
	var i, key;

	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		if (key in src) {
			dst[key] = src[key];
		}
	}

	return dst;
};
