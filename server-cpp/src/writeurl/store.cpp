#include <string>
#include <vector>
#include <cassert>

#include <writeurl/store.hpp>

using namespace writeurl;

namespace {

std::string resolve(const std::vector<std::string>& components)
{
    assert(components.size() != 0);
    std::string result = components[0];
    for (size_t i = 1; i < components.size(); ++i) {
        result.append(1, '/');
        result.append(components[i]);
    }
    return result;
}

std::string resolve(const std::string& prefix, const std::string& name)
{
    std::vector<std::string> components(2);
    components[0] = prefix;
    components[1] = name;
    return resolve(components);
}

std::string resolve_document_dir(const std::string& root_dir, const std::string& id)
{
    assert(id.size() > 2);
    std::vector<std::string> components(4);
    components[0] = root_dir;
    components[1] = id[0];
    components[2] = id[1];
    components[3] = id[2];
    return resolve(components);
}

std::string resolve_ids(const std::string& document_dir)
{
    return resolve(document_dir, "ids");
}

std::string resolve_noperation(const std::string& document_dir)
{
    return resolve(document_dir, "noperation");
}

std::string resolve_nstate(const std::string& document_dir)
{
    return resolve(document_dir, "nstate");
}



} // anonymous namespace

document::DocumentMetaData store::read_document_meta_data(const std::string& root_dir, const std::string& id)
{
    document::DocumentMetaData document_meta_data;
    
    return document_meta_data;
}



//
//'use strict';
//
//var fs = require('fs');
//
//var ngroup = 100;
//
//var path = function (id) {
//	return 'docs/' + id[0] + '/' + id[1] + '/' + id;
//};
//
//var read = function (id, name, json) {
//	var content;
//
//	content = fs.readFileSync(path(id) + '/' + name, 'utf8');
//
//	return json ? JSON.parse(content) : content;
//};
//
//var write = function (id, name, content, json) {
//	fs.writeFileSync(path(id) + '/' + name, json ? JSON.stringify(content) : content);
//};
//
//var read_group = function (id, g) {
//	return read(id, 'operation-' + g, true);
//};
//
//var write_group = function (id, g, operations) {
//	write(id, 'operation-' + g, operations, true);
//};
//
//exports.exist = function (id) {
//	var stat;
//
//	try {
//		stat = fs.statSync(path(id));
//	} catch (e) {
//		stat = null;
//	}
//
//	return stat !== null;
//};
//
//exports.create = function (ids, state) {
//	fs.mkdirSync(path(ids.id));
//	write(ids.id, 'ids', ids, true);
//	write(ids.id, 'noperation', 0, true);
//	write(ids.id, 'state', state, false);
//	write(ids.id, 'nstate', 0, true);
//};
//
//exports.get_ids = function (id) {
//	return read(id, 'ids', true);
//};
//
//exports.get_state = function (id) {
//	return read(id, 'state', false);
//};
//
//exports.put_state = function (id, state, nstate) {
//	write(id, 'state', state, false);
//	write(id, 'nstate', nstate, true);
//};
//
//exports.get_nstate = function (id) {
//	try {
//		return read(id, 'nstate', true);
//	} catch (e) {
//		return null;
//	}
//};
//
//exports.get_noperation = function (id) {
//	return read(id, 'noperation', true);
//};
//
//exports.get_operations = function (id, nstart) {
//	var noperation, operations, g, group;
//
//	noperation = exports.get_noperation(id);
//	operations = [];
//	while (nstart < noperation) {
//		g = Math.floor(nstart / ngroup);
//		group = read_group(id, g);
//		operations = operations.concat(group.slice(nstart - g * ngroup, Math.min(ngroup, noperation - g * ngroup)));
//		nstart = (g + 1) * ngroup;
//	}
//
//	return operations;
//};
//
//exports.put_operations = function (id, operations) {
//	var noperation, g, tail, break_point, group, next_break_point;
//
//	noperation = exports.get_noperation(id);
//	g = Math.floor((noperation - 1) / ngroup);
//	tail = (g + 1) * ngroup - noperation;
//	if (tail > 0) {
//		break_point = Math.min(tail, operations.length);
//		group = read_group(id, g);
//		write_group(id, g, group.concat(operations.slice(0, break_point)));
//	} else {
//		break_point = 0;
//	}
//
//	while (break_point < operations.length) {
//		g = g + 1;
//		next_break_point = Math.min(break_point + ngroup, operations.length);
//		write_group(id, g, operations.slice(break_point, next_break_point));
//		break_point = next_break_point;
//	}
//
//	write(id, 'noperation', noperation + operations.length, true);
//};
