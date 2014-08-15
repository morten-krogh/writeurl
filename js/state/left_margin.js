'use strict';

nbe.state.left_margin = function (direction, val) {
	var step, old_value, new_value;

	step = 20;

	old_value = val.left_margin ? val.left_margin : 0;
	if (direction === 'increment') {
		new_value = old_value + step;
	} else {
		new_value = old_value >= step ? old_value - step : old_value;
	}

	if (new_value > 0) {
		val.left_margin = new_value;
	} else {
		delete val.left_margin;
	}

	return new_value !== old_value;
};
