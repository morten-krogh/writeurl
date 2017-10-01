#include <thread>
#include <chrono>

#include <writeurl/server.hpp>

#include <spdlog/sinks/null_sink.h>


using namespace writeurl;


Server::Server(const Config& config):
    m_config {config}
{
    if (config.logger) {
        logger = config.logger;
    }
    else {
        auto null_sink = std::make_shared<spdlog::sinks::null_sink_st>();
        logger = std::make_shared<spdlog::logger>("null_logger", null_sink);
    }

    logger->info("Writeurl server created with log level {}",
                spdlog::level::level_names[logger->level()]);

}

void Server::start()
{
    logger->info("Writeurl server started");

    for (int i = 0; i < 1000; ++i) {
        logger->debug("Debug test {}", i);
        std::this_thread::sleep_for(std::chrono::seconds {1});
    }

}
