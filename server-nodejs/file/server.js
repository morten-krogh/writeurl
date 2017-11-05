'use strict';

var http = require('http');
var fs = require('fs');
var crypto = require('crypto');
var buffer = require('../../../buffer/buffer.js');
var response = require('../../../server/response.js');

var host = null;
var port = 8051;
var dir = '../../files';
var url_prefix = '/editor/files/';
var max_size = 10000000;

var response_header = {
	'Access-Control-Allow-Origin' : '*',
	'Access-Control-Allow-Methods' : 'POST, OPTIONS',
	'Access-Control-Allow-Headers' : 'X-File-Ending',
	'Access-Control-Max-Age' : '30'
};

var find_ending = function (req) {
	var ending;

	ending = req.headers['x-file-ending'] || '';
	return ending.match(/[a-zA-Z]+/) ? ending : null;
};

var make_id = function () {
	var size, buf, chars, i;

	size = 20;
	try {
		buf = crypto.randomBytes(size);
		chars = [];
		for (i = 0; i < size; i++) {
			chars[i] = buf[i].toString(36).slice(-1);
		}
		return chars.join('');
	} catch (e) {
		return null;
	}
};

var init = function () {
	http.createServer(function (req, res) {
		if (req.method !== 'POST') {
			response.body(req, res, 200, response_header, '', false);
		} else if (req.method === 'POST') {
			buffer.read_stream_to_buffer(req, function (body) {
				var ending, id, filename, pathname, url;

				ending = find_ending(req);
				id = make_id();
				if (ending && id && body.length < max_size) {
					filename = id + '.' + ending;
					pathname = dir + '/' + filename;
					url = url_prefix + filename;
					fs.writeFile(pathname, body);
					response.body(req, res, 200, response_header, JSON.stringify(url), false);
				} else {
					response.body(req, res, 200, response_header, JSON.stringify(null), false);
				}
			});
		}
	}).listen(port, host);

	console.log('mailform server running at ' + host + ':' + port);
};

init();
