'use strict';

nbe.state.line_val_merge = function (parentval, childval) {
	var val, choose_singleton_else_parent;

	val = {};

	choose_singleton_else_parent = function (key) {
		if (key in parentval) {
			val[key] = parentval[key];
		} else if (key in childval) {
			val[key] = childval[key];
		}
	};

	nbe.state.formats.text.concat(nbe.state.formats.line).forEach(function (key) {
		choose_singleton_else_parent(key);
	});

	if ('left_margin' in parentval) {
		val.left_margin = parentval.left_margin;
	} else {
		delete val.left_margin;
	}

	return val;
};
