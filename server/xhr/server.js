'use strict';

var http = require('http');
var buffer = require('./buffer.js');
var mail = require('./mail.js');
var response = require('./response.js');
var mod_publish = require('./mod_publish.js');

var host = null;
var port = 8050;

var response_header = {
	'Access-Control-Allow-Origin' : '*',
	'Access-Control-Allow-Methods' : 'POST, OPTIONS',
	'Access-Control-Allow-Headers' : 'Content-Type',
	'Access-Control-Max-Age' : '30'
};

var parse_form = function (req, callback) {
	buffer.read_stream_to_buffer(req, function (body) {
		var form;

		try {
			form = JSON.parse(body);
		} catch (err) {
			form = null;
		}
		callback(form);
	});
};

var are_strings = function (obj, keys) {
	var i;

	for (i = 0; i < keys.length; i++) {
		if (typeof(obj[keys[i]]) !== 'string') {
			return false;
		}
	}

	return true;
};

var validate = function (form) {
	var key;

	if (form === null || typeof(form) !== 'object') {
		return false;
	}

	for (key in form) {
		if (form.hasOwnProperty(key)) {
			if (typeof(form[key]) !== 'string') {
				return false;
			}
		}
	}

	return 'type' in form;
};

var make_feedback =  function (form) {
	var content;

	if (are_strings(form, ['name', 'mail', 'message'])) {
		content = 'Name: ' + form.name + '\nMail: ' + form.mail + '\nMessage: ' + form.message;
	} else {
		content = 'Feedback in wrong format';
	}

	return {
		to : 'info@writeurl.com',
		from : 'info@writeurl.com',
		subject : 'editor feedback',
		content : content
	};
};

var make_share = function (form) {
	var content, share;

	if (are_strings(form, ['access', 'url', 'message', 'title'])) {
		content = form.message + '\n\n' + 'url to ' + form.access + 'access to the document, ' + form.title + ' : ' + form.url;
	} else {
		content = 'share is in wrong format';
	}

	share = {
		from : 'info@writeurl.com',
		subject : 'Invitation to the writeurl document, ' + form.title,
		content : content
	};

	return share;
};

var init = function () {
	http.createServer(function (req, res) {
		if (req.method !== 'POST') {
			response.body(req, res, 200, response_header, '', false);
		} else if (req.method === 'POST') {
			parse_form(req, function (form) {
				var feedback, share, msg;

				if (typeof(form) === 'object' && form.type === 'feedback') {
					feedback = make_feedback(form);
					mail.sendmail(feedback.to, feedback.from, feedback.subject, feedback.content);
					response.body(req, res, 200, response_header, JSON.stringify('feedback received'), false);
				} else if (typeof(form) === 'object' && form.type === 'share' && Object.prototype.toString.call(form.emails) === '[object Array]') {
					share = make_share(form);
					form.emails.forEach(function (email) {
						if (mail.validate(email)) {
							mail.sendmail(email, share.from, share.subject, share.content);
						}
					});
					response.body(req, res, 200, response_header, JSON.stringify('email sent'), false);
				} else if (typeof(form) === 'object' && form.type === 'publish') {
					msg = mod_publish.publish(form);
					response.body(req, res, 200, response_header, JSON.stringify(msg), false);
				} else {
					response.body(req, res, 200, response_header, JSON.stringify('invalid format'), false);
				}
			});
		}
	}).listen(port, host);

        console.log('mailform and publish server running at ' + host + ':' + port);
};

init();
