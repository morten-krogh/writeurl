'use strict';

nbe.lib.xhr = function (method, url, headers, body, timeout, callback_200, callback_other, callback_error) {
	var request, prop;

	request = new XMLHttpRequest();

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status === 200) {
				callback_200(request.responseText);
			} else {
				callback_other();
			}
		}
	};

	request.onerror = function () {
		callback_error();
	};

	request.ontimeout = function () {
		callback_error();
	};

	request.open(method, url, true);
	request.timeout = timeout;

	for (prop in headers) {
		if (headers.hasOwnProperty(prop)) {
			request.setRequestHeader(prop, headers[prop]);
		}
	}

	request.send(body);
};
