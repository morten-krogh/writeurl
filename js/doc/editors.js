import { TitleEditor } from '../title.js';
import { PublishEditor } from '../publish.js';

nbe.doc.editors = function (doc) {
	var editors, add, remove, notify;

	editors = {};

	add = function (editor_id, editor_type, options) {
		const ops_editor = [];
		for (let i = 0; i < doc.operations_local.length; i++) {
			const ops = doc.operations_local[i].ops;
			for (let j = 0; j < ops.length; j++) {
				const op = ops[j];
				if (editor_type === op.editor_class || (editor_type === 'text' && !('editor_class' in op))) {
					ops_editor.push(op);
				}
			}
		}

        let editor;
		if (editor_type === 'text') {
			const state = nbe.state.state_copy(doc.state.text);
			nbe.state.update(null, state, null, ops_editor);
			editor = nbe.editor.create(editor_id, options, doc);
			editor.init(state);
		} else if (editor_type === 'title') {
			const title_state = doc.state.title.copy();
			editor = new TitleEditor(editor_id, options, doc, title_state);
			editor.add_external_ops(ops_editor, false);
		} else if (editor_type === 'publish') {
			const publish_state = doc.state.publish.copy();
			editor = new PublishEditor(editor_id, doc, publish_state);
			editor.add_external_ops(ops_editor, false);
		}

		editors[editor_id] = editor;

		return editor;
	};

	remove = function (editor_id) {
		delete editors[editor_id];
	};

	notify = function (ops, excl_editor_id, set_location) {
		for (const editor_id in editors) {
			if (editors.hasOwnProperty(editor_id) && (excl_editor_id === null || excl_editor_id !== editor_id)) {
				editors[editor_id].add_external_ops(ops, set_location);
			}
		}
	};

	return {add : add, remove : remove, notify : notify};
};
