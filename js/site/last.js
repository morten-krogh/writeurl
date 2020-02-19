'use strict';

(function () {
	var supported, ids, loading, status_panel, callback_status, doc;

	supported = typeof(WebSocket) !== 'undefined' || typeof(MozWebSocket) === 'function';

	ids = nbe.config.parse_pathname(window.location.pathname);

	nbe.site.display_feedback();

	if (ids.prefix === 'new') {
		window.location = nbe.config.new_url();
	} else if ((ids.prefix !== 'text'  && ids.prefix !== 'scroller') || ids.id === null || ids.read === null || (ids.new_doc && ids.write === null)) {
		if (window.history.replaceState) {
			window.history.replaceState('', '', nbe.config.home_pathname);
		}
		document.getElementById('frontpage').style.display = 'inline';
		nbe.site.display_demo();
		nbe.site.supported_front(supported);
	} else if (!supported) {
		nbe.site.supported_doc();
	} else {
		if (ids.new_doc) {
			window.history.replaceState('', '', nbe.config.write_pathname(ids));
		}

		loading = nbe.site.loading();
		loading.on();
		if (ids.write !== null) {
			status_panel = nbe.site.status_panel(ids);
		}

		document.getElementById('home').target = '_blank';
		document.getElementById('faq').target = '_blank';

		callback_status = function (key, value) {
			if (key === 'doc') {
				loading.off();
				if (value === 'exist') {
					doc.comm.notify();
					nbe.site.display_editor(doc);
					if (ids.write !== null) {
						status_panel.display(document.getElementById('panel'));
					}
				} else if (value === 'noexist') {
					nbe.site.doc_noexist(doc);
				}
			} else if (key === 'password') {
				if (value === 'wrong password') {
					nbe.site.wrong_password();
				}
			} else if (key === 'network' || key === 'nunsaved') {
				if (ids.write !== null) {
					status_panel.set_status(key, value);
				}
			}
		};

		doc = nbe.doc.create(ids, nbe.config.local_storage, nbe.config.ws_url, callback_status);
		nbe.dynamic.doc = doc;

		if (doc.server_status !== 'unknown') {
			callback_status('doc', 'exist');
		}
	}

	// iOS Safari hide browser address bar
	/*
	setTimeout(function () {
		window.scrollTo(0, 0);
	}, 0);
	*/

    
    // Register the service worker for offline caching.
    if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/serviceworker.js').then(registration => {
                console.log('service worker registered');
            });

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('controllerchange');
            });
    }
}());
