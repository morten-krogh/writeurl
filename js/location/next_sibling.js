'use strict';

nbe.location.next_sibling = function (node) {
	var index;

	index = node.parent.children.indexOf(node);
	if (index < node.parent.children.length - 1) {
		return node.parent.children[index + 1];
	} else {
		return null;
	}
};
