'use strict';

nbe.paste.div = function (state, node) {
	var format, format_div, add_class, left_margin, val, line;

	format = state.format;

	format_div = nbe.lib.clone(format);

	add_class = function (key, names) {
		var i;

		for (i = 0; i < names.length; i++) {
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
		left_margin = Number(node.style.marginLeft.slice(0, node.style.marginLeft.length - 2));
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

	val = nbe.state.copy_line_format(format_div, {});

	if (state.line.children.length === 0) {
		state.line.val = val;
	} else {
		line = {type : 'line', val : val, children : []};
		state.root.push(line);
		state.line = line;
	}

	state.format = format_div;

	state = nbe.paste.traverse(state, node);

	state.format = format;

	return state;
};
