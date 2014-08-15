'use strict';

nbe.inputs.font_size = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('font_size', title, content, {}, parent, trigger, init, true);

	return drop_down;
};
