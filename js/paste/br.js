'use strict';

nbe.paste.br = function (state, node) {
	var line;

	line = {type : 'line', val : {}, children : []};
	state.root.push(line);
	state.line = line;

	return state;
};
