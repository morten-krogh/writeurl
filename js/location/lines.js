'use strict';

nbe.location.lines = function (editor) {
	var lines, nodes, start, end, node_line_start, node_line_end, children, index_start, index_end;

	lines = [];

	if (editor.location) {
		nodes = editor.state.nodes;
		start = editor.location.start;
		end = editor.location.collapsed ? start : editor.location.end;

		node_line_start = nbe.location.parent_line(editor, start.container);
		node_line_end = nbe.location.parent_line(editor, end.container);

		children = node_line_start.parent.children;

		index_start = children.indexOf(node_line_start);
		index_end = children.indexOf(node_line_end);

		lines = children.slice(index_start, index_end + 1);
	}

	return lines;
};
