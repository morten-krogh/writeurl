/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#ifndef WRITEURL_NETWORK_H
#define WRITEURL_NETWORK_H

#include <string>
#include <vector>

#include <spdlog/spdlog.h>

namespace writeurl {
namespace network {

struct address {
    std::string hostname = "";
    std::string port = "";
};

struct listen_socket {
    int descriptor;
    address address;
};

std::vector<listen_socket> listen(const address& address, spdlog::logger* logger);



} // namespace network
} // namespace writeurl

#endif // WRITEURL_NETWORK_H
