'use strict';

nbe.location.get_format = function (editor) {
	nbe.location.get(editor);
	nbe.location.format(editor);
};
