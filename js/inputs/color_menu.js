'use strict';

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

	rgb_input = function (e) {
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

	return {display : function (parent, offset_element, new_value) {
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