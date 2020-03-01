window.nbe.state = {};

nbe.state.clean = function (editor) {
	nbe.state.init(editor, editor.state);
	nbe.location.set(editor, editor.location);
};

nbe.state.cmp_text_format = function (format1, format2) {
	var cmp_type, i;

	cmp_type = function (type) {
		if (type in format1 && type in format2) {
			return format1[type] === format2[type];
		} else if (type in format1) {
			return nbe.state.formats.default_values[type] === format1[type];
		} else if (type in format2) {
			return nbe.state.formats.default_values[type] === format2[type];
		} else {
			return true;
		}
	};

	for (i = 0; i < nbe.state.formats.text.length; i++) {
		if (!cmp_type(nbe.state.formats.text[i])) {
			return false;
		}
	}

	return true;
};

nbe.state.cmp_value_format = function (type, value, format) {
	if (nbe.state.formats.default_values[type] === value) {
		return !(type in format);
	} else {
		return (type in format) && format[type] === value;
	}
};

nbe.state.copy_line_format = function (src, dst) {
	var keys, i, key;

	keys = nbe.state.formats.text.concat(nbe.state.formats.line);

	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		if (key in src) {
			dst[key] = src[key];
		} else {
			delete dst[key];
		}
	}

	return dst;
};

nbe.state.copy_text_format = function (src, dst) {
	var keys, i, key;

	keys = nbe.state.formats.text;

	for (i = 0; i < keys.length; i++) {
		key = keys[i];
		if (key in src) {
			dst[key] = src[key];
		} else {
			delete dst[key];
		}
	}

	return dst;
};

nbe.state.deserialize = function (str) {
	var new_nodes, nodes, id, node, new_node, i;

	new_nodes = {};
	nodes = JSON.parse(str).nodes;
	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_nodes[id] = {type : node.type, id : node.id, val : node.val, children : []};
		}
	}

	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_node = new_nodes[id];
			if (node.parent) {
				new_node.parent = new_nodes[node.parent];
			}
			for (i = 0; i < node.children.length; i++) {
				new_node.children[i] = new_nodes[node.children[i]];
			}
		}
	}

	return {nodes : new_nodes};
};

nbe.state.element = function (id, type, val) {
	var name, el;

	name = {
		root : 'div',
		line : 'div',
		text : 'span',
		img : 'img',
		link : 'a'
	}[type];

	el = document.createElement(name);
	el.setAttribute('data-id', id);
	el.classList.add('wu-' + type);

	if (type === 'line') {
		el.appendChild(document.createElement('br'));
	}

	nbe.state.mutate_element(el, type, val);

	return el;
};

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

nbe.state.init = function (editor, state) {
	var dom, insert_child_nodes;

	editor.state = state;
	editor.dom = dom = {};

	dom.root = nbe.state.element('root', 'root', state.nodes.root.val);

	insert_child_nodes = function (par, type, nodes) {
		var i, node;

		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];
			dom[node.id] = nbe.state.element(node.id, node.type, node.val);
			if (type === 'line') {
				par.insertBefore(dom[node.id], par.lastChild);
			} else {
				par.appendChild(dom[node.id]);
			}
			insert_child_nodes(dom[node.id], node.type, node.children);
		}
	};

	insert_child_nodes(dom.root, 'root', state.nodes.root.children);

	nbe.state.reset_counter(editor);

	editor.mutation.disconnect();

	while (editor.el_editor.firstChild) {
		editor.el_editor.removeChild(editor.el_editor.firstChild);
	}
	editor.el_editor.appendChild(dom.root);

	editor.mutation.observe();

	return editor;
};

nbe.state.initial = function () {
	return JSON.stringify({
		nodes : {
			root : {
				type : 'root',
				id : 'root',
				parent : null,
				children : ['line'],
				val : {}
			},
			line : {
				type : 'line',
				id : 'line',
				parent : 'root',
				children : [],
				val : {}
			}
		}
	});
};

nbe.state.invert_oploc = function (oploc) {
	var oploc_inv;

	oploc_inv = {
		ops : nbe.state.invert_ops(oploc.ops),
		loc_before : oploc.loc_after,
		loc_after : oploc.loc_before
	};

	return oploc_inv;
};

