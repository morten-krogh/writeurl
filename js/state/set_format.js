'use strict';

nbe.state.set_format = function (type, value, format) {
	if (nbe.state.formats.default_values[type] === value) {
		delete format[type];
	} else {
		format[type] = value;
	}

	return format;
};
