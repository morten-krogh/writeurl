'use strict';

nbe.notify.left_margin = function (editor, _format) {
	var dec, inc, lines;

	dec = 'off';
	inc = 'off';

	lines = nbe.location.lines(editor);
	lines.forEach(function (line) {
		var margin;

		margin = 'left_margin' in line.val ? line.val.left_margin : 0;
		inc = margin < nbe.state.formats.left_margin.max ? 'on' : inc;
		dec = margin > 0 ? 'on' : dec;
	});

	return dec + ':' + inc;
};
