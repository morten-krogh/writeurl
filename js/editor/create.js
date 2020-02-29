import { new_id } from '../lib.js';

nbe.editor.create = function (editor_id, options, doc) {
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
		editor.undo = nbe.editor.undo(editor);
		editor.observer = nbe.events.observer(editor);
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

		nbe.events.add_event_listeners(editor);
	}

	return editor;
};
