nbe.inputs = {};

nbe.inputs.background_color = function (trigger, title, parent, init) {
	var button, value, element, el_symbol, color_menu, set_value;

	button = nbe.inputs.input('background_color', trigger);

	value = null;
	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-background_color off');
	element.title = title;
	el_symbol = kite.browser.dom.ea('div', element);
	el_symbol.textContent = 'A';

	color_menu = nbe.inputs.color_menu(function (color) {
		button.trigger(color);
	}, 'transparent', 'None', [
		'rgb(255, 200, 200)', 'rgb(255, 200, 75)', 'rgb(255, 255, 200)', 'rgb(200, 255, 0)', 'rgb(200, 255, 200)', 'rgb(150, 255, 225)', 'rgb(200, 255, 255)', 'rgb(135, 240, 255)', 'rgb(100, 175, 255)', 'rgb(235, 120, 255)', 'rgb(255, 100, 200)', 'rgb(224,224,224)',
		'rgb(255, 150, 150)', 'rgb(255, 175, 50)', 'rgb(255, 255, 150)', 'rgb(175, 255, 0)', 'rgb(150, 255, 150)', 'rgb(100, 255, 200)', 'rgb(150, 255, 255)', 'rgb(80, 235, 255)', 'rgb(0, 150, 255)', 'rgb(200, 80, 255)', 'rgb(237, 0, 175)', 'rgb(192,192,192)',
		'rgb(255, 100, 100)', 'rgb(255, 150, 25)', 'rgb(255, 255, 100)', 'rgb(150, 255, 0)', 'rgb(100, 255, 100)', 'rgb(50, 255, 175)', 'rgb(100, 255, 255)', 'rgb(50, 220, 255)', 'rgb(0, 100, 255)', 'rgb(175, 40, 255)', 'rgb(218, 0, 150)', 'rgb(160,160,160)',
		'rgb(255, 0, 0)', 'rgb(255, 125, 0)', 'rgb(255, 255, 0)', 'rgb(125, 255, 0)', 'rgb(0, 255, 0)', 'rgb(0, 255, 150)', 'rgb(0, 255, 255)', 'rgb(0, 200, 255)', 'rgb(0, 0, 255)', 'rgb(150, 0, 255)', 'rgb(200, 0, 125)', 'rgb(128,128,128)',
		'rgb(200 ,0, 0)', 'rgb(200, 100, 0)', 'rgb(200, 200, 0)', 'rgb(100, 200, 0)', 'rgb(0, 200, 0)', 'rgb(0, 200, 125)', 'rgb(0, 200, 200)', 'rgb(0, 170, 225)', 'rgb(0, 0, 200)', 'rgb(125, 0, 200)', 'rgb(170, 0, 105)', 'rgb(96,96,96)',
		'rgb(150, 0, 0)', 'rgb(150, 75, 0)', 'rgb(150, 150, 0)', 'rgb(75, 150, 0)', 'rgb(0, 150, 0)', 'rgb(0, 150, 100)', 'rgb(0, 150, 150)', 'rgb(0, 140, 195)', 'rgb(0, 0, 150)', 'rgb(100, 0, 150)', 'rgb(140, 0, 85)', 'rgb(64,64,64)',
		'rgb(100, 0, 0)', 'rgb(100, 50, 0)', 'rgb(100, 100, 0)', 'rgb(50, 100, 0)', 'rgb(0, 100, 0)', 'rgb(0, 100, 75)', 'rgb(0, 100, 100)', 'rgb(0, 110, 165)', 'rgb(0, 0, 100)', 'rgb(75, 0, 100)', 'rgb(110, 0, 65)', 'rgb(32,32,32)'
	], init);

	set_value = function (new_value) {
		if (value !== new_value) {
			value = new_value;
			el_symbol.style.backgroundColor = value;
		}
	};

	set_value(init);

	element.addEventListener('click', function (e) {
		e.stopPropagation();
		if (color_menu.is_open()) {
			color_menu.remove();
		} else {
			color_menu.display(parent, element, value);
		}

	}, false);

	button.element = element;
	button.set_value = set_value;

	return button;
};

