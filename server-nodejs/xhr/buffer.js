'use strict';

var zlib = require('zlib');

/*
	Incomplete implementations of streams
*/

exports.create_read_stream = function (input) {
	var stream;

	stream = {
		destination : null,

		on : function (event, listener) {
		},

		pipe : function (destination) {
			stream.destination = destination;
			return destination;
		}
	};

	setTimeout(function () {
		if (stream.destination) {
			stream.destination.end(input);
		}
	}, 0);

	return stream;
};

exports.cat = function (buffers) {
        var length, nbuffers, i, buffer, index;

        length = 0;
        nbuffers = buffers.length;
        for (i = 0; i < nbuffers; i++) {
                length += buffers[i].length;
        }
        buffer = new Buffer(length);
        index = 0;
        for (i = 0; i < nbuffers; i++) {
                buffers[i].copy(buffer, index, 0);
                index += buffers[i].length;
        }
        return buffer;
};

exports.read_stream_to_buffer = function (stream, callback) {
	var chunks;

	chunks = [];

	stream.on('data', function (data) {
		chunks.push(data);
	});

	stream.on('end', function () {
		callback(exports.cat(chunks));
	});
};

exports.compress = function (input, compression, callback) {
	var compressor;

	compressor = compression === 'deflate' ? zlib.createDeflate() : zlib.createGzip();
	exports.read_stream_to_buffer(exports.create_read_stream(input).pipe(compressor), callback);
};

exports.gzip_deflate = function (input, callback) {
	exports.compress(input, 'gzip', function (gzipped) {
		exports.compress(input, 'deflate', function (deflated) {
			callback(gzipped, deflated);
		});
	});
};

exports.parse_form = function (req, callback) {
	exports.read_stream_to_buffer(req, function (body) {
		var form;

		try {
			form = JSON.parse(body);
		} catch (err) {
			form = null;
		}

		callback(form);
	});
};
