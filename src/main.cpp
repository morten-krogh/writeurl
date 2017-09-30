#include <iostream>

#include <writeurl/server.hpp>


int main(int argc, char** argv)
{

    std::shared_ptr<spdlog::logger> logger = spdlog::stdout_logger_mt("console");
    // std::shared_ptr<spdlog::logger> logger = spdlog::stdout_color_mt("console");

    writeurl::Server::Config config = { *logger };






    writeurl::Server server {config};

    server.start();









    return 0;
}
