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
#include <wul/worker.h>

struct wul_server_config {

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

	// Number of worker threads. A fixed set of workers run during the
	// life time of the server. The workers process requests and update
	// the documents.
	size_t nworker;
};

struct wul_server {
        char *hostname;
        char *servname;

        int nsocks;
        struct wul_net_listen_sock *socks;

        pthread_mutex_t mutex;
        bool stopped;

	size_t nworker;
	struct wul_worker *worker;
};

void wul_server_init(struct wul_server *server, const struct wul_server_config *config);

void wul_server_destroy(struct wul_server *server);

// listen() creates a listening socket.
// start must be called after listen().
int wul_server_listen(struct wul_server *server);

// start() starts the event loop. start() is blocking and does not return
// before stop() is called. start() must be called on the thread on which
// the server's event loop is expected to run. start() is not supposed to be 
// called more than once.
void wul_server_start(struct wul_server *server);

// stop() tells the the event loop thread to terminate all connections and
// stop the event loop. stop() might return before the event loop has
// terminated. The server might continue servicing clients for a little while
// after stop() returns.
//
// stop() is thread safe and can be called repeatedly.
// The server will continue listening until the server is freed.
void wul_server_stop(struct wul_server *server);
