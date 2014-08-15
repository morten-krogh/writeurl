'use strict';

nbe.inputs.font_family = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('font_family', title, content, {}, parent, trigger, init, false);

	return drop_down;
};
