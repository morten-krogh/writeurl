'use strict';

kite.browser.ui = {};

kite.browser.ui.Window_core = function () {
	var that, move, prev_width, prev_height;

	that = this;

	this.close_handler = null;
	this.close_on = ''; // click/out
	this.is_open = false;
	this.close_function = null;
	this.element = kite.browser.dom.ec('div', 'window window_light');
	this.header = kite.browser.dom.ec('div', 'window_header header_light');
	this.container = kite.browser.dom.ec('div', 'container');

	move = new kite.browser.ui.Move(that.element, {});

	this.header.addEventListener('mousedown', function (e) {
		if (e.target === that.header) {
			move.drag_start(e, {});
		}
	}, false);

	prev_width = document.documentElement.clientWidth;
	prev_height = document.documentElement.clientHeight;

	this.check_dimensions_position = function (_e) {
		if (prev_width !== document.documentElement.clientWidth || prev_height !== document.documentElement.clientHeight) {
			that.position();
			prev_width = document.documentElement.clientWidth;
			prev_height = document.documentElement.clientHeight;
		}
	};

	// Default action, run in position()
	this.action = function (_el_target, _target_position) {
		return true;
	};
};

kite.browser.ui.Window_core.prototype.set_content = function (content) { // Sets window content (this.container)
	//var this_window = this;
	this.container.appendChild(content);
	/*
	this.container.addEventListener('DOMSubtreeModified', function (e) {
		this_window.position();
	}, false);
	*/
};
kite.browser.ui.Window_core.prototype.set_title = function (title) { // Sets window title
	if (this.header !== undefined) {
		kite.browser.dom.text(this.header, title);
	}
};
kite.browser.ui.Window_core.prototype.set_close_handler = function (close_handler) { // Sets custom close handler
	this.close_handler = close_handler;
};
kite.browser.ui.Window_core.prototype.open = function (el_target) { // Display window
	var that = this;

	//if (!this.element.parentNode) {
	kite.browser.ui.set_opacity(this.element, 1);
	if (this.cover) {
		document.body.appendChild(this.cover);
	}

	document.body.appendChild(this.element);

	this.close_function = function (e) {
		if (!kite.browser.dom.is_element_child(that.element, e.target) && !kite.browser.dom.is_element_child(el_target, e.target)) {
			that.close();
		}
	};

	if (this.close_on === 'out') {
		this.element.addEventListener('mouseout', this.close_function, false);
	} else if (this.close_on === 'click') {
		document.body.addEventListener('mousedown', this.close_function, false);
	}

	this.element.style.left = (document.documentElement.clientWidth / 2) - (this.element.offsetWidth / 2) + 'px';

	this.position(el_target);
	this.is_open = true;

	window.addEventListener('resize', this.check_dimensions_position, false);
	document.body.addEventListener('orientationchange', this.check_dimensions_position, false);

	//}
};
kite.browser.ui.Window_core.prototype.size = function () { // Adjust window size to content
/*	var min_width, min_height, width, height, max_width, max_height, current_width, current_height, overflow;

	min_width = this.container.firstChild.offsetWidth;
	min_height = this.container.firstChild.offsetHeight;
	max_width = window.innerWidth - 60;
	max_height = window.innerHeight - 60;
	current_width = this.container.offsetWidth - 10;
	current_height = this.container.offsetHeight - 10;
	overflow = 'visible';

	if (min_height > max_height) {
		min_height = max_height;
		height = max_height + 'px';
		overflow = 'auto';
	} else if (min_height > current_height) {
		height = 'auto';
		overflow = 'visible';
	} else {
		height = current_height + 'px';
	}

	if (min_width > max_width) {
		min_width = max_width;
		width = max_width + 'px';
		overflow = 'auto';
	} else if (min_width > current_width) {
		width = 'auto';
		if (overflow !== 'auto') {
			overflow = 'visible';
		}
	} else {
		width = current_width + 'px';
	}

	this.container.style.minWidth = min_width + 'px';
	this.container.style.minHeight = min_height + 'px';
	this.container.style.width = width;
	this.container.style.height = height;
	this.container.style.maxWidth = max_width + 'px';
	this.container.style.overflow = overflow;
*/

	// Max width
	this.element.style.width = 'auto';
	if (this.element.offsetWidth >= (window.innerWidth - 20)) {
		this.element.style.width = window.innerWidth - 20 + 'px';
	} else {
		this.element.style.width = 'auto';
	}

	// Max height
	this.element.style.height = 'auto';
	if (this.element.offsetHeight >= (document.documentElement.clientHeight - 20)) {
		this.element.style.height = document.documentElement.clientHeight - 20 + 'px';
	} else {
		this.element.style.height = 'auto';
	}
};
kite.browser.ui.Window_core.prototype.position = function (el_target) { // Positions window relative to el_target
	var target_position, left, top;

	this.size();

	if (el_target) { // Position relative to target
		target_position = kite.browser.ui.get_offset(el_target);

		// left
		left = target_position.left + (el_target.offsetWidth / 2) - (this.element.offsetWidth / 2);
		if (left + this.element.offsetWidth > window.innerWidth) {
			this.element.style.left = (window.innerWidth - this.element.offsetWidth) + 'px';
		} else if (left < 0) {
			this.element.style.left = '0px';
		} else {
			this.element.style.left = left + 'px';
		}
		this.action(el_target, target_position);
	} else { // Position relative to screen
		window.scrollTo(0, 0);
		top = (document.documentElement.clientHeight - this.element.offsetHeight) / 2;
		//alert(document.documentElement.clientHeight + ', ' + this.element.offsetHeight + ', ' + top + ', ' + this.element.offsetTop);
		if (top < 0) {
			top = 0;
		}
		this.element.style.top = top + 'px';
		//alert(this.element.offsetTop);
		left = (window.innerWidth - this.element.offsetWidth) / 2;
		if (left < 0) {
			left = 0;
		}
		this.element.style.left = left + 'px';
	}
};
kite.browser.ui.Window_core.prototype.close = function () { // Close without running close handler
	var this_window = this;
	if (this.is_open) {
		kite.browser.animation.Fade_out(this_window.element, { duration : 50, fps: 50, callback : function () {
			document.body.removeChild(this_window.element);
		}});
		if (this_window.cover) {
			document.body.removeChild(this_window.cover);
		}

		if (this.close_on === 'out') {
			this.element.removeEventListener('mouseout', this.close_function, false);
		} else if (this.close_on === 'click') {
			document.body.removeEventListener('mousedown', this.close_function, false);
		}

		this.close_function = null;
		this.is_open = false;

		window.removeEventListener('resize', this.check_dimensions_position, false);
		document.body.removeEventListener('orientationchange', this.check_dimensions_position, false);
	}
};
kite.browser.ui.Window_core.prototype.terminate = function () { // Close and run close handler
	this.close();
	if (this.close_handler !== null) {
		this.close_handler();
	}
};
kite.browser.ui.Window_core.prototype.insert_close_button = function () {
	var that = this;
	this.close_button = kite.browser.dom.eac('img', kite.browser.dom.eac('div', this.header, 'close_div'), 'close_button');
	this.close_button.src = '/public/inlund/img/close.png';
	this.close_button.addEventListener('click', function (_e) {
		that.terminate();
	}, false);
};
kite.browser.ui.Window_core.prototype.insert_footer = function (element) { // Insert footer element
	var that, el_resize, resize;
	that = this;
	this.footer = kite.browser.dom.eac('div', element, 'window_footer_light');
	el_resize = kite.browser.dom.eac('img', that.footer, 'window_resize');
	el_resize.src = '/public/inlund/img/resize.png';
	resize = kite.browser.ui.Resize(that.container, {});
	el_resize.addEventListener('mousedown', function (e) {
		resize.drag_start(e, {});
	}, false);
};

