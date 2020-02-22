'use strict';

nbe.inputs.drop_down = function (type, title, menu_content, button_content, parent, trigger, init, display_input) {
	var input, value, el_panel, element, el_input, input_handler, close, el_menu, options, key, set_value;

	input = nbe.inputs.input(type, trigger);

	value = null;

	el_panel = document.body;

	element = kite.browser.dom.eac('div', parent, 'wu-icon wu-drop-down wu-icon-' + type);
	element.title = title;
	element.addEventListener('click', function (e) {
		var offset;

		if (!el_menu.parentNode && e.target !== el_input) {
			offset = kite.browser.ui.get_offset(element);
			el_menu.style.left = offset.left + 1 + 'px';
			el_menu.style.top = offset.top + element.offsetHeight + 'px';
			el_panel.appendChild(el_menu);
			close = false;
			setTimeout(function () {
				close = true;
			}, 0);
		}
	}, true);

	el_input = document.createElement('input');
	if (display_input) {
		element.appendChild(el_input);
		el_input.type = 'text';
		input_handler = function (_e) {
			var new_value = el_input.value.replace(/\s/g, '');

			if (isNaN(new_value)) {
				alert('Please specify a number.');
				set_value(value);
			} else {
				set_value(new_value + 'px');
				input.trigger(value);
			}
		};
		el_input.addEventListener('blur', input_handler, false);
		el_input.addEventListener('keyup', function (e) {
			if (e.keyCode === 13) {
				input_handler(e);
			}
		}, false);
	}

	document.body.addEventListener('click', function (_e) {
		if (el_menu.parentNode && close) {
			el_panel.removeChild(el_menu);
		}
	}, false);

	el_menu = kite.browser.dom.ec('div', 'wu-menu drop_down_menu');
	el_menu.addEventListener('click', function (e) {
		var value;

		value = e.target.getAttribute('data-option') ? e.target.getAttribute('data-option') : e.target.parentNode.getAttribute('data-option');
		input.trigger(value);

		if (el_menu.parentNode) {
			el_panel.removeChild(el_menu);
		}
	}, false);

	options = {};

	for (key in menu_content) {
		if (menu_content.hasOwnProperty(key)) {
			options[key] = kite.browser.dom.eac('div', el_menu, 'wu-menu-row');
			options[key].setAttribute('data-option', key);
			options[key].innerHTML = menu_content[key];
		}
	}

	set_value = function (new_value) {
		if (value && value in options) {
			options[value].className = 'wu-menu-row';
		}
		value = new_value;
		if (value in options) {
			options[value].className = 'wu-menu-row wu-selected';
		}
		if (display_input) {
			el_input.value = value.replace('px', '');
		} else {
			element.innerHTML = button_content[value] ? button_content[value] : (menu_content[value] ? menu_content[value].replace(' (default)', '') : value);
		}
	};

	set_value(init);

	input.element = element;
	input.set_value = set_value;

	return input;
};
