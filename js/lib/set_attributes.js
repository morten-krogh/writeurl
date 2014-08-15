'use strict';

nbe.lib.set_attributes = function (element, keys, format) {
	var set_attribute, i;

	set_attribute = function (key) {
		if (key in format) {
			element.setAttribute('data-' + key, format[key]);
		} else {
			element.removeAttribute('data-' + key);
		}
	};

	for (i = 0; i < keys.length; i++) {
		set_attribute(keys[i]);
	}

	return element;
};
