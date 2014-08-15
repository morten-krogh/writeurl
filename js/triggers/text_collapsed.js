'use strict';

nbe.triggers.text_collapsed = function (editor, text) {
	var max_text_length, start, node, op, val, insertion;

	max_text_length = 10;

	start = nbe.location.loc_to_point(editor, editor.location.start);
	node = start.node;

	if (node.type === 'text' && node.val.text.length < max_text_length && (start.offset < node.val.text.length || node.parent.type === 'line') && nbe.state.cmp_text_format(node.val, editor.format)) {
		op = {domop : 'mutate', id : node.id, before : node.val, after : nbe.state.copy_text_format(node.val, {})};
		op.after.text = node.val.text.slice(0, start.offset) + text + node.val.text.slice(start.offset);

		return {ops : [op], loc : {container : node.id, offset : start.offset + text.length}};
	} else {
		val =  nbe.state.copy_text_format(editor.format, {});
		val.text = text;
		insertion = [{type : 'line', val : {}, children : [{type : 'text', val : val, children : []}]}];

		return nbe.ops.root(editor, start, start, insertion);
	}
};
