'use strict';
/* eslint-disable */


var kite = {browser : {}};

var nbe = {
	browser : {icon : {}},
	dynamic : {},
	css : {},
	site : {},
	lib : {},
	doc : {},
	state : {},
	inputs : {},
	notify : {},
	format : {},
	location : {},
	events : {},
	triggers : {},
	ops : {},
	editor : {},
	paste : {},
	title : {},
	publish : {}
};


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
			console.log('The id is already taken');
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

	doc.new_id = nbe.lib.new_id();

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
		var ops_editor, ops, state, editor, i, j, op;

		ops_editor = [];
		for (i = 0; i < doc.operations_local.length; i++) {
			ops = doc.operations_local[i].ops;
			for (j = 0; j < ops.length; j++) {
				op = ops[j];
				if (editor_type === op.editor_class || (editor_type === 'text' && !('editor_class' in op))) {
					ops_editor.push(op);
				}
			}
		}

		if (editor_type === 'text') {
			state = nbe.state.state_copy(doc.state.text);
			nbe.state.update(null, state, null, ops_editor);
			editor = nbe.editor.create(editor_id, options, doc);
			editor.init(state);
		} else if (editor_type === 'title') {
			state = nbe.title.state_copy(doc.state.title);
			editor = nbe.title.create(editor_id, options, doc);
			editor.init(state);
			editor.add_external_ops(ops_editor, false);
		} else if (editor_type === 'publish') {
			state = nbe.publish.state_copy(doc.state.publish);
			editor = nbe.publish.create(editor_id, doc);
			editor.init(state);
			editor.add_external_ops(ops_editor, false);
		}

		editors[editor_id] = editor;

		return editor;
	};

	remove = function (editor_id) {
		delete editors[editor_id];
	};

	notify = function (ops, excl_editor_id, set_location) {
		var editor_id;

		for (editor_id in editors) {
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
		nbe.css.publish,
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
		title : nbe.title.state_copy(state.title),
		publish : nbe.publish.state_copy(state.publish)
	};
};


nbe.doc.state_deserialize = function (value) {
	var parsed;

	parsed = JSON.parse(value);

	return {
		text : nbe.state.deserialize(parsed.text),
		title : parsed.title,
		publish : parsed.publish
	};
};


nbe.doc.state_init = function () {
	return {
		text : nbe.state.deserialize(nbe.state.initial()),
		title : nbe.title.state_init(),
		publish : nbe.publish.state_init()
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
	var ops;

	ops = {
		text : [],
		title : [],
		publish : []
	};

	operations.forEach(function (operation) {
		operation.ops.forEach(function (op) {
			var editor_class;

			editor_class = 'editor_class' in op ? op.editor_class : 'text';
			ops[editor_class].push(op);
		});
	});

	nbe.state.update(null, state.text, null, ops.text);
	nbe.title.state_update(state.title, ops.title);
	nbe.publish.state_update(state.publish, ops.publish);
};


nbe.doc.ws = function (url, callback_msg, callback_status) {
	var closed, msg1, msg2, msg_status, send, close, connect, conn;

	if (typeof(WebSocket) === 'undefined' && typeof(MozWebSocket) !== 'function') {
		return null;
	}

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
		conn = typeof(WebSocket) !== 'undefined' ?  new WebSocket(url) : new MozWebSocket(url);
		//console.log('connect', new Date(), conn);

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
		editor.new_id = nbe.lib.new_id();
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

	trigger = function (type, value) {
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


nbe.events.add_event_listeners = function (editor) {
	var el_editor;

	el_editor = editor.el_editor;

	el_editor.addEventListener('click', function (event) {
		//console.log('click');
		nbe.location.get_format(editor);
	}, false);

	el_editor.addEventListener('touchend', function (event) {
		setTimeout(function () {
			nbe.location.get_format(editor);
		}, 0);
	}, false);

	el_editor.addEventListener('keydown', function (event) {
		//console.log('keydown', event);
		if (event.which && (event.keyCode >= 37 && event.keyCode <= 40)) {
			nbe.location.get_format(editor);
		} else if (event.keyCode === 8) {
			editor.trigger('delete', null);
			event.preventDefault();
		} else if (event.keyCode === 9) {
			editor.trigger('tab', null);
			event.preventDefault();
		} else if (event.keyCode === 13) {
			editor.trigger('newline', null);
			event.preventDefault();
		} else if (event.ctrlKey || event.metaKey) {
			if (event.keyCode === 65) {
				editor.trigger('select', null);
				event.preventDefault();
			} else if (event.keyCode === 86) {
				editor.trigger('paste', null);
			} else if (event.keyCode === 88) {
				//editor.trigger('cut', null); cut event is fired automatically.
			} else if (event.keyCode === 90) {
				editor.trigger('undo', event.shiftKey ? 'redo' : 'undo');
				event.preventDefault();
			}
		}
	}, false);

	el_editor.addEventListener('keypress', function (event) {
		var char;

		//console.log('keypress', event);
		if (event.charCode === 0 && event.keyCode >= 37 && event.keyCode <= 40) {
			nbe.location.get_format(editor);
		} else if (!event.ctrlKey && !event.metaKey && event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 13) {
			char = String.fromCharCode(event.charCode ? event.charCode : event.which);
			editor.trigger('text', char);
			event.preventDefault();
		}
	}, false);

	el_editor.addEventListener('keyup', function (event) {
		//console.log('keyup');
		if (event.keyCode >= 37 && event.keyCode <= 40) {
			nbe.location.get_format(editor);
		}
	}, false);

	el_editor.addEventListener('mousedown', function (event) {
		// console.log('mousedown');
	}, false);

	el_editor.addEventListener('mouseup', function (event) {
		nbe.location.get_format(editor);
	}, false);

	el_editor.addEventListener('mouseout', function (event) {
	}, false);

	el_editor.addEventListener('focus', function (event) {
		//console.log('focus');
		editor.focus = true;
	}, false);

	el_editor.addEventListener('blur', function (event) {
		editor.focus = false;
	}, false);

	el_editor.addEventListener('select', function (event) {
		editor.trigger('select', null);
	}, false);

	el_editor.addEventListener('paste', function (event) {
		editor.trigger('paste', null);
	}, false);

	el_editor.addEventListener('cut', function (event) {
		editor.trigger('cut', null);
	}, false);

	editor.mutation = nbe.events.observer(editor);
	if (!editor.mutation.supported) {
		editor.mutation = nbe.events.subtree(editor);
	}
};


nbe.events.subtree = function (editor) {
	var active, events, timer, observe, disconnect;

	active = false;
	events = [];
	timer = null;

	editor.el_editor.addEventListener('DOMSubtreeModified', function (event) {
		if (active) {
			events.push(event);
			if (!timer) {
				timer = setTimeout(function () {
					editor.trigger('subtree', events);
					timer = null;
					events = [];
				}, 0);
			}
		}
	}, false);

	observe = function () {
		active = true;
	};

	disconnect = function () {
		active = false;
	};

	return {observe : observe, disconnect : disconnect, supported : true};
};


nbe.inputs.background_color = function (trigger, title, parent, init) {
	var button, value, element, el_symbol, color_menu, set_value;

	button = nbe.inputs.input('background_color', trigger);

	value = null;
	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-background_color off');
	element.title = title;
	el_symbol = kite.browser.dom.ea('div', element);
	el_symbol.textContent = 'A';

	color_menu = nbe.inputs.color_menu(function (color) {
		button.trigger(color);
	}, 'transparent', 'None', [
		'rgb(255, 200, 200)', 'rgb(255, 200, 75)', 'rgb(255, 255, 200)', 'rgb(200, 255, 0)', 'rgb(200, 255, 200)', 'rgb(150, 255, 225)', 'rgb(200, 255, 255)', 'rgb(135, 240, 255)', 'rgb(100, 175, 255)', 'rgb(235, 120, 255)', 'rgb(255, 100, 200)', 'rgb(224,224,224)',
		'rgb(255, 150, 150)', 'rgb(255, 175, 50)', 'rgb(255, 255, 150)', 'rgb(175, 255, 0)', 'rgb(150, 255, 150)', 'rgb(100, 255, 200)', 'rgb(150, 255, 255)', 'rgb(80, 235, 255)', 'rgb(0, 150, 255)', 'rgb(200, 80, 255)', 'rgb(237, 0, 175)', 'rgb(192,192,192)',
		'rgb(255, 100, 100)', 'rgb(255, 150, 25)', 'rgb(255, 255, 100)', 'rgb(150, 255, 0)', 'rgb(100, 255, 100)', 'rgb(50, 255, 175)', 'rgb(100, 255, 255)', 'rgb(50, 220, 255)', 'rgb(0, 100, 255)', 'rgb(175, 40, 255)', 'rgb(218, 0, 150)', 'rgb(160,160,160)',
		'rgb(255, 0, 0)', 'rgb(255, 125, 0)', 'rgb(255, 255, 0)', 'rgb(125, 255, 0)', 'rgb(0, 255, 0)', 'rgb(0, 255, 150)', 'rgb(0, 255, 255)', 'rgb(0, 200, 255)', 'rgb(0, 0, 255)', 'rgb(150, 0, 255)', 'rgb(200, 0, 125)', 'rgb(128,128,128)',
		'rgb(200 ,0, 0)', 'rgb(200, 100, 0)', 'rgb(200, 200, 0)', 'rgb(100, 200, 0)', 'rgb(0, 200, 0)', 'rgb(0, 200, 125)', 'rgb(0, 200, 200)', 'rgb(0, 170, 225)', 'rgb(0, 0, 200)', 'rgb(125, 0, 200)', 'rgb(170, 0, 105)', 'rgb(96,96,96)',
		'rgb(150, 0, 0)', 'rgb(150, 75, 0)', 'rgb(150, 150, 0)', 'rgb(75, 150, 0)', 'rgb(0, 150, 0)', 'rgb(0, 150, 100)', 'rgb(0, 150, 150)', 'rgb(0, 140, 195)', 'rgb(0, 0, 150)', 'rgb(100, 0, 150)', 'rgb(140, 0, 85)', 'rgb(64,64,64)',
		'rgb(100, 0, 0)', 'rgb(100, 50, 0)', 'rgb(100, 100, 0)', 'rgb(50, 100, 0)', 'rgb(0, 100, 0)', 'rgb(0, 100, 75)', 'rgb(0, 100, 100)', 'rgb(0, 110, 165)', 'rgb(0, 0, 100)', 'rgb(75, 0, 100)', 'rgb(110, 0, 65)', 'rgb(32,32,32)'
	], init);

	set_value = function (new_value) {
		if (value !== new_value) {
			value = new_value;
			el_symbol.style.backgroundColor = value;
		}
	};

	set_value(init);

	element.addEventListener('click', function (e) {
		e.stopPropagation();
		if (color_menu.is_open()) {
			color_menu.remove();
		} else {
			color_menu.display(parent, element, value);
		}

	}, false);

	button.element = element;
	button.set_value = set_value;

	return button;
};


nbe.inputs.bold = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('bold', title, parent, trigger, init);
	button.element.textContent = 'B';

	return button;
};


nbe.inputs.button = function (type, title, parent, trigger, init) {
	var input, value, element, set_value;

	input = nbe.inputs.input(type, trigger);

	value = null;
	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-' + type + ' off');
	element.title = title;

	set_value = function (new_value) {
		if (value !== new_value) {
			value = new_value;
			element.className = 'wu-icon wu-icon-' + type + ' ' + value;
		}
	};

	set_value(init);

	element.addEventListener('click', function () {
		input.trigger(value === 'off' ? 'on' : 'off');
	});

	input.element = element;
	input.set_value = set_value;

	return input;
};


nbe.inputs.color = function (trigger, title, parent, init) {
	var button, value, element, color_menu, set_value;

	button = nbe.inputs.input('color', trigger);

	value = null;
	element = kite.browser.dom.eac('button', parent, 'wu-icon off');
	element.title = title;
	element.textContent = 'A';

	color_menu = nbe.inputs.color_menu(function (color) {
		button.trigger(color);
	}, 'rgb(0, 0, 0)', 'Black', [
		'rgb(255, 200, 200)', 'rgb(255, 200, 75)', 'rgb(255, 255, 200)', 'rgb(200, 255, 0)', 'rgb(200, 255, 200)', 'rgb(150, 255, 225)', 'rgb(200, 255, 255)', 'rgb(135, 240, 255)', 'rgb(100, 175, 255)', 'rgb(235, 120, 255)', 'rgb(255, 100, 200)', 'rgb(224,224,224)',
		'rgb(255, 150, 150)', 'rgb(255, 175, 50)', 'rgb(255, 255, 150)', 'rgb(175, 255, 0)', 'rgb(150, 255, 150)', 'rgb(100, 255, 200)', 'rgb(150, 255, 255)', 'rgb(80, 235, 255)', 'rgb(0, 150, 255)', 'rgb(200, 80, 255)', 'rgb(237, 0, 175)', 'rgb(192,192,192)',
		'rgb(255, 100, 100)', 'rgb(255, 150, 25)', 'rgb(255, 255, 100)', 'rgb(150, 255, 0)', 'rgb(100, 255, 100)', 'rgb(50, 255, 175)', 'rgb(100, 255, 255)', 'rgb(50, 220, 255)', 'rgb(0, 100, 255)', 'rgb(175, 40, 255)', 'rgb(218, 0, 150)', 'rgb(160,160,160)',
		'rgb(255, 0, 0)', 'rgb(255, 125, 0)', 'rgb(255, 255, 0)', 'rgb(125, 255, 0)', 'rgb(0, 255, 0)', 'rgb(0, 255, 150)', 'rgb(0, 255, 255)', 'rgb(0, 200, 255)', 'rgb(0, 0, 255)', 'rgb(150, 0, 255)', 'rgb(200, 0, 125)', 'rgb(128,128,128)',
		'rgb(200 ,0, 0)', 'rgb(200, 100, 0)', 'rgb(200, 200, 0)', 'rgb(100, 200, 0)', 'rgb(0, 200, 0)', 'rgb(0, 200, 125)', 'rgb(0, 200, 200)', 'rgb(0, 170, 225)', 'rgb(0, 0, 200)', 'rgb(125, 0, 200)', 'rgb(170, 0, 105)', 'rgb(96,96,96)',
		'rgb(150, 0, 0)', 'rgb(150, 75, 0)', 'rgb(150, 150, 0)', 'rgb(75, 150, 0)', 'rgb(0, 150, 0)', 'rgb(0, 150, 100)', 'rgb(0, 150, 150)', 'rgb(0, 140, 195)', 'rgb(0, 0, 150)', 'rgb(100, 0, 150)', 'rgb(140, 0, 85)', 'rgb(64,64,64)',
		'rgb(100, 0, 0)', 'rgb(100, 50, 0)', 'rgb(100, 100, 0)', 'rgb(50, 100, 0)', 'rgb(0, 100, 0)', 'rgb(0, 100, 75)', 'rgb(0, 100, 100)', 'rgb(0, 110, 165)', 'rgb(0, 0, 100)', 'rgb(75, 0, 100)', 'rgb(110, 0, 65)', 'rgb(32,32,32)'
	], init);

	set_value = function (new_value) {
		if (value !== new_value) {
			value = new_value;
			element.style.color = value;
		}
	};

	set_value(init);

	element.addEventListener('click', function (e) {
		e.stopPropagation();
		if (color_menu.is_open()) {
			color_menu.remove();
		} else {
			color_menu.display(parent, element, value);
		}
	}, false);

	button.element = element;
	button.set_value = set_value;

	return button;
};


nbe.inputs.color_menu = function (trigger, default_color, default_label, colors, init) {
	var is_open, el_panel, element, value, swatches, create_swatch, el_default, rgb_input, el_custom, el_custom_swatch, el_r, el_g, el_b, el_default_label, i, remove, remove_handler, switch_swatch;

	is_open = false;

	el_panel = document.body;

	element = kite.browser.dom.ec('div', 'wu-menu wu-color_menu');
	element.addEventListener('click', function (e) {
		var color;

		color = e.target.getAttribute('data-color');

		if (color) {
			switch_swatch(color);
		}
	}, false);

	value = init;
	swatches = {};

	create_swatch = function (color, parent) {
		var el_swatch;

		el_swatch = kite.browser.dom.eac('div', parent, 'wu-color_swatch');
		el_swatch.style.backgroundColor = color;
		el_swatch.setAttribute('data-color', color);

		return el_swatch;
	};

	el_default = kite.browser.dom.eac('div', element, 'wu-color_default');

	rgb_input = function (e) {
		var new_value;

		if (el_r.value !== '' && el_g.value !== '' && el_b.value !== '') {
			new_value = 'rgb(' + el_r.value + ', ' + el_g.value + ', ' + el_b.value + ')';

			el_custom_swatch.style.backgroundColor = new_value;
			switch_swatch(new_value);
		} else {
			switch_swatch(init);
		}
	};

	el_custom = kite.browser.dom.eac('div', element, 'wu-color_custom');
	el_custom_swatch = kite.browser.dom.eac('div', el_custom, 'wu-color_swatch');
	el_custom_swatch.addEventListener('click', function (e) {
		rgb_input(e);
	}, false);

	kite.browser.dom.ea('span', el_custom).textContent = 'R:';
	el_r = kite.browser.dom.ea('input', el_custom);
	el_r.addEventListener('keyup', rgb_input, false);

	kite.browser.dom.ea('span', el_custom).textContent = 'G:';
	el_g = kite.browser.dom.ea('input', el_custom);
	el_g.addEventListener('keyup', rgb_input, false);

	kite.browser.dom.ea('span', el_custom).textContent = 'B:';
	el_b = kite.browser.dom.ea('input', el_custom);
	el_b.addEventListener('keyup', rgb_input, false);

	swatches[default_color] = create_swatch(default_color, el_default);

	el_default_label = kite.browser.dom.ea('span', el_default);
	el_default_label.textContent = default_label;
	el_default_label.setAttribute('data-color', default_color);

	for (i = 0; i < colors.length; i++) {
		swatches[colors[i]] = create_swatch(colors[i], element);
	}

	remove = function () {
		is_open = false;
		el_panel.removeChild(element);
		document.body.removeEventListener('click', remove_handler, false);
		trigger(value);
	};

	remove_handler = function (e) {
		if (e.target !== el_r && e.target !== el_g && e.target !== el_b) {
			remove();
		}
	};

	switch_swatch = function (new_value) {
		if (swatches[value]) {
			swatches[value].classList.remove('wu-selected');
		}

		el_custom_swatch.classList.remove('wu-selected');
		el_custom_swatch.style.backgroundColor = 'transparent';

		if (swatches[new_value]) {
			swatches[new_value].classList.add('wu-selected');
		} else {
			el_custom_swatch.classList.add('wu-selected');
			el_custom_swatch.style.backgroundColor = new_value;
		}

		value = new_value;
	};

	return {display : function (parent, offset_element, new_value) {
		var rgb, offset;

		is_open = true;

		el_panel.appendChild(element);

		offset = kite.browser.ui.get_offset(offset_element);
		element.style.left = (offset.left - (element.offsetWidth / 2) + (offset_element.offsetWidth / 2)) + 'px';
		element.style.top = offset.top + offset_element.offsetHeight + 'px';

		document.body.addEventListener('click', remove_handler, false);

		switch_swatch(new_value);

		if (swatches[new_value]) {
			if (el_r.value !== '' && el_g.value !== '' && el_b.value !== '') {
				el_custom_swatch.style.backgroundColor = 'rgb(' + el_r.value + ', ' + el_g.value + ', ' + el_b.value + ')';
			}
		} else {
			rgb = new_value.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
			el_r.value = rgb[1];
			el_g.value = rgb[2];
			el_b.value = rgb[3];
		}
	}, remove : remove, is_open : function () {
		return is_open;
	}};
};

nbe.inputs.drop_down = function (type, title, menu_content, button_content, parent, trigger, init, display_input) {
	var input, value, el_panel, element, el_input, input_handler, close, el_menu, options, key, set_value;

	input = nbe.inputs.input(type, trigger);

	value = null;

	el_panel = document.body;

	element = kite.browser.dom.eac('div', parent, 'wu-icon wu-drop-down wu-icon-' + type);
	element.title = title;
	element.addEventListener('click', function (e) {
		var offset;

		if (!el_menu.parentNode && e.target !== el_input) {
			offset = kite.browser.ui.get_offset(element);
			el_menu.style.left = offset.left + 1 + 'px';
			el_menu.style.top = offset.top + element.offsetHeight + 'px';
			el_panel.appendChild(el_menu);
			close = false;
			setTimeout(function () {
				close = true;
			}, 0);
		}
	}, true);

	el_input = document.createElement('input');
	if (display_input) {
		element.appendChild(el_input);
		el_input.type = 'text';
		input_handler = function (e) {
			var new_value = el_input.value.replace(/\s/g, '');

			if (isNaN(new_value)) {
				alert('Please specify a number.');
				set_value(value);
			} else {
				set_value(new_value + 'px');
				input.trigger(value);
			}
		};
		el_input.addEventListener('blur', input_handler, false);
		el_input.addEventListener('keyup', function (e) {
			if (e.keyCode === 13) {
				input_handler(e);
			}
		}, false);
	}

	document.body.addEventListener('click', function (e) {
		if (el_menu.parentNode && close) {
			el_panel.removeChild(el_menu);
		}
	}, false);

	el_menu = kite.browser.dom.ec('div', 'wu-menu drop_down_menu');
	el_menu.addEventListener('click', function (e) {
		var value;

		value = e.target.getAttribute('data-option') ? e.target.getAttribute('data-option') : e.target.parentNode.getAttribute('data-option');
		input.trigger(value);

		if (el_menu.parentNode) {
			el_panel.removeChild(el_menu);
		}
	}, false);

	options = {};

	for (key in menu_content) {
		if (menu_content.hasOwnProperty(key)) {
			options[key] = kite.browser.dom.eac('div', el_menu, 'wu-menu-row');
			options[key].setAttribute('data-option', key);
			options[key].innerHTML = menu_content[key];
		}
	}

	set_value = function (new_value) {
		if (value && value in options) {
			options[value].className = 'wu-menu-row';
		}
		value = new_value;
		if (value in options) {
			options[value].className = 'wu-menu-row wu-selected';
		}
		if (display_input) {
			el_input.value = value.replace('px', '');
		} else {
			element.innerHTML = button_content[value] ? button_content[value] : (menu_content[value] ? menu_content[value].replace(' (default)', '') : value);
		}
	};

	set_value(init);

	input.element = element;
	input.set_value = set_value;

	return input;
};


nbe.inputs.font_family = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('font_family', title, content, {}, parent, trigger, init, false);

	return drop_down;
};


nbe.inputs.font_size = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('font_size', title, content, {}, parent, trigger, init, true);

	return drop_down;
};


