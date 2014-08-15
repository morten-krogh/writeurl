'use strict';

nbe.inputs.bold = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('bold', title, parent, trigger, init);
	button.element.textContent = 'B';

	return button;
};
