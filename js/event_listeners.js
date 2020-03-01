
function domsubtreemodified(editor) {
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
}

function mutationobserver(editor) {
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
}

function add_event_listeners(editor) {
	var el_editor;

	el_editor = editor.el_editor;

	el_editor.addEventListener('click', function (_event) {
		//console.log('click');
		nbe.location.get_format(editor);
	}, false);

	el_editor.addEventListener('touchend', function (_event) {
		setTimeout(function () {
			nbe.location.get_format(editor);
		}, 0);
	}, false);

	el_editor.addEventListener('keydown', function (event) {
		//console.log('keydown', event);
		if (event.which && (event.keyCode >= 37 && event.keyCode <= 40)) {
			nbe.location.get_format(editor);
		} else if (event.keyCode === 8) {
			editor.trigger('delete', null);
			event.preventDefault();
		} else if (event.keyCode === 9) {
			editor.trigger('tab', null);
			event.preventDefault();
		} else if (event.keyCode === 13) {
			editor.trigger('newline', null);
			event.preventDefault();
		} else if (event.ctrlKey || event.metaKey) {
			if (event.keyCode === 65) {
				editor.trigger('select', null);
				event.preventDefault();
			} else if (event.keyCode === 86) {
				editor.trigger('paste', null);
			} else if (event.keyCode === 88) {
				//editor.trigger('cut', null); cut event is fired automatically.
			} else if (event.keyCode === 90) {
				editor.trigger('undo', event.shiftKey ? 'redo' : 'undo');
				event.preventDefault();
			}
		}
	}, false);

	el_editor.addEventListener('keypress', function (event) {
		var char;

		//console.log('keypress', event);
		if (event.charCode === 0 && event.keyCode >= 37 && event.keyCode <= 40) {
			nbe.location.get_format(editor);
		} else if (!event.ctrlKey && !event.metaKey && event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 13) {
			char = String.fromCharCode(event.charCode ? event.charCode : event.which);
			editor.trigger('text', char);
			event.preventDefault();
		}
	}, false);

	el_editor.addEventListener('keyup', function (event) {
		//console.log('keyup');
		if (event.keyCode >= 37 && event.keyCode <= 40) {
			nbe.location.get_format(editor);
		}
	}, false);

	el_editor.addEventListener('mousedown', function (_event) {
		// console.log('mousedown');
	}, false);

	el_editor.addEventListener('mouseup', function (_event) {
		nbe.location.get_format(editor);
	}, false);

	el_editor.addEventListener('mouseout', function (_event) {
	}, false);

	el_editor.addEventListener('focus', function (_event) {
		//console.log('focus');
		editor.focus = true;
	}, false);

	el_editor.addEventListener('blur', function (_event) {
		editor.focus = false;
	}, false);

	el_editor.addEventListener('select', function (_event) {
		editor.trigger('select', null);
	}, false);

	el_editor.addEventListener('paste', function (_event) {
		editor.trigger('paste', null);
	}, false);

	el_editor.addEventListener('cut', function (_event) {
		editor.trigger('cut', null);
	}, false);

	editor.mutation = mutationobserver(editor);
	if (!editor.mutation.supported) {
		editor.mutation = domsubtreemodified(editor);
	}
}

export {
    mutationobserver,
    add_event_listeners,
};
