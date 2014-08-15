'use strict';

nbe.triggers.left_margin = function (editor, value) {
	var lines, ops;

	if (editor.location === null) {
		return null;
	}

	lines = nbe.location.lines(editor);

	ops = [];

	lines.forEach(function (node) {
		var margin_pre, margin_post, op;

		margin_pre = 'left_margin' in node.val ? node.val.left_margin : 0;
		margin_post = margin_pre + (value === 'increment' ? 1 : -1) * nbe.state.formats.left_margin.step;
		if (margin_post >= 0 && margin_post <= nbe.state.formats.left_margin.max) {
			op = {domop : 'mutate', id : node.id, before : node.val};
			op.after = nbe.state.set_format('left_margin', margin_post, nbe.state.copy_line_format(node.val, {}));
			ops.push(op);
		}
	});

	return {ops : ops, loc_after : editor.location};
};
