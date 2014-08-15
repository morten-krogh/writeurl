'use strict';

nbe.inputs.edit_link = function (trigger, title, parent, init) {
	var button, element, value, id, set_value, drop_down, el_window, el_link_url_container, el_link_url, el_buttons, el_insert, el_cancel;

	button = nbe.inputs.input('link', trigger);

	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-edit_link off');
	element.title = title;
	kite.browser.dom.ea('img', element).src = '/img/pen_alt2.svg';
	kite.browser.dom.ea('img', element).src = '/img/link.svg';

	value = null;
	id = null;

	set_value = function (new_value) {
		value = new_value;
		if (value) {
			id = value.id;
			el_link_url.value = value.href;
			element.className = 'wu-icon wu-icon-edit_link on';
		} else {
			el_link_url.value = '';
			element.className = 'wu-icon wu-icon-edit_link off';
		}
	};

	drop_down = new kite.browser.ui.Window();
	drop_down.set_title('Edit link');

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

	el_window = kite.browser.dom.ec('div', 'wu-special_characters');

	el_link_url_container = kite.browser.dom.ea('div', el_window);
	kite.browser.dom.ea('div', el_link_url_container).textContent = 'URL: ';
	el_link_url = kite.browser.dom.ea('input', el_link_url_container);
	el_link_url.type = 'text';

	el_buttons = kite.browser.dom.eac('div', el_window, 'wu-special_character_buttons');
	el_insert = kite.browser.dom.eac('button', el_buttons, 'button');
	el_insert.textContent = 'OK';
	el_cancel = kite.browser.dom.eac('button', el_buttons, 'button');
	el_cancel.textContent = 'Cancel';

	drop_down.set_content(el_window);

	el_window.addEventListener('click', function (e) {
		if (el_insert === e.target) {
			button.trigger({id : id, href : el_link_url.value});
			drop_down.close();
		} else if (el_cancel === e.target) {
			drop_down.close();
		}
	}, false);

	set_value(init);

	button.set_value = set_value;
	button.element = element;
	return button;
};
