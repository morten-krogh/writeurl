import { new_id } from './lib.js';
import { mutationobserver, add_event_listeners } from './event_listeners.js';

function editor_undo(editor) {
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
}

function create_editor(editor_id, options, doc) {
	var el_editor, add_external_ops, init, editor;

	el_editor = document.createElement('div');
	el_editor.classList.add('wu-editor');
	el_editor.setAttribute('data-id', 'editor');

	add_external_ops = function (ops, set_location) {
		ops = ops.filter(function (op) {
			return !('editor_class' in op);
		});
		nbe.state.update(editor, editor.state, editor.dom, ops);
		if (editor.focus && set_location) {
			nbe.location.set(editor, editor.location);
		}
	};

	init = function (state) {
		nbe.state.init(editor, state);
		editor.location = null;
	};

	editor = {
		id : editor_id,
		state : null,
		dom : null,
		location : null,
		format : {},
		inputs : null,
		undo : null,
		trigger : null,
		el_editor : el_editor,
		get_html : function () {
			return el_editor.innerHTML;
		},
		init : init,
		focus : false,
		add_internal_oploc : null,
		add_external_ops : add_external_ops,
		new_id : null,
		mutation : {observe : function () {}, disconnect : function () {}}
	};

	if (options.editable) {
		el_editor.contentEditable = true;
		editor.new_id = new_id();
		editor.inputs = nbe.notify.inputs(editor);
		editor.undo = editor_undo(editor);
		editor.observer = mutationobserver(editor);
		editor.add_internal_oploc = function (oploc) {
			doc.add_ops(editor_id, oploc.ops);
			nbe.state.update(editor, editor.state, editor.dom, oploc.ops);
			nbe.location.set(editor, oploc.loc_after);
			nbe.location.format_update(editor);
		};
		editor.trigger = function (type, value) {
			var oploc;

			editor.focus = true;
			oploc = nbe.triggers.trigger(editor, type, value);
			if (oploc !== null && oploc !== 'break') {
				editor.add_internal_oploc(oploc);
				editor.undo.add_oploc(oploc);
			} else if (oploc === null) {
				nbe.location.set(editor, editor.location);
				editor.inputs.notify();
			}
		};

		add_event_listeners(editor);
	}

	return editor;
}

export { create_editor };
