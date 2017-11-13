'use strict';

/* global nbe: false */

exports.init = function () {
	return nbe.doc.state_serialize(nbe.doc.state_init());
};

exports.update = function (state, operations) {
	var state_deserialized;

	state_deserialized = nbe.doc.state_deserialize(state);

	nbe.doc.state_update(state_deserialized, operations);

	return nbe.doc.state_serialize(state_deserialized);
};

exports.test = function (state, operations) {
	var state_deserialized, i, st1, st2;

	state_deserialized = nbe.doc.state_deserialize(state);
	for (i = 0; i < operations.length; i++) {
		//console.log(i);
		nbe.doc.state_update(state_deserialized, [operations[i]]);

		try {
			st1 = nbe.doc.state_serialize(state_deserialized);
			st2 = nbe.doc.state_serialize(nbe.doc.state_deserialize(st1));
			console.log(st2);
		} catch (e) {
			console.log(state_deserialized.text.nodes.root.children.slice(0, 5));
			//console.log(nbe.doc.state_serialize(state_deserialized));
			//st1 = nbe.doc.state_deserialize(nbe.doc.state_serialize(state_deserialized));
			//console.log(st1.text.nodes.root.children.slice(0, 5));
			//console.log('error', i, operations[i]);
			break;
		}
	}
};
