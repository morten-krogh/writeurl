'use strict';

nbe.triggers.insertion = function (editor, insertion) {
	var location, start, end;

	if (!editor.location) {
		return null;
	}

	location = editor.location;

	if (location.collapsed) {
		start = end = nbe.location.loc_to_point(editor, location.start);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
	}

	return nbe.ops.root(editor, start, end, insertion);
};
