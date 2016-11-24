"use strict";

kite.browser.animation = {};

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
