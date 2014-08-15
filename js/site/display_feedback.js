'use strict';

nbe.site.display_feedback = function () {
	var el_button, feedback_window, el_feedback, el_name, el_email_address, el_message, el_buttons, el_send, el_send_message, el_close;

	feedback_window = new kite.browser.ui.Window();
	feedback_window.set_title('Feedback');

	el_button = document.getElementById('feedback');
	el_button.addEventListener('click', function (e) {
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
	el_send.addEventListener('click', function (e) {
		if (el_message.value) {
			if (!el_email_address.value || (el_email_address.value && nbe.lib.valid_email(el_email_address.value))) {
				var body = {type : 'feedback', name : el_name.value, mail : el_email_address.value, message : el_message.value};
				nbe.lib.xhr('POST', nbe.config.feedback_url, {}, JSON.stringify(body), 0, function (response) {
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
	el_close.addEventListener('click', function (e) {
		feedback_window.close();
	}, false);

	feedback_window.set_content(el_feedback);
};
