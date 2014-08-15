'use strict';

nbe.ops.insert_after = function (editor, id, items) {
	var node, next;

	node = editor.state.nodes[id];
	next = nbe.location.next_sibling(node);

	if (next) {
		return nbe.ops.insert_before(editor, next.id, items);
	} else {
		return nbe.ops.append(editor, node.parent, items);
	}
};
