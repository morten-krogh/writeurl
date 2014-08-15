'use strict';

nbe.site.loading = function () {
	var el_message, status, on, off;

	el_message = document.createElement('div');
	el_message.className = 'full_screen_message';
	kite.browser.dom.ea('div', el_message).textContent = 'We are trying to connect to the server.';

	status = 'init';

	on = function () {
		setTimeout(function () {
			if (status === 'init') {
				status = 'on';
				document.body.appendChild(el_message);
			}
		}, 200);
	};

	off = function () {
		if (status === 'on') {
			document.body.removeChild(el_message);
		}
		status = 'off';
	};

	return {on : on, off : off};
};
