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

namespace writeurl {
namespace network {

struct Address {
    std::string hostname = "";
    std::string port = "";
};


struct ListenStatus {
    int error = 0;
    std::string error_str;
    std::vector<int> sockets;
    std::vector<std::string> hostnames;
    std::vector<std::string> ports;
};

ListenStatus listen(const Address& address);



} // namespace network
} // namespace writeurl

#endif // WRITEURL_NETWORK_H
