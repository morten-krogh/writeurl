'use strict';

nbe.inputs.list = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('list', title, content, {}, parent, trigger, init, false);

	return drop_down;
};
