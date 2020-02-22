import { rnd_string } from './rnd_string.js';

nbe.lib.new_id = function () {
	var stem, counter;

	stem = rnd_string(12);
	counter = 0;

	return function () {
		var id;

		id = stem + counter;
		counter++;

		return id;
	};
};
