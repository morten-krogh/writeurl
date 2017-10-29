/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#pragma once

#include <netdb.h>


struct wul_net_listen_sock {
        int fd;
        char host[NI_MAXHOST]; // NUL terminated.
        char serv[NI_MAXSERV]; // NUL terminated.
};

// wul_net_listen creates a number of listening sockets.
// The input parameters hostname and servname are as in getaddrinfo.
// The resulting listening sockets are returned in sockets.
// *sockets is an allocated array of struct wul_net_listen_sock and must be freed
// after use: free(*sockets);
// The return value is the size of *sockets, i.e. the number of listening sockets.
int wul_net_listen(const char *hostname, const char *servname, struct wul_net_listen_sock **sockets);