nbe.inputs.bold = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('bold', title, parent, trigger, init);
	button.element.textContent = 'B';

	return button;
};

nbe.inputs.button = function (type, title, parent, trigger, init) {
	var input, value, element, set_value;

	input = nbe.inputs.input(type, trigger);

	value = null;
	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-' + type + ' off');
	element.title = title;

	set_value = function (new_value) {
		if (value !== new_value) {
			value = new_value;
			element.className = 'wu-icon wu-icon-' + type + ' ' + value;
		}
	};

	set_value(init);

	element.addEventListener('click', function () {
		input.trigger(value === 'off' ? 'on' : 'off');
	});

	input.element = element;
	input.set_value = set_value;

	return input;
};

nbe.inputs.color = function (trigger, title, parent, init) {
	var button, value, element, color_menu, set_value;

	button = nbe.inputs.input('color', trigger);

	value = null;
	element = kite.browser.dom.eac('button', parent, 'wu-icon off');
	element.title = title;
	element.textContent = 'A';

	color_menu = nbe.inputs.color_menu(function (color) {
		button.trigger(color);
	}, 'rgb(0, 0, 0)', 'Black', [
		'rgb(255, 200, 200)', 'rgb(255, 200, 75)', 'rgb(255, 255, 200)', 'rgb(200, 255, 0)', 'rgb(200, 255, 200)', 'rgb(150, 255, 225)', 'rgb(200, 255, 255)', 'rgb(135, 240, 255)', 'rgb(100, 175, 255)', 'rgb(235, 120, 255)', 'rgb(255, 100, 200)', 'rgb(224,224,224)',
		'rgb(255, 150, 150)', 'rgb(255, 175, 50)', 'rgb(255, 255, 150)', 'rgb(175, 255, 0)', 'rgb(150, 255, 150)', 'rgb(100, 255, 200)', 'rgb(150, 255, 255)', 'rgb(80, 235, 255)', 'rgb(0, 150, 255)', 'rgb(200, 80, 255)', 'rgb(237, 0, 175)', 'rgb(192,192,192)',
		'rgb(255, 100, 100)', 'rgb(255, 150, 25)', 'rgb(255, 255, 100)', 'rgb(150, 255, 0)', 'rgb(100, 255, 100)', 'rgb(50, 255, 175)', 'rgb(100, 255, 255)', 'rgb(50, 220, 255)', 'rgb(0, 100, 255)', 'rgb(175, 40, 255)', 'rgb(218, 0, 150)', 'rgb(160,160,160)',
		'rgb(255, 0, 0)', 'rgb(255, 125, 0)', 'rgb(255, 255, 0)', 'rgb(125, 255, 0)', 'rgb(0, 255, 0)', 'rgb(0, 255, 150)', 'rgb(0, 255, 255)', 'rgb(0, 200, 255)', 'rgb(0, 0, 255)', 'rgb(150, 0, 255)', 'rgb(200, 0, 125)', 'rgb(128,128,128)',
		'rgb(200 ,0, 0)', 'rgb(200, 100, 0)', 'rgb(200, 200, 0)', 'rgb(100, 200, 0)', 'rgb(0, 200, 0)', 'rgb(0, 200, 125)', 'rgb(0, 200, 200)', 'rgb(0, 170, 225)', 'rgb(0, 0, 200)', 'rgb(125, 0, 200)', 'rgb(170, 0, 105)', 'rgb(96,96,96)',
		'rgb(150, 0, 0)', 'rgb(150, 75, 0)', 'rgb(150, 150, 0)', 'rgb(75, 150, 0)', 'rgb(0, 150, 0)', 'rgb(0, 150, 100)', 'rgb(0, 150, 150)', 'rgb(0, 140, 195)', 'rgb(0, 0, 150)', 'rgb(100, 0, 150)', 'rgb(140, 0, 85)', 'rgb(64,64,64)',
		'rgb(100, 0, 0)', 'rgb(100, 50, 0)', 'rgb(100, 100, 0)', 'rgb(50, 100, 0)', 'rgb(0, 100, 0)', 'rgb(0, 100, 75)', 'rgb(0, 100, 100)', 'rgb(0, 110, 165)', 'rgb(0, 0, 100)', 'rgb(75, 0, 100)', 'rgb(110, 0, 65)', 'rgb(32,32,32)'
	], init);

	set_value = function (new_value) {
		if (value !== new_value) {
			value = new_value;
			element.style.color = value;
		}
	};

	set_value(init);

	element.addEventListener('click', function (e) {
		e.stopPropagation();
		if (color_menu.is_open()) {
			color_menu.remove();
		} else {
			color_menu.display(parent, element, value);
		}
	}, false);

	button.element = element;
	button.set_value = set_value;

	return button;
};