nbe.inputs.heading = function (trigger, title, menu_content, button_content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('heading', title, menu_content, button_content, parent, trigger, init, false);

	return drop_down;
};


nbe.inputs.input = function (type, trigger) {
	var triggers, add_trigger, remove_trigger;

	triggers = trigger ? [trigger] : [];

	add_trigger = function (trigger) {
		var i, add;

		add = true;

		for (i = 0; i < triggers.length; i++) {
			if (triggers[i] === trigger) {
				add = false;
			}
		}

		if (add) {
			triggers.push(trigger);
		}
	};

	remove_trigger = function (trigger) {
		var i;

		for (i = 0; i < triggers.length; i++) {
			if (triggers[i] === trigger) {
				triggers.splice(i, 1);
			}
		}
	};

	return {editors : triggers, add_trigger : add_trigger, remove_trigger : remove_trigger, trigger : function (value) {
		var i;

		for (i = 0; i < triggers.length; i++) {
			triggers[i](type, value);
		}
	}, get_triggers : function () {
		return triggers;
	}};

};


nbe.inputs.italic = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('italic', title, parent, trigger, init);
	button.element.textContent = 'I';

	return button;
};


nbe.inputs.left_margin = function (trigger, parent, init) {
	var current_value, el_container, input, decrease, increase;

	current_value = ['off', 'on'];

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('left_margin', trigger);

	decrease = nbe.inputs.button('decrease_indent', 'Decrease indentation', parent, function () {
		if (current_value[0] === 'on') {
			input.trigger('decrement');
		}
	}, 'off');
	decrease.element.textContent = '<';
	increase = nbe.inputs.button('increase_indent', 'Increase indentation', parent, function () {
		if (current_value[1] === 'on') {
			input.trigger('increment');
		}
	}, 'off');
	increase.element.textContent = '>';

	input.element = el_container;
	input.set_value = function (value) {
		current_value = value.split(':');
		decrease.set_value(current_value[0]);
		increase.set_value(current_value[1]);
	};

	input.set_value(init);

	return input;
};


nbe.inputs.line_spacing = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('line_spacing', title, content, {}, parent, trigger, init, false);

	return drop_down;
};


nbe.inputs.list = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('list', title, content, {}, parent, trigger, init, false);

	return drop_down;
};


nbe.inputs.strikethrough = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('strikethrough', title, parent, trigger, init);
	button.element.textContent = 'S';

	return button;
};


nbe.inputs.text_align = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('text_align', title, content, {}, parent, trigger, init, false);

	return drop_down;
};


nbe.inputs.underline = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('underline', title, parent, trigger, init);
	button.element.textContent = 'U';

	return button;
};


nbe.inputs.undo = function (trigger, parent) {
	var el_container, input, undo, redo;

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('undo', trigger);

	undo = nbe.inputs.button('undo', 'Undo', el_container, function () {
		input.trigger('undo');
	}, 'off');
	kite.browser.dom.ea('img', undo.element).src = '/img/undo.svg';
	redo = nbe.inputs.button('redo', 'Redo', el_container, function () {
		input.trigger('redo');
	}, 'off');
	kite.browser.dom.ea('img', redo.element).src = '/img/redo.svg';

	input.element = el_container;
	input.set_value = function (value) {
		undo.set_value(value.undo ? 'on' : 'off');
		redo.set_value(value.redo ? 'on' : 'off');
	};

	return input;
};


nbe.inputs.vertical_align = function (trigger, parent, init) {
	var el_container, input, button_trigger, sup, sub;

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('vertical_align', trigger);

	button_trigger = function (type, value) {
		if (value === 'on') {
			input.trigger(type);
		} else {
			input.trigger('baseline');
		}
	};

	sup = nbe.inputs.button('super', 'Superscript', el_container, button_trigger, 'off');
	sup.element.innerHTML = 'A<span>2</span>';
	sub = nbe.inputs.button('sub', 'Subscript', el_container, button_trigger, 'off');
	sub.element.innerHTML = 'A<span>2</span>';

	input.element = el_container;
	input.set_value = function (value) {
		if (value === 'super') {
			sup.set_value('on');
			sub.set_value('off');
		} else if (value === 'sub') {
			sub.set_value('on');
			sup.set_value('off');
		} else {
			sup.set_value('off');
			sub.set_value('off');
		}
	};

	input.set_value(init);

	return input;
};


nbe.lib.clone = function (val) {
	return JSON.parse(JSON.stringify(val));
};


nbe.lib.file_upload = function (file, callback) {
	var find_ending, ending, reader;

	find_ending = function (file) {
		var match;

		match = file.name.match(/\.([a-zA-Z]+)/);
		ending = match ? match[1] : null;

		return ending;
	};

	ending = find_ending(file);

	if (ending === null) {
		callback(null);
	} else {
		reader = new FileReader();

		reader.onload = function (event) {
			nbe.lib.xhr('POST', nbe.config.file_upload_url, {'X-File-Ending' : ending}, reader.result, 0, function (responseText) {
				callback(JSON.parse(responseText));
			}, function () {
				callback(null);
			}, function () {
				callback(null);
			});
		};

		reader.readAsArrayBuffer(file);
	}
};


nbe.lib.get_attributes = function (element, keys) {
	var format, set_value, i;

	format = {};

	set_value = function (key) {
		var value;

		value = element.getAttribute('data-' + key);
		if (value) {
			format[key] = value;
		}
	};

	for (i = 0; i < keys.length; i++) {
		set_value(keys[i]);
	}

	return format;
};


nbe.lib.new_id = function () {
	var stem, counter;

	stem = nbe.lib.rnd_string(12);
	counter = 0;

	return function () {
		var id;

		id = stem + counter;
		counter++;

		return id;
	};
};


nbe.lib.partial_copy = function (src, dst, keys) {
	var i, key;

	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		if (key in src) {
			dst[key] = src[key];
		}
	}

	return dst;
};


nbe.lib.rnd_math_random = function (n) {
	var chars, i;

	chars = [];

	for (i = 0; i < n; i++) {
		chars[i] = Math.floor(36 * Math.random()).toString(36);
	}

	return chars.join('');
};


nbe.lib.rnd_random_org = (function () {
	var sent, min, chars, fetch, get;

	sent = false;
	sent = true; // This line is used to block the requests while testing.
	min = 40;

	chars = '';

	fetch = function () {
		var url;

		if (!sent) {
			sent = true;
			url = 'http://www.random.org/strings/?num=3&len=20&digits=on&upperalpha=off&loweralpha=on&unique=off&format=plain&rnd=new';

			nbe.lib.xhr('GET', url, {}, '', 0, function (resp) {
				sent = false;
				try {
					chars = chars + resp.split('\n').join('');
				} catch (e) {}
			}, function () {
				sent = false;
			}, function () {
				sent = false;
			});
		}
	};

	fetch();

	get = function (n) {
		var str;

		str = '';

		if (chars.length >= n) {
			str = chars.slice(0, n);
			chars = chars.slice(n);
		}

		if (chars.length < min) {
			fetch();
		}

		return str;
	};

	return get;
}());


nbe.lib.rnd_string = function (n) {
	var str;

	str = nbe.lib.rnd_random_org(n);

	if (str.length !== n) {
		str = nbe.lib.rnd_crypto(n);
	}

	if (str.length !== n) {
		str = nbe.lib.rnd_math_random(n);
	}

	return str;
};


nbe.lib.server_waiting_for_init_read = function () {
	var element, stop;

	element = document.createTextNode('The document is loading');

	stop = function () {

	};

	return {element : element, stop : stop};
};


nbe.lib.set_attributes = function (element, keys, format) {
	var set_attribute, i;

	set_attribute = function (key) {
		if (key in format) {
			element.setAttribute('data-' + key, format[key]);
		} else {
			element.removeAttribute('data-' + key);
		}
	};

	for (i = 0; i < keys.length; i++) {
		set_attribute(keys[i]);
	}

	return element;
};


nbe.lib.share_emails = function (text) {
	var emails, valid, invalid;

	emails = text.split(/[ ,\n]/).filter(function (email) {
		return email !== '';
	});

	valid = [];
	invalid = [];

	emails.forEach(function (email) {
		if (nbe.lib.valid_email(email)) {
			valid.push(email);
		} else {
			invalid.push(email);
		}
	});

	return {valid : valid, invalid : invalid};
};


