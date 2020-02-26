import { rnd_string } from './lib/rnd_string.js';

function display_share(ids) {
	var share_window, el_share, display_url, section, el_publish_message, el_close;

	share_window = new kite.browser.ui.Window();
	share_window.set_title('Share');

	el_share = kite.browser.dom.ec('div', 'nbe_window share');
	kite.browser.dom.ea('img', el_share).src = '/img/fork.svg';
	kite.browser.dom.ea('h1', el_share).textContent = 'Share';
	kite.browser.dom.ea('p', el_share).textContent = 'Share the write URL with collaborators or share the read or publish URLs with readers.';

	display_url = function (heading, text, url) {
		var el_section, el_heading, el_url;

		el_section = kite.browser.dom.ea('div', el_share);
		el_heading = kite.browser.dom.ea('h2', el_section);
		el_heading.textContent = heading;
		kite.browser.dom.ea('span', el_heading).textContent = text;
		el_url = kite.browser.dom.ea('a', el_section);
		el_url.textContent = url;
		el_url.href = url;
		el_url.target = '_blank';

		return {element : el_section, url : el_url};
	};

	display_url('Write URL', '(Collaborators can edit the document with this URL)', nbe.config.urls(ids).write);
	display_url('Read URL', '(Readers can view the document and see changes as you type)', nbe.config.urls(ids).read);
	section = display_url('Publish URL', '(Readers can view the published version of this document)', nbe.config.urls(ids).publish);

	(function () {
		var el_html;

		el_html = kite.browser.dom.ea('button', section.element);
		el_html.textContent = 'Publish';

		//nbe.dynamic.publish.get_time(); // null or new Date(time)

		el_publish_message = kite.browser.dom.ea('span', section.element);

		el_html.addEventListener('click', function (_e) {
			nbe.dynamic.publish.publish(function (response) {

				if (response === 'published') {
					el_publish_message.textContent = 'The document is published!';
					el_publish_message.className = 'message_success';
					section.url.className = 'visible';
				} else if (response === 'not published') {
					el_publish_message.textContent = 'Error, please try again.';
					el_publish_message.className = 'message_failure';
				} else { // null
					el_publish_message.textContent = 'Network error.';
					el_publish_message.className = 'message_failure';
				}
			});
		}, false);
	}());

	el_close = kite.browser.dom.ea('button', el_share);
	el_close.textContent = 'Close';
	el_close.addEventListener('click', function (_e) {
		share_window.close();
	}, false);

	share_window.set_content(el_share);

	return {display : function () {
		//el_email_message.textContent = '';
		el_publish_message.textContent = '';
		section.element.appendChild(nbe.dynamic.publish.msg);
		if (nbe.dynamic.publish.get_time() === null) {
			section.url.className = 'hidden';
		} else {
			section.url.className = 'visible';
		}
		share_window.open();
	}};
}

class TryingToConnect {
    constructor() {
        this.status = 'init';
        this.el_message = document.createElement('div');
        this.el_message.className = 'full_screen_message';
        kite.browser.dom.ea('div', this.el_message).textContent = 'We are trying to connect to the server.';
    }

	on() {
		setTimeout(function () {
			if (this.status === 'init') {
				this.status = 'on';
				document.body.appendChild(this.el_message);
			}
		}, 200);
	}

	off() {
		if (this.status === 'on') {
			document.body.removeChild(this.el_message);
		}
		this.status = 'off';
	}
}

function display_url_error() {
	const el_message = kite.browser.dom.eac('div', document.body, 'full_screen_message');
	kite.browser.dom.ea('div', el_message).textContent = 'It seems like you\'re not using a proper URL for this document, please check your link.';
}

