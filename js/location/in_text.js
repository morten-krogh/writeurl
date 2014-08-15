'use strict';

nbe.location.in_text = function (point) {
	return point && point.node.type === 'text' && point.offset < point.node.val.text.length && point.offset > 0;
};
