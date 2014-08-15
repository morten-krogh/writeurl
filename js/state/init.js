'use strict';

nbe.state.init = function (editor, state) {
	var dom, insert_child_nodes;

	editor.state = state;
	editor.dom = dom = {};

	dom.root = nbe.state.element('root', 'root', state.nodes.root.val);

	insert_child_nodes = function (par, type, nodes) {
		var i, node;

		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];
			dom[node.id] = nbe.state.element(node.id, node.type, node.val);
			if (type === 'line') {
				par.insertBefore(dom[node.id], par.lastChild);
			} else {
				par.appendChild(dom[node.id]);
			}
			insert_child_nodes(dom[node.id], node.type, node.children);
		}
	};

	insert_child_nodes(dom.root, 'root', state.nodes.root.children);

	nbe.state.reset_counter(editor);

	editor.mutation.disconnect();

	while (editor.el_editor.firstChild) {
		editor.el_editor.removeChild(editor.el_editor.firstChild);
	}
	editor.el_editor.appendChild(dom.root);

	editor.mutation.observe();

	return editor;
};
