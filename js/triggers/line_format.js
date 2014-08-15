'use strict';

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
