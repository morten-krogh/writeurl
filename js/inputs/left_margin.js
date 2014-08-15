'use strict';

nbe.inputs.left_margin = function (trigger, parent, init) {
	var current_value, el_container, input, decrease, increase;

	current_value = ['off', 'on'];

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('left_margin', trigger);

	decrease = nbe.inputs.button('decrease_indent', 'Decrease indentation', parent, function () {
		if (current_value[0] === 'on') {
			input.trigger('decrement');
		}
	}, 'off');
	decrease.element.textContent = '<';
	increase = nbe.inputs.button('increase_indent', 'Increase indentation', parent, function () {
		if (current_value[1] === 'on') {
			input.trigger('increment');
		}
	}, 'off');
	increase.element.textContent = '>';

	input.element = el_container;
	input.set_value = function (value) {
		current_value = value.split(':');
		decrease.set_value(current_value[0]);
		increase.set_value(current_value[1]);
	};

	input.set_value(init);

	return input;
};
