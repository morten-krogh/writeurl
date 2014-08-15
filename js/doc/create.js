'use strict';

nbe.doc.create = function (ids, use_local_storage, server_url, callback_status) {
	var doc;

	doc = {};
	doc.ids = ids;
	doc.server_status = 'unknown';
	doc.state = nbe.doc.state_init();
	doc.n_operations_server = 0;
	doc.operations_local = [];
	doc.local_storage = nbe.doc.local_storage(doc, use_local_storage);
	doc.local_storage.read();

	if (doc.server_status === 'unknown' && ids.new_doc) {
		doc.server_status = 'new';
		doc.local_storage.write();
	}
	delete ids.new_doc;

	doc.editors = nbe.doc.editors(doc);

	doc.new_id = nbe.lib.new_id();

	doc.add_ops = function (editor_id, ops) {
		var operation;

		operation = {id : doc.new_id(), ops : ops};
		doc.editors.notify(ops, editor_id, true);
		doc.operations_local.push(operation);
		doc.comm.notify();
		doc.local_storage.write();
	};

	doc.comm = nbe.doc.comm(doc, server_url, callback_status);

	callback_status('nunsaved', doc.operations_local.length);

	return doc;
};
