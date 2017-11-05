'use strict';

nbe.triggers.text_format = function (editor, type, value) {
	var nodes, start, end, loc_after, ops_split, ops_middle, ops_lines, ops, loc;

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
		loc = {container : start.container, offset : end.offset - start.offset};
	} else {
		ops = ops_split(start.container, start.offset, 'infinite');
		ops = ops.concat(ops_split(end.container, 0, end.offset));
		ops = ops.concat(ops_middle(start.container, end.container));
		ops = ops.concat(ops_lines(start.container, end.container));
		loc = end;
	}

	return {ops : ops, loc_after : loc_after};
};
