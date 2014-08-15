'use strict';

nbe.location.previous_location = function (editor, loc) {
	var node_end, node, node_prev, node_parent_prev;

	node_end = function (node) {
		if (node.type === 'text') {
			return {container : node.id, offset : node.val.text.length};
		} else if (node.type === 'link') {
			return node_end(node.children[node.children.length - 1]);
		} else if (node.type === 'line') {
			if (node.children.length === 0) {
				return {container : node.id, offset : 0};
			} else {
				return node_end(node.children[node.children.length - 1]);
			}
		} else {
			return {container : node.id, offset : 1};
		}
	};

	node = editor.state.nodes[loc.container];

	if (node.type === 'text' && loc.offset > 1) {
		return {container : node.id, offset : loc.offset - 1};
	} else if (node.type === 'line') {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			return loc;
		}
	} else if (node.parent.type === 'line') {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			return {container : node.parent.id, offset : 0};
		}
	} else {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			node_parent_prev = nbe.location.previous_sibling(node.parent);
			if (node_parent_prev) {
				return node_end(node_parent_prev);
			} else {
				return {container : node.parent.parent.id, offset : 0};
			}
		}
	}
};
