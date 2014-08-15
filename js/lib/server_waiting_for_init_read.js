'use strict';

nbe.lib.server_waiting_for_init_read = function () {
	var element, stop;

	element = document.createTextNode('The document is loading');

	stop = function () {

	};

	return {element : element, stop : stop};
};
