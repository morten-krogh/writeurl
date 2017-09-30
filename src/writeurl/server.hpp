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

    struct Config {

        spdlog::logger& logger;




    };

    Server(const Config& config);

    void start();


private:
    spdlog::logger& logger;

};

} // namespace writeurl

#endif // WRITEURL_SERVER_H
