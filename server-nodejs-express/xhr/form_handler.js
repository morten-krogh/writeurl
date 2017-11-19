'use strict';

const buffer = require('./buffer.js');
const mail = require('./mail.js');
const response = require('./response.js');
const publish = require('./publish.js');

const response_header = {
	'Access-Control-Allow-Origin' : '*',
	'Access-Control-Allow-Methods' : 'POST, OPTIONS',
	'Access-Control-Allow-Headers' : 'Content-Type',
	'Access-Control-Max-Age' : '30'
};

const parse_form = function (req, callback) {
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

const are_strings = function (obj, keys) {
	var i;

	for (i = 0; i < keys.length; i++) {
		if (typeof(obj[keys[i]]) !== 'string') {
			return false;
		}
	}

	return true;
};

const make_feedback =  function (form) {
	let content;

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
	let content;

	if (are_strings(form, ['access', 'url', 'message', 'title'])) {
		content = form.message + '\n\n' + 'url to ' + form.access + 'access to the document, ' + form.title + ' : ' + form.url;
	} else {
		content = 'share is in wrong format';
	}

	return {
		from : 'info@writeurl.com',
		subject : 'Invitation to the writeurl document, ' + form.title,
		content : content
	};
};

function form_handler(app_state, req, res, _next) {

	parse_form(req, function (form) {
		var feedback, share, msg;

		if (typeof(form) === 'object' && form.type === 'feedback') {
			feedback = make_feedback(form);
			app_state.logger.info({feedback: feedback}, 'feedback');
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
			msg = publish(app_state, form);
			response.body(req, res, 200, response_header, JSON.stringify(msg), false);
		} else {
			response.body(req, res, 200, response_header, JSON.stringify('invalid format'), false);
		}
	});
}

function make_form_handler(app_state) {
	function handler(req ,res, next) {
		form_handler(app_state, req ,res, next);
	}

	return handler;

}

module.exports = make_form_handler;
