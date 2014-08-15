'use strict';

nbe.triggers.format = function (editor, type, value) {
	nbe.state.set_format(type, value, editor.format);
	if (editor.location === null) {
		return null;
	} else if (editor.location.collapsed) {
		return nbe.triggers.format_collapsed(editor, type, value);
	} else if (nbe.state.formats.text.indexOf(type) !== -1) {
		return nbe.triggers.text_format(editor, type, value);
	} else {
		return nbe.triggers.line_format(editor, type, value);
	}
};
