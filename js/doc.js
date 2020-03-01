import { TitleEditor, TitleState } from './title.js';
import { PublishEditor, PublishState, publish_css } from './publish.js';
import { create_editor } from './editor.js';
import { new_id } from './lib.js';

window.nbe.doc = {};

nbe.doc.comm = function (doc, server_url, callback_status) {
	var send_new, receive_new, send_unknown, receive_unknown, send_sync, receive_sync, receive, ws, notify;

	send_new = function () {
		ws.send(JSON.stringify({type : 'new', ids : doc.ids}));
	};

	receive_new = function (msg) {
		if (msg.text === 'created') {
			doc.server_status = 'established';
			doc.local_storage.write();
			send_sync();
		} else {
			alert('The id is already taken');
		}
	};

	send_unknown = function () {
		ws.send(JSON.stringify({type : 'unknown', ids : doc.ids}));
	};

	receive_unknown = function (msg) {
		if (msg.text === 'noexist') {
			ws.close();
			callback_status('doc', 'noexist');
		} else {
			doc.state =  nbe.doc.state_deserialize(msg.state);
			doc.n_operations_server = msg.noperation;
			doc.server_status = 'established';
			doc.local_storage.write();
			callback_status('doc', 'exist');
		}
	};

	send_sync = function () {
		ws.send(JSON.stringify({type : 'sync', ids : doc.ids, noperations : doc.n_operations_server, operations : doc.operations_local}));
		callback_status('nunsaved', doc.operations_local.length);
	};

	receive_sync = function (msg) {
		var n_operations_pre;

		n_operations_pre = doc.n_operations_server;
		nbe.doc.merge(doc, msg.operations, msg.noperations);
		if (n_operations_pre !== doc.n_operations_server) {
			send_sync();
		}
	};

	receive = function (data) {
		var msg;

		msg = JSON.parse(data);
		switch (msg.type) {
		case 'new':
			receive_new(msg);
			break;
		case 'unknown':
			receive_unknown(msg);
			break;
		case 'invalid':
			ws.close();
			callback_status('password', 'wrong password');
			break;
		case 'sync':
			receive_sync(msg);
			break;
		}
	};

	callback_status('network', 'unconnected');

	if (server_url) {
		ws = nbe.doc.ws(server_url, receive, callback_status);
		if (ws !== null) {
			switch (doc.server_status) {
			case 'new':
				send_new();
				break;
			case 'unknown':
				send_unknown();
				break;
			case 'established':
				send_sync();
				break;
			}
		}
	}

	notify = function () {
		if (server_url && ws !== null && doc.server_status === 'established') {
			send_sync();
		}
	};

	return {notify : notify};
};

nbe.doc.create = function (ids, use_local_storage, server_url, callback_status) {
	var doc;

	doc = {};
	doc.ids = ids;
	doc.server_status = 'unknown';
	doc.state = nbe.doc.state_init();
	doc.n_operations_server = 0;
	doc.operations_local = [];
	doc.local_storage = nbe.doc.local_storage(doc, use_local_storage);
	doc.local_storage.read();

	if (doc.server_status === 'unknown' && ids.new_doc) {
		doc.server_status = 'new';
		doc.local_storage.write();
	}
	delete ids.new_doc;

	doc.editors = nbe.doc.editors(doc);

	doc.new_id = new_id();

	doc.add_ops = function (editor_id, ops) {
		var operation;

		operation = {id : doc.new_id(), ops : ops};
		doc.editors.notify(ops, editor_id, true);
		doc.operations_local.push(operation);
		doc.comm.notify();
		doc.local_storage.write();
	};

	doc.comm = nbe.doc.comm(doc, server_url, callback_status);

	callback_status('nunsaved', doc.operations_local.length);

	return doc;
};

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
			editor = create_editor(editor_id, options, doc);
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

nbe.doc.html = function (doc) {
	var title_editor, text_editor, title, text, html;

	title_editor = doc.editors.add('temp', 'title', {editable : false, html_title : false});
	title = title_editor.get_value();
	doc.editors.remove('temp');

	text_editor = doc.editors.add('temp', 'text', {editable : false});
	text = text_editor.get_html();
	doc.editors.remove('temp');

	text = text.replace(/ data-id="[a-z0-9]+"/g, '');
	text = text.replace(/ style=""/g, '');

	html = [
		'<!DOCTYPE html>',
		'<html lang="en">',
		'<head>',
		'<meta http-equiv="Content-type" content="text/html; charset=UTF-8" />',
		'<title>',
		title,
		'</title>',
		'<style type="text/css">',
		publish_css,
		'</style>',
		'</head>',
		'<body>',
		'<div class="nbe editor">',
		text,
		'</div>',
		'</body>',
		'</html>'
	].join('\n');

	return html;
};

