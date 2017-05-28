/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#include <writeurl/document.hpp>

namespace writeurl {
namespace store {

//struct DocumentMetaData {
//    std::string id;
//    std::string read;
//    std::string write;
//    uint_fast64_t noperation;
//    uint_fast64_t nstate;
//};
//

document::DocumentMetaData read_document_meta_data(const std::string& root_dir, const std::string& id);



} // namespace store
} // namespace writeurl
