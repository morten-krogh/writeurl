'use strict';

nbe.state.formats = {

	text : ['bold', 'italic', 'underline', 'strikethrough', 'color', 'background_color', 'font_family', 'font_size', 'vertical_align'],

	line : ['heading', 'text_align', 'left_margin', 'line_spacing', 'list'],

	default_values : {
		bold : 'off',				// text
		italic : 'off',				// text
		underline : 'off',			// text
		strikethrough : 'off',			// text
		color : 'rgb(0, 0, 0)',			// text
		background_color : 'transparent',	// text
		font_family : 'arial',			// text
		font_size : '16px',			// text
		vertical_align : 'baseline',		// text
		heading : 'none',			// line
		text_align : 'left',			// line
		left_margin : 0,			// line
		line_spacing : 'line_spacing_16',	// line
		list : 'none',				// line
		edit_img : null,			// image button
		edit_link : null			// link button
	},

	left_margin : {
		step : 20,
		max : 500
	},

	font_family : ['arial', 'courier', 'helvetica', 'times', 'verdana']
};
