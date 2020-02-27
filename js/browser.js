kite.browser.animation = {};
kite.browser.dom = {};
kite.browser.ui = {};

kite.browser.animation.Core = function (options) {
	var option;

	// Default options
	this.options = {
		duration:	200,
		fps:			100,
		from:			0,
		to:				200,
		padding:	0
	};

	for (option in options) {
		if (options.hasOwnProperty(option)) {
			this.options[option] = options[option];
		}
	}

	if (this.options.element2) {
		this.options.element2.start_width = this.options.element2.start_width || this.options.element2.element.offsetWidth;
		this.options.element2.padding = this.options.element2.padding || 0;
	}

	this.start_on				= 0;
	this.finish_on			= this.start_on - this.options.duration;
	this.from_to_delta	= this.options.to - this.options.from;
	this.total_time			= this.finish_on - this.start_on;
	this.total_frames		= this.options.fps * (this.options.duration / 1000);
};

kite.browser.animation.Core.prototype.render = function () {
	var that, i, step;

	that = this;
	i = 1;

	step = function () {
		that.action(i);
		if (i < that.total_frames) {
			i += 1;
			setTimeout(step, 1000 / that.options.fps);
		} else {
			that.end();
			if (that.options.callback) {
				that.options.callback();
			}
		}
	};
	setTimeout(step, 1000 / this.options.fps);
};

kite.browser.animation.Hide_up = function (element, options) {
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.target_height = that.options.target_height || element.offsetHeight;
		that.target_top = that.options.target_top || element.offsetTop - that.target_height;
		that.start_top = element.offsetTop;
	};
	that.end = function () { // Things to do at the end of the animation
		element.style.top = that.target_top + 'px';
	};
	that.action = function (frame) { // Happens at each step
		var step_size = Math.round((frame / that.total_frames) * that.target_height);
		element.style.top = that.start_top - step_size + 'px';
	};
	that.init();
	that.render();
};

kite.browser.animation.Slide_up = function (element, options) {
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.target_height = that.options.target_height || element.offsetHeight;
		that.target_top = that.options.target_top || element.offsetTop - that.target_height;
		that.start_top = element.offsetTop;
		element.style.height = '0px';
		element.style.overflow = 'hidden';
	};
	that.end = function () { // Things to do at the end of the animation
		element.style.top = that.target_top + 'px';
		element.style.overflow = 'visible';
		element.style.height = 'auto';
	};
	that.action = function (frame) { // Happens at each step
		var step_size = Math.round((frame / that.total_frames) * that.target_height);
		if (element.offsetHeight < that.target_height) {
			element.style.height = (step_size - (that.options.padding * 2)) + 'px'; // top and bottom padding is removed
		}
		element.style.top = that.start_top - step_size + 'px';
	};
	that.init();
	that.render();
};

kite.browser.animation.Slide_down = function (element, options) {
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.target_height = that.options.target_height || element.offsetHeight;
		that.child = element.firstChild;
		that.target_top = 0;
		that.start_child_top = -1 * that.target_height;
		that.child.style.position = 'relative';
		that.child.style.top = that.start_child_top + 'px';
		element.style.height = '0px';
		element.style.overflow = 'hidden';
	};
	that.top = function (element) {
		if (window.innerHeight < element.offsetTop + element.offsetHeight) {
			element.style.top = (window.innerHeight - element.offsetHeight) + 'px';
		}
	};
	that.end = function () { // Things to do at the end of the animation
		that.child.style.top = that.target_top + 'px';
		element.style.overflow = 'visible';
		element.style.height = 'auto';
		that.top(element);
	};
	that.action = function (frame) { // Happens at each step
		var step_size, height;

		step_size = Math.round((frame / that.total_frames) * that.target_height);

		if (element.offsetHeight < that.target_height) {
			height = (step_size - (that.options.padding * 2));
			element.style.height = height + 'px'; // top and bottom padding is removed
			that.top(element);
			that.child.style.top = (that.start_child_top + step_size - that.options.padding) + 'px';
		}
	};
	that.init();
	that.render();
};

kite.browser.animation.Slide_in_right = function (element, options) {
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.start_width = that.options.start_width || element.offsetWidth;
		that.target_width = that.options.target_width || 0;
	};
	that.end = function () { // Things to do at the end of the animation
		element.style.width = that.target_width + 'px';
	};
	that.action = function (frame) { // Happens at each step
		var step_size = Math.round((frame / that.total_frames) * that.start_width);
		if (element.offsetWidth > that.target_width) {
			element.style.width = (that.start_width - step_size - (that.options.padding * 2)) + 'px'; // top and bottom padding is removed
			if (that.options.element2) {
				that.options.element2.element.style.width = (that.options.element2.start_width + step_size - (that.options.element2.padding * 2)) + 'px';
			}
		}
	};
	that.init();
	that.render();
};

