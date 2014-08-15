'use strict';

nbe.location.last_child = function (node) {
	if (node.children.length === 0) {
		return null;
	} else {
		return node.children[node.children.length - 1];
	}
};
