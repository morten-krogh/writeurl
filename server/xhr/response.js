'use strict';

var zlib = require('zlib');
var fs = require('fs');
var mime = require('node-mime');
var buffer = require('./buffer.js');

var set_status_code_and_standard_headers = function (req, res, status_code, headers) {
        res.setHeader('Server', 'Kite server');
        res.setHeader('Date', new Date().toUTCString());
	//res.setHeader('Expires', new Date(Date.now() + 10000000).toUTCString());  // for development, the browser will not cache anything now.
	res.setHeader('Cache-Control', ['no-cache', 'no-store']);  // for development, the browser will not cache anything now.
	res.writeHead(status_code, headers);
};

exports.stream_no_compres = function (req, res, status_code, headers, stream) {
	set_status_code_and_standard_headers(req, res, status_code, headers);
	stream.pipe(res);
};

exports.stream = function (req, res, status_code, headers, stream, compress) {
	var compressed_stream;

	if (compress && req.headers['accept-encoding'] && req.headers['accept-encoding'].match(/deflate/)) {
		headers['Content-Encoding'] = 'deflate';
		compressed_stream = stream.pipe(zlib.createDeflate());
	} else if (compress && req.headers['accept-encoding'] && req.headers['accept-encoding'].match(/gzip/)) {
		headers['Content-Encoding'] = 'gzip';
		compressed_stream = stream.pipe(zlib.createGzip());
	} else {
		compressed_stream = stream;
	}

	exports.stream_no_compres(req, res, status_code, headers, compressed_stream);
};

exports.body = function (req, res, status_code, headers, body, compress) {
	exports.stream(req, res, status_code, headers, buffer.create_read_stream(body), compress);
};

exports.pathname = function (req, res, status_code, headers, pathname, compress) {
	var stream;

	headers['Content-Type'] = mime.lookup(pathname);
	stream = fs.createReadStream(pathname);
	stream.on('error', function (exception) {
		exports['404'](req, res);
	});
	exports.stream(req, res, status_code, headers, stream, compress);
};

exports['303'] = function (req, res, location) {
	exports.body(req, res, 303, {location : location}, '', false);
};

exports['304'] = function (req, res, headers) {
	exports.body(req, res, 304, headers, '', false);
};

exports['404'] = function (req, res, body) {
	if (body) {
		exports.body(req, res, 404, {'Content-Type' : 'text/html'}, body, false);
	} else {
		exports.body(req, res, 404, {'Content-Type' : 'text/plain'}, '404 Not Found\n', false);
	}
};

var if_modified_since = function (req, res, headers, body, pathname, compress) {
	if (req.headers['if-modified-since'] === headers['Last-Modified']) {
		exports['304'](req, res, headers);
	} else if (body) {
		exports.body(req, res, 200, headers, body, compress);
	} else if (pathname) {
		exports.pathname(req, res, 200, headers, pathname, compress);
	}
};

exports.body_if_modified_since = function (req, res, headers, body, compress) {
	if_modified_since(req, res, headers, body, null, compress);
};

exports.pathname_if_modified_since = function (req, res, headers, pathname, compress) {
	if_modified_since(req, res, headers, null, pathname, compress);
};
