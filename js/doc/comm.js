'use strict';

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
        const operations_local = []; // Temporary diasble doc.operations_local;
		ws.send(JSON.stringify({type : 'sync', ids : doc.ids, noperations : doc.n_operations_server, operations : operations_local}));
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
