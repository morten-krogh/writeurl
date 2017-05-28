/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#include <string>

namespace writeurl {
namespace document {

struct DocumentMetaData {
    std::string id;
    std::string read;
    std::string write;
    uint_fast64_t noperation;
    uint_fast64_t nstate;
};



} // namespace document
} // namespace writeurl
