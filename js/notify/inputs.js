'use strict';

nbe.notify.inputs = function (editor) {
	var inputs, add, remove, notify, notify_type;

	inputs = {};

	add = function (type, input) {
		if (type in inputs && inputs[type].indexOf(input) === -1) {
			inputs[type].push(input);
		} else {
			inputs[type] = [input];
		}
	};

	remove = function (type, input) {
		var inputs_type, index;

		inputs_type = inputs[type];
		if (inputs_type) {
			index = inputs_type.indexOf(input);
			if (index !== -1) {
				inputs[type] = inputs_type.slice(0, index).concat(inputs_type.slice(index + 1));
			}
		}
	};

	notify_type = function (type, value) {
		var i;

		if (type === 'left_margin' && 'left_margin' in inputs) {
			value = nbe.notify.left_margin(editor);
		}

		for (i = 0; i < (type in inputs ? inputs[type].length : 0) ; i++) {
			inputs[type][i].set_value(value);
		}
	};

	notify = function () {
		var type;

		for (type in nbe.state.formats.default_values) {
			if (nbe.state.formats.default_values.hasOwnProperty(type)) {
				notify_type(type, type in editor.format ? editor.format[type] : nbe.state.formats.default_values[type]);
			}
		}
	};

	return {add : add, remove : remove, notify : notify};
};
