'use strict';

nbe.site.supported_doc = function () {
	var el_message = kite.browser.dom.eac('div', document.body, 'full_screen_message');
	kite.browser.dom.ea('div', el_message).innerHTML = 'Your browser is not supported.';
};
