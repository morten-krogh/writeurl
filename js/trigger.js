import { clone } from './lib.js';

nbe.triggers.cut = function (editor) {
	editor.mutation.disconnect();
	setTimeout(function () {
		nbe.state.clean(editor);
		if (!editor.location.collapsed) {
			editor.trigger('delete', null);
		}
		editor.mutation.observe();
	}, 0);
};

nbe.triggers.del = function (editor) {
	var location, node, loc_start, start, end;

	if (!editor.location) {
		return null;
	}

	location = editor.location;
	node = editor.state.nodes[location.start.container];

	if (node.type === 'line' && 'left_margin' in node.val && location.collapsed) {
		return nbe.triggers.left_margin(editor, 'decrement');
	} else if (location.collapsed) {
		loc_start = nbe.location.previous_location(editor, location.start);
		start = nbe.location.loc_to_point(editor, loc_start);
		end = nbe.location.loc_to_point(editor, location.start);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
	}

	return nbe.ops.root(editor, start, end, null);
};

nbe.triggers.format = function (editor, type, value) {
	nbe.state.set_format(type, value, editor.format);
	if (editor.location === null) {
		return null;
	} else if (editor.location.collapsed) {
		return nbe.triggers.format_collapsed(editor, type, value);
	} else if (nbe.state.formats.text.indexOf(type) !== -1) {
		return nbe.triggers.text_format(editor, type, value);
	} else {
		return nbe.triggers.line_format(editor, type, value);
	}
};

nbe.triggers.format_collapsed = function (editor, type, value) {
	var line, ops, op, text_nodes, i, text_node;

	line = nbe.location.parent_line(editor, editor.location.start.container);

	ops = [];

	if (!nbe.state.cmp_value_format(type, value, line.val) && ((nbe.state.formats.text.indexOf(type) !== -1 && line.children.length === 0) || (nbe.state.formats.line.indexOf(type) !== -1))) {
		op = {domop : 'mutate', id : line.id, before : line.val};
		op.after = nbe.state.set_format(type, value, nbe.state.copy_line_format(line.val, {}));
		ops.push(op);

		if (type === 'heading' && value !== 'none') {
			text_nodes = nbe.location.text_nodes_in_line(line);
			for (i = 0; i < text_nodes.length; i++) {
				text_node = text_nodes[i];
				if (!nbe.state.cmp_value_format('font_size', nbe.state.formats.default_values.font_size, text_node.val)) {
					op = {domop : 'mutate', id : text_node.id, before : text_node.val};
					op.after = nbe.state.set_format('font_size', nbe.state.formats.default_values.font_size, nbe.state.copy_text_format(text_node.val, {}));
					op.after.text = text_node.val.text;
					ops.push(op);
				}
			}

			delete op.after.list;
		}
	}

	return {ops : ops, loc_after : editor.location};
};

nbe.triggers.img = function (editor, value) {
	var node, op, oploc, location, start, end, val, insertion;

	if ('id' in value && value.id in editor.state.nodes) {
		node = editor.state.nodes[value.id];
		op = {domop : 'mutate', id : value.id, before : node.val, after : clone(value)};
		delete op.after.id;
		oploc = {ops : [op], loc_after : editor.location};
	} else if (!editor.location) {
		oploc = null;
	} else {
		location = editor.location;

		if (location.collapsed) {
			start = end = nbe.location.loc_to_point(editor, location.start);
		} else {
			start = nbe.location.loc_to_point(editor, location.start);
			end = nbe.location.loc_to_point(editor, location.end);
		}

		val = clone(value);
		insertion = [{type : 'line', val : {}, children : [{type : 'img', val : val, children : []}]}];

		oploc = nbe.ops.root(editor, start, end, insertion);
	}

	return oploc;
};

nbe.triggers.insertion = function (editor, insertion) {
	var location, start, end;

	if (!editor.location) {
		return null;
	}

	location = editor.location;

	if (location.collapsed) {
		start = end = nbe.location.loc_to_point(editor, location.start);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
	}

	return nbe.ops.root(editor, start, end, insertion);
};

