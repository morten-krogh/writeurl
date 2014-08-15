'use strict';

nbe.lib.clone = function (val) {
	return JSON.parse(JSON.stringify(val));
};
