'use strict';

nbe.ops.insert_before = function (editor, id, items) {
	var ops, iditem, fill, i, item, new_id;

	ops = [];
	iditem = null;

	fill = function (ops, parent_id, items) {
		var i, new_id, item;

		for (i = 0; i < items.length; i++) {
			new_id = editor.new_id();
			item = items[i];
			ops.push({domop : 'append', id : new_id, parent : parent_id, type : item.type, val : item.val});
			iditem = {id : new_id, item : item};
			fill(ops, new_id, item.children);
		}
	};

	for (i = 0; i < items.length; i++) {
		item = items[i];
		new_id = editor.new_id();
		ops.push({domop : 'insert', id : new_id, before : id, type : item.type, val : item.val});
		iditem = {id : new_id, item : item};
		fill(ops, new_id, item.children);
	}

	return ops.length > 0 ? {ops : ops, loc : nbe.location.item_to_loc(iditem)} : null;
};