nbe.inputs.color_menu = function (trigger, default_color, default_label, colors, init) {
	var is_open, el_panel, element, value, swatches, create_swatch, el_default, rgb_input, el_custom, el_custom_swatch, el_r, el_g, el_b, el_default_label, i, remove, remove_handler, switch_swatch;

	is_open = false;

	el_panel = document.body;

	element = kite.browser.dom.ec('div', 'wu-menu wu-color_menu');
	element.addEventListener('click', function (e) {
		var color;

		color = e.target.getAttribute('data-color');

		if (color) {
			switch_swatch(color);
		}
	}, false);

	value = init;
	swatches = {};

	create_swatch = function (color, parent) {
		var el_swatch;

		el_swatch = kite.browser.dom.eac('div', parent, 'wu-color_swatch');
		el_swatch.style.backgroundColor = color;
		el_swatch.setAttribute('data-color', color);

		return el_swatch;
	};

	el_default = kite.browser.dom.eac('div', element, 'wu-color_default');

	rgb_input = function (_e) {
		var new_value;

		if (el_r.value !== '' && el_g.value !== '' && el_b.value !== '') {
			new_value = 'rgb(' + el_r.value + ', ' + el_g.value + ', ' + el_b.value + ')';

			el_custom_swatch.style.backgroundColor = new_value;
			switch_swatch(new_value);
		} else {
			switch_swatch(init);
		}
	};

	el_custom = kite.browser.dom.eac('div', element, 'wu-color_custom');
	el_custom_swatch = kite.browser.dom.eac('div', el_custom, 'wu-color_swatch');
	el_custom_swatch.addEventListener('click', function (e) {
		rgb_input(e);
	}, false);

	kite.browser.dom.ea('span', el_custom).textContent = 'R:';
	el_r = kite.browser.dom.ea('input', el_custom);
	el_r.addEventListener('keyup', rgb_input, false);

	kite.browser.dom.ea('span', el_custom).textContent = 'G:';
	el_g = kite.browser.dom.ea('input', el_custom);
	el_g.addEventListener('keyup', rgb_input, false);

	kite.browser.dom.ea('span', el_custom).textContent = 'B:';
	el_b = kite.browser.dom.ea('input', el_custom);
	el_b.addEventListener('keyup', rgb_input, false);

	swatches[default_color] = create_swatch(default_color, el_default);

	el_default_label = kite.browser.dom.ea('span', el_default);
	el_default_label.textContent = default_label;
	el_default_label.setAttribute('data-color', default_color);

	for (i = 0; i < colors.length; i++) {
		swatches[colors[i]] = create_swatch(colors[i], element);
	}

	remove = function () {
		is_open = false;
		el_panel.removeChild(element);
		document.body.removeEventListener('click', remove_handler, false);
		trigger(value);
	};

	remove_handler = function (e) {
		if (e.target !== el_r && e.target !== el_g && e.target !== el_b) {
			remove();
		}
	};

	switch_swatch = function (new_value) {
		if (swatches[value]) {
			swatches[value].classList.remove('wu-selected');
		}

		el_custom_swatch.classList.remove('wu-selected');
		el_custom_swatch.style.backgroundColor = 'transparent';

		if (swatches[new_value]) {
			swatches[new_value].classList.add('wu-selected');
		} else {
			el_custom_swatch.classList.add('wu-selected');
			el_custom_swatch.style.backgroundColor = new_value;
		}

		value = new_value;
	};

	return {display : function (_parent, offset_element, new_value) {
		var rgb, offset;

		is_open = true;

		el_panel.appendChild(element);

		offset = kite.browser.ui.get_offset(offset_element);
		element.style.left = (offset.left - (element.offsetWidth / 2) + (offset_element.offsetWidth / 2)) + 'px';
		element.style.top = offset.top + offset_element.offsetHeight + 'px';

		document.body.addEventListener('click', remove_handler, false);

		switch_swatch(new_value);

		if (swatches[new_value]) {
			if (el_r.value !== '' && el_g.value !== '' && el_b.value !== '') {
				el_custom_swatch.style.backgroundColor = 'rgb(' + el_r.value + ', ' + el_g.value + ', ' + el_b.value + ')';
			}
		} else {
			rgb = new_value.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
			el_r.value = rgb[1];
			el_g.value = rgb[2];
			el_b.value = rgb[3];
		}
	}, remove : remove, is_open : function () {
		return is_open;
	}};
};

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

