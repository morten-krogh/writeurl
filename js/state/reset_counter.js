'use strict';

nbe.state.reset_counter = function (editor) {
	var ordered_types, current_type, lines, i, line, type, reset;

	ordered_types = {
		'disc' : true,
		'lower-alpha' : true,
		'lower-roman' : true,
		'square' : true,
		'upper-alpha' : true,
		'upper-roman' : true,
		'ordered' : true
	};

	current_type = null;
	lines = editor.state.nodes.root.children;
	for (i = 0; i < lines.length; i++) {
		line = lines[i];
		type = line.val.list;
		if (type && type in ordered_types) {
			if (type !== current_type) {
				current_type = type;
				reset = true;
			} else {
				reset = false;
			}
		} else {
			current_type = null;
			reset = false;
		}

		if (reset) {
			editor.dom[line.id].classList.add('wu-reset-counter');
		} else {
			editor.dom[line.id].classList.remove('wu-reset-counter');
		}
	}
};
