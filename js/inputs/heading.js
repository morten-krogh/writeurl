'use strict';

nbe.inputs.heading = function (trigger, title, menu_content, button_content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('heading', title, menu_content, button_content, parent, trigger, init, false);

	return drop_down;
};
