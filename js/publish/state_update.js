'use strict';

nbe.publish.state_update = function (state, ops) {
	if (ops.length > 0) {
		state.time = ops[ops.length - 1].after; 
	}
};