nbe.state.invert_ops = function (ops) {
	var invert_op, ops_inv, i;

	invert_op = function (op) {
		var inv;

		if ('editor_class' in op && (op.editor_class === 'title' || op.editor_class === 'publish')) {
			inv = {editor_class : op.editor_class, before : op.after, after : op.before};
		} else if (op.domop === 'insert') {
			inv = {domop : 'remove', id : op.id, before : op.before, type : op.type, val : op.val};
		} else if (op.domop === 'append') {
			inv = {domop : 'remove', id : op.id, parent : op.parent, type : op.type, val : op.val};
		} else if (op.domop === 'remove' && 'before' in op) {
			inv = {domop : 'insert', id : op.id, before : op.before, type : op.type, val : op.val};
		} else if (op.domop === 'remove' && 'parent' in op) {
			inv = {domop : 'append', id : op.id, parent : op.parent, type : op.type, val : op.val};
		} else if (op.domop === 'mutate') {
			inv = {domop : 'mutate', id : op.id, before : op.after, after : op.before};
		} else if (op.domop === 'split' || op.domop === 'merge') {
			inv = {domop : 'merge', parent : op.parent, child : op.child, point : op.point, parentval : op.parentval, childval : op.childval};
			inv.domop = op.domop === 'split' ? 'merge' : 'split';
		}

		return inv;
	};

	ops_inv = [];
	for (i = 0; i < ops.length; i++) {
		ops_inv.push(invert_op(ops[i]));
	}
	ops_inv = ops_inv.reverse();

	return ops_inv;
};

nbe.state.left_margin = function (direction, val) {
	var step, old_value, new_value;

	step = 20;

	old_value = val.left_margin ? val.left_margin : 0;
	if (direction === 'increment') {
		new_value = old_value + step;
	} else {
		new_value = old_value >= step ? old_value - step : old_value;
	}

	if (new_value > 0) {
		val.left_margin = new_value;
	} else {
		delete val.left_margin;
	}

	return new_value !== old_value;
};

nbe.state.line_classes = [
	'center',
	'right',
	'justify',
	'heading1',
	'heading2',
	'heading3',
	'heading4',
	'heading5',
	'heading6',
	'disc',
	'lower-alpha',
	'lower-roman',
	'square',
	'upper-alpha',
	'upper-roman',
	'ordered',
	'line_spacing_05',
	'line_spacing_06',
	'line_spacing_07',
	'line_spacing_08',
	'line_spacing_09',
	'line_spacing_10',
	'line_spacing_11',
	'line_spacing_12',
	'line_spacing_13',
	'line_spacing_14',
	'line_spacing_15',
	'line_spacing_16',
	'line_spacing_17',
	'line_spacing_18',
	'line_spacing_19',
	'line_spacing_20'
];

nbe.state.line_font_size = function (state, dom, line_id, domop) {
	var line, el_line, child, font_size;

	line = state.nodes[line_id];
	if (dom) {
		el_line = dom[line_id];
	}

	if (domop === 'remove') {
		if (line.children.length === 1) {
			child = line.children[0];
			if (child.type === 'text') {
				font_size = child.val.font_size;
				if (font_size) {
					line.val.font_size = font_size;
					if (dom) {
						nbe.state.mutate_element(el_line, 'line', line.val);
					}
				}
			}
		}
	} else {
		if (line.val.font_size) {
			delete line.val.font_size;
			if (dom) {
				nbe.state.mutate_element(el_line, 'line', line.val);
			}
		}
	}
};

nbe.state.line_val_merge = function (parentval, childval) {
	var val, choose_singleton_else_parent;

	val = {};

	choose_singleton_else_parent = function (key) {
		if (key in parentval) {
			val[key] = parentval[key];
		} else if (key in childval) {
			val[key] = childval[key];
		}
	};

	nbe.state.formats.text.concat(nbe.state.formats.line).forEach(function (key) {
		choose_singleton_else_parent(key);
	});

	if ('left_margin' in parentval) {
		val.left_margin = parentval.left_margin;
	} else {
		delete val.left_margin;
	}

	return val;
};