kite.browser.ui.Window = function () {
	var that = new kite.browser.ui.Window_core();

//	that.element.appendChild(that.header);
	that.element.appendChild(that.container);
//	that.insert_close_button();
//	that.insert_footer(that.element);

	return that;
};

kite.browser.ui.Dialog = function () {
	var that = new kite.browser.ui.Window_core();

	that.container.className = 'container_dark';
	that.cover = kite.browser.dom.ec('div', 'dialog_cover');
	that.cover.addEventListener('click', function (_e) {
		kite.browser.animation.shake(that.element, null);
	}, false);

//	that.element.appendChild(that.header);
	that.element.appendChild(that.container);

	return that;
};

kite.browser.ui.confirm = function (title, text, buttons, callback) {
	var dialog, el_content, el_buttons, i, len, el_button;

	dialog = new kite.browser.ui.Dialog();
	dialog.set_title(title);

	el_content = kite.browser.dom.ec('div', 'confirm_content');
	el_content.textContent = text;
	el_buttons = kite.browser.dom.eac('div', el_content, 'overflow_hidden');
	el_buttons.style.marginTop = '10px';

	for (i = 0, len = buttons.length; i < len; i++) {
		el_button = kite.browser.dom.eac('button', el_buttons, 'float_left');
		el_button.textContent = buttons[i];
		el_button.id = buttons[i];
	}

	dialog.set_content(el_content);

	el_buttons.addEventListener('click', function (e) {
		if (e.target.id) {
			if (callback) {
				callback(e.target.id);
			}
			dialog.close();
		}
	}, false);

	dialog.open();
};

