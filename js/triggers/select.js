'use strict';

nbe.triggers.select = function (editor) {
	var last, next, offset, location;

	last = nbe.location.last_child(editor.state.nodes.root);
	next = nbe.location.next_node(last);
	while (next !== null) {
		last = next;
		next = nbe.location.next_node(last);
	}

	if (last.type === 'text') {
		offset = last.val.text.length;
	} else if (last.type === 'line') {
		offset = 0;
	} else {
		offset = 1;
	}

	location = {start : {container : 'line', offset : 0}, end : {container : last.id, offset : offset}, collapsed : false};

	nbe.location.set(editor, location);
};
