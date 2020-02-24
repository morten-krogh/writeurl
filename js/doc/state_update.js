'use strict';

nbe.doc.state_update = function (state, operations) {
	const ops = {
		text : [],
		title : [],
		publish : []
	};

    for (const operation of operations) {
        for (const op of operation.ops) {
			const editor_class = 'editor_class' in op ? op.editor_class : 'text';
			ops[editor_class].push(op);
		}
	}

	nbe.state.update(null, state.text, null, ops.text);
    state.title.update(ops.title);
    state.publish.update(ops.publish);
};
