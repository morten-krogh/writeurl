import { clone } from './lib.js';

nbe.ops.append = function (editor, id, items) {
	const ops = [];
	let iditem = null;

	const fill = function (ops, parent_id, items) {
		for (let i = 0; i < items.length; i++) {
			const new_id = editor.new_id();
			const item = items[i];
			ops.push({domop : 'append', id : new_id, parent : parent_id, type : item.type, val : item.val});
			iditem = {id : new_id, item : item};
			fill(ops, new_id, item.children);
		}
	};

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const new_id = editor.new_id();
		ops.push({domop : 'append', id : new_id, parent : id, type : item.type, val : item.val});
		iditem = {id : new_id, item : item};
		fill(ops, new_id, item.children);
	}

	return ops.length > 0 ? {ops : ops, loc : nbe.location.item_to_loc(iditem)} : null;
};

nbe.ops.insert_after = function (editor, id, items) {
	const node = editor.state.nodes[id];
    const next = nbe.location.next_sibling(node);

	if (next) {
		return nbe.ops.insert_before(editor, next.id, items);
	} else {
		return nbe.ops.append(editor, node.parent, items);
	}
};

nbe.ops.insert_before = function (editor, id, items) {
	const ops = [];
	let iditem = null;

	const fill = function (ops, parent_id, items) {
		for (let i = 0; i < items.length; i++) {
			const new_id = editor.new_id();
			const item = items[i];
			ops.push({domop : 'append', id : new_id, parent : parent_id, type : item.type, val : item.val});
			iditem = {id : new_id, item : item};
			fill(ops, new_id, item.children);
		}
	};

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const new_id = editor.new_id();
		ops.push({domop : 'insert', id : new_id, before : id, type : item.type, val : item.val});
		iditem = {id : new_id, item : item};
		fill(ops, new_id, item.children);
	}

	return ops.length > 0 ? {ops : ops, loc : nbe.location.item_to_loc(iditem)} : null;
};

