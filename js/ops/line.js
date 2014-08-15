'use strict';

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
