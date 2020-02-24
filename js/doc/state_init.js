import { TitleState } from '../title.js';
import { PublishState } from '../publish.js';

nbe.doc.state_init = function () {
	return {
		text : nbe.state.deserialize(nbe.state.initial()),
		title : new TitleState(),
		publish : new PublishState(),
	};
};
