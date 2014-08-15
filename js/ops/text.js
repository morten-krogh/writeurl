'use strict';

nbe.ops.text = function (editor, start, end, insertion) {
	var node, op_mutate, ops, loc, op_start, oploc;

	node = start ? start.node : end.node;

	op_mutate = {domop : 'mutate', id : node.id, before : node.val, after : nbe.lib.clone(node.val)};
	ops = [op_mutate];
	loc = null;

	if (insertion) {
		op_mutate.after.text = node.val.text.slice(end.offset);
		if (start) {
			op_start = {domop : 'insert', id : editor.new_id(), before : node.id, type : 'text', val : nbe.lib.clone(node.val)};
			op_start.val.text = node.val.text.slice(0, start.offset);
			ops.push(op_start);
			loc = {container : op_start.id, offset : start.offset};
		}
		oploc = nbe.ops.insert_before(editor, node.id, insertion);
		if (oploc) {
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	} else {
		op_mutate.after.text = (start ?  node.val.text.slice(0, start.offset) : '') + (end ?  node.val.text.slice(end.offset) : '');
		loc = start ? {container : node.id, offset : start.offset} : null;
	}

	return {ops : ops, loc : loc};
};
