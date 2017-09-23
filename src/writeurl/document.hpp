/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#ifndef WRITEURL_DOCUMENT_H
#define WRITEURL_DOCUMENT_H

#include <string>
#include <writeurl/store.hpp>

namespace writeurl {
namespace document {

class Document {
public:

    Document(const writeurl::Store::Ids& ids);

    const std::string& get_id() const noexcept;

    const std::string& get_read_password() const noexcept;

    const std::string& get_write_password() const noexcept;

    uint_fast64_t get_noperation() const noexcept;
    void set_noperation(uint_fast64_t noperation);


private:
    const std::string m_id;
    const std::string m_read_password;
    const std::string m_write_password;
    uint_fast64_t m_noperation;
    uint_fast64_t m_nstate;
};



} // namespace document
} // namespace writeurl

#endif // WRITEURL_DOCUMENT_H