nbe.triggers.left_margin = function (editor, value) {
	var lines, ops;

	if (editor.location === null) {
		return null;
	}

	lines = nbe.location.lines(editor);

	ops = [];

	lines.forEach(function (node) {
		var margin_pre, margin_post, op;

		margin_pre = 'left_margin' in node.val ? node.val.left_margin : 0;
		margin_post = margin_pre + (value === 'increment' ? 1 : -1) * nbe.state.formats.left_margin.step;
		if (margin_post >= 0 && margin_post <= nbe.state.formats.left_margin.max) {
			op = {domop : 'mutate', id : node.id, before : node.val};
			op.after = nbe.state.set_format('left_margin', margin_post, nbe.state.copy_line_format(node.val, {}));
			ops.push(op);
		}
	});

	return {ops : ops, loc_after : editor.location};
};

nbe.triggers.line_format = function (editor, type, value) {
	var lines, ops;

	lines = nbe.location.lines(editor);

	ops = [];
	lines.forEach(function (node) {
		var op;

		if (!nbe.state.cmp_value_format(type, value, node.val)) {
			op = {domop : 'mutate', id : node.id, before : node.val};
			op.after = nbe.state.set_format(type, value, nbe.state.copy_line_format(node.val, {}));
			ops.push(op);

			if (type === 'heading' && value !== 'none') {
				nbe.location.text_nodes_in_line(node).forEach(function (text_node) {
					if (!nbe.state.cmp_value_format('font_size', nbe.state.formats.default_values.font_size, text_node.val)) {
						op = {domop : 'mutate', id : text_node.id, before : text_node.val};
						op.after = nbe.state.set_format('font_size', nbe.state.formats.default_values.font_size, nbe.state.copy_text_format(text_node.val, {}));
						op.after.text = text_node.val.text;
						ops.push(op);
					}
				});

				delete op.after.list;
			}
		}
	});

	return {ops : ops, loc_after : editor.location};
};

nbe.triggers.link = function (editor, value) {
	var node, op, oploc, location, start, end, link, insertion;

	if ('id' in value && value.id in editor.state.nodes) {
		node = editor.state.nodes[value.id];
		op = {domop : 'mutate', id : value.id, before : node.val, after : {href : value.href}};
		oploc = {ops : [op], loc_after : editor.location};
	} else if (!editor.location) {
		oploc = null;
	} else {
		location = editor.location;

		if (location.collapsed) {
			start = end = nbe.location.loc_to_point(editor, location.start);
		} else {
			start = nbe.location.loc_to_point(editor, location.start);
			end = nbe.location.loc_to_point(editor, location.end);
		}

		link = {type : 'link', val : {href : value.href}, children : value.insertion};
		insertion = [{type : 'line', val : {}, children : [link]}];

		oploc = nbe.ops.root(editor, start, end, insertion);
	}

	return oploc;
};

nbe.triggers.newline = function (editor) {
	var location, start, end, insertion;

	if (!editor.location) {
		return null;
	}

	location = editor.location;

	if (location.collapsed) {
		start = end = nbe.location.loc_to_point(editor, location.start);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
	}

	insertion = [{type : 'line', val : {}, children : []}, {type : 'line', val : {}, children : []}];

	return nbe.ops.root(editor, start, end, insertion);
};

