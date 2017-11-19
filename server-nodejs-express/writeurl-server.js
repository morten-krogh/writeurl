'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');
const vhost = require('vhost');
const express = require('express');
const compression = require('compression');
const yaml = require('js-yaml');
const make_store = require('./operations-router/mod_store.js');
const make_operations_handler = require('./operations-router/router.js');
const make_form_handler = require('./xhr/form_handler.js');
const make_logger = require('./logger.js');
const make_express_pino = require('express-pino-logger');

const app = express();
const server = http.createServer(app);

function  print_usage() {
	const node_cmd = process.argv[0];
	const writeurl_server = process.argv[1];
	console.error('Usage:', node_cmd, writeurl_server, 'config-path');
}

if (process.argv.length != 3) {
	print_usage();
	process.exit(1);
}

let config;

try {
	const config_path = process.argv[2];
	const config_content = fs.readFileSync(config_path);
	config = yaml.safeLoad(config_content);
} catch (e) {
	console.error('The config file does not exists or is not a valid yaml file');
	process.exit(1);
}

const app_state = {
	config: config,
	store: make_store(config.documents.path),
	logger: make_logger(config)
};

app_state.logger.info({config: config}, 'Writeurl server started');

const operations_handler = make_operations_handler(app_state);
const form_handler = make_form_handler(app_state);
const express_pino = make_express_pino(app_state.logger);

app.use(compression());
app.use(express_pino);

app.use(function (_req, res, next) {
	res.setHeader('X-Powered-By', 'Writeurl server');
	next();
});

server.on('upgrade', (req, socket, head) => {
	app_state.logger.info({req: req}, 'upgrade');
	const path = url.parse(req.url).pathname;
	if (path == '/operations') {
		operations_handler(req, socket, head);
	} else {
		socket.destroy();
	}
});

app.post('*', form_handler);


// static files

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

// static files for other virtual hosts shared with Writeurl.
for (const virtual_host of config.virtual_hosts) {
	app_state.logger.info({virtual_host: virtual_host}, 'virtual host');
	app.use(vhost(virtual_host.host, express.static(virtual_host.public, options)));
	app.use(vhost(virtual_host.host, (_req, res, _next) => {
		res.sendFile(virtual_host.public + '/index.html');
	}));
}


// static files for writeurl debug

app.use(vhost(config.debug.host, express.static(config.debug.public,  options)));
app.use(vhost(config.debug.host, (_req, res, _next) => {
	res.sendFile(config.debug.public + '/html/index.html');
}));

// publish directory
app.use('/publish', express.static(config.publish.public, options));

// release_host and any other host.
app.use(express.static(config.release.public, options));
app.use((_req, res, _next) => {
	res.sendFile(config.release.public + '/index.html');
});

server.listen(config.port, () => {
	app_state.logger.info({port: config.port}, 'Writeurl server is listening');
});
