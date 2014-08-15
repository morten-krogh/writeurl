'use strict';

nbe.site.supported_front = function (supported) {
	var el_new_button;

	el_new_button = document.getElementById('new_doc');

	if (supported) {
		el_new_button.addEventListener('click', function (e) {
			window.open(nbe.config.new_url(), '_blank');
		}, false);
	} else {
		el_new_button.innerHTML = 'Your browser is not supported.';
		el_new_button.className = 'unsupported';
	}
};
