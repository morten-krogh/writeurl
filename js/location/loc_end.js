'use strict';

nbe.location.loc_end = function (node) {
	if (node.type === 'text') {
		return {container : node.id, offset : node.val.text.length};
	} else if (node.type === 'link') {
		return nbe.location.loc_end(node.children[node.children.length - 1]);
	} else if (node.type === 'line') {
		if (node.children.length === 0) {
			return {container : node.id, offset : 0};
		} else {
			return nbe.location.loc_end(node.children[node.children.length - 1]);
		}
	} else {
		return {container : node.id, offset : 1};
	}
};