nbe.lib.valid_email = function (email) {
	var pattern;

	pattern = /^[\-a-z0-9~!$%\^&*_=+}{\'?]+(\.[\-a-z0-9~!$%\^&*_=+}{\'?]+)*@([a-z0-9_][\-a-z0-9_]*(\.[\-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

	return typeof email === 'string' && pattern.test(email);
};


nbe.lib.xhr = function (method, url, headers, body, timeout, callback_200, callback_other, callback_error) {
	var request, prop;

	request = new XMLHttpRequest();

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status === 200) {
				callback_200(request.responseText);
			} else {
				callback_other();
			}
		}
	};

	request.onerror = function () {
		callback_error();
	};

	request.ontimeout = function () {
		callback_error();
	};

	request.open(method, url, true);
	request.timeout = timeout;

	for (prop in headers) {
		if (headers.hasOwnProperty(prop)) {
			request.setRequestHeader(prop, headers[prop]);
		}
	}

	request.send(body);
};


nbe.location.blur = function (editor) {
	editor.el_editor.blur();
};


nbe.location.first_child = function (node) {
	if (node.children.length === 0) {
		return null;
	} else {
		return node.children[0];
	}
};


nbe.location.focus = function (editor) {
	editor.el_editor.focus();

	/*
	cowriter.editor.state.update_state(view);
	cowriter.editor.cursor.scroll_into_view(view);
	cowriter.editor.view.panel_take_over(view);
	*/
};


nbe.location.format = function (editor) {
	var format;

	format = {};
	nbe.location.format_line(editor, format);
	nbe.location.format_text(editor, format);

	//nbe.location.format_left_margin(editor, format);
	nbe.location.format_img_link(editor, format);

	editor.format = format;
	editor.inputs.notify();

	return format;
};


nbe.location.format_img_link = function (editor, format) {
	var set_node_img_link, node_start, node_end, offset, node_traverse, cont, node_img, node_link, node_next;

	set_node_img_link = function (node) {
		if (node && node.type === 'img' && node_img === null) {
			node_img = node;
		}

		if (node_link === null) {
			if (node && node.type === 'link') {
				node_link = node;
			} else if (node && node.parent && node.parent.type === 'link') {
				node_link = node.parent;
			}
		}
	};

	if (editor.location === null) {
		return null;
	}

	if (editor.location.collapsed) {
		node_start = node_end = editor.state.nodes[editor.location.start.container];
		offset = editor.location.start.offset;
	} else {
		node_start = editor.state.nodes[editor.location.start.container];
		node_end = editor.state.nodes[editor.location.end.container];
		offset = editor.location.end.offset;
	}

	node_traverse = node_end;
	cont = true;
	node_img = null;
	node_link = null;
	while (cont) {
		set_node_img_link(node_traverse);

		if (node_traverse === node_start) {
			cont = false;
		} else {
			node_traverse = nbe.location.previous_node(node_traverse);
		}
	}

	if (!(node_end.type === 'text' && offset < node_end.val.text.length)) {
		node_next = nbe.location.next_node(node_end);
		set_node_img_link(node_next);
	}

	if (node_img) {
		format.edit_img = {id : node_img.id};
		nbe.lib.partial_copy(node_img.val, format.edit_img, ['src', 'width', 'height', 'title']);
	}

	if (node_link) {
		format.edit_link = {id : node_link.id, href : node_link.val.href};
	}

	return format;
};


nbe.location.format_line = function (editor, format) {
	var find_line_val, line_val, point, node_location;

	find_line_val = function (node) {
		while (node.type !== 'line') {
			node = node.parent;
		}

		return node.val;
	};

	if (editor.location === null) {
		line_val = {};
	} else {
		point = editor.location.collapsed ? editor.location.start : editor.location.end;
		node_location = editor.state.nodes[point.container];
		line_val = find_line_val(node_location);
	}

	nbe.state.copy_line_format(line_val, format);

	return format;
};


nbe.location.format_text = function (editor, format) {
	var find_previous_text_or_line, find_next_text_or_line, node_first, node_between, val, point, node_location, node_val, node_previous;

	find_previous_text_or_line = function (node) {
		node = nbe.location.previous_node(node);
		while (node !== null && node.type !== 'text' && node.type !== 'line') {
			node = nbe.location.previous_node(node);
		}

		return node;
	};

	find_next_text_or_line = function (node) {
		node = nbe.location.next_node(node);
		while (node !== null && node.type !== 'text' && node.type !== 'line') {
			node = nbe.location.next_node(node);
		}

		return node;
	};

	node_first = function (node_line) {
		var node_next;

		node_next = find_next_text_or_line(node_line);
		if (node_next && node_next.type === 'text') {
			return node_next;
		} else {
			return node_line;
		}
	};

	node_between = function (node) {
		var node_previous, node_next;

		node_previous = find_previous_text_or_line(node);
		if (node_previous.type === 'text') {
			return node_previous;
		}

		node_next = find_next_text_or_line(node);
		if (node_next && node_next.type === 'text') {
			return node_next;
		}

		return node_previous;
	};

	if (editor.location === null) {
		val = {};
	} else {
		point = editor.location.collapsed ? editor.location.start : editor.location.end;
		node_location = editor.state.nodes[point.container];

		if (node_location.type === 'text' && point.offset > 0) {
			node_val = node_location;
		} else if (node_location.type === 'text') {
			node_previous = nbe.location.previous_node(node_location);
			if (node_previous.type === 'text') {
				node_val = node_previous;
			} else {
				node_val = node_location;
			}
		} else if (node_location.type === 'line') {
			node_val = node_first(node_location);
		} else {
			node_val = node_between(node_location);
		}

		val = node_val.val;
	}

	nbe.state.copy_text_format(val, format);

	return format;
};


nbe.location.format_update = function (editor) {
	nbe.location.format_line(editor, editor.format);
	nbe.location.format_text(editor, editor.format);

	//nbe.location.format_left_margin(editor, editor.format);
	nbe.location.format_img_link(editor, editor.format);

	editor.inputs.notify();

	return editor.format;
};


nbe.location.get_format = function (editor) {
	nbe.location.get(editor);
	nbe.location.format(editor);
};


nbe.location.in_link = function (point) {
	var index;

	if (point.node.parent.type !== 'link') {
		return false;
	}

	index = point.node.parent.children.indexOf(point.node);
	if (index === point.node.parent.children.length - 1) {
		if (point.node.type === 'text') {
			return nbe.location.in_text(point);
		} else {
			return false;
		}
	} else {
		return true;
	}
};


nbe.location.in_text = function (point) {
	return point && point.node.type === 'text' && point.offset < point.node.val.text.length && point.offset > 0;
};


nbe.location.insert_after = function (editor, id) {
	var node, index;

	node = editor.state.nodes[id];
	index = node.parent.children.indexOf(node);
	if (index < node.parent.children.length - 1) {
		return {domop : 'insert', before : node.parent.children[index + 1].id};
	} else {
		return {domop : 'append', parent : node.parent.id};
	}
};


nbe.location.item_to_loc = function (iditem) {
	var offset, item;

	item = iditem.item;
	offset = item.type === 'text' ? item.val.text.length : 1;

	return {container : iditem.id, offset : offset};
};


nbe.location.last_child = function (node) {
	if (node.children.length === 0) {
		return null;
	} else {
		return node.children[node.children.length - 1];
	}
};


nbe.location.line = function (node) {
	while (node.type !== 'line') {
		node = node.parent;
	}

	return node;
};


nbe.location.lines = function (editor) {
	var lines, nodes, start, end, node_line_start, node_line_end, children, index_start, index_end;

	lines = [];

	if (editor.location) {
		nodes = editor.state.nodes;
		start = editor.location.start;
		end = editor.location.collapsed ? start : editor.location.end;

		node_line_start = nbe.location.parent_line(editor, start.container);
		node_line_end = nbe.location.parent_line(editor, end.container);

		children = node_line_start.parent.children;

		index_start = children.indexOf(node_line_start);
		index_end = children.indexOf(node_line_end);

		lines = children.slice(index_start, index_end + 1);
	}

	return lines;
};


nbe.location.loc_end = function (node) {
	if (node.type === 'text') {
		return {container : node.id, offset : node.val.text.length};
	} else if (node.type === 'link') {
		return nbe.location.loc_end(node.children[node.children.length - 1]);
	} else if (node.type === 'line') {
		if (node.children.length === 0) {
			return {container : node.id, offset : 0};
		} else {
			return nbe.location.loc_end(node.children[node.children.length - 1]);
		}
	} else {
		return {container : node.id, offset : 1};
	}
};


nbe.location.loc_previous = function (node) {
	var node_end, index, node_previous;

	node_end = function (node) {
		if (node.type === 'text') {
			return {container : node.id, offset : node.val.text.length};
		} else if (node.type === 'link') {
			return node_end(node.children[node.children.length - 1]);
		} else if (node.type === 'line') {
			if (node.children.length === 0) {
				return {container : node.id, offset : 0};
			} else {
				return node_end(node.children[node.children.length - 1]);
			}
		} else {
			return {container : node.id, offset : 1};
		}
	};

	index = node.parent.children.indexOf(node);
	if (index > 0) {
		node_previous = node.parent.children[index - 1];
		return {start : node_end(node_previous), collapsed : true};
	} else if (node.type === 'line') {
		return {start : {container : node.id, offset : 0}, collapsed : true};
	} else if (node.parent.type === 'line') {
		return {start : {container : node.parent.id, offset : 0}, collapsed : true};
	} else {
		return nbe.location.loc_previous(node.parent);
	}
};


nbe.location.loc_to_point = function (editor, loc) {
	return {node : editor.state.nodes[loc.container], offset : loc.offset};
};


nbe.location.next_node = function (node) {
	var next_sibling_or_higher;

	next_sibling_or_higher = function (node) {
		var index;

		if (node.parent) {
			index = node.parent.children.indexOf(node);
			if (index < node.parent.children.length - 1) {
				return node.parent.children[index + 1];
			} else {
				return next_sibling_or_higher(node.parent);
			}
		} else {
			return null;
		}
	};

	if (node.children.length === 0) {
		return next_sibling_or_higher(node);
	} else {
		return node.children[0];
	}
};


nbe.location.next_sibling = function (node) {
	var index;

	index = node.parent.children.indexOf(node);
	if (index < node.parent.children.length - 1) {
		return node.parent.children[index + 1];
	} else {
		return null;
	}
};


nbe.location.op_remove = function (node) {
	var op, index;

	op = {domop : 'remove', id : node.id, type : node.type, val : node.val};
	index = node.parent.children.indexOf(node);
	if (index === node.parent.children.length - 1) {
		op.parent = node.parent.id;
	} else {
		op.before = node.parent.children[index + 1].id;
	}

	return op;
};


nbe.location.parent_line = function (editor, id) {
	var node;

	node = editor.state.nodes[id];
	while (node && node.type !== 'line') {
		node = node.parent;
	}

	return node;
};


nbe.location.previous_location = function (editor, loc) {
	var node_end, node, node_prev, node_parent_prev;

	node_end = function (node) {
		if (node.type === 'text') {
			return {container : node.id, offset : node.val.text.length};
		} else if (node.type === 'link') {
			return node_end(node.children[node.children.length - 1]);
		} else if (node.type === 'line') {
			if (node.children.length === 0) {
				return {container : node.id, offset : 0};
			} else {
				return node_end(node.children[node.children.length - 1]);
			}
		} else {
			return {container : node.id, offset : 1};
		}
	};

	node = editor.state.nodes[loc.container];

	if (node.type === 'text' && loc.offset > 1) {
		return {container : node.id, offset : loc.offset - 1};
	} else if (node.type === 'line') {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			return loc;
		}
	} else if (node.parent.type === 'line') {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			return {container : node.parent.id, offset : 0};
		}
	} else {
		node_prev = nbe.location.previous_sibling(node);
		if (node_prev) {
			return node_end(node_prev);
		} else {
			node_parent_prev = nbe.location.previous_sibling(node.parent);
			if (node_parent_prev) {
				return node_end(node_parent_prev);
			} else {
				return {container : node.parent.parent.id, offset : 0};
			}
		}
	}
};


nbe.location.previous_node = function (node) {
	var last_descendant, index;

	last_descendant = function (node2) {
		if (node2.children.length === 0) {
			return node2;
		} else {
			return last_descendant(node2.children[node2.children.length - 1]);
		}
	};

	if (node.parent) {
		index = node.parent.children.indexOf(node);
		if (index > 0) {
			return last_descendant(node.parent.children[index - 1]);
		} else {
			return node.parent;
		}
	} else {
		return null;
	}
};


nbe.location.previous_sibling = function (node) {
	var index;

	index = node.parent.children.indexOf(node);
	if (index > 0) {
		return node.parent.children[index - 1];
	} else {
		return null;
	}
};


nbe.location.scroll = function (editor) {
	var el_editor, el_scroll, find_pos, end, element, pos_location, pos_el_scroll, pos, scroll_top;

	el_editor = editor.el_editor;
	el_scroll = el_editor.parentNode.classList.contains('editor_container') ? el_editor.parentNode : el_editor;

	find_pos = function (el) {
		var pos;

		pos = 0;
		while (el) {
			pos = pos + el.offsetTop;
			el = el.offsetParent;
		}

		return pos;
	};

	end = editor.location.collapsed ? editor.location.start : editor.location.end;
	element = editor.dom[end.container];

	pos_location = find_pos(element);
	pos_el_scroll = find_pos(el_scroll);
	pos = pos_location - pos_el_scroll;

	if (el_scroll.scrollTop > pos) {
		el_scroll.scrollTop = pos;
	} else {
		scroll_top = pos + element.offsetHeight - el_scroll.offsetHeight;
		if (el_scroll.scrollTop < scroll_top) {
			el_scroll.scrollTop = scroll_top;
		}
	}
};


nbe.location.split_merge_point = function (point) {
	var end_of, line_child;

	if (point.node.type === 'line') {
		line_child = nbe.location.first_child(point.node);
		end_of = false;
	} else if (point.node.parent.type === 'link') {
		line_child = point.node.parent;
		end_of = !nbe.location.in_link(point);
	} else {
		line_child = point.node;
		end_of = !nbe.location.in_text(point);
	}

	if (end_of) {
		line_child = nbe.location.next_sibling(line_child);
	}

	return line_child ? line_child.id : null;
};


nbe.location.text_nodes_in_line = function (line) {
	var nodes, i, node, j;

	nodes = [];
	for (i = 0; i < line.children.length; i++) {
		node = line.children[i];
		if (node.type === 'text') {
			nodes.push(node);
		} else if (node.type === 'link') {
			for (j = 0; j < node.children.length; j++) {
				if (node.children[j].type === 'text') {
					nodes.push(node.children[j]);
				}
			}
		}
	}

	return nodes;
};


nbe.notify.inputs = function (editor) {
	var inputs, add, remove, notify, notify_type;

	inputs = {};

	add = function (type, input) {
		if (type in inputs && inputs[type].indexOf(input) === -1) {
			inputs[type].push(input);
		} else {
			inputs[type] = [input];
		}
	};

	remove = function (type, input) {
		var inputs_type, index;

		inputs_type = inputs[type];
		if (inputs_type) {
			index = inputs_type.indexOf(input);
			if (index !== -1) {
				inputs[type] = inputs_type.slice(0, index).concat(inputs_type.slice(index + 1));
			}
		}
	};

	notify_type = function (type, value) {
		var i;

		if (type === 'left_margin' && 'left_margin' in inputs) {
			value = nbe.notify.left_margin(editor);
		}

		for (i = 0; i < (type in inputs ? inputs[type].length : 0) ; i++) {
			inputs[type][i].set_value(value);
		}
	};

	notify = function () {
		var type;

		for (type in nbe.state.formats.default_values) {
			if (nbe.state.formats.default_values.hasOwnProperty(type)) {
				notify_type(type, type in editor.format ? editor.format[type] : nbe.state.formats.default_values[type]);
			}
		}
	};

	return {add : add, remove : remove, notify : notify};
};


