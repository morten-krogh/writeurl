'use strict';

const process = require('process');
const wul_home = process.env['WUL_HOME'];

if (!wul_home) {
	console.log('WUL_HOME must be set in the environment');
	process.exit(1);
}

const html_dir = wul_home + '/html';
const css_dir = wul_home + '/css';
const js_dir = wul_home + '/js';
const img_dir = wul_home + '/img';
const build_dir = wul_home + '/build/browser';


var fs = require('fs');
var uglifyjs = require('uglify-js');

var js_css = function () {
	var inputs, out_pathname, content, output;

	inputs = [
		css_dir + '/wu-format.css',
		css_dir + '/publish.css'
	];

	out_pathname = '../../js/css/publish.js';

	content = '';
	inputs.forEach(function (input) {
		content = content + fs.readFileSync(input, 'utf8') + '\n';
	});

	content = content.replace(/'/g, "\\'");
	content = content.replace(/\n/g, "\\n");
	output = [
		'\'use strict\';',
		'',
		'nbe.css.publish = \'' + content + '\';'
	].join('\n');

	fs.writeFileSync(out_pathname, output);
};

js_css();
build();
