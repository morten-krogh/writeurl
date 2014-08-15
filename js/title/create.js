'use strict';

nbe.title.create = function (editor_id, options, doc) {
	var value, init, el_editor, set_value, detect_input, add_external_ops, get_value;

	init = function (state) {
		set_value(state.value);
	};

	if (options.editable) {

		el_editor = kite.browser.dom.ec('input', 'wu-title');
		el_editor.setAttribute('type', 'text');

		set_value = function (new_value) {
			value = new_value;

			if (el_editor.value !== value) {
				el_editor.value = value;
			}
			if (options.html_title) {
				document.title = value;
			}
		};

		detect_input = function (event) {
			var new_value, op;

			new_value = el_editor.value;
			if (new_value !== value) {
				set_value(new_value);
				op = {editor_class : 'title', before : value, after : new_value};
				doc.add_ops(editor_id, [op]);
			}
		};

		el_editor.addEventListener('input', detect_input, false);
	} else {

		el_editor = document.createElement('div');

		set_value = function (new_value) {
			value = new_value;

			el_editor.textContent = value;
			if (options.html_title) {
				document.title = value;
			}
		};
	}

	add_external_ops = function (ops, set_location) {
		ops.forEach(function (op) {
			if ('editor_class' in op && op.editor_class === 'title') {
				set_value(op.after);
			}
		});
	};

	get_value = function () {
		return value;
	};

	return {id : editor_id, el_editor : el_editor, init : init, add_external_ops : add_external_ops, get_value : get_value};
};