nbe.triggers.observer = function (editor, mutations) {
	var added_nodes, removed_nodes, mutated_nodes, add_to_array, remove_from_array, add_node, remove_node, mutate_node, add_line, lines, oploc;

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

nbe.triggers.paste = function (editor) {
	var callback;

	callback = function (insertion) {
		editor.trigger('insertion', insertion);
	};

	nbe.paste.clipboard(callback);
};

nbe.triggers.select = function (editor) {
	var last, next, offset, location;

	last = nbe.location.last_child(editor.state.nodes.root);
	next = nbe.location.next_node(last);
	while (next !== null) {
		last = next;
		next = nbe.location.next_node(last);
	}

	if (last.type === 'text') {
		offset = last.val.text.length;
	} else if (last.type === 'line') {
		offset = 0;
	} else {
		offset = 1;
	}

	location = {start : {container : 'line', offset : 0}, end : {container : last.id, offset : offset}, collapsed : false};

	nbe.location.set(editor, location);
};

nbe.triggers.subtree = function (editor, events) {
	var find_line, lines, i, oploc;

	find_line = function (el, lines) {
		while (el !== null && !(el.classList && el.classList.contains('line'))) {
			el = el.parentNode;
		}

		if (el !== null) {
			lines[el.getAttribute('data-id')] = true;
		}

		return lines;
	};

	lines = {};
	for (i = 0; i < events.length; i++) {
		find_line(events[i].target ? events[i].target : null, lines);
	}

	oploc = nbe.ops.modified(editor, Object.keys(lines));

	nbe.state.clean(editor);

	return oploc;
};

nbe.triggers.tab = function (editor) {
	var node, oploc;

	if (!editor.location) {
		return null;
	}

	node = editor.state.nodes[editor.location.start.container];
	if (node.type === 'line') {
		oploc = nbe.triggers.left_margin(editor, 'increment');
	} else {
		oploc = nbe.triggers.text(editor, ' ');
	}

	return oploc;
};

nbe.triggers.text = function (editor, text) {
	var location, start, end, val, insertion;

	if (!editor.location) {
		return null;
	}

	location = editor.location;

	if (location.collapsed) {
		return nbe.triggers.text_collapsed(editor, text);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
		val =  nbe.state.copy_text_format(editor.format, {});
		val.text = text;
		insertion = [{type : 'line', val : {}, children : [{type : 'text', val : val, children : []}]}];
		return nbe.ops.root(editor, start, end, insertion);
	}
};

nbe.triggers.text_collapsed = function (editor, text) {
	var max_text_length, start, node, op, val, insertion;

	max_text_length = 10;

	start = nbe.location.loc_to_point(editor, editor.location.start);
	node = start.node;

	if (node.type === 'text' && node.val.text.length < max_text_length && (start.offset < node.val.text.length || node.parent.type === 'line') && nbe.state.cmp_text_format(node.val, editor.format)) {
		op = {domop : 'mutate', id : node.id, before : node.val, after : nbe.state.copy_text_format(node.val, {})};
		op.after.text = node.val.text.slice(0, start.offset) + text + node.val.text.slice(start.offset);

		return {ops : [op], loc : {container : node.id, offset : start.offset + text.length}};
	} else {
		val =  nbe.state.copy_text_format(editor.format, {});
		val.text = text;
		insertion = [{type : 'line', val : {}, children : [{type : 'text', val : val, children : []}]}];

		return nbe.ops.root(editor, start, start, insertion);
	}
};

nbe.triggers.text_format = function (editor, type, value) {
	var nodes, start, end, loc_after, ops_split, ops_middle, ops_lines, ops;

	nbe.state.set_format(type, value, editor.format);
	if (editor.location === null || editor.location.collapsed) {
		return null;
	}

	nodes = editor.state.nodes;
	start = editor.location.start;
	end = editor.location.end;

	loc_after = {start : start, end : end, collapsed : false};

	ops_split = function (id, offset_start, offset_end_arg) {
		var ops, node, offset_end, op_mutate, op_start, op_end;

		ops = [];
		node = nodes[id];
		if (node.type === 'text' && !nbe.state.cmp_value_format(type, value, node.val)) {
			offset_end = offset_end_arg === 'infinite' ? node.val.text.length : offset_end_arg;
			if (offset_start !== offset_end) {
				op_mutate = {domop : 'mutate', id : id, before : node.val};
				op_mutate.after = nbe.state.set_format(type, value, nbe.state.copy_text_format(node.val, {}));
				op_mutate.after.text = node.val.text.slice(offset_start, offset_end);
				ops.push(op_mutate);
				if (offset_end_arg !== 'infinite') {
					loc_after.end = {container : id, offset : offset_end - offset_start};
				}
				if (offset_start > 0) {
					op_start = {domop : 'insert', id : editor.new_id(), before : id, type : 'text', val : nbe.state.copy_text_format(node.val, {})};
					op_start.val.text = node.val.text.slice(0, offset_start);
					ops.push(op_start);
					loc_after.start = {container : op_start.id, offset : offset_start};
				}
				if (offset_end < node.val.text.length) {
					op_end = nbe.location.insert_after(editor, id);
					op_end.id = editor.new_id();
					op_end.type = 'text';
					op_end.val = nbe.state.copy_text_format(node.val, {});
					op_end.val.text = node.val.text.slice(offset_end);
					ops.push(op_end);
				}
			}
		}

		return ops;
	};

	ops_middle = function (start_id, end_id) {
		var ops, node, op_mutate;

		ops = [];
		node = nbe.location.previous_node(nodes[end_id]);
		while (node && node.id !== start_id) {
			if (node.type === 'text' && !nbe.state.cmp_value_format(type, value, node.val)) {
				op_mutate = {domop : 'mutate', id : node.id, before : node.val};
				op_mutate.after = nbe.state.set_format(type, value, nbe.state.copy_text_format(node.val, {}));
				op_mutate.after.text = node.val.text;
				ops.push(op_mutate);
			}
			node = nbe.location.previous_node(node);
		}

		return ops;
	};

	ops_lines = function (_start_id, _end_id) {
		var lines, ops;

		lines = nbe.location.lines(editor);

		ops = [];

		lines.forEach(function (node) {
			var op;

			if (!nbe.state.cmp_value_format(type, value, node.val)) {
				op = {domop : 'mutate', id : node.id, before : node.val};
				op.after = nbe.state.set_format(type, value, nbe.state.copy_line_format(node.val, {}));
				ops.push(op);
			}
		});

		return ops;
	};

	if (start.container === end.container) {
		ops = ops_split(start.container, start.offset, end.offset);
	} else {
		ops = ops_split(start.container, start.offset, 'infinite');
		ops = ops.concat(ops_split(end.container, 0, end.offset));
		ops = ops.concat(ops_middle(start.container, end.container));
		ops = ops.concat(ops_lines(start.container, end.container));
	}

	return {ops : ops, loc_after : loc_after};
};

nbe.triggers.trigger = function (editor, type, value) {
	var oploc, loc_after;

	//console.log('trigger', type, value);
	//nbe.location.get(editor);

	switch (type) {
	case 'text':
		oploc = nbe.triggers.text(editor, value);
		break;
	case 'insertion':
		oploc = nbe.triggers.insertion(editor, value);
		break;
	case 'bold':
	case 'underline':
	case 'italic':
	case 'strikethrough':
	case 'color':
	case 'background_color':
	case 'font_family':
	case 'vertical_align':
	case 'font_size':
	case 'heading':
	case 'text_align':
	case 'line_spacing':
	case 'list':
		oploc = nbe.triggers.format(editor, type, value);
		break;
	case 'left_margin':
		oploc = nbe.triggers.left_margin(editor, value);
		break;
	case 'tab':
		oploc = nbe.triggers.tab(editor);
		break;
	case 'delete':
		oploc = nbe.triggers.del(editor);
		break;
	case 'newline':
		oploc = nbe.triggers.newline(editor);
		break;
	case 'img':
		oploc = nbe.triggers.img(editor, value);
		break;
	case 'link':
		oploc = nbe.triggers.link(editor, value);
		break;
	case 'cut':
		nbe.triggers.cut(editor);
		oploc = 'break';
		break;
	case 'paste':
		nbe.triggers.paste(editor);
		oploc = 'break';
		break;
	case 'undo':
		editor.undo.trigger('undo', value);
		oploc = null;
		break;
	case 'observer':
		oploc = nbe.triggers.observer(editor, value);
		break;
	case 'subtree':
		oploc = nbe.triggers.subtree(editor, value);
		break;
	case 'select':
		nbe.triggers.select(editor);
		oploc = 'break';
		break;
	default:
		oploc = null;
		break;
	}

	//console.log(oploc);

	if (oploc === 'break') {
		return oploc;
	} else if (oploc === null || oploc.ops.length === 0) {
		return null;
	} else {
		loc_after = 'loc_after' in oploc ? oploc.loc_after : {start : oploc.loc, collapsed : true};
		return {ops : oploc.ops, loc_before : editor.location, loc_after : loc_after};
	}
};
