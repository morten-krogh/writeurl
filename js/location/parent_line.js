'use strict';

nbe.location.parent_line = function (editor, id) {
	var node;

	node = editor.state.nodes[id];
	while (node && node.type !== 'line') {
		node = node.parent;
	}

	return node;
};
