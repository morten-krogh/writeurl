'use strict';

nbe.state.mutate_element = function (element, type, val) {
	var add_classes, remove_classes;

	add_classes = function (keys) {
		var i;

		for (i = 0; i < keys.length; i++) {
			if (keys[i] in val) {
				element.classList.add('wu-' + val[keys[i]]);
			}
		}
	};

	remove_classes = function (classes) {
		var i;

		for (i = 0; i < classes.length; i++) {
			element.classList.remove('wu-' + classes[i]);
		}
	};

	switch (type) {
	case 'root' :
		break;
	case 'line' :
		remove_classes(nbe.state.line_classes);
		add_classes(['heading', 'text_align', 'list', 'line_spacing']);
		element.style.marginLeft = val.left_margin ? (val.left_margin + 'px') : '';
		element.style.fontSize = val.font_size || '';
		break;
	case 'text' :
		element.textContent = val.text;
		element.classList[val.bold ? 'add' : 'remove']('wu-bold');
		element.classList[val.italic ? 'add' : 'remove']('wu-italic');
		element.classList[val.underline ? 'add' : 'remove']('wu-underline');
		element.classList[val.strikethrough ? 'add' : 'remove']('wu-strikethrough');
		element.style.color = val.color || '';
		element.style.backgroundColor = val.background_color || '';
		element.style.fontFamily = val.font_family || '';
		element.style.verticalAlign = val.vertical_align || '';
		element.style.fontSize = val.vertical_align ? (val.font_size ? ((0.8 * (Number(val.font_size.slice(0, val.font_size.length - 2)))) + 'px') : '80%') : (val.font_size || '');
		break;
	case 'img' :
		element.src = val.src || '';
		if ('width' in val) {
			element.width = val.width;
		} else {
			element.removeAttribute('width');
		}
		if ('height' in val) {
			element.height = val.height;
		} else {
			element.removeAttribute('height');
		}
		element.title = val.title || '';
		break;
	case 'link' :
		element.href = val.href;
	}

	return element;
};
