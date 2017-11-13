'use strict';

const express = require('express');
const vhost = require('vhost');

const debug_host = 'debug.writeurl.localhost';

const options = {
	dotfiles: 'ignore',
	etag: false,
	extensions: ['index.html'],
	fallthrough: true,
	index: 'index.html',
	maxAge: 0,
	redirect: false,
	setHeaders: null
};

const make_static_router = function(config) {
	const router = express.Router();

	router.get('/hello.txt', (req, res, next) => {
		console.log("Hi from abc");
		express.static('/Users/mkrogh/publish_dir')(req, res, next);
	});

	router.get('/publish', express.static(config.publish_dir, options));

	router.use(vhost(debug_host, express.static(config.debug_build_dir, options)));
	router.use(vhost(debug_host, (_req, res, _next) => {
		res.sendFile(config.debug_build_dir + '/html/index.html');
	}));

	// release_host and anything else.
	// const release_host = 'release.writeurl.localhost';
	router.use(express.static(config.release_build_dir, options));
	router.use((_req, res, _next) => {
		res.sendFile(config.release_build_dir + '/index.html');
	});

	return router;
};

module.exports = make_static_router;
