'use strict';

nbe.state.invert_ops = function (ops) {
	var invert_op, ops_inv, i;

	invert_op = function (op) {
		var inv;

		if ('editor_class' in op && (op.editor_class === 'title' || op.editor_class === 'publish')) {
			inv = {editor_class : op.editor_class, before : op.after, after : op.before};
		} else if (op.domop === 'insert') {
			inv = {domop : 'remove', id : op.id, before : op.before, type : op.type, val : op.val};
		} else if (op.domop === 'append') {
			inv = {domop : 'remove', id : op.id, parent : op.parent, type : op.type, val : op.val};
		} else if (op.domop === 'remove' && 'before' in op) {
			inv = {domop : 'insert', id : op.id, before : op.before, type : op.type, val : op.val};
		} else if (op.domop === 'remove' && 'parent' in op) {
			inv = {domop : 'append', id : op.id, parent : op.parent, type : op.type, val : op.val};
		} else if (op.domop === 'mutate') {
			inv = {domop : 'mutate', id : op.id, before : op.after, after : op.before};
		} else if (op.domop === 'split' || op.domop === 'merge') {
			inv = {domop : 'merge', parent : op.parent, child : op.child, point : op.point, parentval : op.parentval, childval : op.childval};
			inv.domop = op.domop === 'split' ? 'merge' : 'split';
		}

		return inv;
	};

	ops_inv = [];
	for (i = 0; i < ops.length; i++) {
		ops_inv.push(invert_op(ops[i]));
	}
	ops_inv = ops_inv.reverse();

	return ops_inv;
};
