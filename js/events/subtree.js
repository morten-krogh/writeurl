'use strict';

nbe.events.subtree = function (editor) {
	var active, events, timer, observe, disconnect;

	active = false;
	events = [];
	timer = null;

	editor.el_editor.addEventListener('DOMSubtreeModified', function (event) {
		if (active) {
			events.push(event);
			if (!timer) {
				timer = setTimeout(function () {
					editor.trigger('subtree', events);
					timer = null;
					events = [];
				}, 0);
			}
		}
	}, false);

	observe = function () {
		active = true;
	};

	disconnect = function () {
		active = false;
	};

	return {observe : observe, disconnect : disconnect, supported : true};
};
