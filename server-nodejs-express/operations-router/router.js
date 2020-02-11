'use strict';

const WebSocket = require('ws');

const mod_client = require('./mod_client');
const mod_handler = require('./mod_handler');

function log(state, type, ws, ws_id) {
	var nclients, msg, id;

	try {
		nclients = ', number of clients : ' + Object.keys(state.clients).length;
		if (type === 'open') {
			msg = 'connection open, ws_id : ' + ws_id + ', date : ' + new Date() + nclients + ', remote address : ' + ws._socket.remoteAddress;
		} else if (type === 'close') {
			id = state.clients[ws_id].id;
			msg = 'connection close, ws_id : ' + ws_id + ', date : ' + new Date() + nclients + ', document id : ' + id;
		}
	} catch (e) {
		msg = 'log error, type = ' + type;
	}

	console.log(msg);
}


function make_operations_handler(app_state) {

	const wss = new WebSocket.Server({
		noServer: true,
		perMessageDeflate: true
	});

	const state = {
		ws_id_counter: 0,
		clients : {},
		docs : {},
		store: app_state.store
	};

	wss.on('connection', function (ws) {
		var ws_id;

		console.log('wss connection');
		ws_id = state.ws_id_counter++;
		mod_client.open(state, ws_id, ws);

		log(state, 'open', ws, ws_id);

		ws.on('message', function (message) {
			mod_handler.message(state, ws_id, message);
		});

		ws.onclose = function () {
			log(state, 'close', ws, ws_id);
			mod_client.close(state, ws_id);
		};

		ws.onerror = function(event) {
			console.log('websocket error', event.code, ' ws_id:', ws_id);
			mod_client.close(state, ws_id);
		};
	});

	const operations_handler = function(req, socket, head) {
		wss.handleUpgrade(req, socket, head, (ws) => {
			console.log('handleUpgrade');
			wss.emit('connection', ws);
		});
	};

	return operations_handler;
}

module.exports = make_operations_handler;
