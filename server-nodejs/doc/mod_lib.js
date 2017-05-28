'use strict';

var is_id = function (s) {
	return typeof(s) === 'string' && /^[a-z0-9]+$/.test(s);
};

var has_ids = function (msg, keys) {
	var i, key;

	if (!('ids' in msg)) {
		return false;
	}

	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		if (!(key in msg.ids && msg.ids[key].length >= 3 && is_id(msg.ids[key]))) {
			return false;
		}
	}

	return true;
};

exports.verify_two_ids = function (msg) {
	return has_ids(msg, ['id', 'read']);
};

exports.verify_three_ids = function (msg) {
	return has_ids(msg, ['id', 'read', 'write']);
};

exports.verify_sync = function (msg) {
	if (!(typeof(msg.noperations) === 'number' && msg.noperations >= 0 && msg.noperations === Math.round(msg.noperations) && typeof(msg.operations) === 'object' && Object.prototype.toString.call(msg.operations) === '[object Array]')) {
		return false;
	}

	if (msg.operations.length === 0) {
		return exports.verify_two_ids(msg);
	} else {
		return exports.verify_three_ids(msg);
	}
};

exports.verify_operation = function (operation) {
	return typeof(operation) === 'object' && 'id' in operation && is_id(operation.id);
};
