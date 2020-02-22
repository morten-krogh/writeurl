import { TitleState } from '../title.js';

nbe.doc.state_init = function () {
	return {
		text : nbe.state.deserialize(nbe.state.initial()),
		title : new TitleState(),
		publish : nbe.publish.state_init()
	};
};
