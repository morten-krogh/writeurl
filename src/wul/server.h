/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#pragma once

#include <pthread.h>
#include <stdbool.h>
#include <zf_log/zf_log.h>
#include <wul/network.h>

struct wurl_server_config {

        // The Writeurl server will output log messages
        // whose level is at least log_level. The logger
        // is zf_log. The available levels are
        // ZF_LOG_VERBOSE 1
        // ZF_LOG_DEBUG   2
        // ZF_LOG_INFO    3
        // ZF_LOG_WARN    4
        // ZF_LOG_ERROR   5
        // ZF_LOG_FATAL   6
        // ZF_LOG_NONE    0xFF
        int log_level;

        char* hostname;
        char* servname;
};

struct wurl_server {
        char *hostname;
        char *servname;

        int nsocks;
        struct wurl_net_listen_sock *socks;

        pthread_mutex_t mutex;
        bool stopped;

};

void wurl_server_init(struct wurl_server *server, const struct wurl_server_config *config);

void wurl_server_free(struct wurl_server *server);

// listen() creates a listening socket.
// start must be called after listen().
int wurl_server_listen(struct wurl_server *server);

// start() starts the event loop. start() is blocking and does not return
// before stop() is called. start() must be called on the thread on which
// the server's event loop is expected to run. start() is not supposed to be 
// called more than once.
void wurl_server_start(struct wurl_server *server);

// stop() tells the the event loop thread to terminate all connections and
// stop the event loop. stop() might return before the event loop has
// terminated. The server might continue servicing clients for a little while
// after stop() returns.
//
// stop() is thread safe and can be called repeatedly.
// The server will continue listening until the server is freed.
void wurl_server_stop(struct wurl_server *server);
