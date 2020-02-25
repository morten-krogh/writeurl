import { insert_panel } from './panel.js';

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
		nbe.site.scroller(editor);
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

export { 
    TryingToConnect, 
    display_url_error,
    display_feedback,
    display_editor,
    display_demo,
    status_panel,
};
