'use strict';

nbe.site.panel = function (el_panel_container, editor) {
	var defval, left_margin_initial_value, is_visible, buttons, el_panel, toggle_panel, el_toggle_panel, el_font, font_family_spec, el_format, el_color, el_paragraph, el_insert, key, button_undo, el_hide_format_panel;

	defval = nbe.state.formats.default_values;
	left_margin_initial_value = 'off:on';
	is_visible = false;

	buttons = {};

	el_panel = kite.browser.dom.eac('div', el_panel_container, 'wu-format-panel');

	toggle_panel = function () {
		if (is_visible) {
			el_panel.className = 'wu-format-panel';
			el_toggle_panel.textContent = 'More';
		} else {
			el_panel.className = 'wu-format-panel open';
			el_toggle_panel.textContent = 'Less';
		}
		is_visible = !is_visible;
	};

	el_toggle_panel = kite.browser.dom.eac('button', el_panel_container, 'wu-toggle circle_button');
	el_toggle_panel.textContent = 'More';
	el_toggle_panel.addEventListener('click', toggle_panel, false);

	el_panel.addEventListener('click', function (e) {
		if (e.target.classList.contains('wu-icon') || e.target.parentNode.classList.contains('drop_down_menu') || e.target.parentNode.parentNode.classList.contains('drop_down_menu')) {
			toggle_panel();
		}
	}, false);

	el_font = kite.browser.dom.ea('div', el_panel);

	buttons.heading = nbe.inputs.heading(editor.trigger, 'Heading', {none : 'No heading (-)', heading1 : '<span class="line heading1">Heading 1 (H1)</span>', heading2 : '<span class="line heading2">Heading 2 (H2)</span>', heading3 : '<span class="line heading3">Heading 3 (H3)</span>', heading4 : '<span class="line heading4">Heading 4 (H4)</span>', heading5 : '<span class="line heading5">Heading 5 (H5)</span>', heading6 : '<span class="line heading6">Heading 6 (H6)</span>'}, {none : '-', heading1 : 'H1', heading2 : 'H2', heading3 : 'H3', heading4 : 'H4', heading5 : 'H5', heading6 : 'H6'}, el_font, defval.heading);

	font_family_spec = {};
	nbe.state.formats.font_family.forEach(function (family) {
		var family_upper;

		family_upper = family[0].toUpperCase() + family.slice(1);
		font_family_spec[family] = '<span style="font-family : ' + family_upper + ';">' + family_upper + '</span>';
	});

	buttons.font_family = nbe.inputs.font_family(editor.trigger, 'Font', font_family_spec, el_font, defval.font_family);

	buttons.font_size = nbe.inputs.font_size(editor.trigger, 'Font size', {'10px' : '10', '11px' : '11', '12px' : '12', '13px' : '13', '14px' : '14', '16px' : '16', '18px' : '18', '20px' : '20', '22px' : '22', '24px' : '24', '28px' : '28', '32px' : '32', '36px' : '36', '48px' : '48', '72px' : '72'}, el_font, defval.font_size);

	el_format = kite.browser.dom.ea('div', el_panel);
	buttons.bold = nbe.inputs.bold(editor.trigger, 'Bold', el_format, defval.bold);
	buttons.italic = nbe.inputs.italic(editor.trigger, 'Italic', el_format, defval.italic);
	buttons.underline = nbe.inputs.underline(editor.trigger, 'Underline', el_format, defval.underline);
	buttons.strikethrough = nbe.inputs.strikethrough(editor.trigger, 'Strikethrough', el_format, defval.strikethrough);

	el_color = kite.browser.dom.ea('div', el_panel);
	buttons.color = nbe.inputs.color(editor.trigger, 'Text color', el_color, defval.color);
	buttons.background_color = nbe.inputs.background_color(editor.trigger, 'Line color', el_color, defval.background_color);

	buttons.vertical_align = nbe.inputs.vertical_align(editor.trigger, kite.browser.dom.ea('div', el_panel), defval.vertical_align);

	buttons.left_margin = nbe.inputs.left_margin(editor.trigger, kite.browser.dom.ea('div', el_panel), left_margin_initial_value);

	el_paragraph = kite.browser.dom.ea('div', el_panel);
	buttons.text_align = nbe.inputs.text_align(editor.trigger, 'Text align', {left : 'Left', center : 'Center', right : 'Right', justify : 'Justify'}, el_paragraph, defval.text_align);
	buttons.line_spacing = nbe.inputs.line_spacing(editor.trigger, 'Line spacing', {'line_spacing_05' : '0.5', 'line_spacing_06' : '0.6', 'line_spacing_07' : '0.7', 'line_spacing_08' : '0.8', 'line_spacing_09' : '0.9', 'line_spacing_10' : '1', 'line_spacing_11' : '1.1', 'line_spacing_12' : '1.2', 'line_spacing_13' : '1.3', 'line_spacing_14' : '1.4', 'line_spacing_15' : '1.5', 'line_spacing_16' : '1.6 (default)', 'line_spacing_17' : '1.7', 'line_spacing_18' : '1.8', 'line_spacing_19' : '1.9', 'line_spacing_20' : '2'}, el_paragraph, defval.line_spacing);

	buttons.list = nbe.inputs.list(editor.trigger, 'List', {none : 'none', disc : '•', 'square' : '▀', ordered : '1. 2. 3.', 'lower-alpha' : 'a. b. c.', 'upper-alpha' : 'A. B. C.', 'lower-roman' : 'i. ii. iii.', 'upper-roman' : 'I. II. III.'}, kite.browser.dom.ea('div', el_panel), defval.list);

	el_insert = kite.browser.dom.ea('div', el_panel);
	buttons.special_characters = nbe.inputs.special_characters(editor.trigger, 'Special characters', el_insert, null);
	buttons.insert_link = nbe.inputs.insert_link(editor.trigger, 'Insert link', el_insert);
	buttons.edit_link = nbe.inputs.edit_link(editor.trigger, 'Edit link', el_insert, null);
	buttons.insert_img = nbe.inputs.insert_image(editor.trigger, 'Insert image', el_insert);
	buttons.edit_img = nbe.inputs.edit_image(editor.trigger, 'Edit image', el_insert, null);

	for (key in buttons) {
		if (buttons.hasOwnProperty(key)) {
			editor.inputs.add(key, buttons[key]);
		}
	}

	button_undo = nbe.inputs.undo(editor.trigger, kite.browser.dom.ea('div', el_panel));
	editor.undo.add_button(button_undo);

	el_hide_format_panel = kite.browser.dom.eac('button', el_panel, 'hide circle_button');
	el_hide_format_panel.textContent = 'Close';
	el_hide_format_panel.addEventListener('click', toggle_panel, false);
};