nbe.state.mutate_element = function (element, type, val) {
	var add_classes, remove_classes;

	add_classes = function (keys) {
		var i;

		for (i = 0; i < keys.length; i++) {
			if (keys[i] in val) {
				element.classList.add('wu-' + val[keys[i]]);
			}
		}
	};

	remove_classes = function (classes) {
		var i;

		for (i = 0; i < classes.length; i++) {
			element.classList.remove('wu-' + classes[i]);
		}
	};

	switch (type) {
	case 'root' :
		break;
	case 'line' :
		remove_classes(nbe.state.line_classes);
		add_classes(['heading', 'text_align', 'list', 'line_spacing']);
		element.style.marginLeft = val.left_margin ? (val.left_margin + 'px') : '';
		element.style.fontSize = val.font_size || '';
		break;
	case 'text' :
		element.textContent = val.text;
		element.classList[val.bold ? 'add' : 'remove']('wu-bold');
		element.classList[val.italic ? 'add' : 'remove']('wu-italic');
		element.classList[val.underline ? 'add' : 'remove']('wu-underline');
		element.classList[val.strikethrough ? 'add' : 'remove']('wu-strikethrough');
		element.style.color = val.color || '';
		element.style.backgroundColor = val.background_color || '';
		element.style.fontFamily = val.font_family || '';
		element.style.verticalAlign = val.vertical_align || '';
		element.style.fontSize = val.vertical_align ? (val.font_size ? ((0.8 * (Number(val.font_size.slice(0, val.font_size.length - 2)))) + 'px') : '80%') : (val.font_size || '');
		break;
	case 'img' :
		element.src = val.src || '';
		if ('width' in val) {
			element.width = val.width;
		} else {
			element.removeAttribute('width');
		}
		if ('height' in val) {
			element.height = val.height;
		} else {
			element.removeAttribute('height');
		}
		element.title = val.title || '';
		break;
	case 'link' :
		element.href = val.href;
	}

	return element;
};

nbe.state.reset_counter = function (editor) {
	var ordered_types, current_type, lines, i, line, type, reset;

	ordered_types = {
		'disc' : true,
		'lower-alpha' : true,
		'lower-roman' : true,
		'square' : true,
		'upper-alpha' : true,
		'upper-roman' : true,
		'ordered' : true
	};

	current_type = null;
	lines = editor.state.nodes.root.children;
	for (i = 0; i < lines.length; i++) {
		line = lines[i];
		type = line.val.list;
		if (type && type in ordered_types) {
			if (type !== current_type) {
				current_type = type;
				reset = true;
			} else {
				reset = false;
			}
		} else {
			current_type = null;
			reset = false;
		}

		if (reset) {
			editor.dom[line.id].classList.add('wu-reset-counter');
		} else {
			editor.dom[line.id].classList.remove('wu-reset-counter');
		}
	}
};

nbe.state.serialize = function (state) {
	var new_nodes, nodes, id, node, new_node, i;

	new_nodes = {};
	nodes = state.nodes;
	for (id in nodes) {
		if (nodes.hasOwnProperty(id)) {
			node = nodes[id];
			new_node = {type : node.type, id : node.id, val : node.val, children : []};
			if (node.parent) {
				new_node.parent = node.parent.id;
			}
			for (i = 0; i < node.children.length; i++) {
				new_node.children[i] = node.children[i].id;
			}
			new_nodes[id] = new_node;
		}
	}

	return JSON.stringify({nodes : new_nodes});
};

nbe.state.set_format = function (type, value, format) {
	if (nbe.state.formats.default_values[type] === value) {
		delete format[type];
	} else {
		format[type] = value;
	}

	return format;
};

nbe.state.state_copy = function (state) {
	return nbe.state.deserialize(nbe.state.serialize(state));
};

