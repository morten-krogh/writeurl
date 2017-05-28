'use strict';

var fs = require('fs');

var publish_dir = '../../publish';
var docs_dir = '../doc/docs';

var is_id = function (s) {
	return typeof(s) === 'string' && /^[a-z0-9]+$/.test(s);
};

var verify_write = function (id, write) {
	var ids, valid;

	try {
		ids = JSON.parse(fs.readFileSync(docs_dir + '/' + id[0] + '/' + id[1] + '/' + id + '/ids', 'utf8'));
		valid = write === ids.write;
	} catch (e) {
		valid = false;
	}

	return valid;
};

exports.publish = function (form) {
	var pathname;

	if ('id' in form && is_id(form.id) && 'write' in form && is_id(form.write) && 'html' in form && typeof(form.html) === 'string' && verify_write(form.id, form.write)) {
		pathname = publish_dir + '/' + form.id + '.html';
		fs.writeFileSync(pathname, form.html);
		return 'published';
	} else {
		return 'not published';
	}
};
