'use strict';

nbe.inputs.vertical_align = function (trigger, parent, init) {
	var el_container, input, button_trigger, sup, sub;

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('vertical_align', trigger);

	button_trigger = function (type, value) {
		if (value === 'on') {
			input.trigger(type);
		} else {
			input.trigger('baseline');
		}
	};

	sup = nbe.inputs.button('super', 'Superscript', el_container, button_trigger, 'off');
	sup.element.innerHTML = 'A<span>2</span>';
	sub = nbe.inputs.button('sub', 'Subscript', el_container, button_trigger, 'off');
	sub.element.innerHTML = 'A<span>2</span>';

	input.element = el_container;
	input.set_value = function (value) {
		if (value === 'super') {
			sup.set_value('on');
			sub.set_value('off');
		} else if (value === 'sub') {
			sub.set_value('on');
			sup.set_value('off');
		} else {
			sup.set_value('off');
			sub.set_value('off');
		}
	};

	input.set_value(init);

	return input;
};