kite.browser.animation.Slide_out_left = function (element, options) {
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.start_width = that.options.start_width || element.offsetWidth;
		that.target_width = that.options.target_width || 0;
	};
	that.end = function () { // Things to do at the end of the animation
		element.style.width = that.target_width + 'px';
	};
	that.action = function (frame) { // Happens at each step
		var step_size = Math.round((frame / that.total_frames) * that.target_width);
		if (element.offsetWidth < that.target_width) {
			element.style.width = (step_size - (that.options.padding * 2)) + 'px'; // top and bottom padding is removed
			if (that.options.element2) {
				that.options.element2.element.style.width = (that.options.element2.start_width - step_size - (that.options.element2.padding * 2)) + 'px';
			}
		}
	};
	that.init();
	that.render();
};

kite.browser.animation.Resize = function (element, options) {
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.target_height = that.options.target_height >= 0 ? that.options.target_height : element.offsetHeight;
		that.target_width = that.options.target_width >= 0 ? that.options.target_width : element.offsetWidth;
		that.start_height = that.options.start_height >= 0 ? that.options.start_height : element.offsetHeight;
		that.start_width = that.options.start_width >= 0 ? that.options.start_width : element.offsetWidth;
	};
	that.end = function () { // Things to do at the end of the animation
		if (options.target_height >= 0) {
			element.style.height = that.target_height + 'px';
		}
		if (options.target_width >= 0) {
			element.style.width = that.target_width + 'px';
		}
	};
	that.action = function (frame) { // Happens at each step
		var step_size = frame / that.total_frames;
		if (options.target_height >= 0 && that.start_height !== that.target_height) {
			element.style.height = Math.round(that.start_height + step_size * (that.target_height - that.start_height)) + 'px';
		}
		if (options.target_width >= 0 && that.start_width !== that.target_width) {
			element.style.width = Math.round(that.start_width + step_size * (that.target_width - that.start_width)) + 'px';
		}
	};
	that.init();
	that.render();
};

kite.browser.animation.Fade_out = function (element, options) { // time in milliseconds
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.start = 1;
		that.target = 0;
	};
	that.end = function () {
		element.style.opacity = that.target;
//		element.style.display = 'none';
	};
	that.action = function (frame) {
		element.style.opacity = that.start - (frame / that.total_frames);
	};
	that.init();
	that.render();
};

kite.browser.animation.Fade_in = function (element, options) { // time in milliseconds
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.start = 0;
		that.target = 1;
		element.style.display = 'block';
	};
	that.end = function () {
		element.style.opacity = that.target;
	};
	that.action = function (frame) {
		element.style.opacity = (frame / that.total_frames) * that.target;
	};
	that.init();
	that.render();
};

kite.browser.animation.Highlight = function (element, options) { // time in milliseconds
	var that, val;
	that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.start_rgb = options.start_rgb;
		that.target_rgb = {r: options.target_rgb.r - options.start_rgb.r, g: options.target_rgb.g - options.start_rgb.g, b: options.target_rgb.b - options.start_rgb.b};
	};
	that.end = function () {
		element.style.backgroundColor = '';
	};
	that.action = function (frame) {
		val = frame / that.total_frames;
		element.style.backgroundColor = 'rgb(' + Math.ceil(val * that.target_rgb.r + that.start_rgb.r) + ',' + Math.ceil(val * that.target_rgb.g + that.start_rgb.g) + ',' + Math.ceil(val * that.target_rgb.b + that.start_rgb.b) + ')';
	};
	that.init();
	that.render();
};

kite.browser.animation.Scroll = function (element, options) { // time in milliseconds
	var that = new kite.browser.animation.Core(options);
	that.init = function () {
		that.start = element.scrollLeft;
	};
	that.end = function () {
		element.scrollLeft = options.to;
	};
	that.action = function (frame) {
		element.scrollLeft = that.start + ((options.to - that.start) / that.total_frames) * frame;
	};
	that.init();
	that.render();
};

