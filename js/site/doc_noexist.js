'use strict';

nbe.site.doc_noexist = function (doc) {
	var el_message;

	el_message = kite.browser.dom.eac('div', document.body, 'full_screen_message');
	kite.browser.dom.ea('div', el_message).textContent = 'The document is not known to the server.';
};
