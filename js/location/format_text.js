'use strict';

nbe.location.format_text = function (editor, format) {
	var find_previous_text_or_line, find_next_text_or_line, node_first, node_between, val, point, node_location, node_val, node_previous;

	find_previous_text_or_line = function (node) {
		node = nbe.location.previous_node(node);
		while (node !== null && node.type !== 'text' && node.type !== 'line') {
			node = nbe.location.previous_node(node);
		}

		return node;
	};

	find_next_text_or_line = function (node) {
		node = nbe.location.next_node(node);
		while (node !== null && node.type !== 'text' && node.type !== 'line') {
			node = nbe.location.next_node(node);
		}

		return node;
	};

	node_first = function (node_line) {
		var node_next;

		node_next = find_next_text_or_line(node_line);
		if (node_next && node_next.type === 'text') {
			return node_next;
		} else {
			return node_line;
		}
	};

	node_between = function (node) {
		var node_previous, node_next;

		node_previous = find_previous_text_or_line(node);
		if (node_previous.type === 'text') {
			return node_previous;
		}

		node_next = find_next_text_or_line(node);
		if (node_next && node_next.type === 'text') {
			return node_next;
		}

		return node_previous;
	};

	if (editor.location === null) {
		val = {};
	} else {
		point = editor.location.collapsed ? editor.location.start : editor.location.end;
		node_location = editor.state.nodes[point.container];

		if (node_location.type === 'text' && point.offset > 0) {
			node_val = node_location;
		} else if (node_location.type === 'text') {
			node_previous = nbe.location.previous_node(node_location);
			if (node_previous.type === 'text') {
				node_val = node_previous;
			} else {
				node_val = node_location;
			}
		} else if (node_location.type === 'line') {
			node_val = node_first(node_location);
		} else {
			node_val = node_between(node_location);
		}

		val = node_val.val;
	}

	nbe.state.copy_text_format(val, format);

	return format;
};
