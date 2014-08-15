'use strict';

nbe.triggers.subtree = function (editor, events) {
	var find_line, lines, i, oploc;

	find_line = function (el, lines) {
		while (el !== null && !(el.classList && el.classList.contains('line'))) {
			el = el.parentNode;
		}

		if (el !== null) {
			lines[el.getAttribute('data-id')] = true;
		}

		return lines;
	};

	lines = {};
	for (i = 0; i < events.length; i++) {
		find_line(events[i].target ? events[i].target : null, lines);
	}

	oploc = nbe.ops.modified(editor, Object.keys(lines));

	nbe.state.clean(editor);

	return oploc;
};
