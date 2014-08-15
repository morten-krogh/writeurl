'use strict';

nbe.triggers.img = function (editor, value) {
	var node, op, oploc, location, start, end, val, insertion;

	if ('id' in value && value.id in editor.state.nodes) {
		node = editor.state.nodes[value.id];
		op = {domop : 'mutate', id : value.id, before : node.val, after : nbe.lib.clone(value)};
		delete op.after.id;
		oploc = {ops : [op], loc_after : editor.location};
	} else if (!editor.location) {
		oploc = null;
	} else {
		location = editor.location;

		if (location.collapsed) {
			start = end = nbe.location.loc_to_point(editor, location.start);
		} else {
			start = nbe.location.loc_to_point(editor, location.start);
			end = nbe.location.loc_to_point(editor, location.end);
		}

		val = nbe.lib.clone(value);
		insertion = [{type : 'line', val : {}, children : [{type : 'img', val : val, children : []}]}];

		oploc = nbe.ops.root(editor, start, end, insertion);
	}

	return oploc;
};
