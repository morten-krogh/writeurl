'use strict';

nbe.inputs.undo = function (trigger, parent) {
	var el_container, input, undo, redo;

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('undo', trigger);

	undo = nbe.inputs.button('undo', 'Undo', el_container, function () {
		input.trigger('undo');
	}, 'off');
	kite.browser.dom.ea('img', undo.element).src = '/img/undo.svg';
	redo = nbe.inputs.button('redo', 'Redo', el_container, function () {
		input.trigger('redo');
	}, 'off');
	kite.browser.dom.ea('img', redo.element).src = '/img/redo.svg';

	input.element = el_container;
	input.set_value = function (value) {
		undo.set_value(value.undo ? 'on' : 'off');
		redo.set_value(value.redo ? 'on' : 'off');
	};

	return input;
};
