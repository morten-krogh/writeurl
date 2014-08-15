'use strict';

nbe.lib.share_emails = function (text) {
	var emails, valid, invalid;

	emails = text.split(/[ ,\n]/).filter(function (email) {
		return email !== '';
	});

	valid = [];
	invalid = [];

	emails.forEach(function (email) {
		if (nbe.lib.valid_email(email)) {
			valid.push(email);
		} else {
			invalid.push(email);
		}
	});

	return {valid : valid, invalid : invalid};
};
