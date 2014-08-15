'use strict';

nbe.location.in_link = function (point) {
	var index;

	if (point.node.parent.type !== 'link') {
		return false;
	}

	index = point.node.parent.children.indexOf(point.node);
	if (index === point.node.parent.children.length - 1) {
		if (point.node.type === 'text') {
			return nbe.location.in_text(point);
		} else {
			return false;
		}
	} else {
		return true;
	}
};
