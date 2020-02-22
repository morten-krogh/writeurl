'use strict';

nbe.site.display_export = function () {
	var export_window, el_export, el_section, el_word, el_html, el_close;

	export_window = new kite.browser.ui.Window();
	export_window.set_title('Export');

	el_export = kite.browser.dom.ec('div', 'nbe_window share');
	kite.browser.dom.ea('img', el_export).src = '/img/export.svg';
	kite.browser.dom.ea('h1', el_export).textContent = 'Export';
	kite.browser.dom.ea('p', el_export).textContent = 'Please select format by clicking one of the buttons and the file will be downloaded to your device.';

	el_section = kite.browser.dom.ea('div', el_export);
	kite.browser.dom.ea('p', el_section).textContent = 'Please note that export currently only works in Google Chrome.';

	el_word = kite.browser.dom.ea('button', el_section);
	el_word.textContent = 'Word';
	el_word.addEventListener('click', function (_e) {
		nbe.lib.save_as(new Blob([nbe.doc.html(nbe.dynamic.doc)], {type : 'application/vnd.ms-word'}), nbe.dynamic.get_title() + '.doc');
	}, false);

	el_html = kite.browser.dom.ea('button', el_section);
	el_html.textContent = 'HTML';
	el_html.addEventListener('click', function (_e) {
		nbe.lib.save_as(new Blob([nbe.doc.html(nbe.dynamic.doc)], {type : 'text/html'}), nbe.dynamic.get_title() + '.html');
	}, false);

	kite.browser.dom.ea('p', el_export);

	el_close = kite.browser.dom.ea('button', el_export);
	el_close.textContent = 'Close';
	el_close.addEventListener('click', function (_e) {
		export_window.close();
	}, false);

	export_window.set_content(el_export);

	return {display : function () {
		export_window.open();
	}};
};
