'use strict';

const express = require('express');
const vhost = require('vhost');
const router = express.Router();

const wul_home = process.env['WUL_HOME'];
if (!wul_home) {
	console.log('WUL_HOME must be set in the environment');
	process.exit(1);
}

const release_host = 'release.writeurl.localhost';
const debug_host = 'debug.writeurl.localhost';

const release_dir = wul_home + '/build/release/browser';
const debug_dir = wul_home + '/build/debug/browser';

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

router.use(vhost(release_host, express.static(release_dir, options)));
router.use(vhost(release_host, (_req, res, _next) => {
	res.sendFile(release_dir + '/index.html');
}));

router.use(vhost(debug_host, express.static(debug_dir, options)));
router.use(vhost(debug_host, (_req, res, _next) => {
	res.sendFile(debug_dir + '/html/index.html');
}));

module.exports = router;
