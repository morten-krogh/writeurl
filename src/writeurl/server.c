#include <zf_log/zf_log.h>

//#include <thread>
//#include <chrono>
//
#include <writeurl/server.h>

int wurl_server_init(struct wurl_server *server, const struct wurl_server_config *config)
{
        zf_log_set_output_level(config->log_level);
        ZF_LOGI("The Writeurl server is initialized with log level = %i", config->log_level);

        server->dummy = 987;

        return 0;
}


int wurl_server_listen(struct wurl_server *server)
{
        server->dummy++;

        return 0;
}


//
//#include <spdlog/sinks/null_sink.h>
//
//
//using namespace writeurl;
//
//
//Server::Server(const Config& config):
//    m_config {config}
//{
//    if (config.logger) {
//        logger = config.logger;
//    }
//    else {
//        auto null_sink = std::make_shared<spdlog::sinks::null_sink_st>();
//        logger = std::make_shared<spdlog::logger>("null_logger", null_sink);
//    }
//
//    logger->info("Writeurl server created with log level {}",
//                spdlog::level::level_names[logger->level()]);
//
//}
//
//void Server::listen()
//{
//    m_listen_sockets = network::listen(m_config.address, logger.get());
//
//    if (m_listen_sockets.empty()) {
//        logger->error("Listen failed. The server is not listening on any sockets");
//    }
//    else {
//        logger->info("Listen succeeded. The server is listening on {} sockets",
//                     m_listen_sockets.size());
//        for (size_t i = 0; i < m_listen_sockets.size(); ++i)
//            logger->info("Listening socket, descriptor = {}, hostname = {}, port = {}",
//                         m_listen_sockets[i].descriptor,
//                         m_listen_sockets[i].address.hostname,
//                         m_listen_sockets[i].address.port);
//    }
//}
//
//std::vector<network::address> Server::get_addresses() const
//{
//    std::vector<network::address> addresses;
//    for (size_t i = 0; i < m_listen_sockets.size(); ++i)
//        addresses.push_back(m_listen_sockets[i].address);
//
//    return addresses;
//}
//
//void Server::start()
//{
//    logger->info("Writeurl server started");
//
//    for (int i = 0; i < 1000; ++i) {
//        logger->debug("Debug test {}", i);
//        std::this_thread::sleep_for(std::chrono::seconds {100});
//    }
//
//}
//
//void stop()
//{
//
//}
