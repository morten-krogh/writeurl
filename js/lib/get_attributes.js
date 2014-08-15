'use strict';

nbe.lib.get_attributes = function (element, keys) {
	var format, set_value, i;

	format = {};

	set_value = function (key) {
		var value;

		value = element.getAttribute('data-' + key);
		if (value) {
			format[key] = value;
		}
	};

	for (i = 0; i < keys.length; i++) {
		set_value(keys[i]);
	}

	return format;
};
