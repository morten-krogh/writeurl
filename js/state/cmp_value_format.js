'use strict';

nbe.state.cmp_value_format = function (type, value, format) {
	if (nbe.state.formats.default_values[type] === value) {
		return !(type in format);
	} else {
		return (type in format) && format[type] === value;
	}
};
