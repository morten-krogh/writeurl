'use strict';

var counter = 0;

exports.get = function () {
	var id;

	id = '' + counter;
	counter++;

	return id;
};
