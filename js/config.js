'use strict';

// urls:  /text/id/read/write/new

nbe.config = (function () {
	var host, home_pathname, valid_id, parse_pathname, publish_pathname, read_pathname,  write_pathname, urls, new_url;

	host = window.location.host;

	home_pathname = '/';

	valid_id = function (id) {
		var pattern;

		pattern = /^[a-z0-9]{3,}$/;

		return pattern.test(id);
	};

	parse_pathname = function (pathname) {
		var parts, ids;

		parts = pathname.split('/');
		ids = {
			prefix : parts.length > 1 ? parts[1] : null,
			id : parts.length > 2 && valid_id(parts[2]) ? parts[2] : null,
			read : parts.length > 3 && valid_id(parts[3]) ? parts[3] : null,
			write : parts.length > 4 && valid_id(parts[4]) ? parts[4] : null,
			new_doc : parts.length > 5 && parts[5] === 'new'
		};

		return ids;
	};

	publish_pathname = function (ids) {
		return '/publish/' + ids.id;
	};

	read_pathname = function (ids) {
		return '/text/' + ids.id + '/' + ids.read;
	};

	write_pathname = function (ids) {
		return read_pathname(ids) + '/' + ids.write;
	};

	urls = function (ids) {
		var domain;

		domain = 'http://' + host;

		return {
			publish : domain + publish_pathname(ids),
			read : domain + read_pathname(ids),
			write : domain + write_pathname(ids)
		};
	};

	new_url = function () {
		var ids;

		ids = {
			id : nbe.lib.rnd_string(20),
			read : nbe.lib.rnd_string(20),
			write : nbe.lib.rnd_string(20)
		};

		return urls(ids).write + '/new';
	};

	return {
		title : 'My Title',
		home_pathname : home_pathname,
		write_pathname : write_pathname,
		urls : urls,
		new_url : new_url,
		parse_pathname : parse_pathname,
		local_storage : true,
		ws_url : 'ws://' + host + '/operations',
		share_url : 'http://' + host + '/xhr/share',
		feedback_url : 'http://' + host + '/xhr/feedback',
		publish_url : 'http://' + host + '/xhr/publish',
		file_upload_url : 'http://' + host + ':8051'
	};
}());
