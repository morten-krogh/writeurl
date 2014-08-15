'use strict';

nbe.location.op_remove = function (node) {
	var op, index;

	op = {domop : 'remove', id : node.id, type : node.type, val : node.val};
	index = node.parent.children.indexOf(node);
	if (index === node.parent.children.length - 1) {
		op.parent = node.parent.id;
	} else {
		op.before = node.parent.children[index + 1].id;
	}

	return op;
};