nbe.inputs.font_family = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('font_family', title, content, {}, parent, trigger, init, false);

	return drop_down;
};

nbe.inputs.font_size = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('font_size', title, content, {}, parent, trigger, init, true);

	return drop_down;
};

nbe.inputs.heading = function (trigger, title, menu_content, button_content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('heading', title, menu_content, button_content, parent, trigger, init, false);

	return drop_down;
};

nbe.inputs.input = function (type, trigger) {
	var triggers, add_trigger, remove_trigger;

	triggers = trigger ? [trigger] : [];

	add_trigger = function (trigger) {
		var i, add;

		add = true;

		for (i = 0; i < triggers.length; i++) {
			if (triggers[i] === trigger) {
				add = false;
			}
		}

		if (add) {
			triggers.push(trigger);
		}
	};

	remove_trigger = function (trigger) {
		var i;

		for (i = 0; i < triggers.length; i++) {
			if (triggers[i] === trigger) {
				triggers.splice(i, 1);
			}
		}
	};

	return {editors : triggers, add_trigger : add_trigger, remove_trigger : remove_trigger, trigger : function (value) {
		var i;

		for (i = 0; i < triggers.length; i++) {
			triggers[i](type, value);
		}
	}, get_triggers : function () {
		return triggers;
	}};

};

