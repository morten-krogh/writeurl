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

#include <writeurl/network.hpp>


namespace writeurl {

class Server {
public:
    using Address = network::Address;

    struct Config {

        std::shared_ptr<spdlog::logger> logger;

        Address address;




    };

    Server(const Config& config);

    // listen() creates a listening socket.
    // start must be called after listen().
    void listen();

    // get_address() returns the address at which the server is listening.
    // get_address() must be called after listen().
    const Address& get_address() const;

    // start() starts the event loop. start() is blocking and does not return
    // before stop() is called. start() must be called on the thread on which 
    // the server's event loop runs.
    void start();

    // stop() tells the the event loop thread to terminate all connections and
    // stop the event loop. stop() might return before the event loop has
    // terminated. The server might continue servicing clients for a little while
    // after stop() returns.
    // 
    // stop() is thread safe and can be called repeatedly.
    // start() can be called again after stop().
    // The server will continue listening until the serve object is destroyed.
    void stop();



private:
    std::shared_ptr<spdlog::logger> logger;

    Config m_config;
    Address m_addres;



    



};

} // namespace writeurl

#endif // WRITEURL_SERVER_H