nbe.notify.left_margin = function (editor, format) {
	var dec, inc, lines;

	dec = 'off';
	inc = 'off';

	lines = nbe.location.lines(editor);
	lines.forEach(function (line) {
		var margin;

		margin = 'left_margin' in line.val ? line.val.left_margin : 0;
		inc = margin < nbe.state.formats.left_margin.max ? 'on' : inc;
		dec = margin > 0 ? 'on' : dec;
	});

	return dec + ':' + inc;
};


nbe.ops.append = function (editor, id, items) {
	var ops, iditem, fill, i, item, new_id;

	ops = [];
	iditem = null;

	fill = function (ops, parent_id, items) {
		var i, new_id, item;

		for (i = 0; i < items.length; i++) {
			new_id = editor.new_id();
			item = items[i];
			ops.push({domop : 'append', id : new_id, parent : parent_id, type : item.type, val : item.val});
			iditem = {id : new_id, item : item};
			fill(ops, new_id, item.children);
		}
	};

	for (i = 0; i < items.length; i++) {
		item = items[i];
		new_id = editor.new_id();
		ops.push({domop : 'append', id : new_id, parent : id, type : item.type, val : item.val});
		iditem = {id : new_id, item : item};
		fill(ops, new_id, item.children);
	}

	return ops.length > 0 ? {ops : ops, loc : nbe.location.item_to_loc(iditem)} : null;
};


nbe.ops.insert_after = function (editor, id, items) {
	var node, next;

	node = editor.state.nodes[id];
	next = nbe.location.next_sibling(node);

	if (next) {
		return nbe.ops.insert_before(editor, next.id, items);
	} else {
		return nbe.ops.append(editor, node.parent, items);
	}
};


nbe.ops.insert_before = function (editor, id, items) {
	var ops, iditem, fill, i, item, new_id;

	ops = [];
	iditem = null;

	fill = function (ops, parent_id, items) {
		var i, new_id, item;

		for (i = 0; i < items.length; i++) {
			new_id = editor.new_id();
			item = items[i];
			ops.push({domop : 'append', id : new_id, parent : parent_id, type : item.type, val : item.val});
			iditem = {id : new_id, item : item};
			fill(ops, new_id, item.children);
		}
	};

	for (i = 0; i < items.length; i++) {
		item = items[i];
		new_id = editor.new_id();
		ops.push({domop : 'insert', id : new_id, before : id, type : item.type, val : item.val});
		iditem = {id : new_id, item : item};
		fill(ops, new_id, item.children);
	}

	return ops.length > 0 ? {ops : ops, loc : nbe.location.item_to_loc(iditem)} : null;
};


