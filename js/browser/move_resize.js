'use strict';

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
