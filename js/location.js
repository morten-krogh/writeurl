nbe.location.blur = function (editor) {
	editor.el_editor.blur();
};

nbe.location.first_child = function (node) {
	if (node.children.length === 0) {
		return null;
	} else {
		return node.children[0];
	}
};

nbe.location.focus = function (editor) {
	editor.el_editor.focus();

	/*
	cowriter.editor.state.update_state(view);
	cowriter.editor.cursor.scroll_into_view(view);
	cowriter.editor.view.panel_take_over(view);
	*/
};

nbe.location.format = function (editor) {
	var format;

	format = {};
	nbe.location.format_line(editor, format);
	nbe.location.format_text(editor, format);

	//nbe.location.format_left_margin(editor, format);
	nbe.location.format_img_link(editor, format);

	editor.format = format;
	editor.inputs.notify();

	return format;
};

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

nbe.location.format_update = function (editor) {
	nbe.location.format_line(editor, editor.format);
	nbe.location.format_text(editor, editor.format);

	//nbe.location.format_left_margin(editor, editor.format);
	nbe.location.format_img_link(editor, editor.format);

	editor.inputs.notify();

	return editor.format;
};

nbe.location.get = function (editor) {
	var location, range, find_location, clean;

	location = {};
	range = window.getSelection().getRangeAt(0);

	find_location = function (container, offset) {
		var el;

		if (container.classList) {
			el = container;
		} else {
			el = container.parentNode;
		}

		return {container : el.getAttribute('data-id'), offset : offset};
	};

	clean = function (point) {
		var root, node, offset;

		if (point.container === 'editor') {
			root = editor.state.nodes.root;
			if (point.offset === 0) {
				return {container : root.children[0].id, offset : 0};
			} else {
				node = root;
				while (node.children.length > 0) {
					node = node.children[node.children.length - 1];
				}
				return {container : node.id, offset : (node.type === 'text') ? node.val.text.length : 1};
			}
		}

		if (point.container === 'root') {
			return {container : editor.state.nodes.root.children[point.offset].id, offset : 0};
		}

		if (point.container in editor.state.nodes) {
			node = editor.state.nodes[point.container];
			offset = point.offset;
		}

		if (offset === 0 && node.type === 'line') {
			return point;
		} else if (offset === 0) {
			return nbe.location.loc_previous(node).start;
		} else if (node.type === 'line' || node.type === 'link') {
			return nbe.location.loc_end(node.children[offset - 1]);
		} else {
			return point;
		}
	};

	location.start = clean(find_location(range.startContainer, range.startOffset));
	if (range.collapsed) {
		location.collapsed = true;
	} else {
		location.collapsed = false;
		location.end = clean(find_location(range.endContainer, range.endOffset));
	}

	editor.location = location;

	return location;
};

nbe.location.get_format = function (editor) {
	nbe.location.get(editor);
	nbe.location.format(editor);
};

nbe.location.in_link = function (point) {
	var index;

	if (point.node.parent.type !== 'link') {
		return false;
	}

	index = point.node.parent.children.indexOf(point.node);
	if (index === point.node.parent.children.length - 1) {
		if (point.node.type === 'text') {
			return nbe.location.in_text(point);
		} else {
			return false;
		}
	} else {
		return true;
	}
};

nbe.location.in_text = function (point) {
	return point && point.node.type === 'text' && point.offset < point.node.val.text.length && point.offset > 0;
};

nbe.location.insert_after = function (editor, id) {
	var node, index;

	node = editor.state.nodes[id];
	index = node.parent.children.indexOf(node);
	if (index < node.parent.children.length - 1) {
		return {domop : 'insert', before : node.parent.children[index + 1].id};
	} else {
		return {domop : 'append', parent : node.parent.id};
	}
};

nbe.location.item_to_loc = function (iditem) {
	var offset, item;

	item = iditem.item;
	offset = item.type === 'text' ? item.val.text.length : 1;

	return {container : iditem.id, offset : offset};
};

nbe.location.last_child = function (node) {
	if (node.children.length === 0) {
		return null;
	} else {
		return node.children[node.children.length - 1];
	}
};

nbe.location.line = function (node) {
	while (node.type !== 'line') {
		node = node.parent;
	}

	return node;
};

