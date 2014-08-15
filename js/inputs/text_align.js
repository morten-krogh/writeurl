'use strict';

nbe.inputs.text_align = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('text_align', title, content, {}, parent, trigger, init, false);

	return drop_down;
};
