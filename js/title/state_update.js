'use strict';

nbe.title.state_update = function (state, ops) {
	if (ops.length > 0) {
		state.value = ops[ops.length - 1].after;
	}
};
