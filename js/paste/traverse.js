'use strict';

nbe.paste.traverse = function (state, node) {
	var i, child;

	for (i = 0; i < node.childNodes.length; i++) {
		child = node.childNodes[i];
		switch (child.nodeName) {
		case 'DIV':
		case 'div':
		case 'P':
		case 'p':
		case 'H1':
		case 'h1':
		case 'H2':
		case 'h2':
		case 'H3':
		case 'h3':
		case 'H4':
		case 'h4':
		case 'H5':
		case 'h5':
		case 'H6':
		case 'h6':
			state = nbe.paste.div(state, child);
			break;
		case 'SPAN':
		case 'span':
			state = nbe.paste.span(state, child);
			break;
		case 'A':
		case 'a':
			state = nbe.paste.link(state, child);
			break;
		case 'IMG':
		case 'img':
			state = nbe.paste.img(state, child);
			break;
		case '#text':
		case '#TEXT':
			state = nbe.paste.text(state, child);
			break;
		case 'BR':
		case 'br':
			state = nbe.paste.br(state, child);
			break;
		case 'STYLE':
		case 'style':
			break;
		default:
			state = nbe.paste.remaining(state, child);
			break;
		}
	}

	return state;
};
