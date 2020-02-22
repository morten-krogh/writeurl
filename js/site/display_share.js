'use strict';

nbe.site.display_share = function (ids) {
	var share_window, el_share, display_url, section, el_publish_message, el_close, el_email_message;

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


	(function () {
		var el_section, access, url_handler, el_email, el_write, el_read, el_publish, el_email_address, el_message, el_email_send;

		el_section = kite.browser.dom.ea('div', el_share);

		access = 'publish';

		url_handler = function (e) {
			el_write.className = '';
			el_read.className = '';
			el_publish.className = '';
			if (e.target === el_write) {
				access = 'write';
				el_write.className = 'active';
			} else if (e.target === el_read) {
				access = 'read';
				el_read.className = 'active';
			} else if (e.target === el_publish) {
				access = 'publish';
				el_publish.className = 'active';
			}
		};

		el_email = kite.browser.dom.eac('div', el_section, 'share_email');
		kite.browser.dom.ea('h2', el_email).textContent = 'Share via e-mail';
		kite.browser.dom.ea('div', el_email).textContent = 'Select URL to share:';
		el_write = kite.browser.dom.ea('button', el_email);
		el_write.textContent = 'Write';
		el_write.addEventListener('click', url_handler);
		el_read = kite.browser.dom.ea('button', el_email);
		el_read.textContent = 'Read';
		el_read.addEventListener('click', url_handler);
		el_publish = kite.browser.dom.ea('button', el_email);
		el_publish.textContent = 'Publish';
		el_publish.addEventListener('click', url_handler);
		el_publish.className = 'active';
		kite.browser.dom.ea('div', el_email).textContent = 'E-mail address(es):';
		el_email_address = kite.browser.dom.ea('textarea', el_email);
		el_email_address.setAttribute('autocapitalize', 'none');
		kite.browser.dom.ea('div', el_email).textContent = 'Message (optional):';
		el_message = kite.browser.dom.ea('textarea', el_email);
		el_email_send = kite.browser.dom.eac('button', el_email, 'send');
		el_email_send.textContent = 'Send';
		el_email_send.addEventListener('click', function (_e) {
			var body, emails;

			emails = nbe.lib.share_emails(el_email_address.value);

			if (emails.invalid.length === 0 && emails.valid.length !== 0) {
				body = {type : 'share', emails : emails.valid, message : el_message.value, access : access, url : nbe.config.urls(ids)[access], title : nbe.dynamic.get_title()};
				nbe.lib.xhr('POST', nbe.config.share_url, {}, JSON.stringify(body), 0, function (_response) {
					el_email_address.value = '';
					el_email_message.textContent = 'The invitation has been sent.';
					el_email_message.className = 'message_success';
				}, function () {}, function () {
					el_email_message.textContent = 'Internet connection error, please try again.';
					el_email_message.className = 'message_failure';
				});
			} else {
				if (emails.invalid.length !== 0) {
					el_email_message.textContent = 'These email addresses are invalid. Please correct them.\n\n' + emails.invalid.join('\n');
				} else {
					el_email_message.textContent = 'Please specify the email address(es).';
				}
				el_email_message.className = 'message_failure';
			}
		}, false);
		el_email_message = kite.browser.dom.ea('span', el_email);
	}());

	el_close = kite.browser.dom.ea('button', el_share);
	el_close.textContent = 'Close';
	el_close.addEventListener('click', function (_e) {
		share_window.close();
	}, false);

	share_window.set_content(el_share);

	return {display : function () {
		el_email_message.textContent = '';
		el_publish_message.textContent = '';
		section.element.appendChild(nbe.dynamic.publish.msg);
		if (nbe.dynamic.publish.get_time() === null) {
			section.url.className = 'hidden';
		} else {
			section.url.className = 'visible';
		}
		share_window.open();
	}};
};
