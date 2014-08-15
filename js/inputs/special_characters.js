'use strict';

nbe.inputs.special_characters = function (trigger, title, parent) {
	var button, element, drop_down, el_window, el_menu, sets, el_characters, char_interval, content, i, el_option, j, el_char, el_input, el_buttons, el_insert, el_cancel;

	button = nbe.inputs.input('text', trigger);

	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-special_characters off');
	element.title = title;
	//element.textContent = 'Sp. C.';

	drop_down = new kite.browser.ui.Window();
	drop_down.set_title('Special Characters');

	element.addEventListener('click', function (e) {
		e.stopPropagation();
		if (drop_down.is_open) {
			drop_down.close();
		} else {
			drop_down.open();
		}
	}, false);

	el_window = kite.browser.dom.ec('div', 'wu-special_characters');
	kite.browser.dom.ea('div', el_window).textContent = 'Please choose character sets: ';
	el_menu = kite.browser.dom.ea('select', el_window);
	sets = [];
	el_characters = kite.browser.dom.ea('div', el_window);

	char_interval = function (lower, upper) {
		var chars, i;

		chars = [];
		for (i = lower; i <= upper; i++) {
			chars.push(String.fromCharCode(i));
		}

		return chars;
	};

	content = [{
		name : 'latin extended',
		characters : char_interval(192, 687)
	}, {
		name : 'greek and coptic',
		characters : char_interval(880, 1023)
	}, {
		name : 'mathematical operators',
		characters : char_interval(8704, 8959)
	}, {
		name : 'arrows',
		characters : char_interval(8592, 8703)
	}, {
		name : 'currency',
		characters : char_interval(8352, 8399)
	}];

	for (i = 0; i < content.length; i = i + 1) {
		sets[i] = kite.browser.dom.ec('div', 'wu-character_set');
		el_option = kite.browser.dom.ea('option', el_menu);
		el_option.textContent = content[i].name;
		el_option.value = i;
		for (j = 0; j < content[i].characters.length; j = j + 1) {
			el_char = kite.browser.dom.ea('div', sets[i]);
			el_char.textContent = content[i].characters[j];
			if (j % 11 === 0) {
				el_char.style.clear = 'left';
			}
		}
	}
	// Default character set:
	el_characters.appendChild(sets[0]);

	el_menu.addEventListener('change', function (e) {
		el_characters.removeChild(el_characters.firstChild);
		el_characters.appendChild(sets[e.target.value]);
	}, false);

	kite.browser.dom.ea('div', el_window).textContent = 'Characters to insert:';
	el_input = kite.browser.dom.ea('input', el_window);

	el_buttons = kite.browser.dom.eac('div', el_window, 'wu-special_character_buttons');
	el_insert = kite.browser.dom.eac('button', el_buttons, 'button');
	el_insert.textContent = 'Insert characters';
	el_cancel = kite.browser.dom.eac('button', el_buttons, 'button');
	el_cancel.textContent = 'Cancel';

	drop_down.set_content(el_window);

	el_window.addEventListener('click', function (e) {
		if (el_insert === e.target) {
			button.trigger(el_input.value);
			el_input.value = '';
			drop_down.close();
		} else if (el_cancel === e.target) {
			drop_down.close();
		} else if (e.target.parentNode.className === 'wu-character_set') {
			el_input.value += e.target.textContent;
		}
	}, false);

	button.element = element;
	return button;
};
