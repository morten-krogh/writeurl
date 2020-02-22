import { TitleState } from '../title/title.js';

nbe.doc.state_deserialize = function (value) {
	var parsed;

	parsed = JSON.parse(value);

	return {
		text : nbe.state.deserialize(parsed.text),
		title : new TitleState(parsed.title.value),
		publish : parsed.publish
	};
};
