'use strict';

nbe.location.first_child = function (node) {
	if (node.children.length === 0) {
		return null;
	} else {
		return node.children[0];
	}
};
