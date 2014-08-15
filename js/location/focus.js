'use strict';

nbe.location.focus = function (editor) {
	editor.el_editor.focus();

	/*
	cowriter.editor.state.update_state(view);
	cowriter.editor.cursor.scroll_into_view(view);
	cowriter.editor.view.panel_take_over(view);
	*/
};
