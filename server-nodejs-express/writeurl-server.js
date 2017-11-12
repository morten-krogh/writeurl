'use strict';

const http = require('http');
const url = require('url');
const express = require('express');
const static_router = require('./static-router.js');
const make_operations_handler = require('./operations-router/router.js');


const app = express();
const server = http.createServer(app);

const config = {
	port: 9000,
	doc_dir: '/Users/mkrogh/doc_dir'
};

const wul_state = {
	config: config,
	store: null
};

const operations_handler = make_operations_handler(config.doc_dir);

server.on('upgrade', (req, socket, head) => {
	const path = url.parse(req.url).pathname;
	if (path == '/operations') {
		operations_handler(req, socket, head);
	} else {
		socket.destroy();
	}
});

app.use(static_router);

server.listen(wul_state.config.port, () => {
	console.log('Writeurl server is listening on port: ', wul_state.config.port);
});
