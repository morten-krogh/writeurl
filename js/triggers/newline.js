'use strict';

nbe.triggers.newline = function (editor) {
	var location, start, end, insertion;

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

	insertion = [{type : 'line', val : {}, children : []}, {type : 'line', val : {}, children : []}];

	return nbe.ops.root(editor, start, end, insertion);
};
