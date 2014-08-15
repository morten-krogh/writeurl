'use strict';

nbe.location.previous_sibling = function (node) {
	var index;

	index = node.parent.children.indexOf(node);
	if (index > 0) {
		return node.parent.children[index - 1];
	} else {
		return null;
	}
};
