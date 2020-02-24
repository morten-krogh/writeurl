'use strict';

nbe.site.supported_front = function () {
	const el_new_button = document.getElementById('new_doc');
    el_new_button.addEventListener('click', function (_e) {
        window.open(nbe.config.new_url(), '_blank');
    }, false);
};
