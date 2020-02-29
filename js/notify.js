nbe.notify.inputs = function (editor) {
	const inputs = {};

	const add = function (type, input) {
		if (type in inputs && inputs[type].indexOf(input) === -1) {
			inputs[type].push(input);
		} else {
			inputs[type] = [input];
		}
	};

	const remove = function (type, input) {
		const inputs_type = inputs[type];
		if (inputs_type) {
			const index = inputs_type.indexOf(input);
			if (index !== -1) {
				inputs[type] = inputs_type.slice(0, index).concat(inputs_type.slice(index + 1));
			}
		}
	};

	const notify_type = function (type, value) {
		if (type === 'left_margin' && 'left_margin' in inputs) {
			value = nbe.notify.left_margin(editor);
		}

		for (let i = 0; i < (type in inputs ? inputs[type].length : 0) ; i++) {
			inputs[type][i].set_value(value);
		}
	};

	const notify = function () {
		for (const type in nbe.state.formats.default_values) {
			if (nbe.state.formats.default_values.hasOwnProperty(type)) {
				notify_type(type, type in editor.format ? editor.format[type] : nbe.state.formats.default_values[type]);
			}
		}
	};

	return {add : add, remove : remove, notify : notify};
};

nbe.notify.left_margin = function (editor, _format) {
	let dec = 'off';
	let inc = 'off';

	const lines = nbe.location.lines(editor);
	lines.forEach(function (line) {
		var margin;

		margin = 'left_margin' in line.val ? line.val.left_margin : 0;
		inc = margin < nbe.state.formats.left_margin.max ? 'on' : inc;
		dec = margin > 0 ? 'on' : dec;
	});

	return dec + ':' + inc;
};
