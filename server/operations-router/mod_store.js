'use strict';

var fs = require('fs');

function get_char(num) {
	// 97 is 'a', 48 is '0'
	const char_code = num < 26 ? (97 + num) : (48 + num - 26);
	return String.fromCharCode(char_code);
}

function make_subdirs(doc_dir) {
	for (let i = 0; i < 36; ++i) {
		const sub_dir = doc_dir + '/' + get_char(i);
		if (!fs.existsSync(sub_dir)) {
			fs.mkdirSync(sub_dir);
		}
		for (let j = 0; j < 36; ++j) {
			const sub_sub_dir = sub_dir + '/' + get_char(j);
			if (!fs.existsSync(sub_sub_dir)) {
				fs.mkdirSync(sub_sub_dir);
			}
		}
	}
}

function make_store(doc_dir) {

	make_subdirs(doc_dir);

	const ngroup = 100;

	const path = function (id) {
		return doc_dir + '/' + id[0] + '/' + id[1] + '/' + id;
	};

	const read = function (id, name, json) {
		const content = fs.readFileSync(path(id) + '/' + name, 'utf8');
		return json ? JSON.parse(content) : content;
	};

	const write = function (id, name, content, json) {
		fs.writeFileSync(path(id) + '/' + name, json ? JSON.stringify(content) : content);
	};

	const read_group = function (id, g) {
		return read(id, 'operation-' + g, true);
	};

	const write_group = function (id, g, operations) {
		write(id, 'operation-' + g, operations, true);
	};

	const exist = function (id) {
		var stat;

		try {
			stat = fs.statSync(path(id));
		} catch (e) {
			stat = null;
		}

		return stat !== null;
	};

	const create = function (ids, state) {
		fs.mkdirSync(path(ids.id));
		write(ids.id, 'ids', ids, true);
		write(ids.id, 'noperation', 0, true);
		write(ids.id, 'state', state, false);
		write(ids.id, 'nstate', 0, true);
	};

	const get_ids = function (id) {
		return read(id, 'ids', true);
	};

	const get_state = function (id) {
		return read(id, 'state', false);
	};

	const put_state = function (id, state, nstate) {
		write(id, 'state', state, false);
		write(id, 'nstate', nstate, true);
	};

	const get_nstate = function (id) {
		try {
			return read(id, 'nstate', true);
		} catch (e) {
			return null;
		}
	};

	const get_noperation = function (id) {
		return read(id, 'noperation', true);
	};

	const get_operations = function (id, nstart) {
		var noperation, operations, g, group;

		noperation = get_noperation(id);
		operations = [];
		while (nstart < noperation) {
			g = Math.floor(nstart / ngroup);
			group = read_group(id, g);
			operations = operations.concat(group.slice(nstart - g * ngroup, Math.min(ngroup, noperation - g * ngroup)));
			nstart = (g + 1) * ngroup;
		}

		return operations;
	};

	const put_operations = function (id, operations) {
		var noperation, g, tail, break_point, group, next_break_point;

		noperation = get_noperation(id);
		g = Math.floor((noperation - 1) / ngroup);
		tail = (g + 1) * ngroup - noperation;
		if (tail > 0) {
			break_point = Math.min(tail, operations.length);
			group = read_group(id, g);
			write_group(id, g, group.concat(operations.slice(0, break_point)));
		} else {
			break_point = 0;
		}

		while (break_point < operations.length) {
			g = g + 1;
			next_break_point = Math.min(break_point + ngroup, operations.length);
			write_group(id, g, operations.slice(break_point, next_break_point));
			break_point = next_break_point;
		}

		write(id, 'noperation', noperation + operations.length, true);
	};

	return {
		exist: exist,
		create: create,
		get_ids: get_ids,
		get_state: get_state,
		put_state: put_state,
		get_nstate: get_nstate,
		get_noperation: get_noperation,
		get_operations: get_operations,
		put_operations: put_operations
	};
}

module.exports = make_store;