nbe.ops.line = function (editor, start, end, insertion) {
	var node, line_offset_start, line_child_start, line_offset_end, line_child_end, ops, loc, oploc, i;

	if (start) {
		if (start.node.type === 'line') {
			node = start.node;
			line_offset_start = 0;
			line_child_start = null;
		} else if (start.node.parent.type === 'line') {
			node = start.node.parent;
			line_offset_start = node.children.indexOf(start.node) + 1;
			line_child_start = nbe.location.in_text(start) ? start.node : null;
		} else if (start.node.parent.type === 'link') {
			node = start.node.parent.parent;
			line_offset_start = node.children.indexOf(start.node.parent) + 1;
			line_child_start = nbe.location.in_link(start) ? start.node.parent : null;
		}
	} else {
		line_offset_start = 0;
		line_child_start = null;
	}

	if (end) {
		if (end.node.type === 'line') {
			node = end.node;
			line_offset_end = 0;
			line_child_end = null;
		} else if (end.node.parent.type === 'line') {
			node = end.node.parent;
			line_offset_end = node.children.indexOf(end.node) + (nbe.location.in_text(end) ? 0 : 1);
			line_child_end = nbe.location.in_text(end) ? end.node : null;
		} else if (end.node.parent.type === 'link') {
			node = end.node.parent.parent;
			line_offset_end = node.children.indexOf(end.node.parent) + (nbe.location.in_link(end) ? 0 : 1);
			line_child_end = nbe.location.in_link(end) ? end.node.parent : null;
		}
	} else {
		line_offset_end = node.children.length;
		line_child_end = null;
	}

	ops = [];
	loc = start ? {container : start.node.id, offset : start.offset} : {container : node.id, offset : 0};

	if (line_offset_end < line_offset_start) {
		if (line_child_start.type === 'text') {
			oploc = nbe.ops.text(editor, start, end, insertion);
		} else {
			oploc = nbe.ops.link(editor, start, end, insertion);
		}
		ops = ops.concat(oploc.ops);
		if (oploc.loc) {
			loc = oploc.loc;
		}
	} else {
		if (line_child_start) {
			if (line_child_start.type === 'text') {
				oploc = nbe.ops.text(editor, start, null, null);
			} else {
				oploc = nbe.ops.link(editor, start, null, null);
			}
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}

		for (i = line_offset_start; i < line_offset_end; i++) {
			ops = ops.concat(nbe.ops.remove(node.children[i]));
		}

		oploc = null;
		if (line_child_end) {
			if (line_child_end.type === 'text') {
				oploc = nbe.ops.text(editor, null, end, insertion);
			} else {
				oploc = nbe.ops.link(editor, null, end, insertion);
			}
		} else {
			if (insertion) {
				if (line_offset_end === node.children.length) {
					oploc = nbe.ops.append(editor, node.id, insertion);
				} else if (line_offset_end === 0 && end.node.children.length > 0) {
					oploc = nbe.ops.insert_before(editor, end.node.children[0].id, insertion);
				} else {
					oploc = nbe.ops.insert_after(editor, end.node.id, insertion);
				}
			}
		}
		if (oploc) {
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	}

	return {ops : ops, loc : loc};
};

nbe.ops.link = function (editor, start, end, insertion) {
	var prune, node, link_offset_start, end_of_end, link_offset_end, ops, loc, oploc, i;

	prune = function (ins) {
		var out, i;

		out = [];
		for (i = 0; i < ins.length; i++) {
			if (ins[i].type !== 'link') {
				out.push(ins[i]);
			} else {
				out = out.concat(ins[i].children);
			}
		}

		return out;
	};

	if (insertion) {
		insertion = prune(insertion);
	}

	node = start ? start.node.parent : end.node.parent;

	link_offset_start = start ? node.children.indexOf(start.node) + 1 : 0;

	if (end) {
		end_of_end = !nbe.location.in_text(end);
		link_offset_end = node.children.indexOf(end.node) + (end_of_end ? 1 : 0);
	} else {
		end_of_end = true;
		link_offset_end = node.children.length;
	}

	ops = [];
	loc = null;

	if (link_offset_end < link_offset_start) {
		oploc = nbe.ops.text(editor, start, end, insertion);
		ops = ops.concat(oploc.ops);
		loc = oploc.loc;
	} else {
		if (nbe.location.in_text(start)) {
			oploc = nbe.ops.text(editor, start, null, null);
			ops = ops.concat(oploc.ops);
			loc = oploc.loc;
		} else {
			loc = start ? {container : start.node.id, offset : start.offset} : null;
		}

		for (i = link_offset_start; i < link_offset_end; i++) {
			ops = ops.concat(nbe.ops.remove(node.children[i]));
		}

		if (end_of_end) {
			if (insertion) {
				oploc = nbe.ops.insert_after(editor, end.node.id, insertion);
				if (oploc) {
					ops = ops.concat(oploc.ops);
					if (oploc.loc) {
						loc = oploc.loc;
					}
				}
			}
		} else {
			oploc = nbe.ops.text(editor, null, end, insertion);
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	}

	return {ops : ops, loc : loc};
};

nbe.ops.modified = function (editor, ids) {
	var nodes, traverse_remove_mutate, in_dom, removed, mutate, traverse_insert, traverse_line, find_loc, ops, i, loc, oploc;

	nodes = editor.state.nodes;

	traverse_remove_mutate = function (id, ops) {
		var node, i, child;

		node = nodes[id];
		for (i = 0; i < node.children.length; i++) {
			child = node.children[i];
			if (removed(child.id)) {
				ops = ops.concat(nbe.ops.remove(child));
			} else if (child.type === 'text') {
				ops = mutate(child, ops);
			} else if (child.type === 'link') {
				ops = traverse_remove_mutate(child.id, ops);
			}
		}

		return ops;
	};

	in_dom = function (id) {
		var el;

		el = editor.dom[id];
		while (el !== null && !(el.getAttribute && el.getAttribute('data-id') === 'root')) {
			el = el.parentNode;
		}

		return el !== null;
	};

	removed = function (id) {
		if (!in_dom(id)) {
			return true;
		}

		if (nodes[id].type === 'text') {
			return editor.dom[id].textContent === '';
		} else {
			return false;
		}
	};

	mutate = function (node, ops) {
		var el, op;

		el = editor.dom[node.id];
		if (node.val.text !== el.textContent) {
			op = {domop : 'mutate', id : node.id, before : node.val, after : clone(node.val)};
			op.after.text = el.textContent;
			ops.push(op);
		}

		return ops;
	};

	traverse_insert = function (id, ops) {
		var el, next_id, previous_id, new_val, i, child, text, val, new_id, op, insert_id;

		if (removed(id)) {
			return ops;
		}

		el = editor.dom[id];

		next_id = function (el, index) {
			var el2;

			if (el.childNodes.length === index) {
				return null;
			} else {
				el2 = el.childNodes[index];
				if (el2.getAttribute && el2.getAttribute('data-id')) {
					id = el2.getAttribute('data-id');
					if (nodes[id].type === 'text' && el2.textContent === '') {
						return next_id(el, index + 1);
					} else {
						return id;
					}
				} else {
					return next_id(el, index + 1);
				}
			}
		};

		previous_id = function (el, index) {
			var el2;

			if (index === -1) {
				return null;
			} else {
				el2 = el.childNodes[index];
				if (el2.getAttribute && el2.getAttribute('data-id')) {
					return el2.getAttribute('data-id');
				} else {
					return previous_id(el, index - 1);
				}
			}
		};

		new_val = function (el, index) {
			var val, prev, node, next;

			val = null;
			prev = previous_id(el, index);
			if (prev) {
				node = nodes[prev];
				if (node.type === 'text') {
					val = clone(node.val);
				}
			}
			if (val === null) {
				next = next_id(el, index);
				if (next) {
					node = nodes[next];
					if (node.type === 'text') {
						val = clone(node.val);
					}
				}
			}

			return val === null ? {} : val;
		};

		for (i = 0; i < el.childNodes.length; i++) {
			child = el.childNodes[i];
			if (!(child.classList && child.classList.contains('nbe'))) {
				text = child.textContent;
				if (text !== '') {
					val = new_val(el, i);
					val.text = text;
					new_id = editor.new_id();
					op = {id : new_id, type : 'text', val : val};
					insert_id = next_id(el, i);
					if (insert_id) {
						op.domop = 'insert';
						op.before = insert_id;
					} else {
						op.domop = 'append';
						op.parent = id;
					}
					ops.push(op);
				}
			}
		}

		return ops;
	};

	traverse_line = function (id, ops) {
		var node, i, child;

		node = nodes[id];

		ops = traverse_remove_mutate(id, ops);
		ops = traverse_insert(id, ops);
		for (i = 0; i < node.children.length; i++) {
			child = node.children[i];
			if (child.type === 'link') {
				ops = traverse_insert(child.id, ops);
			}
		}

		return ops;
	};

	find_loc = function () {
		var loc, node, el;

		loc = null;
		if (editor.location) {
			loc = {container : editor.location.start.container, offset : editor.location.start.offset};
			if (!removed(loc.container)) {
				node = nodes[loc.container];
				if (node.type === 'text') {
					el = editor.dom[loc.container];
					loc.offset = Math.min(loc.offset + 1, el.textContent.length);
				}
			} else {
				loc = null;
			}
		}

		return loc;
	};

	ops = [];
	for (i = 0; i < ids.length; i++) {
		ops = traverse_line(ids[i], ops);
	}
	loc = find_loc();

	if (loc) {
		oploc = {ops : ops, loc : loc};
	} else {
		oploc = {ops : ops, loc_after : null};
	}

	return oploc;
};

nbe.ops.remove = function (node) {
	var before_parent, remove;

	before_parent = function (node, op) {
		var index;

		index = node.parent.children.indexOf(node);
		if (index === node.parent.children.length - 1) {
			op.parent = node.parent.id;
		} else {
			op.before = node.parent.children[index + 1].id;
		}
		return op;
	};

	remove = function (node, ops) {
		var i;

		for (i = 0; i < node.children.length; i++) {
			remove(node.children[i], ops);
		}
		ops.push(before_parent(node, {domop : 'remove', id : node.id, type : node.type, val : node.val}));

		return ops;
	};

	return remove(node, []);
};

nbe.ops.root = function (editor, start, end, insertion) {
	var line_start, line_end, root, root_offset_start, root_offset_end, ops, loc, incorp, conc, new_line_id, parentval, childval, split_point, i, items, merge_point;

	line_start = nbe.location.line(start.node);
	line_end = nbe.location.line(end.node);

	root = line_start.parent;

	root_offset_start = root.children.indexOf(line_start);
	root_offset_end = root.children.indexOf(line_end);

	ops = [];
	loc = null;

	incorp = function (oploc) {
		if (oploc) {
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	};

	conc = function (oploc) {
		if (oploc) {
			ops = ops.concat(oploc.ops);
		}
	};

	if (root_offset_start === root_offset_end) {
		if (insertion === null) {
			incorp(nbe.ops.line(editor, start, end, null));
		} else if (insertion.length === 1) {
			incorp(nbe.ops.line(editor, start, end, insertion[0].children));
		} else {
			conc(nbe.ops.line(editor, start, end, insertion[0].children));
			new_line_id = editor.new_id();
			split_point = nbe.location.split_merge_point(end);
			parentval = clone(line_start.val);
			childval = nbe.state.copy_line_format(editor.format, {});
			if (start.node === line_start) {
				delete parentval.heading;
			} else {
				delete childval.heading;
			}
			ops.push({domop : 'split', parent : line_start.id, child : new_line_id, point : split_point, parentval : parentval, childval : childval});
			loc = {container : new_line_id, offset : 0};
			if (split_point) {
				incorp(nbe.ops.insert_before(editor, split_point, insertion[insertion.length - 1].children));
			} else {
				incorp(nbe.ops.append(editor, new_line_id, insertion[insertion.length - 1].children));
			}
			conc(nbe.ops.insert_before(editor, new_line_id, insertion.slice(1, insertion.length - 1)));
		}
	} else {
		for (i = root_offset_start + 1; i < root_offset_end; i++) {
			ops = ops.concat(nbe.ops.remove(root.children[i]));
		}

		if (insertion === null) {
			incorp(nbe.ops.line(editor, start, null, null));
			conc(nbe.ops.line(editor, null, end, null));
			ops.push({domop : 'merge', parent : line_start.id, child : line_end.id, point : nbe.location.split_merge_point(end), parentval : line_start.val, childval : line_end.val});
		} else if (insertion.length === 1) {
			incorp(nbe.ops.line(editor, start, null, null));
			items = insertion[0].children;
			incorp(nbe.ops.line(editor, null, end, items));
			merge_point = items.length === 0 ? nbe.location.split_merge_point(end) : items[0].id;
			ops.push({domop : 'merge', parent : line_start.id, child : line_end.id, point : merge_point, parentval : line_start.val, childval : line_end.val});
		} else {
			conc(nbe.ops.line(editor, start, null, insertion[0].children));
			conc(nbe.ops.insert_before(editor, line_end.id, insertion.slice(1, insertion.length - 1)));
			incorp(nbe.ops.line(editor, null, end, insertion[insertion.length - 1].children));
		}
	}

	return {ops : ops, loc : loc};
};

nbe.ops.text = function (editor, start, end, insertion) {
	const node = start ? start.node : end.node;

	const op_mutate = {domop : 'mutate', id : node.id, before : node.val, after : clone(node.val)};
	let ops = [op_mutate];
	let loc = null;

	if (insertion) {
		op_mutate.after.text = node.val.text.slice(end.offset);
		if (start) {
			const op_start = {domop : 'insert', id : editor.new_id(), before : node.id, type : 'text', val : clone(node.val)};
			op_start.val.text = node.val.text.slice(0, start.offset);
			ops.push(op_start);
			loc = {container : op_start.id, offset : start.offset};
		}
		const oploc = nbe.ops.insert_before(editor, node.id, insertion);
		if (oploc) {
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	} else {
		op_mutate.after.text = (start ?  node.val.text.slice(0, start.offset) : '') + (end ?  node.val.text.slice(end.offset) : '');
		loc = start ? {container : node.id, offset : start.offset} : null;
	}

	return {ops : ops, loc : loc};
};