nbe.location.lines = function (editor) {
	var lines, start, end, node_line_start, node_line_end, children, index_start, index_end;

	lines = [];

	if (editor.location) {
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

nbe.location.loc_end = function (node) {
	if (node.type === 'text') {
		return {container : node.id, offset : node.val.text.length};
	} else if (node.type === 'link') {
		return nbe.location.loc_end(node.children[node.children.length - 1]);
	} else if (node.type === 'line') {
		if (node.children.length === 0) {
			return {container : node.id, offset : 0};
		} else {
			return nbe.location.loc_end(node.children[node.children.length - 1]);
		}
	} else {
		return {container : node.id, offset : 1};
	}
};

nbe.location.loc_previous = function (node) {
	var node_end, index, node_previous;

	node_end = function (node) {
		if (node.type === 'text') {
			return {container : node.id, offset : node.val.text.length};
		} else if (node.type === 'link') {
			return node_end(node.children[node.children.length - 1]);
		} else if (node.type === 'line') {
			if (node.children.length === 0) {
				return {container : node.id, offset : 0};
			} else {
				return node_end(node.children[node.children.length - 1]);
			}
		} else {
			return {container : node.id, offset : 1};
		}
	};

	index = node.parent.children.indexOf(node);
	if (index > 0) {
		node_previous = node.parent.children[index - 1];
		return {start : node_end(node_previous), collapsed : true};
	} else if (node.type === 'line') {
		return {start : {container : node.id, offset : 0}, collapsed : true};
	} else if (node.parent.type === 'line') {
		return {start : {container : node.parent.id, offset : 0}, collapsed : true};
	} else {
		return nbe.location.loc_previous(node.parent);
	}
};

nbe.location.loc_to_point = function (editor, loc) {
	return {node : editor.state.nodes[loc.container], offset : loc.offset};
};

nbe.location.next_node = function (node) {
	var next_sibling_or_higher;

	next_sibling_or_higher = function (node) {
		var index;

		if (node.parent) {
			index = node.parent.children.indexOf(node);
			if (index < node.parent.children.length - 1) {
				return node.parent.children[index + 1];
			} else {
				return next_sibling_or_higher(node.parent);
			}
		} else {
			return null;
		}
	};

	if (node.children.length === 0) {
		return next_sibling_or_higher(node);
	} else {
		return node.children[0];
	}
};

nbe.location.next_sibling = function (node) {
	var index;

	index = node.parent.children.indexOf(node);
	if (index < node.parent.children.length - 1) {
		return node.parent.children[index + 1];
	} else {
		return null;
	}
};

nbe.location.op_remove = function (node) {
	var op, index;

	op = {domop : 'remove', id : node.id, type : node.type, val : node.val};
	index = node.parent.children.indexOf(node);
	if (index === node.parent.children.length - 1) {
		op.parent = node.parent.id;
	} else {
		op.before = node.parent.children[index + 1].id;
	}

	return op;
};

nbe.location.parent_line = function (editor, id) {
	var node;

	node = editor.state.nodes[id];
	while (node && node.type !== 'line') {
		node = node.parent;
	}

	return node;
};

nbe.location.previous_location = function (editor, loc) {
	var node_end, node, node_prev, node_parent_prev;

	node_end = function (node) {
		if (node.type === 'text') {
			return {container : node.id, offset : node.val.text.length};
		} else if (node.type === 'link') {
			return node_end(node.children[node.children.length - 1]);
		} else if (node.type === 'line') {
			if (node.children.length === 0) {
				return {container : node.id, offset : 0};
			} else {
				return node_end(node.children[node.children.length - 1]);
			}
		} else {
			return {container : node.id, offset : 1};
		}
	};

	node = editor.state.nodes[loc.container];

	if (node.type === 'text' && loc.offset > 1) {
		return {container : node.id, offset : loc.offset - 1};
	} else if (node.type === 'line') {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			return loc;
		}
	} else if (node.parent.type === 'line') {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			return {container : node.parent.id, offset : 0};
		}
	} else {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			node_parent_prev = nbe.location.previous_sibling(node.parent);
			if (node_parent_prev) {
				return node_end(node_parent_prev);
			} else {
				return {container : node.parent.parent.id, offset : 0};
			}
		}
	}
};

