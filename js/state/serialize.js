'use strict';

nbe.state.serialize = function (state) {
	var new_nodes, nodes, id, node, new_node, i;

	new_nodes = {};
	nodes = state.nodes;
	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_node = {type : node.type, id : node.id, val : node.val, children : []};
			if (node.parent) {
				new_node.parent = node.parent.id;
			}
			for (i = 0; i < node.children.length; i++) {
				new_node.children[i] = node.children[i].id;
			}
			new_nodes[id] = new_node;
		}
	}

	return JSON.stringify({nodes : new_nodes});
};
