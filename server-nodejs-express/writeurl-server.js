const express = require('express');
const vhost = require('vhost');
const static_router = require('./static-router.js');

const app = express();

const port = 9000;

app.use(static_router);

app.listen(port, () => {
    console.log("Writeurl server is listening on port ", port);
});
