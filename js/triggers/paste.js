'use strict';

nbe.triggers.paste = function (editor) {
	var callback;

	callback = function (insertion) {
		editor.trigger('insertion', insertion);
	};

	nbe.paste.clipboard(callback);
};
