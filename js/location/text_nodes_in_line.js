'use strict';

nbe.location.text_nodes_in_line = function (line) {
	var nodes, i, node, j;

	nodes = [];
	for (i = 0; i < line.children.length; i++) {
		node = line.children[i];
		if (node.type === 'text') {
			nodes.push(node);
		} else if (node.type === 'link') {
			for (j = 0; j < node.children.length; j++) {
				if (node.children[j].type === 'text') {
					nodes.push(node.children[j]);
				}
			}
		}
	}

	return nodes;
};
