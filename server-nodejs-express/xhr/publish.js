'use strict';

const fs = require('fs');

const is_id = function (s) {
	return typeof(s) === 'string' && /^[a-z0-9]+$/.test(s);
};

const verify_write = function (store, id, write) {
	let valid;

	try {
		const ids = store.get_ids(id);
		valid = (write === ids.write);
	} catch (e) {
		valid = false;
	}
	return valid;
};

const publish = function (app_state, form) {
	var pathname;

	if ('id' in form && is_id(form.id) && 'write' in form && is_id(form.write) && 'html' in form &&
		typeof(form.html) === 'string' && verify_write(app_state.store, form.id, form.write)) {
		pathname = app_state.config.publish.public + '/' + form.id + '.html';
		fs.writeFileSync(pathname, form.html);
		return 'published';
	} else {
		return 'not published';
	}
};

module.exports = publish;