nbe.ops.line = function (editor, start, end, insertion) {
	var node, line_offset_start, line_child_start, line_offset_end, line_child_end, ops, loc, oploc, i;

	if (start) {
		if (start.node.type === 'line') {
			node = start.node;
			line_offset_start = 0;
			line_child_start = null;
		} else if (start.node.parent.type === 'line') {
			node = start.node.parent;
			line_offset_start = node.children.indexOf(start.node) + 1;
			line_child_start = nbe.location.in_text(start) ? start.node : null;
		} else if (start.node.parent.type === 'link') {
			node = start.node.parent.parent;
			line_offset_start = node.children.indexOf(start.node.parent) + 1;
			line_child_start = nbe.location.in_link(start) ? start.node.parent : null;
		}
	} else {
		line_offset_start = 0;
		line_child_start = null;
	}

	if (end) {
		if (end.node.type === 'line') {
			node = end.node;
			line_offset_end = 0;
			line_child_end = null;
		} else if (end.node.parent.type === 'line') {
			node = end.node.parent;
			line_offset_end = node.children.indexOf(end.node) + (nbe.location.in_text(end) ? 0 : 1);
			line_child_end = nbe.location.in_text(end) ? end.node : null;
		} else if (end.node.parent.type === 'link') {
			node = end.node.parent.parent;
			line_offset_end = node.children.indexOf(end.node.parent) + (nbe.location.in_link(end) ? 0 : 1);
			line_child_end = nbe.location.in_link(end) ? end.node.parent : null;
		}
	} else {
		line_offset_end = node.children.length;
		line_child_end = null;
	}

	ops = [];
	loc = start ? {container : start.node.id, offset : start.offset} : {container : node.id, offset : 0};

	if (line_offset_end < line_offset_start) {
		if (line_child_start.type === 'text') {
			oploc = nbe.ops.text(editor, start, end, insertion);
		} else {
			oploc = nbe.ops.link(editor, start, end, insertion);
		}
		ops = ops.concat(oploc.ops);
		if (oploc.loc) {
			loc = oploc.loc;
		}
	} else {
		if (line_child_start) {
			if (line_child_start.type === 'text') {
				oploc = nbe.ops.text(editor, start, null, null);
			} else {
				oploc = nbe.ops.link(editor, start, null, null);
			}
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}

		for (i = line_offset_start; i < line_offset_end; i++) {
			ops = ops.concat(nbe.ops.remove(node.children[i]));
		}

		oploc = null;
		if (line_child_end) {
			if (line_child_end.type === 'text') {
				oploc = nbe.ops.text(editor, null, end, insertion);
			} else {
				oploc = nbe.ops.link(editor, null, end, insertion);
			}
		} else {
			if (insertion) {
				if (line_offset_end === node.children.length) {
					oploc = nbe.ops.append(editor, node.id, insertion);
				} else if (line_offset_end === 0 && end.node.children.length > 0) {
					oploc = nbe.ops.insert_before(editor, end.node.children[0].id, insertion);
				} else {
					oploc = nbe.ops.insert_after(editor, end.node.id, insertion);
				}
			}
		}
		if (oploc) {
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	}

	return {ops : ops, loc : loc};
};


nbe.ops.link = function (editor, start, end, insertion) {
	var prune, node, link_offset_start, end_of_end, link_offset_end, ops, loc, oploc, i;

	prune = function (ins) {
		var out, i;

		out = [];
		for (i = 0; i < ins.length; i++) {
			if (ins[i].type !== 'link') {
				out.push(ins[i]);
			} else {
				out = out.concat(ins[i].children);
			}
		}

		return out;
	};

	if (insertion) {
		insertion = prune(insertion);
	}

	node = start ? start.node.parent : end.node.parent;

	link_offset_start = start ? node.children.indexOf(start.node) + 1 : 0;

	if (end) {
		end_of_end = !nbe.location.in_text(end);
		link_offset_end = node.children.indexOf(end.node) + (end_of_end ? 1 : 0);
	} else {
		end_of_end = true;
		link_offset_end = node.children.length;
	}

	ops = [];
	loc = null;

	if (link_offset_end < link_offset_start) {
		oploc = nbe.ops.text(editor, start, end, insertion);
		ops = ops.concat(oploc.ops);
		loc = oploc.loc;
	} else {
		if (nbe.location.in_text(start)) {
			oploc = nbe.ops.text(editor, start, null, null);
			ops = ops.concat(oploc.ops);
			loc = oploc.loc;
		} else {
			loc = start ? {container : start.node.id, offset : start.offset} : null;
		}

		for (i = link_offset_start; i < link_offset_end; i++) {
			ops = ops.concat(nbe.ops.remove(node.children[i]));
		}

		if (end_of_end) {
			if (insertion) {
				oploc = nbe.ops.insert_after(editor, end.node.id, insertion);
				if (oploc) {
					ops = ops.concat(oploc.ops);
					if (oploc.loc) {
						loc = oploc.loc;
					}
				}
			}
		} else {
			oploc = nbe.ops.text(editor, null, end, insertion);
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	}

	return {ops : ops, loc : loc};
};


nbe.ops.modified = function (editor, ids) {
	var nodes, traverse_remove_mutate, in_dom, removed, mutate, traverse_insert, traverse_line, find_loc, ops, i, loc, oploc;

	nodes = editor.state.nodes;

	traverse_remove_mutate = function (id, ops) {
		var node, i, child;

		node = nodes[id];
		for (i = 0; i < node.children.length; i++) {
			child = node.children[i];
			if (removed(child.id)) {
				ops = ops.concat(nbe.ops.remove(child));
			} else if (child.type === 'text') {
				ops = mutate(child, ops);
			} else if (child.type === 'link') {
				ops = traverse_remove_mutate(child.id, ops);
			}
		}

		return ops;
	};

	in_dom = function (id) {
		var el;

		el = editor.dom[id];
		while (el !== null && !(el.getAttribute && el.getAttribute('data-id') === 'root')) {
			el = el.parentNode;
		}

		return el !== null;
	};

	removed = function (id) {
		if (!in_dom(id)) {
			return true;
		}

		if (nodes[id].type === 'text') {
			return editor.dom[id].textContent === '';
		} else {
			return false;
		}
	};

	mutate = function (node, ops) {
		var el, op;

		el = editor.dom[node.id];
		if (node.val.text !== el.textContent) {
			op = {domop : 'mutate', id : node.id, before : node.val, after : nbe.lib.clone(node.val)};
			op.after.text = el.textContent;
			ops.push(op);
		}

		return ops;
	};

	traverse_insert = function (id, ops) {
		var el, next_id, previous_id, new_val, i, child, text, val, new_id, op, insert_id;

		if (removed(id)) {
			return ops;
		}

		el = editor.dom[id];

		next_id = function (el, index) {
			var el2;

			if (el.childNodes.length === index) {
				return null;
			} else {
				el2 = el.childNodes[index];
				if (el2.getAttribute && el2.getAttribute('data-id')) {
					id = el2.getAttribute('data-id');
					if (nodes[id].type === 'text' && el2.textContent === '') {
						return next_id(el, index + 1);
					} else {
						return id;
					}
				} else {
					return next_id(el, index + 1);
				}
			}
		};

		previous_id = function (el, index) {
			var el2;

			if (index === -1) {
				return null;
			} else {
				el2 = el.childNodes[index];
				if (el2.getAttribute && el2.getAttribute('data-id')) {
					return el2.getAttribute('data-id');
				} else {
					return previous_id(el, index - 1);
				}
			}
		};

		new_val = function (el, index) {
			var val, prev, node, next;

			val = null;
			prev = previous_id(el, index);
			if (prev) {
				node = nodes[prev];
				if (node.type === 'text') {
					val = nbe.lib.clone(node.val);
				}
			}
			if (val === null) {
				next = next_id(el, index);
				if (next) {
					node = nodes[next];
					if (node.type === 'text') {
						val = nbe.lib.clone(node.val);
					}
				}
			}

			return val === null ? {} : val;
		};

		for (i = 0; i < el.childNodes.length; i++) {
			child = el.childNodes[i];
			if (!(child.classList && child.classList.contains('nbe'))) {
				text = child.textContent;
				if (text !== '') {
					val = new_val(el, i);
					val.text = text;
					new_id = editor.new_id();
					op = {id : new_id, type : 'text', val : val};
					insert_id = next_id(el, i);
					if (insert_id) {
						op.domop = 'insert';
						op.before = insert_id;
					} else {
						op.domop = 'append';
						op.parent = id;
					}
					ops.push(op);
				}
			}
		}

		return ops;
	};

	traverse_line = function (id, ops) {
		var node, i, child;

		node = nodes[id];

		ops = traverse_remove_mutate(id, ops);
		ops = traverse_insert(id, ops);
		for (i = 0; i < node.children.length; i++) {
			child = node.children[i];
			if (child.type === 'link') {
				ops = traverse_insert(child.id, ops);
			}
		}

		return ops;
	};

	find_loc = function () {
		var loc, node, el;

		loc = null;
		if (editor.location) {
			loc = {container : editor.location.start.container, offset : editor.location.start.offset};
			if (!removed(loc.container)) {
				node = nodes[loc.container];
				if (node.type === 'text') {
					el = editor.dom[loc.container];
					loc.offset = Math.min(loc.offset + 1, el.textContent.length);
				}
			} else {
				loc = null;
			}
		}

		return loc;
	};

	ops = [];
	for (i = 0; i < ids.length; i++) {
		ops = traverse_line(ids[i], ops);
	}
	loc = find_loc();

	if (loc) {
		oploc = {ops : ops, loc : loc};
	} else {
		oploc = {ops : ops, loc_after : null};
	}

	return oploc;
};


nbe.ops.remove = function (node) {
	var before_parent, remove;

	before_parent = function (node, op) {
		var index;

		index = node.parent.children.indexOf(node);
		if (index === node.parent.children.length - 1) {
			op.parent = node.parent.id;
		} else {
			op.before = node.parent.children[index + 1].id;
		}
		return op;
	};

	remove = function (node, ops) {
		var i;

		for (i = 0; i < node.children.length; i++) {
			remove(node.children[i], ops);
		}
		ops.push(before_parent(node, {domop : 'remove', id : node.id, type : node.type, val : node.val}));

		return ops;
	};

	return remove(node, []);
};


nbe.ops.root = function (editor, start, end, insertion) {
	var line_start, line_end, root, root_offset_start, root_offset_end, ops, loc, incorp, conc, new_line_id, parentval, childval, split_point, i, items, merge_point;

	line_start = nbe.location.line(start.node);
	line_end = nbe.location.line(end.node);

	root = line_start.parent;

	root_offset_start = root.children.indexOf(line_start);
	root_offset_end = root.children.indexOf(line_end);

	ops = [];
	loc = null;

	incorp = function (oploc) {
		if (oploc) {
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	};

	conc = function (oploc) {
		if (oploc) {
			ops = ops.concat(oploc.ops);
		}
	};

	if (root_offset_start === root_offset_end) {
		if (insertion === null) {
			incorp(nbe.ops.line(editor, start, end, null));
		} else if (insertion.length === 1) {
			incorp(nbe.ops.line(editor, start, end, insertion[0].children));
		} else {
			conc(nbe.ops.line(editor, start, end, insertion[0].children));
			new_line_id = editor.new_id();
			split_point = nbe.location.split_merge_point(end);
			parentval = nbe.lib.clone(line_start.val);
			childval = nbe.state.copy_line_format(editor.format, {});
			if (start.node === line_start) {
				delete parentval.heading;
			} else {
				delete childval.heading;
			}
			ops.push({domop : 'split', parent : line_start.id, child : new_line_id, point : split_point, parentval : parentval, childval : childval});
			loc = {container : new_line_id, offset : 0};
			if (split_point) {
				incorp(nbe.ops.insert_before(editor, split_point, insertion[insertion.length - 1].children));
			} else {
				incorp(nbe.ops.append(editor, new_line_id, insertion[insertion.length - 1].children));
			}
			conc(nbe.ops.insert_before(editor, new_line_id, insertion.slice(1, insertion.length - 1)));
		}
	} else {
		for (i = root_offset_start + 1; i < root_offset_end; i++) {
			ops = ops.concat(nbe.ops.remove(root.children[i]));
		}

		if (insertion === null) {
			incorp(nbe.ops.line(editor, start, null, null));
			conc(nbe.ops.line(editor, null, end, null));
			ops.push({domop : 'merge', parent : line_start.id, child : line_end.id, point : nbe.location.split_merge_point(end), parentval : line_start.val, childval : line_end.val});
		} else if (insertion.length === 1) {
			incorp(nbe.ops.line(editor, start, null, null));
			items = insertion[0].children;
			incorp(nbe.ops.line(editor, null, end, items));
			merge_point = items.length === 0 ? nbe.location.split_merge_point(end) : items[0].id;
			ops.push({domop : 'merge', parent : line_start.id, child : line_end.id, point : merge_point, parentval : line_start.val, childval : line_end.val});
		} else {
			conc(nbe.ops.line(editor, start, null, insertion[0].children));
			conc(nbe.ops.insert_before(editor, line_end.id, insertion.slice(1, insertion.length - 1)));
			incorp(nbe.ops.line(editor, null, end, insertion[insertion.length - 1].children));
		}
	}

	return {ops : ops, loc : loc};
};


nbe.ops.text = function (editor, start, end, insertion) {
	var node, op_mutate, ops, loc, op_start, oploc;

	node = start ? start.node : end.node;

	op_mutate = {domop : 'mutate', id : node.id, before : node.val, after : nbe.lib.clone(node.val)};
	ops = [op_mutate];
	loc = null;

	if (insertion) {
		op_mutate.after.text = node.val.text.slice(end.offset);
		if (start) {
			op_start = {domop : 'insert', id : editor.new_id(), before : node.id, type : 'text', val : nbe.lib.clone(node.val)};
			op_start.val.text = node.val.text.slice(0, start.offset);
			ops.push(op_start);
			loc = {container : op_start.id, offset : start.offset};
		}
		oploc = nbe.ops.insert_before(editor, node.id, insertion);
		if (oploc) {
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	} else {
		op_mutate.after.text = (start ?  node.val.text.slice(0, start.offset) : '') + (end ?  node.val.text.slice(end.offset) : '');
		loc = start ? {container : node.id, offset : start.offset} : null;
	}

	return {ops : ops, loc : loc};
};


nbe.paste.br = function (state, node) {
	var line;

	line = {type : 'line', val : {}, children : []};
	state.root.push(line);
	state.line = line;

	return state;
};


nbe.paste.div = function (state, node) {
	var format, format_div, add_class, left_margin, val, line;

	format = state.format;

	format_div = nbe.lib.clone(format);

	add_class = function (key, names) {
		var i;

		for (i = 0; i < names.length; i++) {
			if (node.classList.contains(names[i])) {
				format_div[key] = names[i];
				return null;
			}
		}
	};

	add_class('text_align', ['center', 'right', 'justify']);
	add_class('heading', ['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6']);
	add_class('list', ['disc', 'lower-alpha', 'lower-roman', 'square', 'upper-alpha', 'upper-roman', 'ordered']);
	add_class('line_spacing', ['line_spacing_05', 'line_spacing_06', 'line_spacing_07', 'line_spacing_08', 'line_spacing_09', 'line_spacing_10', 'line_spacing_11', 'line_spacing_12', 'line_spacing_13', 'line_spacing_14', 'line_spacing_15', 'line_spacing_16', 'line_spacing_17', 'line_spacing_18', 'line_spacing_19', 'line_spacing_20']);

	if (node.style.marginLeft) {
		left_margin = Number(node.style.marginLeft.slice(0, node.style.marginLeft.length - 2));
		if (left_margin >= 0) {
			format_div.left_margin = left_margin;
		}
	}

	if (node.style.fontSize) {
		format_div.font_size = node.style.fontSize;
	}

	switch (node.align) {
	case 'LEFT':
	case 'left':
		delete format_div.text_align;
		break;
	case 'RIGHT':
	case 'right':
		format_div.text_align = 'right';
		break;
	case 'CENTER':
	case 'center':
		format_div.text_align = 'center';
		break;
	case 'JUSTIFY':
	case 'justify':
		format_div.text_align = 'justify';
		break;
	}

	switch (node.nodeName) {
	case 'H1':
	case 'h1':
		format_div.heading = 'heading1';
		break;
	case 'H2':
	case 'h2':
		format_div.heading = 'heading2';
		break;
	case 'H3':
	case 'h3':
		format_div.heading = 'heading3';
		break;
	case 'H4':
	case 'h4':
		format_div.heading = 'heading4';
		break;
	case 'H5':
	case 'h5':
		format_div.heading = 'heading5';
		break;
	case 'H6':
	case 'h6':
		format_div.heading = 'heading6';
		break;
	}

	val = nbe.state.copy_line_format(format_div, {});

	if (state.line.children.length === 0) {
		state.line.val = val;
	} else {
		line = {type : 'line', val : val, children : []};
		state.root.push(line);
		state.line = line;
	}

	state.format = format_div;

	state = nbe.paste.traverse(state, node);

	state.format = format;

	return state;
};


nbe.paste.img = function (state, node) {
	var val, add_props, item;

	val = {};

	add_props = function (names) {
		var i;

		for (i = 0; i < names.length; i++) {
			if (node[names[i]]) {
				val[names[i]] = node[names[i]];
			}
		}
	};

	add_props(['src', 'width', 'height', 'title']);

	item = {type : 'img', val : val, children : []};

	if (state.link) {
		state.link.children.push(item);
	} else {
		state.line.children.push(item);
	}

	return state;
};


nbe.paste.insertion = function (container) {
	var line, state, insertion;

	line = {type : 'line', val : {}, children : []};
	state = {root : [line], line : line, link : null, format : {}};

	state = nbe.paste.traverse(state, container);

	insertion = [];

	if (Object.keys(state.root[0].val).length !== 0) {
		insertion.push({type : 'line', val : {}, children : []});
	}

	insertion = insertion.concat(state.root);

	if (Object.keys(state.root[state.root.length - 1].val).length !== 0) {
		insertion.push({type : 'line', val : {}, children : []});
	}

	return insertion;
};


nbe.paste.link = function (state, node) {
	var val, item;

	val = {href : node.href};
	item = {type : 'link', val : val, children : []};

	state.line.children.push(item);

	state.link = item;

	state = nbe.paste.traverse(state, node);

	state.link = null;

	return state;
};


nbe.paste.remaining = function (state, node) {
	var format, format_remaining;

	format = state.format;

	format_remaining = nbe.lib.clone(format);

	switch (node.nodeName) {
	case 'STRONG':
	case 'strong':
	case 'B':
	case 'b':
		format_remaining.bold = 'on';
		break;
	case 'I':
	case 'i':
		format_remaining.italic = 'on';
		break;
	case 'U':
	case 'u':
		format_remaining.underline = 'on';
		break;
	}

	state.format = format_remaining;

	state = nbe.paste.traverse(state, node);

	state.format = format;

	return state;
};


nbe.paste.span = function (state, node) {
	var format, format_span, add_classes, verify_color, add_styles, font_family;

	format = state.format;

	format_span = nbe.lib.clone(format);

	add_classes = function (names) {
		var i;

		for (i = 0; i < names.length; i++) {
			if (node.classList.contains(names[i])) {
				format_span[names[i]] = 'on';
			}
		}
	};

	add_classes(['bold', 'italic', 'underline', 'strikethrough']);

	verify_color = function (col) {
		return col.slice(0, 4) === 'rgb(';
	};

	if (node.style.color && verify_color(node.style.color)) {
		format_span.color = node.style.color;
	}

	if (node.style.backgroundColor && verify_color(node.style.backgroundColor)) {
		format_span.background_color = node.style.backgroundColor;
	}

	add_styles = function (names) {
		var i;

		for (i = 0; i < names.length; i++) {
			if (node.style[names[i].style]) {
				format_span[names[i].key] = node.style[names[i].style];
			}
		}
	};

	add_styles([
		{key : 'vertical_align', style : 'verticalAlign'}
	]);

	if (format_span.vertical_align) {
		if (node.style.fontSize.slice(-2) === 'px') {
			format_span.font_size = (1.25 * Number(node.style.fontSize.slice(0, node.style.fontSize.length - 2))) + 'px';
		}
	} else {
		add_styles([
			{key : 'font_size', style : 'fontSize'}
		]);
	}

	if (node.style.fontFamily) {
		font_family = node.style.fontFamily.toLowerCase();
		if (nbe.state.formats.font_family.indexOf(font_family) !== -1) {
			format_span.font_family = font_family;
		}
	}

	state.format = format_span;

	state = nbe.paste.traverse(state, node);

	state.format = format;

	return state;
};


nbe.paste.text = function (state, node) {
	var val, item;

	val = nbe.state.copy_text_format(state.format, {});
	val.text = node.textContent;

	item = {type : 'text', val : val, children : []};

	if (state.link) {
		state.link.children.push(item);
	} else {
		state.line.children.push(item);
	}

	return state;
};


nbe.paste.traverse = function (state, node) {
	var i, child;

	for (i = 0; i < node.childNodes.length; i++) {
		child = node.childNodes[i];
		switch (child.nodeName) {
		case 'DIV':
		case 'div':
		case 'P':
		case 'p':
		case 'H1':
		case 'h1':
		case 'H2':
		case 'h2':
		case 'H3':
		case 'h3':
		case 'H4':
		case 'h4':
		case 'H5':
		case 'h5':
		case 'H6':
		case 'h6':
			state = nbe.paste.div(state, child);
			break;
		case 'SPAN':
		case 'span':
			state = nbe.paste.span(state, child);
			break;
		case 'A':
		case 'a':
			state = nbe.paste.link(state, child);
			break;
		case 'IMG':
		case 'img':
			state = nbe.paste.img(state, child);
			break;
		case '#text':
		case '#TEXT':
			state = nbe.paste.text(state, child);
			break;
		case 'BR':
		case 'br':
			state = nbe.paste.br(state, child);
			break;
		case 'STYLE':
		case 'style':
			break;
		default:
			state = nbe.paste.remaining(state, child);
			break;
		}
	}

	return state;
};


nbe.publish.create = function (editor_id, doc) {
	var time, init, msg, publish, add_external_ops, set_time, get_time;
 
	time = null;

	init = function (state) {
		set_time(state.time);
	};

	msg = document.createElement('div');

	publish = function (callback) {
		var html, body;
		
		html = nbe.doc.html(nbe.dynamic.doc);
			
		body = {
			type : 'publish',
			id : doc.ids.id,
			write : doc.ids.write,
			html : html
		};
			
		nbe.lib.xhr('POST', nbe.config.publish_url, {}, JSON.stringify(body), 0, function (response) {
			var op;
			
			response = JSON.parse(response);
			if (response === 'published') {
				op = {
					editor_class : 'publish',
					before : time,
					after : Date.now()
				};
				set_time(op.after);
				doc.add_ops(editor_id, [op]);
				callback(response);
			}
		}, function () {}, function () {
			callback(null);
		});
	};

	add_external_ops = function (ops, _set_location) {
		ops.forEach(function (op) {
			if ('editor_class' in op && op.editor_class === 'publish') {
				set_time(op.after);
			}
		});
	};

	set_time = function (new_time) {
		time = new_time;
		msg.textContent = time === null ? 'Not published' : 'Published at ' + new Date(time);
	};

	get_time = function () {
		return time;
	};

	return {id : editor_id, init : init, msg : msg, publish : publish, add_external_ops : add_external_ops, get_time : get_time};
};


nbe.publish.state_copy = function (state) {
	return {time: state.time};
};


nbe.publish.state_init = function () {
	return {time : null};
};


nbe.publish.state_update = function (state, ops) {
	if (ops.length > 0) {
		state.time = ops[ops.length - 1].after; 
	}
};


nbe.site.display_editor = function (doc) {
	var editable, editor, el_editor_container, title_editor;

	editable = doc.ids.write !== null;
	document.getElementById('frontpage').style.display = 'none';
	if (editable) {
		document.body.className = 'editor';
	} else {
		document.getElementById('home').style.display = 'none';
		document.getElementById('feedback').style.display = 'none';
		document.getElementById('faq').style.display = 'none';
		document.body.className = 'read_editor';
	}

	editor = doc.editors.add('editor', 'text', {editable : editable});
	el_editor_container = kite.browser.dom.eac('div', document.body, 'editor_container');

	if (editable) {
		nbe.site.panel(document.getElementById('panel'), editor);
	}

	title_editor = doc.editors.add('title_editor', 'title', {editable : editable, html_title : true});
	if (editable) {
		kite.browser.dom.eac('div', el_editor_container, 'wu-title-container').appendChild(title_editor.el_editor);
	}
	nbe.dynamic.get_title = title_editor.get_value;

	nbe.dynamic.publish = doc.editors.add('publish_editor', 'publish', {});

	el_editor_container.appendChild(editor.el_editor);

	if (doc.ids.prefix === 'scroller' && doc.ids.write === null) {
		nbe.site.scroller(editor);
	}
};


nbe.site.doc_noexist = function (doc) {
	var el_message;

	el_message = kite.browser.dom.eac('div', document.body, 'full_screen_message');
	kite.browser.dom.ea('div', el_message).textContent = 'The document is not known to the server.';
};


/*
	el_text, el_title, el_panel : elements for insertion of text, title and panel. If they are null, there is no insertion.
	ids = {id, read, write}, if ids.write is null, the editor is read only, otherwise writeable.
	new_doc : is the document new
	ws_url : the rul of the web socket to the server.
	local_storage : boolean designating whether local storage is to be used.
	html_title : whtehr the title should be used as title of the full html document.
	callback : get key value pairs.
*/

nbe.site.embed = function (el_text, el_title, el_panel, ids, new_doc, ws_url, local_storage, html_title, callback) {
	var editable, dom_id_to_el, callback_status, doc;

	editable = !(ids.write === null || ids.write === '');

	dom_id_to_el = function (id) {
		return typeof(id) === 'string' ? document.getElementById(id) : id;
	};

	callback_status = function (key, value) {
		var editor, title_editor;

		callback(key, value);
		if (key === 'doc' && value === 'exist') {
			doc.comm.notify();
			editor = doc.editors.add('editor', 'text', {editable : editable});
			if (el_text) {
				dom_id_to_el(el_text).appendChild(editor.el_editor);
			}
			if (el_title) {
				title_editor = doc.editors.add('title_editor', 'title', {editable : editable, html_title : html_title});
				dom_id_to_el(el_title).appendChild(title_editor.el_editor);
			}
			if (el_panel) {
				nbe.site.panel(dom_id_to_el(el_panel), editor);
			}
		}
	};

	ids.new_doc = new_doc;
	doc = nbe.doc.create(ids, local_storage, ws_url, callback_status);

	if (doc.server_status !== 'unknown') {
		callback_status('doc', 'exist');
	}
};


/*
	Helper function to call embed.
	It is used for write documents.

	el : an element where panel, title and text is inserted. el can be an id of an element.
	ids : an object with id, the read password, and write password.
*/

nbe.site.embed_new = function (el) {
	var ws_url, el_panel, el_title, el_text, ids;

	el = typeof(el) === 'string' ? document.getElementById(el) : el;

	ws_url = 'ws://www.writeurl.com:8043';

	el_panel = document.createElement('div');
	el.appendChild(el_panel);
	el_title = document.createElement('div');
	el.appendChild(el_title);
	el_text = document.createElement('div');
	el.appendChild(el_text);

	ids = {
		id : nbe.lib.rnd_string(20),
		read : nbe.lib.rnd_string(20),
		write : nbe.lib.rnd_string(20)
	};

	nbe.site.embed(el_text, el_title, el_panel, ids, true, ws_url, true, false, function () {});

	return ids;
};


/*
	Helper function to call embed.
	It is used for read only documents.

	el : an element where title and text is inserted. el can be an id of an element.
	ids : an object with id and the read password.
*/

nbe.site.embed_read = function (el, ids) {
	var ws_url, el_title, el_text;

	el = typeof(el) === 'string' ? document.getElementById(el) : el;

	ws_url = 'ws://www.writeurl.com:8043';

	ids.write = null;

	el_title = document.createElement('div');
	el.appendChild(el_title);
	el_text = document.createElement('div');
	el.appendChild(el_text);

	nbe.site.embed(el_text, el_title, null, ids, false, ws_url, true, false, function () {});
};


/*
	Helper function to call embed.
	It is used for write documents.

	el : an element where panel, title and text is inserted. el can be an id of an element.
	ids : an object with id, the read password, and write password.
*/

nbe.site.embed_write = function (el, ids) {
	var ws_url, el_panel, el_title, el_text;

	el = typeof(el) === 'string' ? document.getElementById(el) : el;

	ws_url = 'ws://www.writeurl.com:8043';

	el_panel = document.createElement('div');
	el.appendChild(el_panel);
	el_title = document.createElement('div');
	el.appendChild(el_title);
	el_text = document.createElement('div');
	el.appendChild(el_text);

	console.log(ids);
	nbe.site.embed(el_text, el_title, el_panel, ids, false, ws_url, true, false, function () {});
};


nbe.site.loading = function () {
	var el_message, status, on, off;

	el_message = document.createElement('div');
	el_message.className = 'full_screen_message';
	kite.browser.dom.ea('div', el_message).textContent = 'We are trying to connect to the server.';

	status = 'init';

	on = function () {
		setTimeout(function () {
			if (status === 'init') {
				status = 'on';
				document.body.appendChild(el_message);
			}
		}, 200);
	};

	off = function () {
		if (status === 'on') {
			document.body.removeChild(el_message);
		}
		status = 'off';
	};

	return {on : on, off : off};
};


nbe.site.panel = function (el_panel_container, editor) {
	var defval, left_margin_initial_value, is_visible, buttons, el_panel, toggle_panel, el_toggle_panel, el_font, font_family_spec, el_format, el_color, el_paragraph, el_insert, key, button_undo, el_hide_format_panel;

	defval = nbe.state.formats.default_values;
	left_margin_initial_value = 'off:on';
	is_visible = false;

	buttons = {};

	el_panel = kite.browser.dom.eac('div', el_panel_container, 'wu-format-panel');

	toggle_panel = function () {
		if (is_visible) {
			el_panel.className = 'wu-format-panel';
			el_toggle_panel.textContent = 'More';
		} else {
			el_panel.className = 'wu-format-panel open';
			el_toggle_panel.textContent = 'Less';
		}
		is_visible = !is_visible;
	};

	el_toggle_panel = kite.browser.dom.eac('button', el_panel_container, 'wu-toggle circle_button');
	el_toggle_panel.textContent = 'More';
	el_toggle_panel.addEventListener('click', toggle_panel, false);

	el_panel.addEventListener('click', function (e) {
		if (e.target.classList.contains('wu-icon') || e.target.parentNode.classList.contains('drop_down_menu') || e.target.parentNode.parentNode.classList.contains('drop_down_menu')) {
			toggle_panel();
		}
	}, false);

	el_font = kite.browser.dom.ea('div', el_panel);

	buttons.heading = nbe.inputs.heading(editor.trigger, 'Heading', {none : 'No heading (-)', heading1 : '<span class="line heading1">Heading 1 (H1)</span>', heading2 : '<span class="line heading2">Heading 2 (H2)</span>', heading3 : '<span class="line heading3">Heading 3 (H3)</span>', heading4 : '<span class="line heading4">Heading 4 (H4)</span>', heading5 : '<span class="line heading5">Heading 5 (H5)</span>', heading6 : '<span class="line heading6">Heading 6 (H6)</span>'}, {none : '-', heading1 : 'H1', heading2 : 'H2', heading3 : 'H3', heading4 : 'H4', heading5 : 'H5', heading6 : 'H6'}, el_font, defval.heading);

	font_family_spec = {};
	nbe.state.formats.font_family.forEach(function (family) {
		var family_upper;

		family_upper = family[0].toUpperCase() + family.slice(1);
		font_family_spec[family] = '<span style="font-family : ' + family_upper + ';">' + family_upper + '</span>';
	});

	buttons.font_family = nbe.inputs.font_family(editor.trigger, 'Font', font_family_spec, el_font, defval.font_family);

	buttons.font_size = nbe.inputs.font_size(editor.trigger, 'Font size', {'10px' : '10', '11px' : '11', '12px' : '12', '13px' : '13', '14px' : '14', '16px' : '16', '18px' : '18', '20px' : '20', '22px' : '22', '24px' : '24', '28px' : '28', '32px' : '32', '36px' : '36', '48px' : '48', '72px' : '72'}, el_font, defval.font_size);

	el_format = kite.browser.dom.ea('div', el_panel);
	buttons.bold = nbe.inputs.bold(editor.trigger, 'Bold', el_format, defval.bold);
	buttons.italic = nbe.inputs.italic(editor.trigger, 'Italic', el_format, defval.italic);
	buttons.underline = nbe.inputs.underline(editor.trigger, 'Underline', el_format, defval.underline);
	buttons.strikethrough = nbe.inputs.strikethrough(editor.trigger, 'Strikethrough', el_format, defval.strikethrough);

	el_color = kite.browser.dom.ea('div', el_panel);
	buttons.color = nbe.inputs.color(editor.trigger, 'Text color', el_color, defval.color);
	buttons.background_color = nbe.inputs.background_color(editor.trigger, 'Line color', el_color, defval.background_color);

	buttons.vertical_align = nbe.inputs.vertical_align(editor.trigger, kite.browser.dom.ea('div', el_panel), defval.vertical_align);

	buttons.left_margin = nbe.inputs.left_margin(editor.trigger, kite.browser.dom.ea('div', el_panel), left_margin_initial_value);

	el_paragraph = kite.browser.dom.ea('div', el_panel);
	buttons.text_align = nbe.inputs.text_align(editor.trigger, 'Text align', {left : 'Left', center : 'Center', right : 'Right', justify : 'Justify'}, el_paragraph, defval.text_align);
	buttons.line_spacing = nbe.inputs.line_spacing(editor.trigger, 'Line spacing', {'line_spacing_05' : '0.5', 'line_spacing_06' : '0.6', 'line_spacing_07' : '0.7', 'line_spacing_08' : '0.8', 'line_spacing_09' : '0.9', 'line_spacing_10' : '1', 'line_spacing_11' : '1.1', 'line_spacing_12' : '1.2', 'line_spacing_13' : '1.3', 'line_spacing_14' : '1.4', 'line_spacing_15' : '1.5', 'line_spacing_16' : '1.6 (default)', 'line_spacing_17' : '1.7', 'line_spacing_18' : '1.8', 'line_spacing_19' : '1.9', 'line_spacing_20' : '2'}, el_paragraph, defval.line_spacing);

	buttons.list = nbe.inputs.list(editor.trigger, 'List', {none : 'none', disc : '•', 'square' : '▀', ordered : '1. 2. 3.', 'lower-alpha' : 'a. b. c.', 'upper-alpha' : 'A. B. C.', 'lower-roman' : 'i. ii. iii.', 'upper-roman' : 'I. II. III.'}, kite.browser.dom.ea('div', el_panel), defval.list);

	el_insert = kite.browser.dom.ea('div', el_panel);
	buttons.special_characters = nbe.inputs.special_characters(editor.trigger, 'Special characters', el_insert, null);
	buttons.insert_link = nbe.inputs.insert_link(editor.trigger, 'Insert link', el_insert);
	buttons.edit_link = nbe.inputs.edit_link(editor.trigger, 'Edit link', el_insert, null);
	buttons.insert_img = nbe.inputs.insert_image(editor.trigger, 'Insert image', el_insert);
	buttons.edit_img = nbe.inputs.edit_image(editor.trigger, 'Edit image', el_insert, null);

	for (key in buttons) {
		if (buttons.hasOwnProperty(key)) {
			editor.inputs.add(key, buttons[key]);
		}
	}

	button_undo = nbe.inputs.undo(editor.trigger, kite.browser.dom.ea('div', el_panel));
	editor.undo.add_button(button_undo);

	el_hide_format_panel = kite.browser.dom.eac('button', el_panel, 'hide circle_button');
	el_hide_format_panel.textContent = 'Close';
	el_hide_format_panel.addEventListener('click', toggle_panel, false);
};


nbe.site.scroller = function (editor) {
	var el_editor, el_scroll;

	el_editor = editor.el_editor;
	el_scroll = el_editor.parentNode.classList.contains('editor_container') ? el_editor.parentNode : el_editor;

	setInterval(function () {
		el_scroll.scrollTop = el_scroll.scrollHeight;
	}, 200);
};


nbe.site.status_panel = function (ids) {
	var element, share, el_share_button, display_export, el_export_button, network, saved, set_status, display;

	element = kite.browser.dom.ec('div', 'status_panel');

	share = nbe.site.display_share(ids);

	el_share_button = kite.browser.dom.eac('button', element, 'circle_button');
	el_share_button.textContent = 'Share';
	el_share_button.addEventListener('click', function (e) {
		share.display(ids);
	}, false);

	display_export = nbe.site.display_export(ids);

	el_export_button = nbe.browser.icon.exporticon(element);
	el_export_button.addEventListener('click', function (e) {
		display_export.display();
	}, false);

	network = nbe.browser.icon.network(element);
	saved = nbe.browser.icon.saved(element);

	set_status = function (key, value) {
		if (key === 'network') {
			if (value === 'connected') {
				//el_network.title = 'You are online';
				network.on();
			} else {
				//el_network.title = 'You are offline';
				network.off();
			}
		} else if (key === 'nunsaved') {
			if (value > 0) {
				//el_saved.title = 'You have unsaved changes';
				saved.off();
			} else {
				//el_saved.title = 'You are offline';
				saved.on();
			}
		}
	};

	display = function (el_panel_container) {
		el_panel_container.appendChild(element);
	};

	return {set_status : set_status, display : display};
};


nbe.site.supported_doc = function () {
	var el_message = kite.browser.dom.eac('div', document.body, 'full_screen_message');
	kite.browser.dom.ea('div', el_message).innerHTML = 'Your browser is not supported.';
};


nbe.site.wrong_password = function () {
	var el_message;

	el_message = kite.browser.dom.eac('div', document.body, 'full_screen_message');
	kite.browser.dom.ea('div', el_message).textContent = 'It seems like you\'re not using a proper URL for this document, please check your link.';
};


nbe.state.clean = function (editor) {
	nbe.state.init(editor, editor.state);
	nbe.location.set(editor, editor.location);
};


nbe.state.cmp_text_format = function (format1, format2) {
	var cmp_type, i;

	cmp_type = function (type) {
		if (type in format1 && type in format2) {
			return format1[type] === format2[type];
		} else if (type in format1) {
			return nbe.state.formats.default_values[type] === format1[type];
		} else if (type in format2) {
			return nbe.state.formats.default_values[type] === format2[type];
		} else {
			return true;
		}
	};

	for (i = 0; i < nbe.state.formats.text.length; i++) {
		if (!cmp_type(nbe.state.formats.text[i])) {
			return false;
		}
	}

	return true;
};


nbe.state.cmp_value_format = function (type, value, format) {
	if (nbe.state.formats.default_values[type] === value) {
		return !(type in format);
	} else {
		return (type in format) && format[type] === value;
	}
};


nbe.state.copy_line_format = function (src, dst) {
	var keys, i, key;

	keys = nbe.state.formats.text.concat(nbe.state.formats.line);

	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		if (key in src) {
			dst[key] = src[key];
		} else {
			delete dst[key];
		}
	}

	return dst;
};


nbe.state.copy_text_format = function (src, dst) {
	var keys, i, key;

	keys = nbe.state.formats.text;

	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		if (key in src) {
			dst[key] = src[key];
		} else {
			delete dst[key];
		}
	}

	return dst;
};


nbe.state.deserialize = function (str) {
	var new_nodes, nodes, id, node, new_node, i;

	new_nodes = {};
	nodes = JSON.parse(str).nodes;
	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_nodes[id] = {type : node.type, id : node.id, val : node.val, children : []};
		}
	}

	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_node = new_nodes[id];
			if (node.parent) {
				new_node.parent = new_nodes[node.parent];
			}
			for (i = 0; i < node.children.length; i++) {
				new_node.children[i] = new_nodes[node.children[i]];
			}
		}
	}

	return {nodes : new_nodes};
};


