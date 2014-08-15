'use strict';

nbe.location.insert_after = function (editor, id) {
	var node, index;

	node = editor.state.nodes[id];
	index = node.parent.children.indexOf(node);
	if (index < node.parent.children.length - 1) {
		return {domop : 'insert', before : node.parent.children[index + 1].id};
	} else {
		return {domop : 'append', parent : node.parent.id};
	}
};
