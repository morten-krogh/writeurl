'use strict';

nbe.location.loc_previous = function (node) {
	var node_end, index, node_previous;

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

	index = node.parent.children.indexOf(node);
	if (index > 0) {
		node_previous = node.parent.children[index - 1];
		return {start : node_end(node_previous), collapsed : true};
	} else if (node.type === 'line') {
		return {start : {container : node.id, offset : 0}, collapsed : true};
	} else if (node.parent.type === 'line') {
		return {start : {container : node.parent.id, offset : 0}, collapsed : true};
	} else {
		return nbe.location.loc_previous(node.parent);
	}
};
