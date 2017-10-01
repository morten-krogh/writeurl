#include <iostream>

#include <writeurl/server.hpp>


int main(int, char**)
{

    writeurl::Server::Config config;

    config.logger = spdlog::stdout_logger_mt("console");
    config.logger->set_level(spdlog::level::level_enum::trace);


    writeurl::Server server {config};

    server.start();









    return 0;
}
