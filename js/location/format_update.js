'use strict';

nbe.location.format_update = function (editor) {
	nbe.location.format_line(editor, editor.format);
	nbe.location.format_text(editor, editor.format);

	//nbe.location.format_left_margin(editor, editor.format);
	nbe.location.format_img_link(editor, editor.format);

	editor.inputs.notify();

	return editor.format;
};
