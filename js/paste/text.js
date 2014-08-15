'use strict';

nbe.paste.text = function (state, node) {
	var val, item;

	val = nbe.state.copy_text_format(state.format, {});
	val.text = node.textContent;

	item = {type : 'text', val : val, children : []};

	if (state.link) {
		state.link.children.push(item);
	} else {
		state.line.children.push(item);
	}

	return state;
};
