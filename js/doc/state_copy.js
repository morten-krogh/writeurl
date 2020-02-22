'use strict';

nbe.doc.state_copy = function (state) {
	return {
		text : nbe.state.deserialize(nbe.state.serialize(state.text)),
		title : state.title.copy(),
		publish : nbe.publish.state_copy(state.publish)
	};
};
