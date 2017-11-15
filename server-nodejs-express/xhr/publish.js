'use strict';

const fs = require('fs');

const is_id = function (s) {
	return typeof(s) === 'string' && /^[a-z0-9]+$/.test(s);
};

const verify_write = function (id, write) {
	var ids, valid;

	//	try {
	//		ids = JSON.parse(fs.readFileSync(docs_dir + '/' + id[0] + '/' + id[1] + '/' + id + '/ids', 'utf8'));
	//		valid = write === ids.write;
	//	} catch (e) {
	//		valid = false;
	//	}

	valid = true;

	return valid;
};

const publish = function (publish_dir, form) {
	var pathname;

	if ('id' in form && is_id(form.id) && 'write' in form && is_id(form.write) && 'html' in form && typeof(form.html) === 'string' && verify_write(form.id, form.write)) {
		pathname = publish_dir + '/' + form.id + '.html';
		fs.writeFileSync(pathname, form.html);
		return 'published';
	} else {
		return 'not published';
	}
};

module.exports = publish;
