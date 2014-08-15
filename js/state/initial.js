'use strict';

nbe.state.initial = function () {
	return JSON.stringify({
		nodes : {
			root : {
				type : 'root',
				id : 'root',
				parent : null,
				children : ['line'],
				val : {}
			},
			line : {
				type : 'line',
				id : 'line',
				parent : 'root',
				children : [],
				val : {}
			}
		}
	});
};
