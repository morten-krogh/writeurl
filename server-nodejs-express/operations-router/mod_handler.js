'use strict';

var mod_state = require('./mod_state');

var mod_store = require('./mod_store');
var mod_lib = require('./mod_lib');
var mod_client = require('./mod_client');

var type_new = function (ws, msg) {
	var reply;

	if (mod_lib.verify_three_ids(msg)) {
		if (mod_store.exist(msg.ids.id)) {
			reply = {type : 'new', text : 'exist'};
		} else {
			reply = {type : 'new', text : 'created'};
			mod_store.create(msg.ids, mod_state.init());
		}
		ws.send(JSON.stringify(reply));
	} else {
		ws.close();
	}
};

var type_unknown = function (ws, msg) {
	var id, ids, state, nstate, noperation, operations, reply;

	if (mod_lib.verify_two_ids(msg)) {
		id = msg.ids.id;
		if (mod_store.exist(msg.ids.id)) {
			ids = mod_store.get_ids(id);
			if (msg.ids.read === ids.read) {
				nstate = mod_store.get_nstate(id);
				if (nstate === null) {
					mod_store.put_state(id, mod_state.init(), 0);
					nstate = 0;
				}
				state = mod_store.get_state(id);
				noperation = mod_store.get_noperation(id);
				if (noperation > nstate) {
					operations = mod_store.get_operations(id, nstate);
					state = mod_state.update(state, operations);
					mod_store.put_state(id, state, noperation);
				}
				reply = {type : 'unknown', text : 'exist', state : state, noperation : noperation};
			} else {
				reply = {type : 'unknown', text : 'noexist'};
			}
		} else {
			reply = {text : 'noexist'};
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

	if (mod_lib.verify_sync(msg) && mod_store.exist(msg.ids.id)) {
		id = msg.ids.id;
		ids = mod_store.get_ids(id);
		if (ids.read === msg.ids.read) {
			mod_client.update(state, ws_id, ids, msg.noperations);
			changes = false;
			if (msg.operations.length !== 0) {
				if (ids.write === msg.ids.write) {
					stored_operations = mod_store.get_operations(id, msg.noperations);
					filtered_operations = filter_operations(stored_operations, msg.operations);
					if (filtered_operations.length > 0) {
						changes = true;
						mod_store.put_operations(id, filtered_operations);
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
		msg = JSON.parse(message.data);
		switch (msg.type) {
		case 'new':
			type_new(ws, msg);
			break;
		case 'unknown':
			type_unknown(ws, msg);
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
