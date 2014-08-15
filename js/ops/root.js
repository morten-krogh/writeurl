'use strict';

nbe.ops.root = function (editor, start, end, insertion) {
	var line_start, line_end, root, root_offset_start, root_offset_end, ops, loc, incorp, conc, new_line_id, parentval, childval, split_point, i, items, merge_point;

	line_start = nbe.location.line(start.node);
	line_end = nbe.location.line(end.node);

	root = line_start.parent;

	root_offset_start = root.children.indexOf(line_start);
	root_offset_end = root.children.indexOf(line_end);

	ops = [];
	loc = null;

	incorp = function (oploc) {
		if (oploc) {
			ops = ops.concat(oploc.ops);
			if (oploc.loc) {
				loc = oploc.loc;
			}
		}
	};

	conc = function (oploc) {
		if (oploc) {
			ops = ops.concat(oploc.ops);
		}
	};

	if (root_offset_start === root_offset_end) {
		if (insertion === null) {
			incorp(nbe.ops.line(editor, start, end, null));
		} else if (insertion.length === 1) {
			incorp(nbe.ops.line(editor, start, end, insertion[0].children));
		} else {
			conc(nbe.ops.line(editor, start, end, insertion[0].children));
			new_line_id = editor.new_id();
			split_point = nbe.location.split_merge_point(end);
			parentval = nbe.lib.clone(line_start.val);
			childval = nbe.state.copy_line_format(editor.format, {});
			if (start.node === line_start) {
				delete parentval.heading;
			} else {
				delete childval.heading;
			}
			ops.push({domop : 'split', parent : line_start.id, child : new_line_id, point : split_point, parentval : parentval, childval : childval});
			loc = {container : new_line_id, offset : 0};
			if (split_point) {
				incorp(nbe.ops.insert_before(editor, split_point, insertion[insertion.length - 1].children));
			} else {
				incorp(nbe.ops.append(editor, new_line_id, insertion[insertion.length - 1].children));
			}
			conc(nbe.ops.insert_before(editor, new_line_id, insertion.slice(1, insertion.length - 1)));
		}
	} else {
		for (i = root_offset_start + 1; i < root_offset_end; i++) {
			ops = ops.concat(nbe.ops.remove(root.children[i]));
		}

		if (insertion === null) {
			incorp(nbe.ops.line(editor, start, null, null));
			conc(nbe.ops.line(editor, null, end, null));
			ops.push({domop : 'merge', parent : line_start.id, child : line_end.id, point : nbe.location.split_merge_point(end), parentval : line_start.val, childval : line_end.val});
		} else if (insertion.length === 1) {
			incorp(nbe.ops.line(editor, start, null, null));
			items = insertion[0].children;
			incorp(nbe.ops.line(editor, null, end, items));
			merge_point = items.length === 0 ? nbe.location.split_merge_point(end) : items[0].id;
			ops.push({domop : 'merge', parent : line_start.id, child : line_end.id, point : merge_point, parentval : line_start.val, childval : line_end.val});
		} else {
			conc(nbe.ops.line(editor, start, null, insertion[0].children));
			conc(nbe.ops.insert_before(editor, line_end.id, insertion.slice(1, insertion.length - 1)));
			incorp(nbe.ops.line(editor, null, end, insertion[insertion.length - 1].children));
		}
	}

	return {ops : ops, loc : loc};
};
