'use strict';

nbe.doc.html = function (doc) {
	var title_editor, text_editor, title, text, html;

	title_editor = doc.editors.add('temp', 'title', {editable : false, html_title : false});
	title = title_editor.get_value();
	doc.editors.remove('temp');

	text_editor = doc.editors.add('temp', 'text', {editable : false});
	text = text_editor.get_html();
	doc.editors.remove('temp');

	text = text.replace(/ data-id="[a-z0-9]+"/g, '');
	text = text.replace(/ style=""/g, '');

	html = [
		'<!DOCTYPE html>',
		'<html lang="en">',
		'<head>',
		'<meta http-equiv="Content-type" content="text/html; charset=UTF-8" />',
		'<title>',
		title,
		'</title>',
		'<style type="text/css">',
		nbe.css.publish,
		'</style>',
        '<script data-ad-client="ca-pub-9524640381347126" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>',
        '<!-- Global site tag (gtag.js) - Google Analytics -->',
        '<script async src="https://www.googletagmanager.com/gtag/js?id=G-K3C0HHS54S"></script>',
        '<script>',
        'window.dataLayer = window.dataLayer || [];',
        'function gtag(){dataLayer.push(arguments);}',
        'gtag('js', new Date());',
        'gtag('config', 'G-K3C0HHS54S');',
        '</script>',
		'</head>',
		'<body>',
		'<div class="nbe editor">',
		text,
		'</div>',
		'</body>',
		'</html>'
	].join('\n');

	return html;
};
