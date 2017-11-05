'use strict';

var fs = require('fs');

var expand = function (files) {
	var result, done;

	result = [];
	done = true;
	files.forEach(function (file) {
		if (file.match('browser|css')) {
			return;
		} else if (file.match('[.]js$')) {
			result.push(file);
		} else if (fs.statSync(file).isDirectory()) {
			result = result.concat(fs.readdirSync(file).map(function (sub) {
				return file + '/' + sub;
			}));
			done = false;
		}
	});

	if (done) {
		return result;
	} else {
		return expand(result);
	}
};

var files = expand(['../../js']);

var first = '../../js/site/first.js';
var last = '../../js/site/last.js';

files = files.filter(function (file) {
	return file !== first && file !== last;
});


files = [first].concat(files);
files.push('./egg_mod_state.js');

var content = [];

files.forEach(function (file) {
	var text;

	text = fs.readFileSync(file, 'utf8');
	if (!text.match('window')) {
		content.push(text);
	}
});

var text = content.join('');
text = text.replace(/'use strict';/g, '');
text = '\'use strict\';\n/* eslint-disable */\n' + text;

var output = 'mod_state.js';
fs.writeFileSync(output, text);