nbe.doc.local_storage = function (doc, use_local_storage) {
	var stringify, parse, timeout, key, read, write, timer, save;

	timeout = 5000;

	stringify = function () {
		return JSON.stringify({
			state : nbe.doc.state_serialize(doc.state),
			server_status : doc.server_status,
			n_operations_server : doc.n_operations_server,
			operations_local : doc.operations_local
		});
	};

	parse = function (value) {
		var parsed;

		parsed = JSON.parse(value);

		doc.state = nbe.doc.state_deserialize(parsed.state);
		doc.server_status = parsed.server_status;
		doc.n_operations_server = parsed.n_operations_server;
		doc.operations_local = parsed.operations_local;
	};

	key = function () {
		return '/nbe/text/' + doc.ids.id;
	};

	read = function () {
		var value;

		value = localStorage.getItem(key());
		if (value) {
			parse(value);
		}
	};

	save = function () {
		localStorage.setItem(key(), stringify());
	};

	timer = null;

	write = function () {
		if (timer === null) {
			timer = setTimeout(function () {
				save();
				timer = null;
			}, timeout);
		}
	};

	if (use_local_storage && typeof(localStorage) === 'object') {
		return {read: read, write : write};
	} else {
		return {read : function () {}, write : function () {}};
	}
};

nbe.doc.merge = function (doc, operations, noperations) {
	var ncommon, operations_server_new, operation_ids, operations_local_new, ops;

	operations = operations.slice(doc.n_operations_server - noperations);

	if (operations.length !== 0) {

		doc.n_operations_server = doc.n_operations_server + operations.length;
		nbe.doc.state_update(doc.state, operations);

		for (ncommon = 0; ncommon < doc.operations_local.length && ncommon < operations.length; ncommon++) {
			if (operations[ncommon].id !== doc.operations_local[ncommon].id) {
				break;
			}
		}

		doc.operations_local = doc.operations_local.slice(ncommon);
		operations_server_new = operations.slice(ncommon);

		if (operations_server_new.length !== 0) {

			operation_ids = {};
			operations_server_new.forEach(function (operation) {
				operation_ids[operation.id] = true;
			});

			operations_local_new = doc.operations_local.filter(function (operation) {
				return !(operation.id in operation_ids);
			});

			ops = [];
			doc.operations_local.forEach(function (operation) {
				ops = ops.concat(operation.ops);
			});
			ops = nbe.state.invert_ops(ops);

			operations_server_new.concat(operations_local_new).forEach(function (operation) {
				ops = ops.concat(operation.ops);
			});

			doc.editors.notify(ops, null, true);
		}
	}
};

nbe.doc.state_copy = function (state) {
	return {
		text : nbe.state.deserialize(nbe.state.serialize(state.text)),
		title : state.title.copy(),
		publish : state.publish.copy(),
	};
};

nbe.doc.state_deserialize = function (value) {
	const parsed = JSON.parse(value);

	return {
		text : nbe.state.deserialize(parsed.text),
		title : new TitleState(parsed.title.value),
		publish : new PublishState(parsed.publish.time),
	};
};

nbe.doc.state_init = function () {
	return {
		text : nbe.state.deserialize(nbe.state.initial()),
		title : new TitleState(),
		publish : new PublishState(),
	};
};

nbe.doc.state_serialize = function (state) {
	return JSON.stringify({
		text : nbe.state.serialize(state.text),
		title : state.title,
		publish : state.publish
	});
};

nbe.doc.state_update = function (state, operations) {
	const ops = {
		text : [],
		title : [],
		publish : []
	};

    for (const operation of operations) {
        for (const op of operation.ops) {
			const editor_class = 'editor_class' in op ? op.editor_class : 'text';
			ops[editor_class].push(op);
		}
	}

	nbe.state.update(null, state.text, null, ops.text);
    state.title.update(ops.title);
    state.publish.update(ops.publish);
};

nbe.doc.ws = function (url, callback_msg, callback_status) {
	var closed, msg1, msg2, msg_status, send, close, connect, conn;

	closed = false;
	msg1 = null;
	msg2 = null;
	msg_status = 'received';

	send = function (msg) {
		msg2 = msg;
		if (msg_status === 'received' && conn.readyState === conn.OPEN) {
			msg1 = msg;
			msg_status = 'pending';
			conn.send(msg);
		}
	};

	close = function () {
		closed = true;
		if (conn.readyState !== conn.CLOSED) {
			conn.close();
		}
	};

	connect = function () {
		conn = new WebSocket(url);

		conn.onopen = function () {
			callback_status('network', 'connected');
			//console.log('open', new Date(), conn);
			if (msg2 !== null) {
				send(msg2);
			}
		};

		conn.onerror = function () {
			//console.log('error', new Date(), conn);
			conn.close();
		};

		conn.onclose = function () {
			//console.log('close', new Date(), conn);
			msg_status = 'received';
			callback_status('network', 'unconnected');
			if (!closed) {
				setTimeout(connect, 5000);
			}
		};

		conn.onmessage = function (e) {
			msg_status = 'received';
			callback_msg(e.data);
			if (msg1 !== msg2) {
				send(msg2);
			}
		};
	};

	connect();

	return {send : send, close : close};
};
