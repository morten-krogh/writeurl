'use strict';

nbe.location.format_img_link = function (editor, format) {
	var set_node_img_link, node_start, node_end, offset, node_traverse, cont, node_img, node_link, node_next;

	set_node_img_link = function (node) {
		if (node && node.type === 'img' && node_img === null) {
			node_img = node;
		}

		if (node_link === null) {
			if (node && node.type === 'link') {
				node_link = node;
			} else if (node && node.parent && node.parent.type === 'link') {
				node_link = node.parent;
			}
		}
	};

	if (editor.location === null) {
		return null;
	}

	if (editor.location.collapsed) {
		node_start = node_end = editor.state.nodes[editor.location.start.container];
		offset = editor.location.start.offset;
	} else {
		node_start = editor.state.nodes[editor.location.start.container];
		node_end = editor.state.nodes[editor.location.end.container];
		offset = editor.location.end.offset;
	}

	node_traverse = node_end;
	cont = true;
	node_img = null;
	node_link = null;
	while (cont) {
		set_node_img_link(node_traverse);

		if (node_traverse === node_start) {
			cont = false;
		} else {
			node_traverse = nbe.location.previous_node(node_traverse);
		}
	}

	if (!(node_end.type === 'text' && offset < node_end.val.text.length)) {
		node_next = nbe.location.next_node(node_end);
		set_node_img_link(node_next);
	}

	if (node_img) {
		format.edit_img = {id : node_img.id};
		nbe.lib.partial_copy(node_img.val, format.edit_img, ['src', 'width', 'height', 'title']);
	}

	if (node_link) {
		format.edit_link = {id : node_link.id, href : node_link.val.href};
	}

	return format;
};
