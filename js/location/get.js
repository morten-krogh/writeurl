'use strict';

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
