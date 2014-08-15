'use strict';

nbe.paste.span = function (state, node) {
	var format, format_span, add_classes, verify_color, add_styles, font_family;

	format = state.format;

	format_span = nbe.lib.clone(format);

	add_classes = function (names) {
		var i;

		for (i = 0; i < names.length; i++) {
			if (node.classList.contains(names[i])) {
				format_span[names[i]] = 'on';
			}
		}
	};

	add_classes(['bold', 'italic', 'underline', 'strikethrough']);

	verify_color = function (col) {
		return col.slice(0, 4) === 'rgb(';
	};

	if (node.style.color && verify_color(node.style.color)) {
		format_span.color = node.style.color;
	}

	if (node.style.backgroundColor && verify_color(node.style.backgroundColor)) {
		format_span.background_color = node.style.backgroundColor;
	}

	add_styles = function (names) {
		var i;

		for (i = 0; i < names.length; i++) {
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
		font_family = node.style.fontFamily.toLowerCase();
		if (nbe.state.formats.font_family.indexOf(font_family) !== -1) {
			format_span.font_family = font_family;
		}
	}

	state.format = format_span;

	state = nbe.paste.traverse(state, node);

	state.format = format;

	return state;
};