nbe.state.update = function (editor, state, dom, ops) {
	var nodes, root, insert, append, remove, mutate, split, merge, opi, op;

	nodes = state.nodes;
	root = nodes.root;

	insert = function (id, before, type, val) {
		var node, index;

		if (!(id in nodes) && before in nodes) {
			node = {id : id, type : type, val : val, parent : nodes[before].parent, children : []};
			nodes[id] = node;
			index = node.parent.children.indexOf(nodes[before]);
			node.parent.children = node.parent.children.slice(0, index).concat([node]).concat(node.parent.children.slice(index));
			if (dom) {
				dom[id] = nbe.state.element(id, type, val);
				dom[nodes[before].parent.id].insertBefore(dom[id], dom[before]);
			}
		}
	};

	append = function (id, parent_id, type, val) {
		var node;

		if (!(id in nodes) && parent_id in nodes) {
			node = {id : id, type : type, val : val, parent : nodes[parent_id], children : []};
			nodes[id] = node;
			node.parent.children.push(node);
			if (dom) {
				dom[id] = nbe.state.element(id, type, val);
			}
			if (node.parent.type === 'line') {
				if (dom) {
					dom[parent_id].insertBefore(dom[id], dom[parent_id].lastChild);
				}
				nbe.state.line_font_size(state, dom, parent_id, 'append');
			} else {
				if (dom) {
					dom[parent_id].appendChild(dom[id]);
				}
			}
		}
	};

	remove = function (id) {
		var node, index;

		if (id in nodes) {
			node = nodes[id];
			if (node.children.length === 0) {
				if (node.parent.type === 'line') {
					nbe.state.line_font_size(state, dom, node.parent.id, 'remove');
				}
				delete nodes[id];
				index = node.parent.children.indexOf(node);
				node.parent.children = node.parent.children.slice(0, index).concat(node.parent.children.slice(index + 1));
				if (dom) {
					dom[node.parent.id].removeChild(dom[id]);
					delete dom[id];
				}
			}
		}
	};

	mutate = function (id, val) {
		if (id in nodes) {
			nodes[id].val = val;
			if (dom) {
				nbe.state.mutate_element(dom[id], nodes[id].type, val);
			}
		}
	};

	split = function (parent_id, child_id, point_id, parentval, childval) {
		var par, child, index_par, index_point, i, par_child;

		par = nodes[parent_id];
		if (!(child_id in nodes) && par && par.type === 'line') {
			child = {id : child_id, type : 'line', val : childval, parent : root, children : []};
			nodes[child_id] = child;
			if (dom) {
				dom[child_id] = nbe.state.element(child_id, 'line', child.val);
			}
			index_par = root.children.indexOf(par);
			if (index_par === root.children.length - 1) {
				if (dom) {
					dom.root.appendChild(dom[child_id]);
				}
			} else {
				if (dom) {
					dom.root.insertBefore(dom[child_id], dom[root.children[index_par + 1].id]);
				}
			}
			root.children = root.children.slice(0, index_par + 1).concat([child]).concat(root.children.slice(index_par + 1));
			if (point_id && point_id in nodes && nodes[point_id].parent === par) {
				index_point = par.children.indexOf(nodes[point_id]);
			} else {
				index_point = par.children.length;
			}
			for (i = index_point; i < par.children.length; i++) {
				par_child = par.children[i];
				par_child.parent = child;
				if (dom) {
					dom[parent_id].removeChild(dom[par_child.id]);
					dom[child_id].insertBefore(dom[par_child.id], dom[child_id].lastChild);
				}
			}
			child.children = par.children.slice(index_point);
			par.children = par.children.slice(0, index_point);
			par.val = parentval;
			if (dom) {
				nbe.state.mutate_element(dom[parent_id], 'line', parentval);
			}
		}
	};

	merge = function (parent_id, parentval, childval) {
		var par, index_par, child, i, child_child;

		par = nodes[parent_id];
		if (par && par.type === 'line') {
			index_par = root.children.indexOf(par);
			if (index_par < root.children.length - 1) {
				child = root.children[index_par + 1];
				for (i = 0; i < child.children.length; i++) {
					child_child = child.children[i];
					child_child.parent = par;
					if (dom) {
						dom[child.id].removeChild(dom[child_child.id]);
						dom[parent_id].insertBefore(dom[child_child.id], dom[parent_id].lastChild);
					}
				}
				if (dom) {
					dom.root.removeChild(dom[child.id]);
					delete dom[child.id];
				}
				root.children = root.children.slice(0, index_par + 1).concat(root.children.slice(index_par + 2));
				delete nodes[child.id];
				par.children = par.children.concat(child.children);
				par.val = nbe.state.line_val_merge(parentval, childval);
				if (dom) {
					nbe.state.mutate_element(dom[parent_id], 'line', par.val);
				}
			}
		}
	};

	if (dom) {
		editor.mutation.disconnect();
	}

	for (opi = 0; opi < ops.length; opi++) {
		op = ops[opi];
		if (op.domop === 'insert') {
			insert(op.id, op.before, op.type, op.val);
		} else if (op.domop === 'append') {
			append(op.id, op.parent, op.type, op.val);
		} else if (op.domop === 'remove') {
			remove(op.id);
		} else if (op.domop === 'mutate') {
			mutate(op.id, op.after);
		} else if (op.domop === 'split') {
			split(op.parent, op.child, op.point, op.parentval, op.childval);
		} else if (op.domop === 'merge') {
			merge(op.parent, op.parentval, op.childval);
		}
	}

	if (dom) {
		nbe.state.reset_counter(editor);
		editor.mutation.observe();
	}
};