nbe.location.previous_node = function (node) {
	var last_descendant, index;

	last_descendant = function (node2) {
		if (node2.children.length === 0) {
			return node2;
		} else {
			return last_descendant(node2.children[node2.children.length - 1]);
		}
	};

	if (node.parent) {
		index = node.parent.children.indexOf(node);
		if (index > 0) {
			return last_descendant(node.parent.children[index - 1]);
		} else {
			return node.parent;
		}
	} else {
		return null;
	}
};

nbe.location.previous_sibling = function (node) {
	var index;

	index = node.parent.children.indexOf(node);
	if (index > 0) {
		return node.parent.children[index - 1];
	} else {
		return null;
	}
};

nbe.location.scroll = function (editor) {
	var el_editor, el_scroll, find_pos, end, element, pos_location, pos_el_scroll, pos, scroll_top;

	el_editor = editor.el_editor;
	el_scroll = el_editor.parentNode.classList.contains('editor_container') ? el_editor.parentNode : el_editor;

	find_pos = function (el) {
		var pos;

		pos = 0;
		while (el) {
			pos = pos + el.offsetTop;
			el = el.offsetParent;
		}

		return pos;
	};

	end = editor.location.collapsed ? editor.location.start : editor.location.end;
	element = editor.dom[end.container];

	pos_location = find_pos(element);
	pos_el_scroll = find_pos(el_scroll);
	pos = pos_location - pos_el_scroll;

	if (el_scroll.scrollTop > pos) {
		el_scroll.scrollTop = pos;
	} else {
		scroll_top = pos + element.offsetHeight - el_scroll.offsetHeight;
		if (el_scroll.scrollTop < scroll_top) {
			el_scroll.scrollTop = scroll_top;
		}
	}
};

nbe.location.set = function (editor, location) {
	var find_container_offset, container_offset_start, container_offset_end, range, selection;

	find_container_offset = function (id, offset) {
		var node, new_id, new_offset, container, new_node;

		node = editor.state.nodes[id];
		if (node) {
			if (node.type === 'img') {
				new_id = node.parent.id;
				new_offset = node.parent.children.indexOf(node) + 1;
			} else {
				new_id = id;
				new_offset = offset;
			}

			container = editor.dom[new_id];
			new_node = editor.state.nodes[new_id];

			if (new_node.type === 'text') {
				container = container.firstChild;
				if (new_offset > new_node.val.length) {
					new_offset = new_node.val.length;
				}
			}

			return {container : container, offset : new_offset};
		} else {
			return null;
		}
	};

	editor.mutation.disconnect();

	if (location) {
		container_offset_start = find_container_offset(location.start.container, location.start.offset);
		if (location.collapsed) {
			container_offset_end = container_offset_start;
		} else {
			container_offset_end = find_container_offset(location.end.container, location.end.offset);
		}

		if (container_offset_start && container_offset_end) {
			range = document.createRange();
			range.setStart(container_offset_start.container, container_offset_start.offset);
			range.setEnd(container_offset_end.container, container_offset_end.offset);
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		} else {
			location = null;
		}
	}

	editor.location = location;
	if (location) {
		nbe.location.focus(editor);
		nbe.location.scroll(editor);
		editor.inputs.notify();
	} else {
		nbe.location.blur(editor);
	}

	editor.mutation.observe();
};

nbe.location.split_merge_point = function (point) {
	var end_of, line_child;

	if (point.node.type === 'line') {
		line_child = nbe.location.first_child(point.node);
		end_of = false;
	} else if (point.node.parent.type === 'link') {
		line_child = point.node.parent;
		end_of = !nbe.location.in_link(point);
	} else {
		line_child = point.node;
		end_of = !nbe.location.in_text(point);
	}

	if (end_of) {
		line_child = nbe.location.next_sibling(line_child);
	}

	return line_child ? line_child.id : null;
};

nbe.location.text_nodes_in_line = function (line) {
	var nodes, i, node, j;

	nodes = [];
	for (i = 0; i < line.children.length; i++) {
		node = line.children[i];
		if (node.type === 'text') {
			nodes.push(node);
		} else if (node.type === 'link') {
			for (j = 0; j < node.children.length; j++) {
				if (node.children[j].type === 'text') {
					nodes.push(node.children[j]);
				}
			}
		}
	}

	return nodes;
};
