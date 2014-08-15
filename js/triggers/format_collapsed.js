'use strict';

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
