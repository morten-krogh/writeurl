'use strict';

nbe.browser.icon.network = function (parent) {
	var off_text, el_icon, el_network, el_bolt;

	off_text = 'You offline';

	el_icon = kite.browser.dom.ea('div', parent);
	el_icon.title = off_text;
	el_network = kite.browser.dom.svg(-8, -8, 48, 48, 'circle_button', el_icon);
	el_bolt = kite.browser.dom.ns('polygon', el_network, ['points', '32,0 8,16 14,20 0,32 24,20 18,16']);

	return {on : function () {
		el_bolt.setAttribute('fill', 'lightgreen');
		el_icon.title = 'You are online';
	}, off : function () {
		el_bolt.setAttribute('fill', 'red');
		el_icon.title = off_text;
	}};
};

nbe.browser.icon.saved = function (parent) {
	var on_text, el_icon, el_saved, el_cloud, el_arrow;

	on_text = 'The document is saved';

	el_icon = kite.browser.dom.ea('div', parent);
	el_icon.title = on_text;
	el_saved = kite.browser.dom.svg(-8, -8, 48, 48, 'circle_button', el_icon);
	el_cloud = kite.browser.dom.ns('path', el_saved, ['d', 'M24,4c-0.375,0-0.738,0.062-1.102,0.109C21.504,1.648,18.926,0,16,0c-2.988,0-5.568,1.664-6.941,4.102C8.707,4.055,8.357,4,8,4c-4.412,0-8,3.586-8,8s3.588,8,8,8h16c4.414,0,8-3.586,8-8S28.414,4,24,4z M24,16H8c-2.205,0-4-1.797-4-4c0-2.195,1.943-3.883,4.004-3.945C8.012,9,8.176,9.922,8.504,10.797l3.746-1.398C12.084,8.953,12,8.484,12,8c0-2.203,1.795-4,4-4c1.295,0,2.463,0.641,3.201,1.641C17.27,7.102,16,9.395,16,12h4c0-2.203,1.797-4,4-4s4,1.797,4,4S26.203,16,24,16z']);
	el_arrow = kite.browser.dom.ns('polygon', el_saved, ['points', '18.002,26 22,26 16.004,20 10.002,26 14.002,26 14.002,32 18.002,32']);

	return {on : function () {
		el_cloud.setAttribute('fill', 'lightgreen');
		el_arrow.setAttribute('fill', 'lightgreen');
		el_icon.title = on_text;
	}, off : function () {
		el_cloud.setAttribute('fill', 'red');
		el_arrow.setAttribute('fill', 'red');
		el_icon.title = 'The document is not saved';
	}};
};

nbe.browser.icon.exporticon = function (parent) {
	var el_icon, el_export, el_rect, el_arrow;

	el_icon = kite.browser.dom.ea('div', parent);
	el_icon.title = 'Export';

	el_export = kite.browser.dom.svg(-16, -11, 56, 56, 'circle_button', el_icon);

	el_rect = kite.browser.dom.ns('rect', el_export, ['y', '27.43']);
	el_rect.style.fill = '#FFFFFF';
	el_rect.setAttribute('width', 24);
	el_rect.setAttribute('height', 4.57);

	el_arrow = kite.browser.dom.ns('polygon', el_export, ['points', '16,18.285 16,0 8,0 8,18.285 4,18.285 12.012,27.43 20,18.285']);
	el_arrow.style.fill = '#FFFFFF';

	return el_icon;
};