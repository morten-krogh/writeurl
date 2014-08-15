'use strict';

nbe.state.line_font_size = function (state, dom, line_id, domop) {
	var line, el_line, child, font_size;

	line = state.nodes[line_id];
	if (dom) {
		el_line = dom[line_id];
	}

	if (domop === 'remove') {
		if (line.children.length === 1) {
			child = line.children[0];
			if (child.type === 'text') {
				font_size = child.val.font_size;
				if (font_size) {
					line.val.font_size = font_size;
					if (dom) {
						nbe.state.mutate_element(el_line, 'line', line.val);
					}
				}
			}
		}
	} else {
		if (line.val.font_size) {
			delete line.val.font_size;
			if (dom) {
				nbe.state.mutate_element(el_line, 'line', line.val);
			}
		}
	}
};
