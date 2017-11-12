'use strict';

exports.open = function (state, ws_id, ws) {
	state.clients[ws_id] = {ws : ws, id : null, read : null, noperations : null};
};

exports.close = function (state, ws_id) {
	var client;

	client = state.clients[ws_id];
	if (client) {
		delete state.clients[ws_id];
		if (client.id) {
			delete state.docs[client.id][ws_id];
			if (Object.keys(state.docs[client.id]).length === 0) {
				delete state.docs[client.id];
			}
		}
	}
};

exports.update = function (state, ws_id, doc_ids, noperations) {
	var client, id;

	client = state.clients[ws_id];
	client.noperations = noperations;
	if (client.id === null) {
		id = doc_ids.id;
		client.id = id;
		client.read = doc_ids.read;
		if (!(id in state.docs)) {
			state.docs[id] = {};
		}
		state.docs[id][ws_id] = true;
	}
};

var send = function (client, noperations, operations) {
	var msg;

	msg = {
		type : 'sync',
		noperations : client.noperations,
		operations : operations.slice(client.noperations - noperations)
	};

	client.ws.send(JSON.stringify(msg));
};

var single = function (state, id, ws_id) {
	var client, operations;

	client = state.clients[ws_id];
	operations = state.store.get_operations(id, client.noperations);
	send(client, client.noperations, operations);
};

var multi = function (state, id) {
	var ws_ids, noperations, ws_id, operations;

	ws_ids = state.docs[id];

	noperations = Infinity;
	for (ws_id in ws_ids) {
		if (ws_ids.hasOwnProperty(ws_id)) {
			noperations = Math.min(noperations, state.clients[ws_id].noperations);
		}
	}

	operations = state.store.get_operations(id, noperations);

	Object.keys(ws_ids).forEach(function (ws_id) {
		send(state.clients[ws_id], noperations, operations);
	});
};

exports.sync = function (state, id, ws_id, changes) {
	if (changes) {
		multi(state, id);
	} else {
		single(state, id, ws_id);
	}
};
