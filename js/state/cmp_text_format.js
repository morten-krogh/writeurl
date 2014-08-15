'use strict';

nbe.state.cmp_text_format = function (format1, format2) {
	var cmp_type, i;

	cmp_type = function (type) {
		if (type in format1 && type in format2) {
			return format1[type] === format2[type];
		} else if (type in format1) {
			return nbe.state.formats.default_values[type] === format1[type];
		} else if (type in format2) {
			return nbe.state.formats.default_values[type] === format2[type];
		} else {
			return true;
		}
	};

	for (i = 0; i < nbe.state.formats.text.length; i++) {
		if (!cmp_type(nbe.state.formats.text[i])) {
			return false;
		}
	}

	return true;
};
