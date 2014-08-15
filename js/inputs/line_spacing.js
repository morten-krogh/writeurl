'use strict';

nbe.inputs.line_spacing = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('line_spacing', title, content, {}, parent, trigger, init, false);

	return drop_down;
};
