'use strict';

const http = require('http');
const url = require('url');
const vhost = require('vhost');
const express = require('express');
const make_operations_handler = require('./operations-router/router.js');
const make_form_handler = require('./xhr/form_handler.js');


const app = express();
const server = http.createServer(app);

const config = {
	port: 9000,
	doc_dir: '/Users/mkrogh/doc_dir',
	release_build_dir: '/Users/mkrogh/writeurl/build/release/browser',
	debug_build_dir: '/Users/mkrogh/writeurl/build/debug/browser',
	publish_dir: '/Users/mkrogh/publish_dir'
};

const app_state = {
//	config: config,
//	store: null
	publish_dir: '/Users/mkrogh/publish_dir'
};

const operations_handler = make_operations_handler(config.doc_dir);
const form_handler = make_form_handler(app_state);

app.use(function (req, _res, next) {
	console.log(req.url);
	next();
});

server.on('upgrade', (req, socket, head) => {
	const path = url.parse(req.url).pathname;
	if (path == '/operations') {
		operations_handler(req, socket, head);
	} else {
		socket.destroy();
	}
});

app.post('*', form_handler);


// static files

const debug_host = 'debug.writeurl.localhost';

const options = {
	dotfiles: 'ignore',
	etag: false,
	extensions: ['html', 'index.html'],
	fallthrough: true,
	index: 'index.html',
	maxAge: 0,
	redirect: false,
	setHeaders: null
};

app.use('/publish', express.static(config.publish_dir, options));

app.use(vhost(debug_host, express.static(config.debug_build_dir, options)));
app.use(vhost(debug_host, (_req, res, _next) => {
	res.sendFile(config.debug_build_dir + '/html/index.html');
}));

// release_host and anything else.
// const release_host = 'release.writeurl.localhost';
app.use(express.static(config.release_build_dir, options));
app.use((_req, res, _next) => {
	res.sendFile(config.release_build_dir + '/index.html');
});

server.listen(config.port, () => {
	console.log('Writeurl server is listening on port: ', config.port);
});
