'use strict';

nbe.paste.clipboard = function (callback) {
	var container, range, selection;

	container = document.createElement('div');
	container.contentEditable = true;
	container.className = 'clipboard';

	range = document.createRange();
	range.setStart(container, 0);
	range.setEnd(container, 0);
	selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
	document.body.appendChild(container);
	container.focus();

	setTimeout(function () {
		var insertion;

		insertion = nbe.paste.insertion(container);
		document.body.removeChild(container);
		callback(insertion);
	}, 0);
};
