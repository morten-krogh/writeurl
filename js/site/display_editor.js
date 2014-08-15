'use strict';

nbe.site.display_editor = function (doc) {
	var editable, editor, el_editor_container, title_editor;

	editable = doc.ids.write !== null;
	document.getElementById('frontpage').style.display = 'none';
	if (editable) {
		document.body.className = 'editor';
	} else {
		document.getElementById('home').style.display = 'none';
		document.getElementById('feedback').style.display = 'none';
		document.getElementById('faq').style.display = 'none';
		document.body.className = 'read_editor';
	}

	editor = doc.editors.add('editor', 'text', {editable : editable});
	el_editor_container = kite.browser.dom.eac('div', document.body, 'editor_container');

	if (editable) {
		nbe.site.panel(document.getElementById('panel'), editor);
	}

	title_editor = doc.editors.add('title_editor', 'title', {editable : editable, html_title : true});
	if (editable) {
		kite.browser.dom.eac('div', el_editor_container, 'wu-title-container').appendChild(title_editor.el_editor);
	}
	nbe.dynamic.get_title = title_editor.get_value;

	nbe.dynamic.publish = doc.editors.add('publish_editor', 'publish', {});

	el_editor_container.appendChild(editor.el_editor);

	if (doc.ids.prefix === 'scroller' && doc.ids.write === null) {
		nbe.site.scroller(editor);
	}
};
