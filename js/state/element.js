'use strict';

nbe.state.element = function (id, type, val) {
	var name, el;

	name = {
		root : 'div',
		line : 'div',
		text : 'span',
		img : 'img',
		link : 'a'
	}[type];

	el = document.createElement(name);
	el.setAttribute('data-id', id);
	el.classList.add('wu-' + type);

	if (type === 'line') {
		el.appendChild(document.createElement('br'));
	}

	nbe.state.mutate_element(el, type, val);

	return el;
};