function display_feedback() {
	var el_button, feedback_window, el_feedback, el_name, el_email_address, el_message, el_buttons, el_send, el_send_message, el_close;

	feedback_window = new kite.browser.ui.Window();
	feedback_window.set_title('Feedback');

	el_button = document.getElementById('feedback');
	el_button.addEventListener('click', function (_e) {
		feedback_window.open();
	}, false);

	el_feedback = kite.browser.dom.ec('div', 'nbe_window feedback');
	kite.browser.dom.ea('div', el_feedback).innerHTML = '!';
	kite.browser.dom.ea('h1', el_feedback).innerHTML = 'Feedback';
	kite.browser.dom.ea('p', el_feedback).innerHTML = 'Your opinion is very valuable to us, please let us know what you think.';

	kite.browser.dom.ea('h3', el_feedback).innerHTML = 'Name';

	el_name = kite.browser.dom.ea('input', el_feedback);
	el_name.type = 'text';

	kite.browser.dom.ea('h3', el_feedback).innerHTML = 'E-mail';

	el_email_address = kite.browser.dom.input('email', null, null, null, null, null, el_feedback);
	el_email_address.setAttribute('autocapitalize', 'none');

	kite.browser.dom.ea('h3', el_feedback).innerHTML = 'Message';

	el_message = kite.browser.dom.ea('textarea', el_feedback);

	el_buttons = kite.browser.dom.ea('footer', el_feedback);

	el_send = kite.browser.dom.ea('button', el_buttons);
	el_send.innerHTML = 'Send';
	el_send.addEventListener('click', function (_e) {
		if (el_message.value) {
			if (!el_email_address.value || (el_email_address.value && nbe.lib.valid_email(el_email_address.value))) {
				var body = {type : 'feedback', name : el_name.value, mail : el_email_address.value, message : el_message.value};
				nbe.lib.xhr('POST', nbe.config.feedback_url, {}, JSON.stringify(body), 0, function (_response) {
					el_name.value = '';
					el_email_address.value = '';
					el_message.value = '';
					el_send_message.innerHTML = 'Email sent.';
					el_send_message.className = 'message_success';
					setTimeout(function () {
						kite.browser.animation.Fade_out(el_send_message, {duration : 4000});
					}, 2000);
				}, function () {}, function () {
                    // error
					el_send_message.innerHTML = 'Server error, please try again.';
					el_send_message.className = 'message_failure';
					setTimeout(function () {
						kite.browser.animation.Fade_out(el_send_message, {duration : 4000});
					}, 2000);
				});
			} else {
				el_send_message.innerHTML = 'The email address is incorrect.';
				el_send_message.className = 'message_failure';
				setTimeout(function () {
					kite.browser.animation.Fade_out(el_send_message, {duration : 4000});
				}, 2000);
			}
		} else {
			el_send_message.innerHTML = 'Please write a message.';
			el_send_message.className = 'message_failure';
			setTimeout(function () {
				kite.browser.animation.Fade_out(el_send_message, {duration : 4000});
			}, 2000);
		}
	}, false);

	el_send_message = kite.browser.dom.ea('div', el_buttons);

	el_close = kite.browser.dom.ea('button', el_buttons);
	el_close.innerHTML = 'Close';
	el_close.addEventListener('click', function (_e) {
		feedback_window.close();
	}, false);

	feedback_window.set_content(el_feedback);
}

function display_export() {
	var export_window, el_export, el_section, el_word, el_html, el_close;

	export_window = new kite.browser.ui.Window();
	export_window.set_title('Export');

	el_export = kite.browser.dom.ec('div', 'nbe_window share');
	kite.browser.dom.ea('img', el_export).src = '/img/export.svg';
	kite.browser.dom.ea('h1', el_export).textContent = 'Export';
	kite.browser.dom.ea('p', el_export).textContent = 'Please select format by clicking one of the buttons and the file will be downloaded to your device.';

	el_section = kite.browser.dom.ea('div', el_export);
	kite.browser.dom.ea('p', el_section).textContent = 'Please note that export currently only works in Google Chrome.';

	el_word = kite.browser.dom.ea('button', el_section);
	el_word.textContent = 'Word';
	el_word.addEventListener('click', function (_e) {
		nbe.lib.save_as(new Blob([nbe.doc.html(nbe.dynamic.doc)], {type : 'application/vnd.ms-word'}), nbe.dynamic.get_title() + '.doc');
	}, false);

	el_html = kite.browser.dom.ea('button', el_section);
	el_html.textContent = 'HTML';
	el_html.addEventListener('click', function (_e) {
		nbe.lib.save_as(new Blob([nbe.doc.html(nbe.dynamic.doc)], {type : 'text/html'}), nbe.dynamic.get_title() + '.html');
	}, false);

	kite.browser.dom.ea('p', el_export);

	el_close = kite.browser.dom.ea('button', el_export);
	el_close.textContent = 'Close';
	el_close.addEventListener('click', function (_e) {
		export_window.close();
	}, false);

	export_window.set_content(el_export);

	return {display : function () {
		export_window.open();
	}};
}

