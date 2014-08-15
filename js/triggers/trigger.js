'use strict';

nbe.triggers.trigger = function (editor, type, value) {
	var oploc, loc_after;

	//console.log('trigger', type, value);
	//nbe.location.get(editor);

	switch (type) {
	case 'text':
		oploc = nbe.triggers.text(editor, value);
		break;
	case 'insertion':
		oploc = nbe.triggers.insertion(editor, value);
		break;
	case 'bold':
	case 'underline':
	case 'italic':
	case 'strikethrough':
	case 'color':
	case 'background_color':
	case 'font_family':
	case 'vertical_align':
	case 'font_size':
	case 'heading':
	case 'text_align':
	case 'line_spacing':
	case 'list':
		oploc = nbe.triggers.format(editor, type, value);
		break;
	case 'left_margin':
		oploc = nbe.triggers.left_margin(editor, value);
		break;
	case 'tab':
		oploc = nbe.triggers.tab(editor);
		break;
	case 'delete':
		oploc = nbe.triggers.del(editor);
		break;
	case 'newline':
		oploc = nbe.triggers.newline(editor);
		break;
	case 'img':
		oploc = nbe.triggers.img(editor, value);
		break;
	case 'link':
		oploc = nbe.triggers.link(editor, value);
		break;
	case 'cut':
		nbe.triggers.cut(editor);
		oploc = 'break';
		break;
	case 'paste':
		nbe.triggers.paste(editor);
		oploc = 'break';
		break;
	case 'undo':
		editor.undo.trigger('undo', value);
		oploc = null;
		break;
	case 'observer':
		oploc = nbe.triggers.observer(editor, value);
		break;
	case 'subtree':
		oploc = nbe.triggers.subtree(editor, value);
		break;
	case 'select':
		nbe.triggers.select(editor);
		oploc = 'break';
		break;
	default:
		oploc = null;
		break;
	}

	//console.log(oploc);

	if (oploc === 'break') {
		return oploc;
	} else if (oploc === null || oploc.ops.length === 0) {
		return null;
	} else {
		loc_after = 'loc_after' in oploc ? oploc.loc_after : {start : oploc.loc, collapsed : true};
		return {ops : oploc.ops, loc_before : editor.location, loc_after : loc_after};
	}
};
