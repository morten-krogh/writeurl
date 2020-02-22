'use strict';

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
