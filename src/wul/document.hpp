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

class Document {
public:

    Document(Store& store);

    enum class CreateStatus {
        ok,
        invalid_id,
        invalid_read_password,
        invalid_write_password,
        exist,
        store_failure
    };

    CreateStatus create_document(const std::string& id,
                         const std::string& read_password,
                         const std::string& write_password);

    enum class AttachStatus {
        ok,
        invalid_id,
        no_exist,
        store_failure
    };

    AttachStatus attach_document(const std::string& id);

    enum class ConsumerStatus {
        ok,
        invalid_read_password,
        invalid_write_password
    };

    ConsumerStatus add_consumer_for_document(bool new_document,
                                   const std::string read_password,
                                   const std::string write_password);


    const std::string& get_id() const noexcept;

    const std::string& get_read_password() const noexcept;

    const std::string& get_write_password() const noexcept;

    uint_fast64_t get_noperation() const noexcept;
    void set_noperation(uint_fast64_t noperation);


private:
    Store& m_store;
    std::string m_id;
    std::string m_read_password;
    std::string m_write_password;
    uint_fast64_t m_noperation = 0;
    uint_fast64_t m_nstate = 0;
};

} // namespace writeurl

#endif // WRITEURL_DOCUMENT_H
