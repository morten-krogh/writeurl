#include <string>
#include <vector>
#include <cassert>

#include <writeurl/error.hpp>
#include <writeurl/store.hpp>
#include <writeurl/file.hpp>

#include <iostream>

using namespace writeurl;

namespace {

char char_at_index(int index)
{
    assert(index >= 0 && index < 36);
    if (index < 26)
        return 'a' + index;
    else
        return '0' + (index - 26);
}

uint_fast64_t parse_uint(const std::string str, std::error_code& ec)
{
    if (str.size() == 0) {
        ec = Error::store_error;
        return 0;
    }
    char* endptr;
    uint_fast64_t result = strtoll(str.c_str(), &endptr, 10);
    if (*endptr == '\0')
        return result;

    ec = Error::store_error;
    return 0;
}

std::string resolve_document_dir(const std::string& root_dir, const std::string& id)
{
    assert(id.size() > 2);
    std::vector<std::string> components(4);
    components[0] = root_dir;
    components[1] = id[0];
    components[2] = id[1];
    components[3] = id;
    return file::resolve(components);
}

std::string resolve_ids(const std::string& document_dir)
{
    return file::resolve(document_dir, "ids");
}

std::string resolve_noperation(const std::string& document_dir)
{
    return file::resolve(document_dir, "noperation");
}

//std::string resolve_nstate(const std::string& document_dir)
//{
//    return file::resolve(document_dir, "nstate");
//}
//

} // anonymous namespace

store::Ids store::get_ids(const std::string& root_dir, const std::string& id, std::error_code& ec)
{
    Ids ids;
    const std::string document_dir = resolve_document_dir(root_dir, id);
    const std::string ids_path = resolve_ids(document_dir);
    buffer::Buffer buf;
    ec = file::read(ids_path, buf);
    if (ec)
        return ids;

    std::cout << buf.to_string() << std::endl;

    ids.id = id;
    ids.read = "read";
    ids.write = "write";

    return ids;
}

uint_fast64_t store::get_noperation(const std::string& root_dir, const std::string& id, std::error_code& ec)
{
    const std::string document_dir = resolve_document_dir(root_dir, id);
    const std::string noperation_path = resolve_noperation(document_dir);
    buffer::Buffer buf;
    ec = file::read(noperation_path, buf);
    if (ec)
        return 0;

    uint_fast64_t noperation = parse_uint(buf.to_string(), ec);
    return noperation;
}

//uint_fast64_t store::get_nstate(const std::string& root_dir, const std::string& id, std::error_code& ec)
//{
//
//}
//
document::DocumentMetaData store::read_document_meta_data(const std::string& /* root_dir */, const std::string& /* id */)
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

std::error_code store::create_document_dirs(const std::string& root_dir)
{
    for (int i = 0; i < 36; ++i) {
        char ch_1 = char_at_index(i);
        std::string dir_1 = file::resolve(root_dir, std::string{ch_1});
        if (!file::exists(dir_1)) {
            std::error_code ec = file::mkdir(dir_1);
            if (ec)
                return ec;
        }
        for (int j = 0; j < 36; ++j) {
            char ch_2 = char_at_index(j);
            std::string dir_2 = file::resolve(dir_1, std::string{ch_2});
            if (!file::exists(dir_2)) {
                std::error_code ec = file::mkdir(dir_2);
                if (ec)
                    return ec;
            }
        }
    }

    return std::error_code {};
}
