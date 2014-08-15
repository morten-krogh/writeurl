'use strict';

nbe.inputs.button = function (type, title, parent, trigger, init) {
	var input, value, element, set_value;

	input = nbe.inputs.input(type, trigger);

	value = null;
	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-' + type + ' off');
	element.title = title;

	set_value = function (new_value) {
		if (value !== new_value) {
			value = new_value;
			element.className = 'wu-icon wu-icon-' + type + ' ' + value;
		}
	};

	set_value(init);

	element.addEventListener('click', function () {
		input.trigger(value === 'off' ? 'on' : 'off');
	});

	input.element = element;
	input.set_value = set_value;

	return input;
};
