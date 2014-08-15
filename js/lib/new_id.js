'use strict';

nbe.lib.new_id = function () {
	var stem, counter;

	stem = nbe.lib.rnd_string(12);
	counter = 0;

	return function () {
		var id;

		id = stem + counter;
		counter++;

		return id;
	};
};
