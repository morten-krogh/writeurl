'use strict';

var host = null;
var port = 8043;

var websockets = require('ws');
var mod_id = require('./mod_id');
var mod_client = require('./mod_client');
var mod_handler = require('./mod_handler');

console.log('web socket server running at port ', port);

var log = function (state, type, ws, ws_id) {
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
		msg = 'log error';
	}

	console.log(msg);
};

var wss = new websockets.Server({host : host, port : port});

var state = {
	clients : {},
	docs : {}
};

wss.on('connection', function (ws) {
	var ws_id;

	ws_id = mod_id.get();
	mod_client.open(state, ws_id, ws);

	log(state, 'open', ws, ws_id);

	ws.onmessage = function (message) {
		mod_handler.message(state, ws_id, message);
	};

	ws.onclose = function () {
		log(state, 'close', ws, ws_id);
		mod_client.close(state, ws_id);
	};

});