kite.browser.ui.Confirm = function (title, text, buttons, callback) {
	var that, el_content, el_buttons, i, len, el_button;

	that = new kite.browser.ui.Dialog();
	that.set_title(title);

	el_content = kite.browser.dom.ec('div', 'confirm_content');
	el_content.textContent = text;
	el_buttons = kite.browser.dom.eac('div', el_content, 'overflow_hidden');
	el_buttons.style.marginTop = '10px';

	for (i = 0, len = buttons.length; i < len; i++) {
		el_button = kite.browser.dom.eac('button', el_buttons, 'float_left');
		el_button.textContent = buttons[i];
		el_button.id = buttons[i];
	}

	that.set_content(el_content);

	el_buttons.addEventListener('click', function (e) {
		if (e.target.id) {
			if (callback) {
				callback(e.target.id);
			}
			that.close();
		}
	}, false);

	return that;
};

kite.browser.ui.Pop_up = function () {
	var that, el_arrow_space, el_arrow_container, el_arrow;

	that = new kite.browser.ui.Window_core();

	that.close_on = 'click';
	that.element.style.backgroundImage = 'none';
	that.container.className = 'container_radius_bottom';
	that.element.appendChild(that.header);
	that.element.appendChild(that.container);
	that.insert_close_button();

	el_arrow_space = kite.browser.dom.eac('div', that.element, 'pop_up_arrow_space');
	el_arrow_container = kite.browser.dom.eac('div', el_arrow_space, 'pop_up_arrow_container');
	el_arrow = kite.browser.dom.ea('img', el_arrow_container);
	el_arrow.src = '/public/inlund/img/pop_up_arrow.png';

	that.action = function (_el_target, target_position) {
		that.element.style.top = target_position.top + 'px';
		kite.browser.animation.Slide_up(that.element, {duration : 100, padding: 1, callback : function () {
			that.size();
		}});
	};

	return that;
};

kite.browser.ui.Drop_down = function () {
	var that = new kite.browser.ui.Window_core();

	that.close_on = 'click';
	that.container.className = 'container_radius_no_padding';
	that.element.appendChild(that.container);

	that.action = function (el_target, target_position) {
		that.element.style.top = target_position.top + el_target.offsetHeight + 'px';
		kite.browser.animation.Slide_down(that.element, {duration : 100, padding: 1, callback : function () {
			that.size();
		}});
	};

	return that;
};

kite.browser.ui.get_offset = function (element) {
	var left, top;

	left = element.offsetLeft;
	top = element.offsetTop;

	element = element.offsetParent;
	while (element) {
		left += element.offsetLeft;
		top += element.offsetTop;
		element = element.offsetParent;
	}

	return {left : left, top : top};
};

kite.browser.ui.set_opacity = function (element, value) {
	element.style.opacity = value;
	element.style.filter = 'alpha(opacity = ' + value * 100 + ')';
};

kite.browser.ui.cursor_position = function (event) {
	// Get cursor position with respect to the page.
	return {x: event.clientX + window.scrollX, y: event.clientY + window.scrollY};
};
