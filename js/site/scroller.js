'use strict';

nbe.site.scroller = function (editor) {
	var el_editor, el_scroll;

	el_editor = editor.el_editor;
	el_scroll = el_editor.parentNode.classList.contains('editor_container') ? el_editor.parentNode : el_editor;

	setInterval(function () {
		el_scroll.scrollTop = el_scroll.scrollHeight;
	}, 200);
};
