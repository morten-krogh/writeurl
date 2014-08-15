'use strict';

nbe.inputs.italic = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('italic', title, parent, trigger, init);
	button.element.textContent = 'I';

	return button;
};
