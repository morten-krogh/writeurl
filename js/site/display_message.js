
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

//function display_loading() {
//	var el_message, status, on, off;
//
//	el_message = document.createElement('div');
//	el_message.className = 'full_screen_message';
//	kite.browser.dom.ea('div', el_message).textContent = 'We are trying to connect to the server.';
//
//	status = 'init';
//
//	on = function () {
//		setTimeout(function () {
//			if (status === 'init') {
//				status = 'on';
//				document.body.appendChild(el_message);
//			}
//		}, 200);
//	};
//
//	off = function () {
//		if (status === 'on') {
//			document.body.removeChild(el_message);
//		}
//		status = 'off';
//	};
//
//	return {on : on, off : off};
//}

function display_url_error() {
	const el_message = kite.browser.dom.eac('div', document.body, 'full_screen_message');
	kite.browser.dom.ea('div', el_message).textContent = 'It seems like you\'re not using a proper URL for this document, please check your link.';
}

export { TryingToConnect, display_url_error };
