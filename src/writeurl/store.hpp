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

class Store {
public:
    Store(const std::string& store_dir);


    struct Ids {
        std::string id;
        std::string read_password;
        std::string write_password;
        uint_fast64_t noperation;
        uint_fast64_t nstate;
    };

    bool exists(const std::string& id);
    Ids get_ids(const std::string& id, std::error_code& ec);

    bool create(const std::string& id,
                const std::string& read_password,
                const std::string& write_password);

private:
    const std::string m_store_dir;

};


} // namespace writeurl

#endif // WRITEURL_STORE_H
