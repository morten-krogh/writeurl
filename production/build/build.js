'use strict';

var fs = require('fs');
var uglifyjs = require('UglifyJS');

var obfuscate = function (content) {
	var script, obfuscated_script, ast;

	script = content.toString();

	ast = uglifyjs.parser.parse(script); // parse code and get the initial AST
	ast = uglifyjs.uglify.ast_mangle(ast); // get a new AST with mangled names
	ast = uglifyjs.uglify.ast_squeeze(ast); // get an AST with compression optimizations
	obfuscated_script = uglifyjs.uglify.gen_code(ast); // compressed code here

	return new Buffer(obfuscated_script);
};

var read_index_html = function () {
	return fs.readFileSync('../../html/index.html', 'utf8');
};

var parse_index_html = function (text) {
	var parts, lines, current, i, line;

	lines = text.split('\n');

	parts = {first : [], css : [], middle : [], js : [], last : []};
	current = 'first';
	for (i = 0; i < lines.length; i++) {
		line = lines[i];
		if (/link rel/.test(line)) {
			parts.css.push(line);
			current = 'middle';
		} else if (/script src/.test(line)) {
			parts.js.push(line);
			current = 'last';
		} else {
			parts[current].push(line);
		}
	}

	return parts;
};

var read_css_files = function (parts) {
	var files;

	files = [];
	parts.css.forEach(function (line) {
		var name;

		name = line.match(/\/([^.]+\.css)/)[1];
		files.push(fs.readFileSync('../../' + name, 'utf8'));
	});

	parts.css = ['<style type="text/css">'].concat(files).concat(['</style>']).join('\n');
};

var read_js_files = function (parts) {
	var files;

	files = [];
	parts.js.forEach(function (line) {
		var name;

		name = line.match(/\/(js\/[^.]+\.js)/)[1];
		if (name !== 'js/site/last.js') {
			files.push(fs.readFileSync('../../' + name, 'utf8'));
		}
	});

	parts.js = files;
};

var process_js = function (parts) {
	var scripts, all, obfuscated;

	scripts = [];
	parts.js.forEach(function (script) {
		scripts.push(script.replace(/^.*'use strict'.*\n/, ''));
	});

	all = ["'use strict';\n"].concat(scripts).join('\n');
	obfuscated = obfuscate(all).toString();
	//obfuscated = all;

	parts.js = obfuscated;
};

var build_html = function (parts) {
	var html_head, html_css, html_middle, html_js, html_last;

	html_head = parts.first.join('\n').replace('<html lang="en"', '<html lang="en" manifest="/manifest.appcache"');
	html_css = '\t<link rel="stylesheet" href="/style.css" type="text/css">';
	html_middle = parts.middle.join('\n');
	html_js = [
		'<script src="/script.js"></script>',
		'<script src="/last.js"></script>'
	].join("\n");
	html_last = parts.last.filter(function (line) {
		return line !== '';
	}).join('\n');

	return html_head + '\n' + html_css + '\n' + html_middle + '\n' + html_js + '\n' + html_last;
};

var write_css = function (css) {
	fs.writeFileSync('../public/style.css', css);
};

var write_js = function (js) {
	fs.writeFileSync('../public/script.js', js);
};

var copy_last = function () {
	fs.writeFileSync('../public/last.js', fs.readFileSync('../../js/site/last.js'));
};

var write_html = function (html) {
	fs.writeFileSync('../public/index.html', html);
};

var write_manifest = function (html) {
	var imgs, others, manifest;

	imgs = fs.readdirSync('../../img').map(function (filename) {
		return '/img/' + filename;
	});

	others = [
		'/style.css',
		'/script.js',
		'/last.js'
	];

	manifest = 'CACHE MANIFEST\n# ' + new Date().toUTCString() + '\n\nCACHE:\n/index.html\n' + imgs.join('\n') + '\n' + others.join('\n') + '\n\nFALLBACK:\n/ /\n\nNETWORK:\n/publish/\n*\n';

	fs.writeFileSync('../public/manifest.appcache', manifest);
};

var build = function () {
	var text, parts, html;

	text = read_index_html();
	parts = parse_index_html(text);
	read_css_files(parts);
	write_css(parts.css);
	read_js_files(parts);
	process_js(parts);
	write_js(parts.js);
	copy_last();
	html = build_html(parts);
	write_html(html);
	write_manifest();
};

var js_css = function () {
	var inputs, out_pathname, content, output;

	inputs = [
		'../../css/wu-format.css',
		'../../css/publish.css'
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
