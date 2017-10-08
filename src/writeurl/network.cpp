#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <unistd.h>
#include <errno.h>

#include <writeurl/network.hpp>


#include <iostream>

using namespace writeurl;




network::ListenStatus network::listen(const Address& address)
{
    ListenStatus status;

    struct addrinfo hints, *res0;

    memset(&hints, 0, sizeof(hints));
    hints.ai_flags = AI_PASSIVE;
    hints.ai_family = PF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;

    const char *hostname = address.hostname.empty() ? nullptr : address.hostname.c_str();
    const char* servname = address.port.empty() ? nullptr : address.port.c_str();

    int error = getaddrinfo(hostname, servname, &hints, &res0);
    
    if (error) {
        status.error = error;
        status.error_str = gai_strerror(error);
        return status;
    }

    error = 0;
    char cause = '\0';
    std::string error_str;
    char host[NI_MAXHOST];
    char serv[NI_MAXSERV];

    for (struct addrinfo *res = res0; res; res = res->ai_next) {
        std::cout << "Trying res, ai_family = " << res->ai_family
            << ", ai_socktype = " << res->ai_socktype
            << ", ai_protocol = " << res->ai_protocol
            << std::endl;



        int sock = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
        if (sock < 0) {
            cause = 's';
            std::cout << "socket failure\n";
            continue;
        }

        if (bind(sock, res->ai_addr, res->ai_addrlen) < 0) {
            cause = 'b';
            close(sock);
            continue;
        }
        
        int backlog = 20;
        if (::listen(sock, backlog)) {
            error = errno;
            cause = 'l';
            close(sock);
            continue;
        }

        struct sockaddr_storage addr;
        socklen_t addrlen = sizeof(addr);
        getsockname(sock, (struct sockaddr*) &addr, &addrlen);

        error = getnameinfo((struct sockaddr*) &addr, addrlen, host, sizeof(host), serv, sizeof(serv),
                            NI_NUMERICHOST | NI_NUMERICSERV);
        if (error) {
            cause = 'g';
            error_str = gai_strerror(error);
            close(sock);
            continue;
        }

        status.sockets.push_back(sock);
        status.hostnames.emplace_back(host);
        status.ports.emplace_back(serv);
    }

    freeaddrinfo(res0);

    if (status.sockets.empty()) {
        status.error = 1;
        if (cause == 's') {
            status.error_str = "Socket could not be created";
        }
        else if (cause == 'b') {
            status.error_str = "Socket could not be bound";
        }
        else if (cause == 'l') {
            status.error_str = std::string {"Listen error with errno = "} +
                std::string {strerror(error)};
        }
        else {
            status.error_str = error_str;
        }
    }

    return status;
}








