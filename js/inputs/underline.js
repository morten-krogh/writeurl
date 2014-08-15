'use strict';

nbe.inputs.underline = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('underline', title, parent, trigger, init);
	button.element.textContent = 'U';

	return button;
};