nbe.state.element = function (id, type, val) {
	var name, el;

	name = {
		root : 'div',
		line : 'div',
		text : 'span',
		img : 'img',
		link : 'a'
	}[type];

	el = document.createElement(name);
	el.setAttribute('data-id', id);
	el.classList.add('wu-' + type);

	if (type === 'line') {
		el.appendChild(document.createElement('br'));
	}

	nbe.state.mutate_element(el, type, val);

	return el;
};


nbe.state.formats = {

	text : ['bold', 'italic', 'underline', 'strikethrough', 'color', 'background_color', 'font_family', 'font_size', 'vertical_align'],

	line : ['heading', 'text_align', 'left_margin', 'line_spacing', 'list'],

	default_values : {
		bold : 'off',				// text
		italic : 'off',				// text
		underline : 'off',			// text
		strikethrough : 'off',			// text
		color : 'rgb(0, 0, 0)',			// text
		background_color : 'transparent',	// text
		font_family : 'arial',			// text
		font_size : '16px',			// text
		vertical_align : 'baseline',		// text
		heading : 'none',			// line
		text_align : 'left',			// line
		left_margin : 0,			// line
		line_spacing : 'line_spacing_16',	// line
		list : 'none',				// line
		edit_img : null,			// image button
		edit_link : null			// link button
	},

	left_margin : {
		step : 20,
		max : 500
	},

	font_family : ['arial', 'courier', 'helvetica', 'times', 'verdana']
};


nbe.state.init = function (editor, state) {
	var dom, insert_child_nodes;

	editor.state = state;
	editor.dom = dom = {};

	dom.root = nbe.state.element('root', 'root', state.nodes.root.val);

	insert_child_nodes = function (par, type, nodes) {
		var i, node;

		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];
			dom[node.id] = nbe.state.element(node.id, node.type, node.val);
			if (type === 'line') {
				par.insertBefore(dom[node.id], par.lastChild);
			} else {
				par.appendChild(dom[node.id]);
			}
			insert_child_nodes(dom[node.id], node.type, node.children);
		}
	};

	insert_child_nodes(dom.root, 'root', state.nodes.root.children);

	nbe.state.reset_counter(editor);

	editor.mutation.disconnect();

	while (editor.el_editor.firstChild) {
		editor.el_editor.removeChild(editor.el_editor.firstChild);
	}
	editor.el_editor.appendChild(dom.root);

	editor.mutation.observe();

	return editor;
};


nbe.state.initial = function () {
	return JSON.stringify({
		nodes : {
			root : {
				type : 'root',
				id : 'root',
				parent : null,
				children : ['line'],
				val : {}
			},
			line : {
				type : 'line',
				id : 'line',
				parent : 'root',
				children : [],
				val : {}
			}
		}
	});
};


nbe.state.invert_oploc = function (oploc) {
	var oploc_inv;

	oploc_inv = {
		ops : nbe.state.invert_ops(oploc.ops),
		loc_before : oploc.loc_after,
		loc_after : oploc.loc_before
	};

	return oploc_inv;
};


