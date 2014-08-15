'use strict';

nbe.location.previous_node = function (node) {
	var last_descendant, index;

	last_descendant = function (node2) {
		if (node2.children.length === 0) {
			return node2;
		} else {
			return last_descendant(node2.children[node2.children.length - 1]);
		}
	};

	if (node.parent) {
		index = node.parent.children.indexOf(node);
		if (index > 0) {
			return last_descendant(node.parent.children[index - 1]);
		} else {
			return node.parent;
		}
	} else {
		return null;
	}
};
