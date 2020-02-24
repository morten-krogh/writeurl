import { TitleState } from '../title.js';
import { PublishState } from '../publish.js';

nbe.doc.state_deserialize = function (value) {
	const parsed = JSON.parse(value);

	return {
		text : nbe.state.deserialize(parsed.text),
		title : new TitleState(parsed.title.value),
		publish : new PublishState(parsed.publish.time),
	};
};
