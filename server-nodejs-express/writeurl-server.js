'use strict';

const http = require('http');
const url = require('url');
const express = require('express');
const static_router = require('./static-router.js');
const operations_handler = require('./operations-router/router.js')();

const app = express();
const server = http.createServer(app);


const router = express.Router();


//router.ws('/', function(ws, req) {
//	ws.on('message', function(msg) {
//		ws.send(msg);
//	});
//});
//




//const operations_router = require('./operations-router/router.js')(server);

const port = 9000;

server.on('upgrade', (req, socket, head) => {
	const path = url.parse(req.url).pathname;
	if (path == '/operations') {
		operations_handler(req, socket, head);
	} else {
		sockt.destroy();
	}

	console.log('upgrade, path = ', path);

});


//app.use('/operations', operations_router);
app.use(static_router);



server.listen(port, () => {
	console.log('Writeurl server is listening on port: ', port);
});
