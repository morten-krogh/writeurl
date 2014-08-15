'use strict';

nbe.doc.state_copy = function (state) {
	return {
		text : nbe.state.deserialize(nbe.state.serialize(state.text)),
		title : nbe.title.state_copy(state.title),
		publish : nbe.publish.state_copy(state.publish)
	};
};