nbe.state.invert_ops = function (ops) {
	var invert_op, ops_inv, i;

	invert_op = function (op) {
		var inv;

		if ('editor_class' in op && (op.editor_class === 'title' || op.editor_class === 'publish')) {
			inv = {editor_class : op.editor_class, before : op.after, after : op.before};
		} else if (op.domop === 'insert') {
			inv = {domop : 'remove', id : op.id, before : op.before, type : op.type, val : op.val};
		} else if (op.domop === 'append') {
			inv = {domop : 'remove', id : op.id, parent : op.parent, type : op.type, val : op.val};
		} else if (op.domop === 'remove' && 'before' in op) {
			inv = {domop : 'insert', id : op.id, before : op.before, type : op.type, val : op.val};
		} else if (op.domop === 'remove' && 'parent' in op) {
			inv = {domop : 'append', id : op.id, parent : op.parent, type : op.type, val : op.val};
		} else if (op.domop === 'mutate') {
			inv = {domop : 'mutate', id : op.id, before : op.after, after : op.before};
		} else if (op.domop === 'split' || op.domop === 'merge') {
			inv = {domop : 'merge', parent : op.parent, child : op.child, point : op.point, parentval : op.parentval, childval : op.childval};
			inv.domop = op.domop === 'split' ? 'merge' : 'split';
		}

		return inv;
	};

	ops_inv = [];
	for (i = 0; i < ops.length; i++) {
		ops_inv.push(invert_op(ops[i]));
	}
	ops_inv = ops_inv.reverse();

	return ops_inv;
};


nbe.state.left_margin = function (direction, val) {
	var step, old_value, new_value;

	step = 20;

	old_value = val.left_margin ? val.left_margin : 0;
	if (direction === 'increment') {
		new_value = old_value + step;
	} else {
		new_value = old_value >= step ? old_value - step : old_value;
	}

	if (new_value > 0) {
		val.left_margin = new_value;
	} else {
		delete val.left_margin;
	}

	return new_value !== old_value;
};


nbe.state.line_classes = [
	'center',
	'right',
	'justify',
	'heading1',
	'heading2',
	'heading3',
	'heading4',
	'heading5',
	'heading6',
	'disc',
	'lower-alpha',
	'lower-roman',
	'square',
	'upper-alpha',
	'upper-roman',
	'ordered',
	'line_spacing_05',
	'line_spacing_06',
	'line_spacing_07',
	'line_spacing_08',
	'line_spacing_09',
	'line_spacing_10',
	'line_spacing_11',
	'line_spacing_12',
	'line_spacing_13',
	'line_spacing_14',
	'line_spacing_15',
	'line_spacing_16',
	'line_spacing_17',
	'line_spacing_18',
	'line_spacing_19',
	'line_spacing_20'
];


nbe.state.line_font_size = function (state, dom, line_id, domop) {
	var line, el_line, child, font_size;

	line = state.nodes[line_id];
	if (dom) {
		el_line = dom[line_id];
	}

	if (domop === 'remove') {
		if (line.children.length === 1) {
			child = line.children[0];
			if (child.type === 'text') {
				font_size = child.val.font_size;
				if (font_size) {
					line.val.font_size = font_size;
					if (dom) {
						nbe.state.mutate_element(el_line, 'line', line.val);
					}
				}
			}
		}
	} else {
		if (line.val.font_size) {
			delete line.val.font_size;
			if (dom) {
				nbe.state.mutate_element(el_line, 'line', line.val);
			}
		}
	}
};


nbe.state.line_val_merge = function (parentval, childval) {
	var val, choose_singleton_else_parent;

	val = {};

	choose_singleton_else_parent = function (key) {
		if (key in parentval) {
			val[key] = parentval[key];
		} else if (key in childval) {
			val[key] = childval[key];
		}
	};

	nbe.state.formats.text.concat(nbe.state.formats.line).forEach(function (key) {
		choose_singleton_else_parent(key);
	});

	if ('left_margin' in parentval) {
		val.left_margin = parentval.left_margin;
	} else {
		delete val.left_margin;
	}

	return val;
};


nbe.state.mutate_element = function (element, type, val) {
	var add_classes, remove_classes;

	add_classes = function (keys) {
		var i;

		for (i = 0; i < keys.length; i++) {
			if (keys[i] in val) {
				element.classList.add('wu-' + val[keys[i]]);
			}
		}
	};

	remove_classes = function (classes) {
		var i;

		for (i = 0; i < classes.length; i++) {
			element.classList.remove('wu-' + classes[i]);
		}
	};

	switch (type) {
	case 'root' :
		break;
	case 'line' :
		remove_classes(nbe.state.line_classes);
		add_classes(['heading', 'text_align', 'list', 'line_spacing']);
		element.style.marginLeft = val.left_margin ? (val.left_margin + 'px') : '';
		element.style.fontSize = val.font_size || '';
		break;
	case 'text' :
		element.textContent = val.text;
		element.classList[val.bold ? 'add' : 'remove']('wu-bold');
		element.classList[val.italic ? 'add' : 'remove']('wu-italic');
		element.classList[val.underline ? 'add' : 'remove']('wu-underline');
		element.classList[val.strikethrough ? 'add' : 'remove']('wu-strikethrough');
		element.style.color = val.color || '';
		element.style.backgroundColor = val.background_color || '';
		element.style.fontFamily = val.font_family || '';
		element.style.verticalAlign = val.vertical_align || '';
		element.style.fontSize = val.vertical_align ? (val.font_size ? ((0.8 * (Number(val.font_size.slice(0, val.font_size.length - 2)))) + 'px') : '80%') : (val.font_size || '');
		break;
	case 'img' :
		element.src = val.src || '';
		if ('width' in val) {
			element.width = val.width;
		} else {
			element.removeAttribute('width');
		}
		if ('height' in val) {
			element.height = val.height;
		} else {
			element.removeAttribute('height');
		}
		element.title = val.title || '';
		break;
	case 'link' :
		element.href = val.href;
	}

	return element;
};


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


nbe.state.serialize = function (state) {
	var new_nodes, nodes, id, node, new_node, i;

	new_nodes = {};
	nodes = state.nodes;
	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_node = {type : node.type, id : node.id, val : node.val, children : []};
			if (node.parent) {
				new_node.parent = node.parent.id;
			}
			for (i = 0; i < node.children.length; i++) {
				new_node.children[i] = node.children[i].id;
			}
			new_nodes[id] = new_node;
		}
	}

	return JSON.stringify({nodes : new_nodes});
};


nbe.state.set_format = function (type, value, format) {
	if (nbe.state.formats.default_values[type] === value) {
		delete format[type];
	} else {
		format[type] = value;
	}

	return format;
};


nbe.state.state_copy = function (state) {
	return nbe.state.deserialize(nbe.state.serialize(state));
};


