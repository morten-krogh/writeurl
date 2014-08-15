'use strict';

nbe.triggers.tab = function (editor) {
	var node, oploc;

	if (!editor.location) {
		return null;
	}

	node = editor.state.nodes[editor.location.start.container];
	if (node.type === 'line') {
		oploc = nbe.triggers.left_margin(editor, 'increment');
	} else {
		oploc = nbe.triggers.text(editor, ' ');
	}

	return oploc;
};
