/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#pragma once

#include <zf_log/zf_log.h>

//#include <string>
//#include <writeurl/network.hpp>

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


        //        network::address address;

};

struct wurl_server {

        int dummy;
};

int wurl_server_init(struct wurl_server *server, const struct wurl_server_config *config);

// listen() creates a listening socket.
// start must be called after listen().
int wurl_server_listen(struct wurl_server *server);



//class Server {
//public:
//
//    struct Config {
//        std::shared_ptr<spdlog::logger> logger;
//        network::address address;
//    };
//
//    Server(const Config& config);
//
//    // listen() creates a listening socket.
//    // start must be called after listen().
//    void listen();
//
//    // get_addresses() returns the addresses at which the server is listening.
//    // get_addresses() must be called after listen().
//    std::vector<network::address> get_addresses() const;
//
//    // start() starts the event loop. start() is blocking and does not return
//    // before stop() is called. start() must be called on the thread on which
//    // the server's event loop runs.
//    void start();
//
//    // stop() tells the the event loop thread to terminate all connections and
//    // stop the event loop. stop() might return before the event loop has
//    // terminated. The server might continue servicing clients for a little while
//    // after stop() returns.
//    //
//    // stop() is thread safe and can be called repeatedly.
//    // start() can be called again after stop().
//    // The server will continue listening until the serve object is destroyed.
//    void stop();
//
//
//
//private:
//    std::shared_ptr<spdlog::logger> logger;
//
//    Config m_config;
//    std::vector<network::listen_socket> m_listen_sockets;
//};
