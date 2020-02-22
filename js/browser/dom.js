'use strict';

kite.browser.dom = {};

kite.browser.dom.eac = function (type, append_to, classname) {
	var element = document.createElement(type);
	element.className = classname;
	append_to.appendChild(element);
	return element;
};

kite.browser.dom.ec = function (type, classname) {
	var element = document.createElement(type);
	element.className = classname;
	return element;
};

kite.browser.dom.ea = function (type, append_to) {
	var element = document.createElement(type);
	append_to.appendChild(element);
	return element;
};

kite.browser.dom.input = function (_type, _id, _name, _value, _classname, _placeholder, append_to) {
	var element, properties, i, p;

	element = document.createElement('input');
	properties = ['type', 'id', 'name', 'value', 'className', 'placeholder'];

	for (i = 0; i < properties.length; i++) {
		p = properties[i];
		if (arguments[i]) {
			element.setAttribute(p, arguments[i]);
		}
	}
	if (append_to) {
		append_to.appendChild(element);
	}
	return element;
};

kite.browser.dom.select_option = function (value, text, el_parent) {
	var el_option;

	el_option = kite.browser.dom.ea('option', el_parent);
	el_option.value = value;
	el_option.innerHTML = text;

	return el_option;
};

kite.browser.dom.removeChildNodes = function (el) {
	while (el.hasChildNodes()) {
		el.removeChild(el.firstChild);
	}
};

kite.browser.dom.has_parent = function (node, parent) {
	while (node.parentNode) {
		if (node.parentNode === parent) {
			return true;
		}
		node = node.parentNode;
	}
	return false;
};

kite.browser.dom.text = function (node, txt) {
	node.appendChild(document.createTextNode(txt));
	return node;
};

kite.browser.dom.svg = function (x, y, width, height, class_name, append_to) {
	var el_svg;

	el_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	el_svg.setAttribute("version", "1.2");
	el_svg.setAttribute("baseProfile", "tiny");
	if (class_name) {
		el_svg.setAttribute('class', class_name);
	}
	if (x) {
		el_svg.setAttribute('x', x + 'px');
	}
	if (y) {
		el_svg.setAttribute('y', y + 'px');
	}
	if (height) {
		el_svg.setAttribute('height', height + 'px');
	}
	if (width) {
		el_svg.setAttribute('width', width + 'px');
	}
	if (height && width) {
		el_svg.setAttribute('viewBox', (x ? x + ' ' : '0 ') + (y ? y + ' ' : '0 ') + ' ' + height + ' ' + width);
	}

	append_to.appendChild(el_svg);

	return el_svg;
};

kite.browser.dom.ns = function (type, append_to, attribute) {
	var element = document.createElementNS("http://www.w3.org/2000/svg", type);
	if (append_to) {
		append_to.appendChild(element);
	}
	if (attribute) {
		element.setAttribute(attribute[0], attribute[1]);
	}
	return element;
};
