/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#ifndef WRITEURL_STORE_H
#define WRITEURL_STORE_H

#include <system_error>

#include <writeurl/document.hpp>

namespace writeurl {
namespace store {

struct Ids {
    std::string id;
    std::string read;
    std::string write;
};

Ids get_ids(const std::string& root_dir, const std::string& id, std::error_code& ec);
uint_fast64_t get_noperation(const std::string& root_dir, const std::string& id, std::error_code& ec);
uint_fast64_t get_nstate(const std::string& root_dir, const std::string& id, std::error_code& ec);


//document::DocumentMetaData read_document_meta_data(const std::string& root_dir, const std::string& id);


std::error_code create_document_dirs(const std::string& root_dir);


} // namespace store
} // namespace writeurl

#endif // WRITEURL_STORE_H
