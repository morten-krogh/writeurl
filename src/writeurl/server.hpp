/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#ifndef WRITEURL_SERVER_H
#define WRITEURL_SERVER_H

#include <string>

#include <spdlog/spdlog.h>
// #include <writeurl/store.hpp>


namespace writeurl {

class Server {
public:

    struct Address {
        std::string address = "::";
        uint16_t port = 0;
    };

    struct Config {

        std::shared_ptr<spdlog::logger> logger;

        Address address;




    };

    Server(const Config& config);

    // Blocking. Starts event loop.
    void start();

    // Thread safe
    void stop();

    const Address& get_address() const;


private:
    std::shared_ptr<spdlog::logger> logger;

    Config m_config;
    Address m_addres;

    



};

} // namespace writeurl

#endif // WRITEURL_SERVER_H
