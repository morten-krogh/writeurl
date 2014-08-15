'use strict';

nbe.location.line = function (node) {
	while (node.type !== 'line') {
		node = node.parent;
	}

	return node;
};