kite.browser.animation.shake = function (element, callback) {
	var start_position, step, distance, factor, shake;

	start_position = element.offsetLeft;
	step = 5;
	distance = 0;
	factor = 1;

	shake = setInterval(function () {
		element.style.left =	element.offsetLeft + step * factor + 'px';
		distance = distance + step * factor;
		if (distance >= 20 || distance <= -20) {
			factor = factor * -1;
		}
	}, 10);

	setTimeout(function () {
		clearInterval(shake);
		element.style.left = start_position + 'px';
		if (callback) {
			callback();
		}
	}, 400);
};


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

nbe.browser.icon.network = function (parent) {
	var off_text, el_icon, el_network, el_bolt;

	off_text = 'You offline';

	el_icon = kite.browser.dom.ea('div', parent);
	el_icon.title = off_text;
	el_network = kite.browser.dom.svg(-8, -8, 48, 48, 'circle_button', el_icon);
	el_bolt = kite.browser.dom.ns('polygon', el_network, ['points', '32,0 8,16 14,20 0,32 24,20 18,16']);

	return {on : function () {
		el_bolt.setAttribute('fill', 'lightgreen');
		el_icon.title = 'You are online';
	}, off : function () {
		el_bolt.setAttribute('fill', 'red');
		el_icon.title = off_text;
	}};
};

nbe.browser.icon.saved = function (parent) {
	var on_text, el_icon, el_saved, el_cloud, el_arrow;

	on_text = 'The document is saved';

	el_icon = kite.browser.dom.ea('div', parent);
	el_icon.title = on_text;
	el_saved = kite.browser.dom.svg(-8, -8, 48, 48, 'circle_button', el_icon);
	el_cloud = kite.browser.dom.ns('path', el_saved, ['d', 'M24,4c-0.375,0-0.738,0.062-1.102,0.109C21.504,1.648,18.926,0,16,0c-2.988,0-5.568,1.664-6.941,4.102C8.707,4.055,8.357,4,8,4c-4.412,0-8,3.586-8,8s3.588,8,8,8h16c4.414,0,8-3.586,8-8S28.414,4,24,4z M24,16H8c-2.205,0-4-1.797-4-4c0-2.195,1.943-3.883,4.004-3.945C8.012,9,8.176,9.922,8.504,10.797l3.746-1.398C12.084,8.953,12,8.484,12,8c0-2.203,1.795-4,4-4c1.295,0,2.463,0.641,3.201,1.641C17.27,7.102,16,9.395,16,12h4c0-2.203,1.797-4,4-4s4,1.797,4,4S26.203,16,24,16z']);
	el_arrow = kite.browser.dom.ns('polygon', el_saved, ['points', '18.002,26 22,26 16.004,20 10.002,26 14.002,26 14.002,32 18.002,32']);

	return {on : function () {
		el_cloud.setAttribute('fill', 'lightgreen');
		el_arrow.setAttribute('fill', 'lightgreen');
		el_icon.title = on_text;
	}, off : function () {
		el_cloud.setAttribute('fill', 'red');
		el_arrow.setAttribute('fill', 'red');
		el_icon.title = 'The document is not saved';
	}};
};

nbe.browser.icon.exporticon = function (parent) {
	var el_icon, el_export, el_rect, el_arrow;

	el_icon = kite.browser.dom.ea('div', parent);
	el_icon.title = 'Export';

	el_export = kite.browser.dom.svg(-16, -11, 56, 56, 'circle_button', el_icon);

	el_rect = kite.browser.dom.ns('rect', el_export, ['y', '27.43']);
	el_rect.style.fill = '#FFFFFF';
	el_rect.setAttribute('width', 24);
	el_rect.setAttribute('height', 4.57);

	el_arrow = kite.browser.dom.ns('polygon', el_export, ['points', '16,18.285 16,0 8,0 8,18.285 4,18.285 12.012,27.43 20,18.285']);
	el_arrow.style.fill = '#FFFFFF';

	return el_icon;
};

kite.browser.ui.Move_resize_core = function (element, options) {
	this.options = {};

	// Default options
	this.drag = {
		element: element,
		container: element.parentNode,
		direction: null,
		padding: 0,
		step_size: 1
	};

	this.change_options(options);
};

