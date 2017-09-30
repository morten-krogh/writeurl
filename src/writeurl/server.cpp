#include <thread>
#include <chrono>

#include <writeurl/server.hpp>


using namespace writeurl;

Server::Server(const Config& config):
    logger {config.logger}

{
    logger.info("Writeurl server created with log level {}", "DEBUG");
}

void Server::start()
{
    logger.info("Writeurl server started");
    
    for (int i = 0; i < 1000; ++i) {
        logger.debug("Debug test {}", i);
        std::this_thread::sleep_for(std::chrono::seconds {1});
    }

}
