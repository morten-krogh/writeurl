'use strict';

var mod_state = require('./mod_state');
var mod_lib = require('./mod_lib');
var mod_client = require('./mod_client');

var type_new = function (state, ws, msg) {
	var reply;

	if (mod_lib.verify_three_ids(msg)) {
		if (state.store.exist(msg.ids.id)) {
			reply = {type : 'new', text : 'exist'};
		} else {
			reply = {type : 'new', text : 'created'};
			state.store.create(msg.ids, mod_state.init());
		}
		ws.send(JSON.stringify(reply));
	} else {
		ws.close();
	}
};

var type_unknown = function (state, ws, msg) {
	var id, ids, doc_state, nstate, noperation, operations, reply;

	if (mod_lib.verify_two_ids(msg)) {
		id = msg.ids.id;
		if (state.store.exist(msg.ids.id)) {
			ids = state.store.get_ids(id);
			if (msg.ids.read === ids.read) {
				nstate = state.store.get_nstate(id);
				if (nstate === null) {
					state.store.put_state(id, mod_state.init(), 0);
					nstate = 0;
				}
				doc_state = state.store.get_state(id);
				noperation = state.store.get_noperation(id);
				if (noperation > nstate) {
					operations = state.store.get_operations(id, nstate);
					doc_state = mod_state.update(doc_state, operations);
					state.store.put_state(id, doc_state, noperation);
				}
				reply = {type : 'unknown', text : 'exist', state : doc_state, noperation : noperation};
			} else {
				reply = {type : 'unknown', text : 'noexist'};
			}
		} else {
			reply = {type: 'unknown', text : 'noexist'};
		}
		ws.send(JSON.stringify(reply));
	} else {
		ws.close();
	}
};

var filter_operations = function (stored_operations, operations) {
	var ids;

	ids = {};
	stored_operations.forEach(function (operation) {
		ids[operation.id] = true;
	});

	return operations.filter(function (operation) {
		return mod_lib.verify_operation(operation) && !(operation.id in ids);
	});
};

var type_sync = function (state, ws_id, ws, msg) {
	var id, ids, changes, stored_operations, filtered_operations;

	if (mod_lib.verify_sync(msg) && state.store.exist(msg.ids.id)) {
		id = msg.ids.id;
		ids = state.store.get_ids(id);
		if (ids.read === msg.ids.read) {
			mod_client.update(state, ws_id, ids, msg.noperations);
			changes = false;
			if (msg.operations.length !== 0) {
				if (ids.write === msg.ids.write) {
					stored_operations = state.store.get_operations(id, msg.noperations);
					filtered_operations = filter_operations(stored_operations, msg.operations);
					if (filtered_operations.length > 0) {
						changes = true;
						state.store.put_operations(id, filtered_operations);
					}
					mod_client.sync(state, id, ws_id, changes);
				} else {
					ws.send(JSON.stringify({type : 'invalid'}));
				}
			} else {
				mod_client.sync(state, id, ws_id, changes);
			}
		} else {
			ws.send(JSON.stringify({type : 'invalid'}));
		}
	} else {
		ws.close();
	}
};

exports.message = function (state, ws_id, message) {
	var ws, msg;

	ws = state.clients[ws_id].ws;

	try {
		msg = JSON.parse(message);
		switch (msg.type) {
		case 'new':
			type_new(state, ws, msg);
			break;
		case 'unknown':
			type_unknown(state, ws, msg);
			break;
		case 'sync':
			type_sync(state, ws_id, ws, msg);
			break;
		}
	} catch (e) {
		console.log('message from mod_handler.message', message);
		ws.close();
	}
};
