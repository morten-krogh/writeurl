'use strict';

nbe.doc.state_init = function () {
	return {
		text : nbe.state.deserialize(nbe.state.initial()),
		title : nbe.title.state_init(),
		publish : nbe.publish.state_init()
	};
};
