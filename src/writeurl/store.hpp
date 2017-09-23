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

namespace writeurl {
namespace store {

struct Ids {
    std::string id;
    std::string read_password;
    std::string write_password;
    uint_fast64_t noperation;
    uint_fast64_t nstate;
};

Ids get_ids(const std::string& root_dir, const std::string& id, std::error_code& ec);


std::error_code create_document_dirs(const std::string& root_dir);


} // namespace store
} // namespace writeurl

#endif // WRITEURL_STORE_H
