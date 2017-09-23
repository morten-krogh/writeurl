#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <cassert>

#include <rapidjson/reader.h>
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"
#include <rapidjson/error/en.h>

#include <writeurl/error.hpp>
#include <writeurl/store.hpp>
#include <writeurl/file.hpp>

#include <iostream> // REMOVE

using namespace writeurl;

namespace {

char char_at_index(int index)
{
    assert(index >= 0 && index < 36);
    if (index < 10)
        return '0' + index;
    else
        return 'a' + (index - 10);
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

std::error_code create_document_dirs(const std::string& store_dir)
{
    for (int i = 0; i < 36; ++i) {
        char ch_1 = char_at_index(i);
        std::string dir_1 = file::resolve(store_dir, std::string{ch_1});
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

std::string resolve_document_dir(const std::string& store_dir, const std::string& id)
{
    assert(id.size() > 2);
    std::vector<std::string> components(4);
    components[0] = store_dir;
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

std::string resolve_nstate(const std::string& document_dir)
{
    return file::resolve(document_dir, "nstate");
}

class IdsJSONHandler: public rapidjson::BaseReaderHandler<rapidjson::UTF8<>, IdsJSONHandler> {
public:

    IdsJSONHandler(Store::Ids& ids):
        m_ids {ids}
    {
    }

    bool StartObject()
    {
        if (m_parser_state != ParserState::ExpectObjectStart)
            return false;

        m_parser_state = ParserState::ExpectKeyOrObjectEnd;
        return true;
    }

    bool String(const char* str, rapidjson::SizeType size, bool)
    {
        switch(m_parser_state) {
            case ParserState::ExpectObjectStart:
                return false;
            case ParserState::ExpectKeyOrObjectEnd:
                m_parser_state = ParserState::ExpectValue;
                m_key = std::string {str, size};
                return true;
            case ParserState::ExpectValue:
                m_parser_state = ParserState::ExpectKeyOrObjectEnd;
                m_map.insert(std::make_pair(m_key, std::string {str, size}));
                return true;
        }
    }

    bool EndObject(rapidjson::SizeType)
    {
        if (m_parser_state != ParserState::ExpectKeyOrObjectEnd)
            return false;

        auto search = m_map.find("id");
        if (search == m_map.end())
            return false;

        m_ids.id = search->second;

        search = m_map.find("read");
        if (search == m_map.end())
            return false;

        m_ids.read_password = search->second;

        search = m_map.find("write");
        if (search == m_map.end())
            return false;

        m_ids.write_password = search->second;

        return true;
    }

    bool Default()
    {
        return false;
    }

private:
    Store::Ids& m_ids;

    std::string m_key;
    std::map<std::string, std::string> m_map;

    enum class ParserState {
        ExpectObjectStart,
        ExpectKeyOrObjectEnd,
        ExpectValue
    };

    ParserState m_parser_state = ParserState::ExpectObjectStart;
};

void read_id_and_passwords(const std::string& document_dir, Store::Ids& ids, std::error_code& ec)
{
    const std::string ids_path = resolve_ids(document_dir);
    buffer::Buffer buf;
    ec = file::read(ids_path, buf);
    if (ec)
        return;

    rapidjson::Reader reader;
    IdsJSONHandler handler {ids};
    rapidjson::MemoryStream stream {buf.data(), buf.size()};
    if (!reader.Parse(stream, handler)) {
        ec = make_error_code(Error::store_json_parser_error);
        return;
    }
}

void read_noperation(const std::string& document_dir, Store::Ids& ids, std::error_code& ec)
{
    const std::string noperation_path = resolve_noperation(document_dir);
    buffer::Buffer buf;
    ec = file::read(noperation_path, buf);
    if (ec)
        return;

    ids.noperation = parse_uint(buf.to_string(), ec);
    return;
}

void read_nstate(const std::string& document_dir, Store::Ids& ids, std::error_code& ec)
{
    const std::string nstate_path = resolve_nstate(document_dir);
    buffer::Buffer buf;
    ec = file::read(nstate_path, buf);
    if (ec)
        return;

    ids.nstate = parse_uint(buf.to_string(), ec);
    return;
}

void write_id_and_passwords(const std::string& document_dir,
                            const std::string& id,
                            const std::string& read_password,
                            const std::string& write_password,
                            std::error_code& ec)
{
    const std::string ids_path = resolve_ids(document_dir);

    rapidjson::StringBuffer buf;
    rapidjson::Writer<rapidjson::StringBuffer> writer {buf};

    writer.StartObject();

    writer.Key("prefix");
    writer.String("text");

    writer.Key("id");
    writer.String(id.c_str());

    writer.Key("read");
    writer.String(read_password.c_str());

    writer.Key("write");
    writer.String(write_password.c_str());

    writer.EndObject();

    ec = file::write(ids_path, buf.GetString(), buf.GetSize());
    return;
}

void write_noperation(const std::string& document_dir, uint_fast64_t noperation, std::error_code& ec)
{
    const std::string noperation_path = resolve_noperation(document_dir);
    std::ostringstream os;
    os << noperation;
    ec = file::write(noperation_path, os.str().c_str(), os.str().size());
    return;
}

void write_nstate(const std::string& document_dir, uint_fast64_t nstate, std::error_code& ec)
{
    const std::string nstate_path = resolve_nstate(document_dir);
    std::ostringstream os;
    os << nstate;
    ec = file::write(nstate_path, os.str().c_str(), os.str().size());
    return;
}

} // namespace

Store::Store(const std::string& store_dir):
    m_store_dir {store_dir}
{
    std::error_code ec = create_document_dirs(store_dir);
    if (ec)
        throw std::system_error(ec);
}

bool Store::exist(const std::string& id)
{
    const std::string document_dir = resolve_document_dir(m_store_dir, id);
    return file::exists(document_dir);
}

Store::Ids Store::get_ids(const std::string& id, std::error_code& ec)
{
    Ids ids;
    const std::string document_dir = resolve_document_dir(m_store_dir, id);

    read_id_and_passwords(document_dir, ids, ec);
    if (ec)
        return {};

    assert(id == ids.id);

    read_noperation(document_dir, ids, ec);
    if (ec)
        return {};

    read_nstate(document_dir, ids, ec);
    if (ec)
        return {};

    return ids;
}

bool Store::create(const std::string& id,
                   const std::string& read_password,
                   const std::string& write_password)
{
    if (exist(id))
        return false;

    const std::string document_dir = resolve_document_dir(m_store_dir, id);

    std::error_code ec = file::mkdir(document_dir);
    if (ec)
        return false;

    write_id_and_passwords(document_dir, id, read_password, write_password, ec);
    if (ec)
        return false;

    write_noperation(document_dir, 0, ec);
    if (ec)
        return false;

    write_nstate(document_dir, 0, ec);
    if (ec)
        return false;







    return true;
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
