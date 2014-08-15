'use strict';

nbe.paste.link = function (state, node) {
	var val, item;

	val = {href : node.href};
	item = {type : 'link', val : val, children : []};

	state.line.children.push(item);

	state.link = item;

	state = nbe.paste.traverse(state, node);

	state.link = null;

	return state;
};
