'use strict';

nbe.triggers.cut = function (editor) {
	editor.mutation.disconnect();
	setTimeout(function () {
		nbe.state.clean(editor);
		if (!editor.location.collapsed) {
			editor.trigger('delete', null);
		}
		editor.mutation.observe();
	}, 0);
};
