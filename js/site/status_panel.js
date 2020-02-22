'use strict';

nbe.site.status_panel = function (ids) {
	var element, share, el_share_button, display_export, el_export_button, network, saved, set_status, display;

	element = kite.browser.dom.ec('div', 'status_panel');

	share = nbe.site.display_share(ids);

	el_share_button = kite.browser.dom.eac('button', element, 'circle_button');
	el_share_button.textContent = 'Share';
	el_share_button.addEventListener('click', function (_e) {
		share.display(ids);
	}, false);

	display_export = nbe.site.display_export(ids);

	el_export_button = nbe.browser.icon.exporticon(element);
	el_export_button.addEventListener('click', function (_e) {
		display_export.display();
	}, false);

	network = nbe.browser.icon.network(element);
	saved = nbe.browser.icon.saved(element);

	set_status = function (key, value) {
		if (key === 'network') {
			if (value === 'connected') {
				//el_network.title = 'You are online';
				network.on();
			} else {
				//el_network.title = 'You are offline';
				network.off();
			}
		} else if (key === 'nunsaved') {
			if (value > 0) {
				//el_saved.title = 'You have unsaved changes';
				saved.off();
			} else {
				//el_saved.title = 'You are offline';
				saved.on();
			}
		}
	};

	display = function (el_panel_container) {
		el_panel_container.appendChild(element);
	};

	return {set_status : set_status, display : display};
};
