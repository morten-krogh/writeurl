'use strict';

nbe.inputs.strikethrough = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('strikethrough', title, parent, trigger, init);
	button.element.textContent = 'S';

	return button;
};