nbe.state.update = function (editor, state, dom, ops) {
	var nodes, root, insert, append, remove, mutate, split, merge, opi, op;

	nodes = state.nodes;
	root = nodes.root;

	insert = function (id, before, type, val) {
		var node, index;

		if (!(id in nodes) && before in nodes) {
			node = {id : id, type : type, val : val, parent : nodes[before].parent, children : []};
			nodes[id] = node;
			index = node.parent.children.indexOf(nodes[before]);
			node.parent.children = node.parent.children.slice(0, index).concat([node]).concat(node.parent.children.slice(index));
			if (dom) {
				dom[id] = nbe.state.element(id, type, val);
				dom[nodes[before].parent.id].insertBefore(dom[id], dom[before]);
			}
		}
	};

	append = function (id, parent_id, type, val) {
		var node;

		if (!(id in nodes) && parent_id in nodes) {
			node = {id : id, type : type, val : val, parent : nodes[parent_id], children : []};
			nodes[id] = node;
			node.parent.children.push(node);
			if (dom) {
				dom[id] = nbe.state.element(id, type, val);
			}
			if (node.parent.type === 'line') {
				if (dom) {
					dom[parent_id].insertBefore(dom[id], dom[parent_id].lastChild);
				}
				nbe.state.line_font_size(state, dom, parent_id, 'append');
			} else {
				if (dom) {
					dom[parent_id].appendChild(dom[id]);
				}
			}
		}
	};

	remove = function (id) {
		var node, index;

		if (id in nodes) {
			node = nodes[id];
			if (node.children.length === 0) {
				if (node.parent.type === 'line') {
					nbe.state.line_font_size(state, dom, node.parent.id, 'remove');
				}
				delete nodes[id];
				index = node.parent.children.indexOf(node);
				node.parent.children = node.parent.children.slice(0, index).concat(node.parent.children.slice(index + 1));
				if (dom) {
					dom[node.parent.id].removeChild(dom[id]);
					delete dom[id];
				}
			}
		}
	};

	mutate = function (id, val) {
		if (id in nodes) {
			nodes[id].val = val;
			if (dom) {
				nbe.state.mutate_element(dom[id], nodes[id].type, val);
			}
		}
	};

	split = function (parent_id, child_id, point_id, parentval, childval) {
		var par, child, index_par, index_point, i, par_child;

		par = nodes[parent_id];
		if (!(child_id in nodes) && par && par.type === 'line') {
			child = {id : child_id, type : 'line', val : childval, parent : root, children : []};
			nodes[child_id] = child;
			if (dom) {
				dom[child_id] = nbe.state.element(child_id, 'line', child.val);
			}
			index_par = root.children.indexOf(par);
			if (index_par === root.children.length - 1) {
				if (dom) {
					dom.root.appendChild(dom[child_id]);
				}
			} else {
				if (dom) {
					dom.root.insertBefore(dom[child_id], dom[root.children[index_par + 1].id]);
				}
			}
			root.children = root.children.slice(0, index_par + 1).concat([child]).concat(root.children.slice(index_par + 1));
			if (point_id && point_id in nodes && nodes[point_id].parent === par) {
				index_point = par.children.indexOf(nodes[point_id]);
			} else {
				index_point = par.children.length;
			}
			for (i = index_point; i < par.children.length; i++) {
				par_child = par.children[i];
				par_child.parent = child;
				if (dom) {
					dom[parent_id].removeChild(dom[par_child.id]);
					dom[child_id].insertBefore(dom[par_child.id], dom[child_id].lastChild);
				}
			}
			child.children = par.children.slice(index_point);
			par.children = par.children.slice(0, index_point);
			par.val = parentval;
			if (dom) {
				nbe.state.mutate_element(dom[parent_id], 'line', parentval);
			}
		}
	};

	merge = function (parent_id, parentval, childval) {
		var par, index_par, child, i, child_child;

		par = nodes[parent_id];
		if (par && par.type === 'line') {
			index_par = root.children.indexOf(par);
			if (index_par < root.children.length - 1) {
				child = root.children[index_par + 1];
				for (i = 0; i < child.children.length; i++) {
					child_child = child.children[i];
					child_child.parent = par;
					if (dom) {
						dom[child.id].removeChild(dom[child_child.id]);
						dom[parent_id].insertBefore(dom[child_child.id], dom[parent_id].lastChild);
					}
				}
				if (dom) {
					dom.root.removeChild(dom[child.id]);
					delete dom[child.id];
				}
				root.children = root.children.slice(0, index_par + 1).concat(root.children.slice(index_par + 2));
				delete nodes[child.id];
				par.children = par.children.concat(child.children);
				par.val = nbe.state.line_val_merge(parentval, childval);
				if (dom) {
					nbe.state.mutate_element(dom[parent_id], 'line', par.val);
				}
			}
		}
	};

	if (dom) {
		editor.mutation.disconnect();
	}

	for (opi = 0; opi < ops.length; opi++) {
		op = ops[opi];
		if (op.domop === 'insert') {
			insert(op.id, op.before, op.type, op.val);
		} else if (op.domop === 'append') {
			append(op.id, op.parent, op.type, op.val);
		} else if (op.domop === 'remove') {
			remove(op.id);
		} else if (op.domop === 'mutate') {
			mutate(op.id, op.after);
		} else if (op.domop === 'split') {
			split(op.parent, op.child, op.point, op.parentval, op.childval);
		} else if (op.domop === 'merge') {
			merge(op.parent, op.parentval, op.childval);
		}
	}

	if (dom) {
		nbe.state.reset_counter(editor);
		editor.mutation.observe();
	}
};


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

		detect_input = function (_event) {
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

	add_external_ops = function (ops, _set_location) {
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


nbe.title.state_copy = function (state) {
	return {value : state.value};
};


nbe.title.state_init = function () {
	return {value : 'My Title'};
};


nbe.title.state_update = function (state, ops) {
	if (ops.length > 0) {
		state.value = ops[ops.length - 1].after;
	}
};


nbe.triggers.cut = function (editor) {
	editor.mutation.disconnect();
	setTimeout(function () {
		nbe.state.clean(editor);
		if (!editor.location.collapsed) {
			editor.trigger('delete', null);
		}
		editor.mutation.observe();
	}, 0);
};


nbe.triggers.del = function (editor) {
	var location, node, loc_start, start, end;

	if (!editor.location) {
		return null;
	}

	location = editor.location;
	node = editor.state.nodes[location.start.container];

	if (node.type === 'line' && 'left_margin' in node.val && location.collapsed) {
		return nbe.triggers.left_margin(editor, 'decrement');
	} else if (location.collapsed) {
		loc_start = nbe.location.previous_location(editor, location.start);
		start = nbe.location.loc_to_point(editor, loc_start);
		end = nbe.location.loc_to_point(editor, location.start);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
	}

	return nbe.ops.root(editor, start, end, null);
};


nbe.triggers.format = function (editor, type, value) {
	nbe.state.set_format(type, value, editor.format);
	if (editor.location === null) {
		return null;
	} else if (editor.location.collapsed) {
		return nbe.triggers.format_collapsed(editor, type, value);
	} else if (nbe.state.formats.text.indexOf(type) !== -1) {
		return nbe.triggers.text_format(editor, type, value);
	} else {
		return nbe.triggers.line_format(editor, type, value);
	}
};


nbe.triggers.format_collapsed = function (editor, type, value) {
	var line, ops, op, text_nodes, i, text_node;

	line = nbe.location.parent_line(editor, editor.location.start.container);

	ops = [];

	if (!nbe.state.cmp_value_format(type, value, line.val) && ((nbe.state.formats.text.indexOf(type) !== -1 && line.children.length === 0) || (nbe.state.formats.line.indexOf(type) !== -1))) {
		op = {domop : 'mutate', id : line.id, before : line.val};
		op.after = nbe.state.set_format(type, value, nbe.state.copy_line_format(line.val, {}));
		ops.push(op);

		if (type === 'heading' && value !== 'none') {
			text_nodes = nbe.location.text_nodes_in_line(line);
			for (i = 0; i < text_nodes.length; i++) {
				text_node = text_nodes[i];
				if (!nbe.state.cmp_value_format('font_size', nbe.state.formats.default_values.font_size, text_node.val)) {
					op = {domop : 'mutate', id : text_node.id, before : text_node.val};
					op.after = nbe.state.set_format('font_size', nbe.state.formats.default_values.font_size, nbe.state.copy_text_format(text_node.val, {}));
					op.after.text = text_node.val.text;
					ops.push(op);
				}
			}

			delete op.after.list;
		}
	}

	return {ops : ops, loc_after : editor.location};
};


nbe.triggers.img = function (editor, value) {
	var node, op, oploc, location, start, end, val, insertion;

	if ('id' in value && value.id in editor.state.nodes) {
		node = editor.state.nodes[value.id];
		op = {domop : 'mutate', id : value.id, before : node.val, after : nbe.lib.clone(value)};
		delete op.after.id;
		oploc = {ops : [op], loc_after : editor.location};
	} else if (!editor.location) {
		oploc = null;
	} else {
		location = editor.location;

		if (location.collapsed) {
			start = end = nbe.location.loc_to_point(editor, location.start);
		} else {
			start = nbe.location.loc_to_point(editor, location.start);
			end = nbe.location.loc_to_point(editor, location.end);
		}

		val = nbe.lib.clone(value);
		insertion = [{type : 'line', val : {}, children : [{type : 'img', val : val, children : []}]}];

		oploc = nbe.ops.root(editor, start, end, insertion);
	}

	return oploc;
};


nbe.triggers.insertion = function (editor, insertion) {
	var location, start, end;

	if (!editor.location) {
		return null;
	}

	location = editor.location;

	if (location.collapsed) {
		start = end = nbe.location.loc_to_point(editor, location.start);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
	}

	return nbe.ops.root(editor, start, end, insertion);
};


nbe.triggers.left_margin = function (editor, value) {
	var lines, ops;

	if (editor.location === null) {
		return null;
	}

	lines = nbe.location.lines(editor);

	ops = [];

	lines.forEach(function (node) {
		var margin_pre, margin_post, op;

		margin_pre = 'left_margin' in node.val ? node.val.left_margin : 0;
		margin_post = margin_pre + (value === 'increment' ? 1 : -1) * nbe.state.formats.left_margin.step;
		if (margin_post >= 0 && margin_post <= nbe.state.formats.left_margin.max) {
			op = {domop : 'mutate', id : node.id, before : node.val};
			op.after = nbe.state.set_format('left_margin', margin_post, nbe.state.copy_line_format(node.val, {}));
			ops.push(op);
		}
	});

	return {ops : ops, loc_after : editor.location};
};


nbe.triggers.line_format = function (editor, type, value) {
	var lines, ops;

	lines = nbe.location.lines(editor);

	ops = [];
	lines.forEach(function (node) {
		var op;

		if (!nbe.state.cmp_value_format(type, value, node.val)) {
			op = {domop : 'mutate', id : node.id, before : node.val};
			op.after = nbe.state.set_format(type, value, nbe.state.copy_line_format(node.val, {}));
			ops.push(op);

			if (type === 'heading' && value !== 'none') {
				nbe.location.text_nodes_in_line(node).forEach(function (text_node) {
					if (!nbe.state.cmp_value_format('font_size', nbe.state.formats.default_values.font_size, text_node.val)) {
						op = {domop : 'mutate', id : text_node.id, before : text_node.val};
						op.after = nbe.state.set_format('font_size', nbe.state.formats.default_values.font_size, nbe.state.copy_text_format(text_node.val, {}));
						op.after.text = text_node.val.text;
						ops.push(op);
					}
				});

				delete op.after.list;
			}
		}
	});

	return {ops : ops, loc_after : editor.location};
};


nbe.triggers.link = function (editor, value) {
	var node, op, oploc, location, start, end, link, insertion;

	if ('id' in value && value.id in editor.state.nodes) {
		node = editor.state.nodes[value.id];
		op = {domop : 'mutate', id : value.id, before : node.val, after : {href : value.href}};
		oploc = {ops : [op], loc_after : editor.location};
	} else if (!editor.location) {
		oploc = null;
	} else {
		location = editor.location;

		if (location.collapsed) {
			start = end = nbe.location.loc_to_point(editor, location.start);
		} else {
			start = nbe.location.loc_to_point(editor, location.start);
			end = nbe.location.loc_to_point(editor, location.end);
		}

		link = {type : 'link', val : {href : value.href}, children : value.insertion};
		insertion = [{type : 'line', val : {}, children : [link]}];

		oploc = nbe.ops.root(editor, start, end, insertion);
	}

	return oploc;
};


nbe.triggers.newline = function (editor) {
	var location, start, end, insertion;

	if (!editor.location) {
		return null;
	}

	location = editor.location;

	if (location.collapsed) {
		start = end = nbe.location.loc_to_point(editor, location.start);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
	}

	insertion = [{type : 'line', val : {}, children : []}, {type : 'line', val : {}, children : []}];

	return nbe.ops.root(editor, start, end, insertion);
};


nbe.triggers.observer = function (editor, mutations) {
	var nodes, dom, added_nodes, removed_nodes, mutated_nodes, add_to_array, remove_from_array, add_node, remove_node, mutate_node, add_line, lines, oploc;

	nodes = editor.state.nodes;
	dom = editor.dom;
	added_nodes = [];
	removed_nodes = [];
	mutated_nodes = [];

	add_to_array = function (array, item) {
		var index;

		index = array.indexOf(item);
		if (index === -1) {
			array.push(item);
		}

		return index === -1;
	};

	remove_from_array = function (array, item) {
		var index;

		index = array.indexOf(item);
		if (index !== -1) {
			array.splice(index, 1);
		}

		return index !== -1;
	};

	add_node = function (node) {
		add_to_array(added_nodes, node);
	};

	remove_node = function (node) {
		var removed;

		removed = remove_from_array(added_nodes, node);
		if (!removed) {
			add_to_array(removed_nodes, node);
		}
	};

	mutate_node = function (node) {
		if (added_nodes.indexOf(node) === -1) {
			add_to_array(mutated_nodes, node);
		}
	};

	mutations.forEach(function (mutation) {
		var i;

		if (mutation.type === 'characterData') {
			mutate_node(mutation.target);
		} else if (mutation.type === 'childList') {
			for (i = 0; i < mutation.addedNodes.length; i++) {
				add_node(mutation.addedNodes[i]);
			}
			for (i = 0; i < mutation.removedNodes.length; i++) {
				remove_node(mutation.removedNodes[i]);
			}
		}
	});

	add_line = function (el, lines) {
		var id;

		while (el !== null && !(el.classList && el.classList.contains('line'))) {
			el = el.parentNode;
		}

		if (el) {
			id = el.getAttribute('data-id');
			lines[id] = true;
		}
	};

	lines = {};

	added_nodes.concat(removed_nodes).concat(mutated_nodes).forEach(function (node) {
		add_line(node, lines);
	});

	oploc = nbe.ops.modified(editor, Object.keys(lines));

	nbe.state.clean(editor);

	return oploc;
};


nbe.triggers.paste = function (editor) {
	var callback;

	callback = function (insertion) {
		editor.trigger('insertion', insertion);
	};

	nbe.paste.clipboard(callback);
};


nbe.triggers.select = function (editor) {
	var last, next, offset, location;

	last = nbe.location.last_child(editor.state.nodes.root);
	next = nbe.location.next_node(last);
	while (next !== null) {
		last = next;
		next = nbe.location.next_node(last);
	}

	if (last.type === 'text') {
		offset = last.val.text.length;
	} else if (last.type === 'line') {
		offset = 0;
	} else {
		offset = 1;
	}

	location = {start : {container : 'line', offset : 0}, end : {container : last.id, offset : offset}, collapsed : false};

	nbe.location.set(editor, location);
};


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


nbe.triggers.tab = function (editor) {
	var node, oploc;

	if (!editor.location) {
		return null;
	}

	node = editor.state.nodes[editor.location.start.container];
	if (node.type === 'line') {
		oploc = nbe.triggers.left_margin(editor, 'increment');
	} else {
		oploc = nbe.triggers.text(editor, ' ');
	}

	return oploc;
};


nbe.triggers.text = function (editor, text) {
	var location, start, end, val, insertion;

	if (!editor.location) {
		return null;
	}

	location = editor.location;

	if (location.collapsed) {
		return nbe.triggers.text_collapsed(editor, text);
	} else {
		start = nbe.location.loc_to_point(editor, location.start);
		end = nbe.location.loc_to_point(editor, location.end);
		val =  nbe.state.copy_text_format(editor.format, {});
		val.text = text;
		insertion = [{type : 'line', val : {}, children : [{type : 'text', val : val, children : []}]}];
		return nbe.ops.root(editor, start, end, insertion);
	}
};


nbe.triggers.text_collapsed = function (editor, text) {
	var max_text_length, start, node, op, val, insertion;

	max_text_length = 10;

	start = nbe.location.loc_to_point(editor, editor.location.start);
	node = start.node;

	if (node.type === 'text' && node.val.text.length < max_text_length && (start.offset < node.val.text.length || node.parent.type === 'line') && nbe.state.cmp_text_format(node.val, editor.format)) {
		op = {domop : 'mutate', id : node.id, before : node.val, after : nbe.state.copy_text_format(node.val, {})};
		op.after.text = node.val.text.slice(0, start.offset) + text + node.val.text.slice(start.offset);

		return {ops : [op], loc : {container : node.id, offset : start.offset + text.length}};
	} else {
		val =  nbe.state.copy_text_format(editor.format, {});
		val.text = text;
		insertion = [{type : 'line', val : {}, children : [{type : 'text', val : val, children : []}]}];

		return nbe.ops.root(editor, start, start, insertion);
	}
};


nbe.triggers.text_format = function (editor, type, value) {
	var nodes, start, end, loc_after, ops_split, ops_middle, ops_lines, ops, loc;

	nbe.state.set_format(type, value, editor.format);
	if (editor.location === null || editor.location.collapsed) {
		return null;
	}

	nodes = editor.state.nodes;
	start = editor.location.start;
	end = editor.location.end;

	loc_after = {start : start, end : end, collapsed : false};

	ops_split = function (id, offset_start, offset_end_arg) {
		var ops, node, offset_end, op_mutate, op_start, op_end;

		ops = [];
		node = nodes[id];
		if (node.type === 'text' && !nbe.state.cmp_value_format(type, value, node.val)) {
			offset_end = offset_end_arg === 'infinite' ? node.val.text.length : offset_end_arg;
			if (offset_start !== offset_end) {
				op_mutate = {domop : 'mutate', id : id, before : node.val};
				op_mutate.after = nbe.state.set_format(type, value, nbe.state.copy_text_format(node.val, {}));
				op_mutate.after.text = node.val.text.slice(offset_start, offset_end);
				ops.push(op_mutate);
				if (offset_end_arg !== 'infinite') {
					loc_after.end = {container : id, offset : offset_end - offset_start};
				}
				if (offset_start > 0) {
					op_start = {domop : 'insert', id : editor.new_id(), before : id, type : 'text', val : nbe.state.copy_text_format(node.val, {})};
					op_start.val.text = node.val.text.slice(0, offset_start);
					ops.push(op_start);
					loc_after.start = {container : op_start.id, offset : offset_start};
				}
				if (offset_end < node.val.text.length) {
					op_end = nbe.location.insert_after(editor, id);
					op_end.id = editor.new_id();
					op_end.type = 'text';
					op_end.val = nbe.state.copy_text_format(node.val, {});
					op_end.val.text = node.val.text.slice(offset_end);
					ops.push(op_end);
				}
			}
		}

		return ops;
	};

	ops_middle = function (start_id, end_id) {
		var ops, node, op_mutate;

		ops = [];
		node = nbe.location.previous_node(nodes[end_id]);
		while (node && node.id !== start_id) {
			if (node.type === 'text' && !nbe.state.cmp_value_format(type, value, node.val)) {
				op_mutate = {domop : 'mutate', id : node.id, before : node.val};
				op_mutate.after = nbe.state.set_format(type, value, nbe.state.copy_text_format(node.val, {}));
				op_mutate.after.text = node.val.text;
				ops.push(op_mutate);
			}
			node = nbe.location.previous_node(node);
		}

		return ops;
	};

	ops_lines = function (_start_id, _end_id) {
		var lines, ops;

		lines = nbe.location.lines(editor);

		ops = [];

		lines.forEach(function (node) {
			var op;

			if (!nbe.state.cmp_value_format(type, value, node.val)) {
				op = {domop : 'mutate', id : node.id, before : node.val};
				op.after = nbe.state.set_format(type, value, nbe.state.copy_line_format(node.val, {}));
				ops.push(op);
			}
		});

		return ops;
	};

	if (start.container === end.container) {
		ops = ops_split(start.container, start.offset, end.offset);
		loc = {container : start.container, offset : end.offset - start.offset};
	} else {
		ops = ops_split(start.container, start.offset, 'infinite');
		ops = ops.concat(ops_split(end.container, 0, end.offset));
		ops = ops.concat(ops_middle(start.container, end.container));
		ops = ops.concat(ops_lines(start.container, end.container));
		loc = end;
	}

	return {ops : ops, loc_after : loc_after};
};


nbe.triggers.trigger = function (editor, type, value) {
	var oploc, loc_after;

	//console.log('trigger', type, value);
	//nbe.location.get(editor);

	switch (type) {
	case 'text':
		oploc = nbe.triggers.text(editor, value);
		break;
	case 'insertion':
		oploc = nbe.triggers.insertion(editor, value);
		break;
	case 'bold':
	case 'underline':
	case 'italic':
	case 'strikethrough':
	case 'color':
	case 'background_color':
	case 'font_family':
	case 'vertical_align':
	case 'font_size':
	case 'heading':
	case 'text_align':
	case 'line_spacing':
	case 'list':
		oploc = nbe.triggers.format(editor, type, value);
		break;
	case 'left_margin':
		oploc = nbe.triggers.left_margin(editor, value);
		break;
	case 'tab':
		oploc = nbe.triggers.tab(editor);
		break;
	case 'delete':
		oploc = nbe.triggers.del(editor);
		break;
	case 'newline':
		oploc = nbe.triggers.newline(editor);
		break;
	case 'img':
		oploc = nbe.triggers.img(editor, value);
		break;
	case 'link':
		oploc = nbe.triggers.link(editor, value);
		break;
	case 'cut':
		nbe.triggers.cut(editor);
		oploc = 'break';
		break;
	case 'paste':
		nbe.triggers.paste(editor);
		oploc = 'break';
		break;
	case 'undo':
		editor.undo.trigger('undo', value);
		oploc = null;
		break;
	case 'observer':
		oploc = nbe.triggers.observer(editor, value);
		break;
	case 'subtree':
		oploc = nbe.triggers.subtree(editor, value);
		break;
	case 'select':
		nbe.triggers.select(editor);
		oploc = 'break';
		break;
	default:
		oploc = null;
		break;
	}

	//console.log(oploc);

	if (oploc === 'break') {
		return oploc;
	} else if (oploc === null || oploc.ops.length === 0) {
		return null;
	} else {
		loc_after = 'loc_after' in oploc ? oploc.loc_after : {start : oploc.loc, collapsed : true};
		return {ops : oploc.ops, loc_before : editor.location, loc_after : loc_after};
	}
};


/* global nbe: false */

exports.init = function () {
	return nbe.doc.state_serialize(nbe.doc.state_init());
};

exports.update = function (state, operations) {
	var state_deserialized;

	state_deserialized = nbe.doc.state_deserialize(state);

	nbe.doc.state_update(state_deserialized, operations);

	return nbe.doc.state_serialize(state_deserialized);
};

exports.test = function (state, operations) {
	var state_deserialized, i, st1, st2;

	state_deserialized = nbe.doc.state_deserialize(state);
	for (i = 0; i < operations.length; i++) {
		//console.log(i);
		nbe.doc.state_update(state_deserialized, [operations[i]]);

		try {
			st1 = nbe.doc.state_serialize(state_deserialized);
			st2 = nbe.doc.state_serialize(nbe.doc.state_deserialize(st1));
			console.log(st2);
		} catch (e) {
			console.log(state_deserialized.text.nodes.root.children.slice(0, 5));
			//console.log(nbe.doc.state_serialize(state_deserialized));
			//st1 = nbe.doc.state_deserialize(nbe.doc.state_serialize(state_deserialized));
			//console.log(st1.text.nodes.root.children.slice(0, 5));
			//console.log('error', i, operations[i]);
			break;
		}
	}
};
