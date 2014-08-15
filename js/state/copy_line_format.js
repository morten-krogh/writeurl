'use strict';

nbe.state.copy_line_format = function (src, dst) {
	var keys, i, key;

	keys = nbe.state.formats.text.concat(nbe.state.formats.line);

	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		if (key in src) {
			dst[key] = src[key];
		} else {
			delete dst[key];
		}
	}

	return dst;
};
