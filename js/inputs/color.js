'use strict';

nbe.inputs.color = function (trigger, title, parent, init) {
	var button, value, element, color_menu, set_value;

	button = nbe.inputs.input('color', trigger);

	value = null;
	element = kite.browser.dom.eac('button', parent, 'wu-icon off');
	element.title = title;
	element.textContent = 'A';

	color_menu = nbe.inputs.color_menu(function (color) {
		button.trigger(color);
	}, 'rgb(0, 0, 0)', 'Black', [
		'rgb(255, 200, 200)', 'rgb(255, 200, 75)', 'rgb(255, 255, 200)', 'rgb(200, 255, 0)', 'rgb(200, 255, 200)', 'rgb(150, 255, 225)', 'rgb(200, 255, 255)', 'rgb(135, 240, 255)', 'rgb(100, 175, 255)', 'rgb(235, 120, 255)', 'rgb(255, 100, 200)', 'rgb(224,224,224)',
		'rgb(255, 150, 150)', 'rgb(255, 175, 50)', 'rgb(255, 255, 150)', 'rgb(175, 255, 0)', 'rgb(150, 255, 150)', 'rgb(100, 255, 200)', 'rgb(150, 255, 255)', 'rgb(80, 235, 255)', 'rgb(0, 150, 255)', 'rgb(200, 80, 255)', 'rgb(237, 0, 175)', 'rgb(192,192,192)',
		'rgb(255, 100, 100)', 'rgb(255, 150, 25)', 'rgb(255, 255, 100)', 'rgb(150, 255, 0)', 'rgb(100, 255, 100)', 'rgb(50, 255, 175)', 'rgb(100, 255, 255)', 'rgb(50, 220, 255)', 'rgb(0, 100, 255)', 'rgb(175, 40, 255)', 'rgb(218, 0, 150)', 'rgb(160,160,160)',
		'rgb(255, 0, 0)', 'rgb(255, 125, 0)', 'rgb(255, 255, 0)', 'rgb(125, 255, 0)', 'rgb(0, 255, 0)', 'rgb(0, 255, 150)', 'rgb(0, 255, 255)', 'rgb(0, 200, 255)', 'rgb(0, 0, 255)', 'rgb(150, 0, 255)', 'rgb(200, 0, 125)', 'rgb(128,128,128)',
		'rgb(200 ,0, 0)', 'rgb(200, 100, 0)', 'rgb(200, 200, 0)', 'rgb(100, 200, 0)', 'rgb(0, 200, 0)', 'rgb(0, 200, 125)', 'rgb(0, 200, 200)', 'rgb(0, 170, 225)', 'rgb(0, 0, 200)', 'rgb(125, 0, 200)', 'rgb(170, 0, 105)', 'rgb(96,96,96)',
		'rgb(150, 0, 0)', 'rgb(150, 75, 0)', 'rgb(150, 150, 0)', 'rgb(75, 150, 0)', 'rgb(0, 150, 0)', 'rgb(0, 150, 100)', 'rgb(0, 150, 150)', 'rgb(0, 140, 195)', 'rgb(0, 0, 150)', 'rgb(100, 0, 150)', 'rgb(140, 0, 85)', 'rgb(64,64,64)',
		'rgb(100, 0, 0)', 'rgb(100, 50, 0)', 'rgb(100, 100, 0)', 'rgb(50, 100, 0)', 'rgb(0, 100, 0)', 'rgb(0, 100, 75)', 'rgb(0, 100, 100)', 'rgb(0, 110, 165)', 'rgb(0, 0, 100)', 'rgb(75, 0, 100)', 'rgb(110, 0, 65)', 'rgb(32,32,32)'
	], init);

	set_value = function (new_value) {
		if (value !== new_value) {
			value = new_value;
			element.style.color = value;
		}
	};

	set_value(init);

	element.addEventListener('click', function (e) {
		e.stopPropagation();
		if (color_menu.is_open()) {
			color_menu.remove();
		} else {
			color_menu.display(parent, element, value);
		}
	}, false);

	button.element = element;
	button.set_value = set_value;

	return button;
};
