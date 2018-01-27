'use strict';

/*
	Helper function to call embed.
	It is used for read only documents.

	el : an element where title and text is inserted. el can be an id of an element.
	ids : an object with id and the read password.
*/

nbe.site.embed_read = function (el, ids) {
	var ws_url, el_title, el_text;

	el = typeof(el) === 'string' ? document.getElementById(el) : el;

	ws_url = 'ws://www.writeurl.com/operations';

	ids.write = null;

	el_title = document.createElement('div');
	el.appendChild(el_title);
	el_text = document.createElement('div');
	el.appendChild(el_text);

	nbe.site.embed(el_text, el_title, null, ids, false, ws_url, true, false, function () {});
};
