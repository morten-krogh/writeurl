class TitleState {
    constructor(value) {
        this.value = value || 'My Title';
    }

    update(ops) {
        if (ops.length > 0) {
            this.value = ops[ops.length - 1].after;
        }
    }

    copy() {
        return new TitleState(this.value);
    }
}

class TitleEditor {
    constructor(editor_id, options, doc, title_state) {
        this.editor_id = editor_id;
        this.options = options;
        this.doc = doc;
        if (options.editable) {
            this.el_editor = kite.browser.dom.ec('input', 'wu-title');
            this.el_editor.setAttribute('type', 'text');
            this.el_editor.addEventListener('input', e => {
                this.detect_input(e);
            }, false);
        } else {
            this.el_editor = document.createElement('div');
        }
        this.set_value(title_state.value);
    }

	get_value() {
		return this.value;
	}

    set_value(new_value) {
        this.value = new_value;

        if (this.options.editable) {
			if (this.el_editor.value != new_value) {
				this.el_editor.value = new_value;
			}
        } else {
			this.el_editor.textContent = new_value;
        }

        if (this.options.html_title) {
            document.title = new_value;
        }
    }

    detect_input(_event) {
        const new_value = this.el_editor.value;
        if (new_value != this.value) {
            const op = {editor_class : 'title', before : this.value, after : new_value};
            this.set_value(new_value);
            this.doc.add_ops(this.editor_id, [op]);
        }
    }

    add_external_ops(ops, _set_location) {
        for (const op of ops) {
            if ('editor_class' in op && op.editor_class == 'title') {
                this.set_value(op.after);
            }
        }
    }
}

export { TitleState, TitleEditor };
