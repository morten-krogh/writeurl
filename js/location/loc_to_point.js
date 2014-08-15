'use strict';

nbe.location.loc_to_point = function (editor, loc) {
	return {node : editor.state.nodes[loc.container], offset : loc.offset};
};
