'use strict';

/*
	Helper function to call embed.
	It is used for write documents.

	el : an element where panel, title and text is inserted. el can be an id of an element.
	ids : an object with id, the read password, and write password.
*/

nbe.site.embed_write = function (el, ids) {
	var ws_url, el_panel, el_title, el_text;

	el = typeof(el) === 'string' ? document.getElementById(el) : el;

	ws_url = 'ws://www.writeurl.com/operations';

	el_panel = document.createElement('div');
	el.appendChild(el_panel);
	el_title = document.createElement('div');
	el.appendChild(el_title);
	el_text = document.createElement('div');
	el.appendChild(el_text);

	console.log(ids);
	nbe.site.embed(el_text, el_title, el_panel, ids, false, ws_url, true, false, function () {});
};
