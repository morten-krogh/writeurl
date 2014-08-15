'use strict';

nbe.location.item_to_loc = function (iditem) {
	var offset, item;

	item = iditem.item;
	offset = item.type === 'text' ? item.val.text.length : 1;

	return {container : iditem.id, offset : offset};
};
