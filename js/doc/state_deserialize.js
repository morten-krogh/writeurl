'use strict';

nbe.doc.state_deserialize = function (value) {
	var parsed;

	parsed = JSON.parse(value);

	return {
		text : nbe.state.deserialize(parsed.text),
		title : parsed.title,
		publish : parsed.publish
	};
};
