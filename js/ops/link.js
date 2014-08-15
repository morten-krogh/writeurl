'use strict';

nbe.ops.link = function (editor, start, end, insertion) {
	var prune, node, link_offset_start, end_of_end, link_offset_end, ops, loc, oploc, i;

	prune = function (ins) {
		var out, i;

		out = [];
		for (i = 0; i < ins.length; i++) {
			if (ins[i].type !== 'link') {
				out.push(ins[i]);
			} else {
				out = out.concat(ins[i].children);
			}
		}

		return out;
	};

	if (insertion) {
		insertion = prune(insertion);
	}

	node = start ? start.node.parent : end.node.parent;

	link_offset_start = start ? node.children.indexOf(start.node) + 1 : 0;

	if (end) {
		end_of_end = !nbe.location.in_text(end);
		link_offset_end = node.children.indexOf(end.node) + (end_of_end ? 1 : 0);
	} else {
		end_of_end = true;
		link_offset_end = node.children.length;
	}

	ops = [];
	loc = null;

	if (link_offset_end < link_offset_start) {
		oploc = nbe.ops.text(editor, start, end, insertion);
		ops = ops.concat(oploc.ops);
		loc = oploc.loc;
	} else {
		if (nbe.location.in_text(start)) {
			oploc = nbe.ops.text(editor, start, null, null);
			ops = ops.concat(oploc.ops);
			loc = oploc.loc;
		} else {
			loc = start ? {container : start.node.id, offset : start.offset} : null;
		}

		for (i = link_offset_start; i < link_offset_end; i++) {
			ops = ops.concat(nbe.ops.remove(node.children[i]));
		}

		if (end_of_end) {
			if (insertion) {
				oploc = nbe.ops.insert_after(editor, end.node.id, insertion);
				if (oploc) {
					ops = ops.concat(oploc.ops);
					if (oploc.loc) {
						loc = oploc.loc;
					}
				}
			}
		} else {
			oploc = nbe.ops.text(editor, null, end, insertion);
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	}

	return {ops : ops, loc : loc};
};
