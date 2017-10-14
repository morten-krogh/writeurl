#include <writeurl/server.h>

int main(__attribute__((unused)) int argc, __attribute__((unused))  char** argv)
{
        struct wurl_server_config config;

        config.log_level = ZF_LOG_VERBOSE;

        struct wurl_server server;

        int rc;

        rc = wurl_server_init(&server, &config);

        rc = wurl_server_listen(&server);

//    writeurl::Server::Config config;
//
//    config.logger = spdlog::stdout_logger_mt("console");
//    config.logger->set_level(spdlog::level::level_enum::trace);
//
//    config.address.hostname = "localhost";
//    //config.address.hostname = "fe80::1c90:df4a:b1dc:8c70%en0";
//    config.address.port = "";
//
//    writeurl::Server server {config};
//
//    server.listen();
//
//    server.start();
//
//







    return 0;
}
