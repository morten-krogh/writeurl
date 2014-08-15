'use strict';

nbe.location.next_node = function (node) {
	var next_sibling_or_higher;

	next_sibling_or_higher = function (node) {
		var index;

		if (node.parent) {
			index = node.parent.children.indexOf(node);
			if (index < node.parent.children.length - 1) {
				return node.parent.children[index + 1];
			} else {
				return next_sibling_or_higher(node.parent);
			}
		} else {
			return null;
		}
	};

	if (node.children.length === 0) {
		return next_sibling_or_higher(node);
	} else {
		return node.children[0];
	}
};
