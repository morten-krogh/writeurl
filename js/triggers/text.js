'use strict';

nbe.triggers.text = function (editor, text) {
	var location, start, end, val, insertion;

	if (!editor.location) {
		return null;
	}

	location = editor.location;

	if (location.collapsed) {
		return nbe.triggers.text_collapsed(editor, text);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
		val =  nbe.state.copy_text_format(editor.format, {});
		val.text = text;
		insertion = [{type : 'line', val : {}, children : [{type : 'text', val : val, children : []}]}];
		return nbe.ops.root(editor, start, end, insertion);
	}
};
