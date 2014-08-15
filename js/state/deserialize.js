'use strict';

nbe.state.deserialize = function (str) {
	var new_nodes, nodes, id, node, new_node, i;

	new_nodes = {};
	nodes = JSON.parse(str).nodes;
	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_nodes[id] = {type : node.type, id : node.id, val : node.val, children : []};
		}
	}

	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_node = new_nodes[id];
			if (node.parent) {
				new_node.parent = new_nodes[node.parent];
			}
			for (i = 0; i < node.children.length; i++) {
				new_node.children[i] = new_nodes[node.children[i]];
			}
		}
	}

	return {nodes : new_nodes};
};
