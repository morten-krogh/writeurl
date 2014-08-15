'use strict';

nbe.paste.img = function (state, node) {
	var val, add_props, item;

	val = {};

	add_props = function (names) {
		var i;

		for (i = 0; i < names.length; i++) {
			if (node[names[i]]) {
				val[names[i]] = node[names[i]];
			}
		}
	};

	add_props(['src', 'width', 'height', 'title']);

	item = {type : 'img', val : val, children : []};

	if (state.link) {
		state.link.children.push(item);
	} else {
		state.line.children.push(item);
	}

	return state;
};
