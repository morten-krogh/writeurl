'use strict';

nbe.triggers.link = function (editor, value) {
	var node, op, oploc, location, start, end, link, insertion;

	if ('id' in value && value.id in editor.state.nodes) {
		node = editor.state.nodes[value.id];
		op = {domop : 'mutate', id : value.id, before : node.val, after : {href : value.href}};
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

		link = {type : 'link', val : {href : value.href}, children : value.insertion};
		insertion = [{type : 'line', val : {}, children : [link]}];

		oploc = nbe.ops.root(editor, start, end, insertion);
	}

	return oploc;
};