function display_editor(doc) {
	var editable, editor, el_editor_container, title_editor;

	editable = doc.ids.write !== null;
	document.getElementById('frontpage').style.display = 'none';
	if (editable) {
		document.body.className = 'editor';
	} else {
		document.getElementById('home').style.display = 'none';
		document.getElementById('feedback').style.display = 'none';
		document.getElementById('faq').style.display = 'none';
		document.body.className = 'read_editor';
	}

	editor = doc.editors.add('editor', 'text', {editable : editable});
	el_editor_container = kite.browser.dom.eac('div', document.body, 'editor_container');

	if (editable) {
		insert_panel(document.getElementById('panel'), editor);
	}

	title_editor = doc.editors.add('title_editor', 'title', {editable : editable, html_title : true});
	if (editable) {
		kite.browser.dom.eac('div', el_editor_container, 'wu-title-container').appendChild(title_editor.el_editor);
	}
	nbe.dynamic.get_title = title_editor.get_value;

	nbe.dynamic.publish = doc.editors.add('publish_editor', 'publish', {});

	el_editor_container.appendChild(editor.el_editor);

	if (doc.ids.prefix === 'scroller' && doc.ids.write === null) {
		scroller(editor);
	}
}

function display_demo() {
	var doc, ops, editor_write, editor_read;

	doc = nbe.doc.create({id : 'demo', read : null, write : null, new_doc : true}, false, null, function (_key, _value) {});

	ops = [
                {domop : 'append', id : 'line2', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line3', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line4', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line5', parent : 'root', type : 'line', val : {heading : 'heading4'}},
                {domop : 'append', id : 'line6', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line7', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line8', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line9', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line10', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line11', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line12', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line13', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line14', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line15', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line16', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line17', parent : 'root', type : 'line', val : {text_align : 'center'}},
                {domop : 'append', id : 'line18', parent : 'root', type : 'line', val : {text_align : 'center'}},
                {domop : 'append', id : 'line19', parent : 'root', type : 'line', val : {text_align : 'center'}},
                {domop : 'append', id : 'line20', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line21', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line22', parent : 'root', type : 'line', val : {left_margin : 20}},
                {domop : 'append', id : 'line23', parent : 'root', type : 'line', val : {left_margin : 40}},
                {domop : 'append', id : 'line24', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line25', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line26', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line27', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line28', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'text1.2', parent : 'line', type : 'text', val : {text : 'Write in the left windows and see changes in the right window'}},
                {domop : 'append', id : 'text3.1', parent : 'line3', type : 'text', val : {text : 'You can insert '}},
                {domop : 'append', id : 'link3.2', parent : 'line3', type : 'link', val : {href : 'www.writeurl.com'}},
                {domop : 'append', id : 'text3.3', parent : 'link3.2', type : 'text', val : {text : 'links'}},
                {domop : 'append', id : 'text3.4', parent : 'line3', type : 'text', val : {text : ', images '}},
                {domop : 'append', id : 'img3.5', parent : 'line3', type : 'img', val : {src : '/img/nyckelpiga.jpg', height : '50'}},
                {domop : 'append', id : 'text3.6', parent : 'line3', type : 'text', val : {text : ' and special characters : \u03b1\u03b2\u03b3'}},
                {domop : 'append', id : 'text5.1', parent : 'line5', type : 'text', val : {text : 'Lines can have headers'}},
                {domop : 'append', id : 'text7.1', parent : 'line7', type : 'text', val : {text : 'There are lists and formatted text'}},
                {domop : 'append', id : 'text9.1', parent : 'line9', type : 'text', val : {text : 'bold', bold : 'on'}},
                {domop : 'append', id : 'text10.1', parent : 'line10', type : 'text', val : {text : 'italic', italic : 'on'}},
                {domop : 'append', id : 'text11.1', parent : 'line11', type : 'text', val : {text : 'underline', underline : 'on'}},
                {domop : 'append', id : 'text12.1', parent : 'line12', type : 'text', val : {text : 'strikethrough', strikethrough : 'on'}},
                {domop : 'append', id : 'text13.1', parent : 'line13', type : 'text', val : {text : 'color', color : 'rgb(255,0,0)'}},
                {domop : 'append', id : 'text14.1', parent : 'line14', type : 'text', val : {text : 'line color', background_color : 'rgb(255,255,0)'}},
                {domop : 'append', id : 'text15.1', parent : 'line15', type : 'text', val : {text : 'superscript', vertical_align : 'super'}},
                {domop : 'append', id : 'text15.2', parent : 'line15', type : 'text', val : {text : ' and '}},
                {domop : 'append', id : 'text15.3', parent : 'line15', type : 'text', val : {text : 'subscript', vertical_align : 'sub'}},
                {domop : 'append', id : 'text17.1', parent : 'line17', type : 'text', val : {text : 'Text alignments can be left,'}},
                {domop : 'append', id : 'text18.1', parent : 'line18', type : 'text', val : {text : 'center (as here),'}},
                {domop : 'append', id : 'text19.1', parent : 'line19', type : 'text', val : {text : 'right and justify.'}},
                {domop : 'append', id : 'text21.1', parent : 'line21', type : 'text', val : {text : 'Text can'}},
                {domop : 'append', id : 'text22.1', parent : 'line22', type : 'text', val : {text : 'also have'}},
                {domop : 'append', id : 'text23.1', parent : 'line23', type : 'text', val : {text : 'indentation levels'}},
                {domop : 'append', id : 'text25.1', parent : 'line25', type : 'text', val : {text : 'Undo ( button or ctrl-z), redo (button or ctrl-shift-z)'}},
                {domop : 'append', id : 'text26.1', parent : 'line26', type : 'text', val : {text : 'Copy (ctrl-c), cut (ctrl-x), paste (ctrl-v)'}},
                {domop : 'append', id : 'text28.1', parent : 'line28', type : 'text', val : {text : 'spell check, fonts, line spacing.'}}
        ];

	doc.add_ops(null, ops);

	editor_write = doc.editors.add('editor_write', 'text', {editable : true});
	document.getElementById('editor_write').appendChild(editor_write.el_editor);

	editor_read = doc.editors.add('editor_read', 'text', {editable : false});
	document.getElementById('editor_read').appendChild(editor_read.el_editor);

	insert_panel(document.getElementById('demo_panel'), editor_write);
}

function status_panel(ids) {
	var element, share, el_share_button, el_export_button, network, saved, set_status, display;

	element = kite.browser.dom.ec('div', 'status_panel');

	share = display_share(ids);

	el_share_button = kite.browser.dom.eac('button', element, 'circle_button');
	el_share_button.textContent = 'Share';
	el_share_button.addEventListener('click', function (_e) {
		share.display(ids);
	}, false);

	const display_export_obj = display_export(ids);

	el_export_button = nbe.browser.icon.exporticon(element);
	el_export_button.addEventListener('click', function (_e) {
		display_export_obj.display();
	}, false);

	network = nbe.browser.icon.network(element);
	saved = nbe.browser.icon.saved(element);

	set_status = function (key, value) {
		if (key === 'network') {
			if (value === 'connected') {
				//el_network.title = 'You are online';
				network.on();
			} else {
				//el_network.title = 'You are offline';
				network.off();
			}
		} else if (key === 'nunsaved') {
			if (value > 0) {
				//el_saved.title = 'You have unsaved changes';
				saved.off();
			} else {
				//el_saved.title = 'You are offline';
				saved.on();
			}
		}
	};

	display = function (el_panel_container) {
		el_panel_container.appendChild(element);
	};

	return {set_status : set_status, display : display};
}

function doc_noexist(_doc) {
	const el_message = kite.browser.dom.eac('div', document.body, 'full_screen_message');
	kite.browser.dom.ea('div', el_message).textContent = 'The document is not known to the server.';
}

function insert_panel(el_panel_container, editor) {
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
}

function supported_front() {
	const el_new_button = document.getElementById('new_doc');
    el_new_button.addEventListener('click', function (_e) {
        window.open(nbe.config.new_url(), '_blank');
    }, false);
}

function scroller(editor) {
	var el_editor, el_scroll;

	el_editor = editor.el_editor;
	el_scroll = el_editor.parentNode.classList.contains('editor_container') ? el_editor.parentNode : el_editor;

	setInterval(function () {
		el_scroll.scrollTop = el_scroll.scrollHeight;
	}, 200);
}

// el_text, el_title, el_panel : elements for insertion of text, title and panel. If they are null, there is no insertion.
// ids = {id, read, write}, if ids.write is null, the editor is read only, otherwise writeable.
// new_doc : is the document new
// ws_url : the url of the web socket to the server.
// local_storage : boolean designating whether local storage is to be used.
// html_title : whtehr the title should be used as title of the full html document.
// callback : get key value pairs.
function embed(el_text, el_title, el_panel, ids, new_doc, ws_url, local_storage, html_title, callback) {
	var editable, dom_id_to_el, callback_status, doc;

	editable = !(ids.write === null || ids.write === '');

	dom_id_to_el = function (id) {
		return typeof(id) === 'string' ? document.getElementById(id) : id;
	};

	callback_status = function (key, value) {
		var editor, title_editor;

		callback(key, value);
		if (key === 'doc' && value === 'exist') {
			doc.comm.notify();
			editor = doc.editors.add('editor', 'text', {editable : editable});
			if (el_text) {
				dom_id_to_el(el_text).appendChild(editor.el_editor);
			}
			if (el_title) {
				title_editor = doc.editors.add('title_editor', 'title', {editable : editable, html_title : html_title});
				dom_id_to_el(el_title).appendChild(title_editor.el_editor);
			}
			if (el_panel) {
				insert_panel(dom_id_to_el(el_panel), editor);
			}
		}
	};

	ids.new_doc = new_doc;
	doc = nbe.doc.create(ids, local_storage, ws_url, callback_status);

	if (doc.server_status !== 'unknown') {
		callback_status('doc', 'exist');
	}
}

// Helper function to call embed.
// It is used for write documents.
// 
// el : an element where panel, title and text is inserted. el can be an id of an element.
// ids : an object with id, the read password, and write password.
function embed_new(el) {
	var ws_url, el_panel, el_title, el_text, ids;

	el = typeof(el) === 'string' ? document.getElementById(el) : el;

	ws_url = 'ws://www.writeurl.com/operations';

	el_panel = document.createElement('div');
	el.appendChild(el_panel);
	el_title = document.createElement('div');
	el.appendChild(el_title);
	el_text = document.createElement('div');
	el.appendChild(el_text);

	ids = {
		id : rnd_string(20),
		read : rnd_string(20),
		write : rnd_string(20)
	};

	embed(el_text, el_title, el_panel, ids, true, ws_url, true, false, function () {});

	return ids;
}

// Helper function to call embed.
// It is used for read only documents.
// 
// el : an element where title and text is inserted. el can be an id of an element.
// ids : an object with id and the read password.
function embed_read(el, ids) {
	var ws_url, el_title, el_text;

	el = typeof(el) === 'string' ? document.getElementById(el) : el;

	ws_url = 'ws://www.writeurl.com/operations';

	ids.write = null;

	el_title = document.createElement('div');
	el.appendChild(el_title);
	el_text = document.createElement('div');
	el.appendChild(el_text);

	embed(el_text, el_title, null, ids, false, ws_url, true, false, function () {});
}

// Helper function to call embed.
// It is used for write documents.
// 
// el : an element where panel, title and text is inserted. el can be an id of an element.
// ids : an object with id, the read password, and write password.
function embed_write(el, ids) {
	var ws_url, el_panel, el_title, el_text;

	el = typeof(el) === 'string' ? document.getElementById(el) : el;

	ws_url = 'ws://www.writeurl.com/operations';

	el_panel = document.createElement('div');
	el.appendChild(el_panel);
	el_title = document.createElement('div');
	el.appendChild(el_title);
	el_text = document.createElement('div');
	el.appendChild(el_text);

	embed(el_text, el_title, el_panel, ids, false, ws_url, true, false, function () {});
}

export { 
    TryingToConnect, 
    display_url_error,
    display_feedback,
    display_editor,
    display_demo,
    status_panel,
    doc_noexist,
    insert_panel,
    supported_front,
    embed_new,
    embed_read,
    embed_write,
};
