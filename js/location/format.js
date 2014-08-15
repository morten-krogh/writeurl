'use strict';

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
