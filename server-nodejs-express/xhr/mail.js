'use strict';

var child_process = require('child_process');

exports.validate = function (email) {
	var pattern;

	pattern = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

	return typeof(email) === 'string' && pattern.test(email);
};

exports.sendmail = function (to, from, subject, content) {
	var sendmail_msg, sendmail_process;

	sendmail_msg = ['To: ' + to,
		'From: ' + from,
		'Subject: ' + subject,
		'',
		content].join('\n');

	sendmail_process = child_process.spawn('/usr/sbin/sendmail', ['-t']);
	sendmail_process.stdin.end(sendmail_msg);
};
