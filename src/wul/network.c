#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <unistd.h>
#include <errno.h>
#include <zf_log/zf_log.h>
#include <wul/network.h>

int wul_net_listen(const char* hostname, const char* servname, struct wul_net_listen_sock** sockets)
{
    struct addrinfo hints, *res0;

    memset(&hints, 0, sizeof(hints));
    hints.ai_flags = AI_PASSIVE;
    hints.ai_family = PF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;

    int error = getaddrinfo(hostname, servname, &hints, &res0);
    if (error) {
            ZF_LOGE("getaddrinfo failed with hostname = %s, servname = %s, "
                    "error = %i, reason = %s", hostname, servname,
                    error, gai_strerror(error));
            return 0;
    }

    int nsocks = 0;
    struct wul_net_listen_sock *socks = NULL;
    char host[NI_MAXHOST];
    char serv[NI_MAXSERV];

    for (struct addrinfo *res = res0; res; res = res->ai_next) {
                ZF_LOGD("Attempt to listen, ai_family = %i, ai_socktype = %i, "
                      "ai_protocol = %i", res->ai_family, res->ai_socktype,
                      res->ai_protocol);

                int fd = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
                if (fd < 0) {
                        ZF_LOGD("socket() failed");
                        continue;
                }
                ZF_LOGD("Socket created with file descriptor = %i", fd);

                if (bind(fd, res->ai_addr, res->ai_addrlen) < 0) {
                        ZF_LOGD("bind() failed, errno = %i, error = %s",
                                errno, strerror(errno));
                        close(fd);
                        continue;
                }
                ZF_LOGD("Socket bound");

                int backlog = 20;
                if (listen(fd, backlog)) {
                        ZF_LOGD("listen() failed with errno = %i", errno);
                        close(fd);
                        continue;
                }
                ZF_LOGD("Socket listening with backlog = %i", backlog);

                struct sockaddr_storage addr;
                socklen_t addrlen = sizeof(addr);
                getsockname(fd, (struct sockaddr*) &addr, &addrlen);

                error = getnameinfo((struct sockaddr*) &addr, addrlen, host,
                                    sizeof(host), serv, sizeof(serv),
                                    NI_NUMERICHOST | NI_NUMERICSERV);
                if (error) {
                        ZF_LOGD("getnameinfo failed for the socket, error = %i, "
                                "strerror = %s", error, gai_strerror(error));
                        close(fd);
                        continue;
                }
                ZF_LOGI("Socket listening with host = %s, serv = %s", host, serv);

                ++nsocks;
                socks = realloc(socks, nsocks * sizeof(*socks));
                socks[nsocks - 1].fd = fd;
                strcpy(socks[nsocks - 1].host, host);
                strcpy(socks[nsocks - 1].serv, serv);
    }

    freeaddrinfo(res0);

    if (nsocks == 0)
        ZF_LOGE("No listening sockets could be created");

    *sockets = socks;
    return nsocks;
}
