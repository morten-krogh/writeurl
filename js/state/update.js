'use strict';

nbe.state.update = function (editor, state, dom, ops) {
	var nodes, root, insert, append, remove, mutate, split, merge, opi, op;

	nodes = state.nodes;
	root = nodes.root;

	insert = function (id, before, type, val) {
		var node, index;

		if (!(id in nodes) && before in nodes) {
			node = {id : id, type : type, val : val, parent : nodes[before].parent, children : []};
			nodes[id] = node;
			index = node.parent.children.indexOf(nodes[before]);
			node.parent.children = node.parent.children.slice(0, index).concat([node]).concat(node.parent.children.slice(index));
			if (dom) {
				dom[id] = nbe.state.element(id, type, val);
				dom[nodes[before].parent.id].insertBefore(dom[id], dom[before]);
			}
		}
	};

	append = function (id, parent_id, type, val) {
		var node;

		if (!(id in nodes) && parent_id in nodes) {
			node = {id : id, type : type, val : val, parent : nodes[parent_id], children : []};
			nodes[id] = node;
			node.parent.children.push(node);
			if (dom) {
				dom[id] = nbe.state.element(id, type, val);
			}
			if (node.parent.type === 'line') {
				if (dom) {
					dom[parent_id].insertBefore(dom[id], dom[parent_id].lastChild);
				}
				nbe.state.line_font_size(state, dom, parent_id, 'append');
			} else {
				if (dom) {
					dom[parent_id].appendChild(dom[id]);
				}
			}
		}
	};

	remove = function (id) {
		var node, index;

		if (id in nodes) {
			node = nodes[id];
			if (node.children.length === 0) {
				if (node.parent.type === 'line') {
					nbe.state.line_font_size(state, dom, node.parent.id, 'remove');
				}
				delete nodes[id];
				index = node.parent.children.indexOf(node);
				node.parent.children = node.parent.children.slice(0, index).concat(node.parent.children.slice(index + 1));
				if (dom) {
					dom[node.parent.id].removeChild(dom[id]);
					delete dom[id];
				}
			}
		}
	};

	mutate = function (id, val) {
		if (id in nodes) {
			nodes[id].val = val;
			if (dom) {
				nbe.state.mutate_element(dom[id], nodes[id].type, val);
			}
		}
	};

	split = function (parent_id, child_id, point_id, parentval, childval) {
		var par, child, index_par, index_point, i, par_child;

		par = nodes[parent_id];
		if (!(child_id in nodes) && par && par.type === 'line') {
			child = {id : child_id, type : 'line', val : childval, parent : root, children : []};
			nodes[child_id] = child;
			if (dom) {
				dom[child_id] = nbe.state.element(child_id, 'line', child.val);
			}
			index_par = root.children.indexOf(par);
			if (index_par === root.children.length - 1) {
				if (dom) {
					dom.root.appendChild(dom[child_id]);
				}
			} else {
				if (dom) {
					dom.root.insertBefore(dom[child_id], dom[root.children[index_par + 1].id]);
				}
			}
			root.children = root.children.slice(0, index_par + 1).concat([child]).concat(root.children.slice(index_par + 1));
			if (point_id && point_id in nodes && nodes[point_id].parent === par) {
				index_point = par.children.indexOf(nodes[point_id]);
			} else {
				index_point = par.children.length;
			}
			for (i = index_point; i < par.children.length; i++) {
				par_child = par.children[i];
				par_child.parent = child;
				if (dom) {
					dom[parent_id].removeChild(dom[par_child.id]);
					dom[child_id].insertBefore(dom[par_child.id], dom[child_id].lastChild);
				}
			}
			child.children = par.children.slice(index_point);
			par.children = par.children.slice(0, index_point);
			par.val = parentval;
			if (dom) {
				nbe.state.mutate_element(dom[parent_id], 'line', parentval);
			}
		}
	};

	merge = function (parent_id, parentval, childval) {
		var par, index_par, child, i, child_child;

		par = nodes[parent_id];
		if (par && par.type === 'line') {
			index_par = root.children.indexOf(par);
			if (index_par < root.children.length - 1) {
				child = root.children[index_par + 1];
				for (i = 0; i < child.children.length; i++) {
					child_child = child.children[i];
					child_child.parent = par;
					if (dom) {
						dom[child.id].removeChild(dom[child_child.id]);
						dom[parent_id].insertBefore(dom[child_child.id], dom[parent_id].lastChild);
					}
				}
				if (dom) {
					dom.root.removeChild(dom[child.id]);
					delete dom[child.id];
				}
				root.children = root.children.slice(0, index_par + 1).concat(root.children.slice(index_par + 2));
				delete nodes[child.id];
				par.children = par.children.concat(child.children);
				par.val = nbe.state.line_val_merge(parentval, childval);
				if (dom) {
					nbe.state.mutate_element(dom[parent_id], 'line', par.val);
				}
			}
		}
	};

	if (dom) {
		editor.mutation.disconnect();
	}

	for (opi = 0; opi < ops.length; opi++) {
		op = ops[opi];
		if (op.domop === 'insert') {
			insert(op.id, op.before, op.type, op.val);
		} else if (op.domop === 'append') {
			append(op.id, op.parent, op.type, op.val);
		} else if (op.domop === 'remove') {
			remove(op.id);
		} else if (op.domop === 'mutate') {
			mutate(op.id, op.after);
		} else if (op.domop === 'split') {
			split(op.parent, op.child, op.point, op.parentval, op.childval);
		} else if (op.domop === 'merge') {
			merge(op.parent, op.parentval, op.childval);
		}
	}

	if (dom) {
		nbe.state.reset_counter(editor);
		editor.mutation.observe();
	}
};
