'use strict';

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
			op = {domop : 'mutate', id : node.id, before : node.val, after : nbe.lib.clone(node.val)};
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
					val = nbe.lib.clone(node.val);
				}
			}
			if (val === null) {
				next = next_id(el, index);
				if (next) {
					node = nodes[next];
					if (node.type === 'text') {
						val = nbe.lib.clone(node.val);
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
