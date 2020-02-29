nbe.paste = {};

nbe.paste.br = function (state, _node) {
	const line = {type : 'line', val : {}, children : []};
	state.root.push(line);
	state.line = line;
	return state;
};

nbe.paste.clipboard = function (callback) {
	const container = document.createElement('div');
	container.contentEditable = true;
	container.className = 'clipboard';

	const range = document.createRange();
	range.setStart(container, 0);
	range.setEnd(container, 0);
	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
	document.body.appendChild(container);
	container.focus();

	setTimeout(function () {
		const insertion = nbe.paste.insertion(container);
		document.body.removeChild(container);
		callback(insertion);
	}, 0);
};

nbe.paste.div = function (state, node) {
	const format = state.format;

	const format_div = nbe.lib.clone(format);

	const add_class = function (key, names) {
		for (let i = 0; i < names.length; i++) {
			if (node.classList.contains(names[i])) {
				format_div[key] = names[i];
				return null;
			}
		}
	};

	add_class('text_align', ['center', 'right', 'justify']);
	add_class('heading', ['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6']);
	add_class('list', ['disc', 'lower-alpha', 'lower-roman', 'square', 'upper-alpha', 'upper-roman', 'ordered']);
	add_class('line_spacing', ['line_spacing_05', 'line_spacing_06', 'line_spacing_07', 'line_spacing_08', 'line_spacing_09', 'line_spacing_10', 'line_spacing_11', 'line_spacing_12', 'line_spacing_13', 'line_spacing_14', 'line_spacing_15', 'line_spacing_16', 'line_spacing_17', 'line_spacing_18', 'line_spacing_19', 'line_spacing_20']);

	if (node.style.marginLeft) {
		const left_margin = Number(node.style.marginLeft.slice(0, node.style.marginLeft.length - 2));
		if (left_margin >= 0) {
			format_div.left_margin = left_margin;
		}
	}

	if (node.style.fontSize) {
		format_div.font_size = node.style.fontSize;
	}

	switch (node.align) {
	case 'LEFT':
	case 'left':
		delete format_div.text_align;
		break;
	case 'RIGHT':
	case 'right':
		format_div.text_align = 'right';
		break;
	case 'CENTER':
	case 'center':
		format_div.text_align = 'center';
		break;
	case 'JUSTIFY':
	case 'justify':
		format_div.text_align = 'justify';
		break;
	}

	switch (node.nodeName) {
	case 'H1':
	case 'h1':
		format_div.heading = 'heading1';
		break;
	case 'H2':
	case 'h2':
		format_div.heading = 'heading2';
		break;
	case 'H3':
	case 'h3':
		format_div.heading = 'heading3';
		break;
	case 'H4':
	case 'h4':
		format_div.heading = 'heading4';
		break;
	case 'H5':
	case 'h5':
		format_div.heading = 'heading5';
		break;
	case 'H6':
	case 'h6':
		format_div.heading = 'heading6';
		break;
	}

	const val = nbe.state.copy_line_format(format_div, {});

	if (state.line.children.length === 0) {
		state.line.val = val;
	} else {
		const line = {type : 'line', val : val, children : []};
		state.root.push(line);
		state.line = line;
	}

	state.format = format_div;

	state = nbe.paste.traverse(state, node);

	state.format = format;

	return state;
};

nbe.paste.img = function (state, node) {
	const val = {};

	const add_props = function (names) {
		for (let i = 0; i < names.length; i++) {
			if (node[names[i]]) {
				val[names[i]] = node[names[i]];
			}
		}
	};

	add_props(['src', 'width', 'height', 'title']);

	const item = {type : 'img', val : val, children : []};

	if (state.link) {
		state.link.children.push(item);
	} else {
		state.line.children.push(item);
	}

	return state;
};

nbe.paste.insertion = function (container) {
	const line = {type : 'line', val : {}, children : []};
	let state = {root : [line], line : line, link : null, format : {}};

	state = nbe.paste.traverse(state, container);

	let insertion = [];

	if (Object.keys(state.root[0].val).length !== 0) {
		insertion.push({type : 'line', val : {}, children : []});
	}

	insertion = insertion.concat(state.root);

	if (Object.keys(state.root[state.root.length - 1].val).length !== 0) {
		insertion.push({type : 'line', val : {}, children : []});
	}

	return insertion;
};

nbe.paste.link = function (state, node) {
	const val = {href : node.href};
	const item = {type : 'link', val : val, children : []};

	state.line.children.push(item);

	state.link = item;

	state = nbe.paste.traverse(state, node);

	state.link = null;

	return state;
};

nbe.paste.remaining = function (state, node) {
	const format = state.format;
	const format_remaining = nbe.lib.clone(format);

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

nbe.paste.span = function (state, node) {
	const format = state.format;

	const format_span = nbe.lib.clone(format);

	const add_classes = function (names) {
		for (let i = 0; i < names.length; i++) {
			if (node.classList.contains(names[i])) {
				format_span[names[i]] = 'on';
			}
		}
	};

	add_classes(['bold', 'italic', 'underline', 'strikethrough']);

	const verify_color = function (col) {
		return col.slice(0, 4) === 'rgb(';
	};

	if (node.style.color && verify_color(node.style.color)) {
		format_span.color = node.style.color;
	}

	if (node.style.backgroundColor && verify_color(node.style.backgroundColor)) {
		format_span.background_color = node.style.backgroundColor;
	}

	const add_styles = function (names) {
		for (let i = 0; i < names.length; i++) {
			if (node.style[names[i].style]) {
				format_span[names[i].key] = node.style[names[i].style];
			}
		}
	};

	add_styles([
		{key : 'vertical_align', style : 'verticalAlign'}
	]);

	if (format_span.vertical_align) {
		if (node.style.fontSize.slice(-2) === 'px') {
			format_span.font_size = (1.25 * Number(node.style.fontSize.slice(0, node.style.fontSize.length - 2))) + 'px';
		}
	} else {
		add_styles([
			{key : 'font_size', style : 'fontSize'}
		]);
	}

	if (node.style.fontFamily) {
		const font_family = node.style.fontFamily.toLowerCase();
		if (nbe.state.formats.font_family.indexOf(font_family) !== -1) {
			format_span.font_family = font_family;
		}
	}

	state.format = format_span;

	state = nbe.paste.traverse(state, node);

	state.format = format;

	return state;
};

nbe.paste.text = function (state, node) {
	const val = nbe.state.copy_text_format(state.format, {});
	val.text = node.textContent;

	const item = {type : 'text', val : val, children : []};

	if (state.link) {
		state.link.children.push(item);
	} else {
		state.line.children.push(item);
	}

	return state;
};

nbe.paste.traverse = function (state, node) {
	for (let i = 0; i < node.childNodes.length; i++) {
		const child = node.childNodes[i];
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
