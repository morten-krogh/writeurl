'use strict';

nbe.location.format_line = function (editor, format) {
	var find_line_val, line_val, point, node_location;

	find_line_val = function (node) {
		while (node.type !== 'line') {
			node = node.parent;
		}

		return node.val;
	};

	if (editor.location === null) {
		line_val = {};
	} else {
		point = editor.location.collapsed ? editor.location.start : editor.location.end;
		node_location = editor.state.nodes[point.container];
		line_val = find_line_val(node_location);
	}

	nbe.state.copy_line_format(line_val, format);

	return format;
};
