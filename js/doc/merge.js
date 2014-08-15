'use strict';

nbe.doc.merge = function (doc, operations, noperations) {
	var ncommon, operations_server_new, operation_ids, operations_local_new, ops;

	operations = operations.slice(doc.n_operations_server - noperations);

	if (operations.length !== 0) {

		doc.n_operations_server = doc.n_operations_server + operations.length;
		nbe.doc.state_update(doc.state, operations);

		for (ncommon = 0; ncommon < doc.operations_local.length && ncommon < operations.length; ncommon++) {
			if (operations[ncommon].id !== doc.operations_local[ncommon].id) {
				break;
			}
		}

		doc.operations_local = doc.operations_local.slice(ncommon);
		operations_server_new = operations.slice(ncommon);

		if (operations_server_new.length !== 0) {

			operation_ids = {};
			operations_server_new.forEach(function (operation) {
				operation_ids[operation.id] = true;
			});

			operations_local_new = doc.operations_local.filter(function (operation) {
				return !(operation.id in operation_ids);
			});

			ops = [];
			doc.operations_local.forEach(function (operation) {
				ops = ops.concat(operation.ops);
			});
			ops = nbe.state.invert_ops(ops);

			operations_server_new.concat(operations_local_new).forEach(function (operation) {
				ops = ops.concat(operation.ops);
			});

			doc.editors.notify(ops, null, true);
		}
	}
};
