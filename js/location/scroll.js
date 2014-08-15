'use strict';

nbe.location.scroll = function (editor) {
	var el_editor, el_scroll, find_pos, end, element, pos_location, pos_el_scroll, pos, scroll_top;

	el_editor = editor.el_editor;
	el_scroll = el_editor.parentNode.classList.contains('editor_container') ? el_editor.parentNode : el_editor;

	find_pos = function (el) {
		var pos;

		pos = 0;
		while (el) {
			pos = pos + el.offsetTop;
			el = el.offsetParent;
		}

		return pos;
	};

	end = editor.location.collapsed ? editor.location.start : editor.location.end;
	element = editor.dom[end.container];

	pos_location = find_pos(element);
	pos_el_scroll = find_pos(el_scroll);
	pos = pos_location - pos_el_scroll;

	if (el_scroll.scrollTop > pos) {
		el_scroll.scrollTop = pos;
	} else {
		scroll_top = pos + element.offsetHeight - el_scroll.offsetHeight;
		if (el_scroll.scrollTop < scroll_top) {
			el_scroll.scrollTop = scroll_top;
		}
	}
};