nbe.inputs.insert_image = function (trigger, title, parent) {
	var button, element, drop_down, el_window, el_src, el_width, el_height, el_title, el_buttons, el_insert, el_cancel;

	button = nbe.inputs.input('img', trigger);

	element = kite.browser.dom.eac('button', parent, 'wu-icon wu-icon-insert_image off');
	element.title = title;
	//element.textContent = '+ Image';

	drop_down = new kite.browser.ui.Window();
	drop_down.set_title('Insert image');

	element.addEventListener('click', function (e) {
		e.stopPropagation();

		if (drop_down.is_open) {
			drop_down.close();
		} else {
			drop_down.open();
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
	el_insert.textContent = 'Insert image';
	el_cancel = kite.browser.dom.eac('button', el_buttons, 'button');
	el_cancel.textContent = 'Cancel';

	drop_down.set_content(el_window);

	el_window.addEventListener('click', function (e) {
		var value;

		if (el_insert === e.target) {
			value = {src : el_src.value};
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
			el_src.value = 'http://';
			el_width.value = '';
			el_height.value = '';
			el_title.value = '';
			drop_down.close();
		} else if (el_cancel === e.target) {
			drop_down.close();
		}
	}, false);

	button.element = element;
	return button;
};

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

nbe.inputs.italic = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('italic', title, parent, trigger, init);
	button.element.textContent = 'I';

	return button;
};

nbe.inputs.left_margin = function (trigger, parent, init) {
	var current_value, el_container, input, decrease, increase;

	current_value = ['off', 'on'];

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('left_margin', trigger);

	decrease = nbe.inputs.button('decrease_indent', 'Decrease indentation', parent, function () {
		if (current_value[0] === 'on') {
			input.trigger('decrement');
		}
	}, 'off');
	decrease.element.textContent = '<';
	increase = nbe.inputs.button('increase_indent', 'Increase indentation', parent, function () {
		if (current_value[1] === 'on') {
			input.trigger('increment');
		}
	}, 'off');
	increase.element.textContent = '>';

	input.element = el_container;
	input.set_value = function (value) {
		current_value = value.split(':');
		decrease.set_value(current_value[0]);
		increase.set_value(current_value[1]);
	};

	input.set_value(init);

	return input;
};

nbe.inputs.line_spacing = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('line_spacing', title, content, {}, parent, trigger, init, false);

	return drop_down;
};

nbe.inputs.list = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('list', title, content, {}, parent, trigger, init, false);

	return drop_down;
};

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

nbe.inputs.strikethrough = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('strikethrough', title, parent, trigger, init);
	button.element.textContent = 'S';

	return button;
};

nbe.inputs.text_align = function (trigger, title, content, parent, init) {
	var drop_down;

	drop_down = nbe.inputs.drop_down('text_align', title, content, {}, parent, trigger, init, false);

	return drop_down;
};

nbe.inputs.underline = function (trigger, title, parent, init) {
	var button;

	button = nbe.inputs.button('underline', title, parent, trigger, init);
	button.element.textContent = 'U';

	return button;
};

nbe.inputs.undo = function (trigger, parent) {
	var el_container, input, undo, redo;

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('undo', trigger);

	undo = nbe.inputs.button('undo', 'Undo', el_container, function () {
		input.trigger('undo');
	}, 'off');
	kite.browser.dom.ea('img', undo.element).src = '/img/undo.svg';
	redo = nbe.inputs.button('redo', 'Redo', el_container, function () {
		input.trigger('redo');
	}, 'off');
	kite.browser.dom.ea('img', redo.element).src = '/img/redo.svg';

	input.element = el_container;
	input.set_value = function (value) {
		undo.set_value(value.undo ? 'on' : 'off');
		redo.set_value(value.redo ? 'on' : 'off');
	};

	return input;
};

nbe.inputs.vertical_align = function (trigger, parent, init) {
	var el_container, input, button_trigger, sup, sub;

	el_container = kite.browser.dom.ea('div', parent);
	input = nbe.inputs.input('vertical_align', trigger);

	button_trigger = function (type, value) {
		if (value === 'on') {
			input.trigger(type);
		} else {
			input.trigger('baseline');
		}
	};

	sup = nbe.inputs.button('super', 'Superscript', el_container, button_trigger, 'off');
	sup.element.innerHTML = 'A<span>2</span>';
	sub = nbe.inputs.button('sub', 'Subscript', el_container, button_trigger, 'off');
	sub.element.innerHTML = 'A<span>2</span>';

	input.element = el_container;
	input.set_value = function (value) {
		if (value === 'super') {
			sup.set_value('on');
			sub.set_value('off');
		} else if (value === 'sub') {
			sub.set_value('on');
			sup.set_value('off');
		} else {
			sup.set_value('off');
			sub.set_value('off');
		}
	};

	input.set_value(init);

	return input;
};
