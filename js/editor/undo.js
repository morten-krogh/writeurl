'use strict';

nbe.editor.undo = function (editor) {
	var undoes, redoes, buttons, add_button, remove_button, notify_buttons, add_oploc, trigger;

	undoes = [];
	redoes = [];

	buttons = [];

	add_button = function (button) {
		buttons.push(button);
		notify_buttons();
	};

	remove_button = function (button) {
		var index;

		index = buttons.indexOf(button);
		if (index !== -1) {
			buttons = buttons.splice(index, 1);
		}
	};

	notify_buttons = function () {
		var value, i;

		value = {undo : undoes.length !== 0, redo : redoes.length !== 0};
		for (i = 0; i < buttons.length; i++) {
			buttons[i].set_value(value);
		}
	};

	add_oploc = function (oploc) {
		undoes.push(oploc);
		redoes = [];
		notify_buttons();
	};

	trigger = function (_type, value) {
		var oploc, oploc_inv;

		if (value === 'undo' && undoes.length !== 0) {
			oploc = undoes.pop();
			redoes.push(oploc);
			oploc_inv = nbe.state.invert_oploc(oploc);
			editor.add_internal_oploc(oploc_inv);
			nbe.location.format_update(editor);
		} else if (value === 'redo' && redoes.length !== 0) {
			oploc = redoes.pop();
			undoes.push(oploc);
			editor.add_internal_oploc(oploc);
		}
		notify_buttons();
	};

	return {add_button : add_button, remove_button : remove_button, add_oploc : add_oploc, trigger : trigger};
};
