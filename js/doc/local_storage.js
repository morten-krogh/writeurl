'use strict';

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
