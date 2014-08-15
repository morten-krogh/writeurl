'use strict';

nbe.events.observer = function (editor) {
	var MutationObserver, supported, observer, config, observe, disconnect;

	MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	supported = typeof(MutationObserver) !== 'undefined';

	if (supported) {
		observer = new MutationObserver(function (mutations) {
			editor.trigger('observer', mutations);
		});
	}

	config = {childList: true, characterData: true, subtree : true};

	observe = function () {
		observer.observe(editor.el_editor, config);
	};

	disconnect = function () {
		observer.disconnect();
	};

	return {observe : observe, disconnect : disconnect, supported : supported};
};
