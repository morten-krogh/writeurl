'use strict';

nbe.doc.state_update = function (state, operations) {
	var ops;

	ops = {
		text : [],
		title : [],
		publish : []
	};

	operations.forEach(function (operation) {
		operation.ops.forEach(function (op) {
			var editor_class;

			editor_class = 'editor_class' in op ? op.editor_class : 'text';
			ops[editor_class].push(op);
		});
	});

	nbe.state.update(null, state.text, null, ops.text);
	nbe.title.state_update(state.title, ops.title);
	nbe.publish.state_update(state.publish, ops.publish);
};
