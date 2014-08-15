'use strict';

nbe.triggers.del = function (editor) {
	var location, node, loc_start, start, end;

	if (!editor.location) {
		return null;
	}

	location = editor.location;
	node = editor.state.nodes[location.start.container];

	if (node.type === 'line' && 'left_margin' in node.val && location.collapsed) {
		return nbe.triggers.left_margin(editor, 'decrement');
	} else if (location.collapsed) {
		loc_start = nbe.location.previous_location(editor, location.start);
		start = nbe.location.loc_to_point(editor, loc_start);
		end = nbe.location.loc_to_point(editor, location.start);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
	}

	return nbe.ops.root(editor, start, end, null);
};
