'use strict';

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