kite.browser.ui.Move_resize_core.prototype.drag_start = function (e, options) {
	var that, cursor, stop;

	e.preventDefault();

	that = this;
	that.drag_callback = options.drag_callback ? options.drag_callback : function () {};

	cursor = kite.browser.ui.cursor_position(e);

	if (this.drag.antagonist) {
		this.drag.start_width_antagonist = this.drag.antagonist.offsetWidth;
		this.drag.start_height_antagonist = this.drag.antagonist.offsetHeight;
	}

	this.drag.start_width = this.drag.element.offsetWidth;
	this.drag.start_height = this.drag.element.offsetHeight;
	this.drag.start_left = this.drag.element.offsetLeft;
	this.drag.start_top = this.drag.element.offsetTop;

	this.drag.max_offset_left = (this.options.max_offset_left - this.drag.padding) || -5000;
	this.drag.max_offset_right = (this.options.max_offset_right - this.drag.padding) || (this.drag.container ? this.drag.container.offsetWidth - this.drag.padding : 5000);
	this.drag.max_offset_top = (this.options.max_offset_top - this.drag.padding) || 0;
	this.drag.max_offset_bottom = (this.options.max_offset_bottom - this.drag.padding) || (this.drag.container ? this.drag.container.offsetHeight - this.drag.padding : 5000);

	this.drag.cursor_start_x = cursor.x;
	this.drag.cursor_start_y = cursor.y;

	stop = function (_e) {
		document.removeEventListener("mousemove", that.go, false);
		document.removeEventListener("mouseup", stop, false);
		if (options.stop_callback) {
			options.stop_callback();
		}
	};

	document.addEventListener("mousemove", this.go, false);
	document.addEventListener("mouseup", stop, false);
};

kite.browser.ui.Move_resize_core.prototype.change_options = function (options) {
	var option;
	for (option in options) {
		if (options.hasOwnProperty(option)) {
			this.options[option] = options[option];
			this.drag[option] = options[option];
		}
	}
};

kite.browser.ui.Move = function (element, options) {
	var that;

	that = new kite.browser.ui.Move_resize_core(element, options);

	that.go = function (e) {
		var cursor, offset;

		cursor = kite.browser.ui.cursor_position(e);
		e.preventDefault();

		if (that.drag.direction !== 'vertical') {
			offset = that.drag.start_left + kite.browser.ui.cursor_position(e).x - that.drag.cursor_start_x;
			if (offset < that.drag.max_offset_left) {
				that.drag.element.style.left = that.drag.max_offset_left + "px";
			} else if (offset < that.drag.max_offset_right) {
				that.drag.element.style.left = offset + "px";
			} else if (offset > that.drag.max_offset_right || cursor.x > 0) {
				that.drag.element.style.left = that.drag.max_offset_right + "px";
			}
		}

		if (that.drag.direction !== 'horizontal') {
			offset = that.drag.start_top + kite.browser.ui.cursor_position(e).y - that.drag.cursor_start_y;
			if (offset < that.drag.max_offset_top) {
				that.drag.element.style.top = that.drag.max_offset_top + "px";
			} else if (offset < that.drag.max_offset_bottom) {
				that.drag.element.style.top = offset + "px";
			} else if (offset > that.drag.max_offset_bottom) {
				that.drag.element.style.top = that.drag.max_offset_bottom + "px";
			}
		}

		if (that.drag.move_callback) {
			that.drag.move_callback(e);
		}
	};
	return that;
};

kite.browser.ui.Resize = function (element, options) {
	var that;

	that = new kite.browser.ui.Move_resize_core(element, options);

	that.go = function (e) {
		var cursor, reverse, width, height;

		e.preventDefault();
		cursor = kite.browser.ui.cursor_position(e);
		reverse = 1;
		width = null;
		height = null;

		if (that.drag.reverse) {
			reverse = -1;
		}

		if (that.drag.direction !== 'vertical' && cursor.x + 15 <= document.documentElement.clientWidth && cursor.x > 0) {
			width = (that.drag.start_width + (cursor.x - that.drag.cursor_start_x) * reverse);
			that.drag.element.style.width = width + "px";
			if (that.drag.antagonist) {
				that.drag.antagonist.style.width = (that.drag.start_width_antagonist + (cursor.x - that.drag.cursor_start_x) * -1 * reverse) + "px";
			}
		}
		if (that.drag.direction !== 'horizontal' && cursor.y + 15 <= document.documentElement.clientHeight && cursor.y > 0) {
			height = (that.drag.start_height + (cursor.y - that.drag.cursor_start_y) * reverse);
			that.drag.element.style.height = height + "px";
			if (that.drag.antagonist) {
				that.drag.antagonist.style.height = (that.drag.start_height + (cursor.y - that.drag.cursor_start_y) * -1 * reverse) + "px";
			}
		}
		if (that.drag_callback) {
			that.drag_callback(e, width, height);
		}
	};
	return that;
};

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
