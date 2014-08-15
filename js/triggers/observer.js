'use strict';

nbe.triggers.observer = function (editor, mutations) {
	var nodes, dom, added_nodes, removed_nodes, mutated_nodes, add_to_array, remove_from_array, add_node, remove_node, mutate_node, add_line, lines, oploc;

	nodes = editor.state.nodes;
	dom = editor.dom;
	added_nodes = [];
	removed_nodes = [];
	mutated_nodes = [];

	add_to_array = function (array, item) {
		var index;

		index = array.indexOf(item);
		if (index === -1) {
			array.push(item);
		}

		return index === -1;
	};

	remove_from_array = function (array, item) {
		var index;

		index = array.indexOf(item);
		if (index !== -1) {
			array.splice(index, 1);
		}

		return index !== -1;
	};

	add_node = function (node) {
		add_to_array(added_nodes, node);
	};

	remove_node = function (node) {
		var removed;

		removed = remove_from_array(added_nodes, node);
		if (!removed) {
			add_to_array(removed_nodes, node);
		}
	};

	mutate_node = function (node) {
		if (added_nodes.indexOf(node) === -1) {
			add_to_array(mutated_nodes, node);
		}
	};

	mutations.forEach(function (mutation) {
		var i;

		if (mutation.type === 'characterData') {
			mutate_node(mutation.target);
		} else if (mutation.type === 'childList') {
			for (i = 0; i < mutation.addedNodes.length; i++) {
				add_node(mutation.addedNodes[i]);
			}
			for (i = 0; i < mutation.removedNodes.length; i++) {
				remove_node(mutation.removedNodes[i]);
			}
		}
	});

	add_line = function (el, lines) {
		var id;

		while (el !== null && !(el.classList && el.classList.contains('line'))) {
			el = el.parentNode;
		}

		if (el) {
			id = el.getAttribute('data-id');
			lines[id] = true;
		}
	};

	lines = {};

	added_nodes.concat(removed_nodes).concat(mutated_nodes).forEach(function (node) {
		add_line(node, lines);
	});

	oploc = nbe.ops.modified(editor, Object.keys(lines));

	nbe.state.clean(editor);

	return oploc;
};
