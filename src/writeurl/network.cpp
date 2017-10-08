#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <unistd.h>
#include <errno.h>

#include <writeurl/network.hpp>


#include <iostream>

using namespace writeurl;

std::vector<network::listen_socket> network::listen(const address& address, spdlog::logger* logger)
{
    struct addrinfo hints, *res0;

    memset(&hints, 0, sizeof(hints));
    hints.ai_flags = AI_PASSIVE;
    hints.ai_family = PF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;

    const char *hostname = address.hostname.empty() ? nullptr : address.hostname.c_str();
    const char* servname = address.port.empty() ? nullptr : address.port.c_str();

    int error = getaddrinfo(hostname, servname, &hints, &res0);
    if (error) {
        logger->error("getaddrinfo error, error = {}, strerror = {}",
                      error, gai_strerror(error));
        return {};
    }

    std::vector<listen_socket> sockets;
    char host[NI_MAXHOST];
    char serv[NI_MAXSERV];

    for (struct addrinfo *res = res0; res; res = res->ai_next) {
        logger->debug("Attempt to listen, ai_family = {}, ai_socktype = {}, "
                      "ai_protocol = {}", res->ai_family, res->ai_socktype,
                      res->ai_protocol);

        int descriptor = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
        if (descriptor < 0) {
            logger->debug("Failure to open socket");
            continue;
        }
        logger->debug("Socket created with descriptor = {}", descriptor);

        if (bind(descriptor, res->ai_addr, res->ai_addrlen) < 0) {
            logger->debug("Failure to bind the socket, errno = {}, error = {}",
                          errno, strerror(errno));
            close(descriptor);
            continue;
        }
        logger->debug("Socket bound");
        
        int backlog = 20;
        if (::listen(descriptor, backlog)) {
            logger->debug("Socket listen failed with errno = {}", errno);
            close(descriptor);
            continue;
        }
        logger->debug("Socket listening with backlog = {}", backlog);

        struct sockaddr_storage addr;
        socklen_t addrlen = sizeof(addr);
        getsockname(descriptor, (struct sockaddr*) &addr, &addrlen);

        error = getnameinfo((struct sockaddr*) &addr, addrlen, host, sizeof(host), serv, sizeof(serv),
                            NI_NUMERICHOST | NI_NUMERICSERV);
        if (error) {
            logger->debug("getnameinfo failed for the socket, error = {}, strerror = {}",
                         error, gai_strerror(error));
            close(descriptor);
            continue;
        }
        logger->debug("Socket listening with hostname = {}, port = {}", host, serv);

        listen_socket socket {descriptor, network::address {host, serv}};
        sockets.push_back(socket);
    }

    freeaddrinfo(res0);

    if (sockets.empty())
        logger->error("No listening sockets could be created");

    return sockets;
}

