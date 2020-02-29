import { xhr } from './lib.js';

class PublishState {
    constructor(time) {
        this.time = time || null;
    }

    update(ops) {
        if (ops.length > 0) {
            this.time = ops[ops.length - 1].after; 
        }
	}

    copy() {
        return new PublishState(this.time);
    }
}

class PublishEditor  {
    constructor(editor_id, doc, publish_state) {
        this.editor_id = editor_id;
        this.doc = doc;
        this.msg = document.createElement('div');
        this.set_time(publish_state.time);
    }

	set_time(new_time) {
		this.time = new_time;
		this.msg.textContent = !new_time ? 'Not published' : 'Published at ' + new Date(new_time);
	}

	get_time() {
		return this.time;
	}

	add_external_ops(ops, _set_location) {
        for (const op of ops) {
            if ('editor_class' in op && op.editor_class === 'publish') {
				this.set_time(op.after);
            }
        }
	}

	publish(callback) {
        const html = nbe.doc.html(nbe.dynamic.doc);
		const body = {
			type : 'publish',
			id : this.doc.ids.id,
			write : this.doc.ids.write,
			html,
		};
			
		xhr('POST', nbe.config.publish_url, {}, JSON.stringify(body), 0, response => {
			const msg = JSON.parse(response);
			if (msg == 'published') {
				const op = {
					editor_class : 'publish',
					before : this.time,
					after : Date.now()
				};
				this.set_time(op.after);
				this.doc.add_ops(this.editor_id, [op]);
				callback(msg);
			}
		}, function () {}, function () {
			callback(null);
		});
	}
}

export { PublishState, PublishEditor };
