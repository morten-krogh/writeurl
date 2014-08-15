'use strict';

nbe.doc.state_serialize = function (state) {
	return JSON.stringify({
		text : nbe.state.serialize(state.text),
		title : state.title,
		publish : state.publish
	});
};
