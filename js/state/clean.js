'use strict';

nbe.state.clean = function (editor) {
	nbe.state.init(editor, editor.state);
	nbe.location.set(editor, editor.location);
};
