'use strict';

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
