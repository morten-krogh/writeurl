'use strict';

nbe.state.state_copy = function (state) {
	return nbe.state.deserialize(nbe.state.serialize(state));
};
