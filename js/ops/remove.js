'use strict';

nbe.ops.remove = function (node) {
	var before_parent, remove;

	before_parent = function (node, op) {
		var index;

		index = node.parent.children.indexOf(node);
		if (index === node.parent.children.length - 1) {
			op.parent = node.parent.id;
		} else {
			op.before = node.parent.children[index + 1].id;
		}
		return op;
	};

	remove = function (node, ops) {
		var i;

		for (i = 0; i < node.children.length; i++) {
			remove(node.children[i], ops);
		}
		ops.push(before_parent(node, {domop : 'remove', id : node.id, type : node.type, val : node.val}));

		return ops;
	};

	return remove(node, []);
};
