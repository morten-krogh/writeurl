'use strict';

nbe.inputs.edit_image = function (trigger, title, parent, init) {
	var button, element, value, id, set_value, drop_down, el_window, el_src, el_width, el_height, el_title, el_buttons, el_insert, el_cancel;

	button = nbe.inputs.input('img', trigger);

	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-edit_image off');
	element.title = title;
	//element.textContent = 'Edit image';
	kite.browser.dom.ea('img', element).src = '/img/pen_alt2.svg';
	kite.browser.dom.ea('img', element).src = '/img/image.svg';

	value = null;
	id = null;

	set_value = function (new_value) {
		value = new_value;

		if (value) {
			id = value.id;
			el_src.value = value.src || '';
			el_width.value = value.width || '';
			el_height.value = value.height || '';
			el_title.value = value.title || '';
			element.className = 'wu-icon wu-icon-edit_image on';
		} else {
			el_src.value = '';
			el_width.value = '';
			el_height.value = '';
			el_title.value = '';
			element.className = 'wu-icon wu-icon-edit_image off';
		}
	};

	drop_down = new kite.browser.ui.Window();
	drop_down.set_title('Edit image');

	element.addEventListener('click', function (e) {
		e.stopPropagation();

		if (drop_down.is_open) {
			drop_down.close();
		} else {
			if (value) {
				drop_down.open();
			}
		}
	}, false);

	el_window = kite.browser.dom.ec('div', 'wu-image_window');

	kite.browser.dom.ea('div', el_window).textContent = 'Image URL ';
	el_src = kite.browser.dom.ea('input', el_window);
	el_src.type = 'text';
	el_src.value = 'http://';

	kite.browser.dom.ea('div', el_window).textContent = 'Width ';
	el_width = kite.browser.dom.ea('input', el_window);
	el_width.type = 'text';

	kite.browser.dom.ea('div', el_window).textContent = 'Height ';
	el_height = kite.browser.dom.ea('input', el_window);
	el_height.type = 'text';

	kite.browser.dom.ea('div', el_window).textContent = 'Title ';
	el_title = kite.browser.dom.ea('input', el_window);
	el_title.type = 'text';

	el_buttons = kite.browser.dom.eac('div', el_window, 'wu-special_character_buttons');
	el_insert = kite.browser.dom.eac('button', el_buttons, 'button');
	el_insert.textContent = 'OK';
	el_cancel = kite.browser.dom.eac('button', el_buttons, 'button');
	el_cancel.textContent = 'Cancel';

	drop_down.set_content(el_window);

	el_window.addEventListener('click', function (e) {
		var value;

		if (el_insert === e.target) {
			value = {id : id, src : el_src.value};

			if (el_width.value !== '') {
				value.width = el_width.value;
			}
			if (el_height.value !== '') {
				value.height = el_height.value;
			}
			if (el_title.value !== '') {
				value.title = el_title.value;
			}

			button.trigger(value);
			drop_down.close();
		} else if (el_cancel === e.target) {
			drop_down.close();
		}
	}, false);

	set_value(init);

	button.element = element;
	button.set_value = set_value;
	return button;
};
