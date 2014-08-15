'use strict';

/*
	el_text, el_title, el_panel : elements for insertion of text, title and panel. If they are null, there is no insertion.
	ids = {id, read, write}, if ids.write is null, the editor is read only, otherwise writeable.
	new_doc : is the document new
	ws_url : the rul of the web socket to the server.
	local_storage : boolean designating whether local storage is to be used.
	html_title : whtehr the title should be used as title of the full html document.
	callback : get key value pairs.
*/

nbe.site.embed = function (el_text, el_title, el_panel, ids, new_doc, ws_url, local_storage, html_title, callback) {
	var editable, dom_id_to_el, callback_status, doc;

	editable = !(ids.write === null || ids.write === '');

	dom_id_to_el = function (id) {
		return typeof(id) === 'string' ? document.getElementById(id) : id;
	};

	callback_status = function (key, value) {
		var editor, title_editor;

		callback(key, value);
		if (key === 'doc' && value === 'exist') {
			doc.comm.notify();
			editor = doc.editors.add('editor', 'text', {editable : editable});
			if (el_text) {
				dom_id_to_el(el_text).appendChild(editor.el_editor);
			}
			if (el_title) {
				title_editor = doc.editors.add('title_editor', 'title', {editable : editable, html_title : html_title});
				dom_id_to_el(el_title).appendChild(title_editor.el_editor);
			}
			if (el_panel) {
				nbe.site.panel(dom_id_to_el(el_panel), editor);
			}
		}
	};

	ids.new_doc = new_doc;
	doc = nbe.doc.create(ids, local_storage, ws_url, callback_status);

	if (doc.server_status !== 'unknown') {
		callback_status('doc', 'exist');
	}
};
