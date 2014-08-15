'use strict';

nbe.inputs.insert_link = function (trigger, title, parent) {
	var button, element, drop_down, insertion, el_window, el_link_text_container, el_text_message, el_link_text, el_link_url_container, el_url_message, el_link_url, el_buttons, el_insert, el_cancel;

	button = nbe.inputs.input('link', trigger);

	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-insert_link off');
	element.title = title;
	//element.textContent = '+ Link';

	drop_down = new kite.browser.ui.Window();
	drop_down.set_title('Insert link');

	element.addEventListener('click', function (e) {
		e.stopPropagation();

		if (drop_down.is_open) {
			drop_down.close();
		} else {
			insertion = false;//nbe.paste.link_text(button.get_triggers()[0]);
			if (!insertion) {
				el_window.insertBefore(el_link_text_container, el_link_url_container);
			} else {
				if (el_link_text_container.parentNode) {
					el_window.removeChild(el_link_text_container);
				}
			}
			el_text_message.textContent = '';
			el_url_message.textContent = '';
			drop_down.open();
		}
	}, false);

	el_window = kite.browser.dom.ec('div', 'wu-special_characters');

	el_link_text_container = document.createElement('div');
	kite.browser.dom.ea('span', el_link_text_container).textContent = 'Link text: ';
	el_text_message = kite.browser.dom.eac('span', el_link_text_container, 'message_failure');
	kite.browser.dom.ea('br', el_link_text_container);
	el_link_text = kite.browser.dom.ea('input', el_link_text_container);
	el_link_text.type = 'text';

	el_link_url_container = kite.browser.dom.ea('div', el_window);
	kite.browser.dom.ea('span', el_link_url_container).textContent = 'URL: ';
	el_url_message = kite.browser.dom.eac('span', el_link_url_container, 'message_failure');
	kite.browser.dom.ea('br', el_link_url_container);
	el_link_url = kite.browser.dom.ea('input', el_link_url_container);
	el_link_url.type = 'text';
	el_link_url.value = 'http://';

	el_buttons = kite.browser.dom.eac('div', el_window, 'wu-special_character_buttons');
	el_insert = kite.browser.dom.eac('button', el_buttons, 'button');
	el_insert.textContent = 'Insert link';
	el_cancel = kite.browser.dom.eac('button', el_buttons, 'button');
	el_cancel.textContent = 'Cancel';

	drop_down.set_content(el_window);

	el_window.addEventListener('click', function (e) {
		var value;

		if (el_insert === e.target) {
			if (el_link_text.value === '') {
				el_text_message.textContent = ' Please specify a link text';
			} else if (el_link_url.value === '') {
				el_url_message.textContent = ' Please specify a url';
			} else {
				value = {href : el_link_url.value};
				if (!insertion) {
					value.insertion = [{type : 'text', val : {text : el_link_text.value}, children : []}];
				}
				button.trigger(value);
				el_link_text.value = '';
				el_link_url.value = 'http://';
				drop_down.close();
			}
		} else if (el_cancel === e.target) {
			drop_down.close();
		}
	}, false);

	button.element = element;
	return button;
};
