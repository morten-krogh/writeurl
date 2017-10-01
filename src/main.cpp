#include <iostream>

#include <writeurl/server.hpp>


int main(int, char**)
{

    writeurl::Server::Config config;

    config.logger = spdlog::stdout_logger_mt("console");
    config.logger->set_level(spdlog::level::level_enum::trace);

    config.address.hostname = "fe80::1c90:df4a:b1dc:8c70%en0";
    config.address.port = "";

    writeurl::Server server {config};

    server.listen();

    server.start();









    return 0;
}
