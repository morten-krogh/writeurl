'use strict';

nbe.state.invert_oploc = function (oploc) {
	var oploc_inv;

	oploc_inv = {
		ops : nbe.state.invert_ops(oploc.ops),
		loc_before : oploc.loc_after,
		loc_after : oploc.loc_before
	};

	return oploc_inv;
};
