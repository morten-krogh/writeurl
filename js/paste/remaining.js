'use strict';

nbe.paste.remaining = function (state, node) {
	var format, format_remaining;

	format = state.format;

	format_remaining = nbe.lib.clone(format);

	switch (node.nodeName) {
	case 'STRONG':
	case 'strong':
	case 'B':
	case 'b':
		format_remaining.bold = 'on';
		break;
	case 'I':
	case 'i':
		format_remaining.italic = 'on';
		break;
	case 'U':
	case 'u':
		format_remaining.underline = 'on';
		break;
	}

	state.format = format_remaining;

	state = nbe.paste.traverse(state, node);

	state.format = format;

	return state;
};
