'use strict';

nbe.publish.create = function (editor_id, doc) {
	var time, init, msg, publish, add_external_ops, set_time, get_time;
 
	time = null;

	init = function (state) {
		set_time(state.time);
	};

	msg = document.createElement('div');

	publish = function (callback) {
		var html, body;
		
		html = nbe.doc.html(nbe.dynamic.doc);
			
		body = {
			type : 'publish',
			id : doc.ids.id,
			write : doc.ids.write,
			html : html
		};
			
		nbe.lib.xhr('POST', nbe.config.publish_url, {}, JSON.stringify(body), 0, function (response) {
			var op;
			
			response = JSON.parse(response);
			if (response === 'published') {
				op = {
					editor_class : 'publish',
					before : time,
					after : Date.now()
				};
				set_time(op.after);
				doc.add_ops(editor_id, [op]);
				callback(response);
			}
		}, function () {}, function () {
			callback(null);
		});
	};

	add_external_ops = function (ops, _set_location) {
		ops.forEach(function (op) {
			if ('editor_class' in op && op.editor_class === 'publish') {
				set_time(op.after);
			}
		});
	};

	set_time = function (new_time) {
		time = new_time;
		msg.textContent = time === null ? 'Not published' : 'Published at ' + new Date(time);
	};

	get_time = function () {
		return time;
	};

	return {id : editor_id, init : init, msg : msg, publish : publish, add_external_ops : add_external_ops, get_time : get_time};
};
