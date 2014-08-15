'use strict';

nbe.site.display_demo = function () {
	var doc, ops, editor_write, editor_read;

	doc = nbe.doc.create({id : 'demo', read : null, write : null, new_doc : true}, false, null, function (key, value) {});

	ops = [
                {domop : 'append', id : 'line2', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line3', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line4', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line5', parent : 'root', type : 'line', val : {heading : 'heading4'}},
                {domop : 'append', id : 'line6', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line7', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line8', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line9', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line10', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line11', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line12', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line13', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line14', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line15', parent : 'root', type : 'line', val : {list : 'ordered'}},
                {domop : 'append', id : 'line16', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line17', parent : 'root', type : 'line', val : {text_align : 'center'}},
                {domop : 'append', id : 'line18', parent : 'root', type : 'line', val : {text_align : 'center'}},
                {domop : 'append', id : 'line19', parent : 'root', type : 'line', val : {text_align : 'center'}},
                {domop : 'append', id : 'line20', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line21', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line22', parent : 'root', type : 'line', val : {left_margin : 20}},
                {domop : 'append', id : 'line23', parent : 'root', type : 'line', val : {left_margin : 40}},
                {domop : 'append', id : 'line24', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line25', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line26', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line27', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'line28', parent : 'root', type : 'line', val : {}},
                {domop : 'append', id : 'text1.2', parent : 'line', type : 'text', val : {text : 'Write in the left windows and see changes in the right window'}},
                {domop : 'append', id : 'text3.1', parent : 'line3', type : 'text', val : {text : 'You can insert '}},
                {domop : 'append', id : 'link3.2', parent : 'line3', type : 'link', val : {href : 'www.writeurl.com'}},
                {domop : 'append', id : 'text3.3', parent : 'link3.2', type : 'text', val : {text : 'links'}},
                {domop : 'append', id : 'text3.4', parent : 'line3', type : 'text', val : {text : ', images '}},
                {domop : 'append', id : 'img3.5', parent : 'line3', type : 'img', val : {src : '/img/nyckelpiga.jpg', height : '50'}},
                {domop : 'append', id : 'text3.6', parent : 'line3', type : 'text', val : {text : ' and special characters : \u03b1\u03b2\u03b3'}},
                {domop : 'append', id : 'text5.1', parent : 'line5', type : 'text', val : {text : 'Lines can have headers'}},
                {domop : 'append', id : 'text7.1', parent : 'line7', type : 'text', val : {text : 'There are lists and formatted text'}},
                {domop : 'append', id : 'text9.1', parent : 'line9', type : 'text', val : {text : 'bold', bold : 'on'}},
                {domop : 'append', id : 'text10.1', parent : 'line10', type : 'text', val : {text : 'italic', italic : 'on'}},
                {domop : 'append', id : 'text11.1', parent : 'line11', type : 'text', val : {text : 'underline', underline : 'on'}},
                {domop : 'append', id : 'text12.1', parent : 'line12', type : 'text', val : {text : 'strikethrough', strikethrough : 'on'}},
                {domop : 'append', id : 'text13.1', parent : 'line13', type : 'text', val : {text : 'color', color : 'rgb(255,0,0)'}},
                {domop : 'append', id : 'text14.1', parent : 'line14', type : 'text', val : {text : 'line color', background_color : 'rgb(255,255,0)'}},
                {domop : 'append', id : 'text15.1', parent : 'line15', type : 'text', val : {text : 'superscript', vertical_align : 'super'}},
                {domop : 'append', id : 'text15.2', parent : 'line15', type : 'text', val : {text : ' and '}},
                {domop : 'append', id : 'text15.3', parent : 'line15', type : 'text', val : {text : 'subscript', vertical_align : 'sub'}},
                {domop : 'append', id : 'text17.1', parent : 'line17', type : 'text', val : {text : 'Text alignments can be left,'}},
                {domop : 'append', id : 'text18.1', parent : 'line18', type : 'text', val : {text : 'center (as here),'}},
                {domop : 'append', id : 'text19.1', parent : 'line19', type : 'text', val : {text : 'right and justify.'}},
                {domop : 'append', id : 'text21.1', parent : 'line21', type : 'text', val : {text : 'Text can'}},
                {domop : 'append', id : 'text22.1', parent : 'line22', type : 'text', val : {text : 'also have'}},
                {domop : 'append', id : 'text23.1', parent : 'line23', type : 'text', val : {text : 'indentation levels'}},
                {domop : 'append', id : 'text25.1', parent : 'line25', type : 'text', val : {text : 'Undo ( button or ctrl-z), redo (button or ctrl-shift-z)'}},
                {domop : 'append', id : 'text26.1', parent : 'line26', type : 'text', val : {text : 'Copy (ctrl-c), cut (ctrl-x), paste (ctrl-v)'}},
                {domop : 'append', id : 'text28.1', parent : 'line28', type : 'text', val : {text : 'spell check, fonts, line spacing.'}}
        ];

	doc.add_ops(null, ops);

	editor_write = doc.editors.add('editor_write', 'text', {editable : true});
	document.getElementById('editor_write').appendChild(editor_write.el_editor);

	editor_read = doc.editors.add('editor_read', 'text', {editable : false});
	document.getElementById('editor_read').appendChild(editor_read.el_editor);

	nbe.site.panel(document.getElementById('demo_panel'), editor_write);
};
