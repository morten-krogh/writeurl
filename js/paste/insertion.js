'use strict';

nbe.paste.insertion = function (container) {
	var line, state, insertion;

	line = {type : 'line', val : {}, children : []};
	state = {root : [line], line : line, link : null, format : {}};

	state = nbe.paste.traverse(state, container);

	insertion = [];

	if (Object.keys(state.root[0].val).length !== 0) {
		insertion.push({type : 'line', val : {}, children : []});
	}

	insertion = insertion.concat(state.root);

	if (Object.keys(state.root[state.root.length - 1].val).length !== 0) {
		insertion.push({type : 'line', val : {}, children : []});
	}

	return insertion;
};
