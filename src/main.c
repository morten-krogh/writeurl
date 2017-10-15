#include <writeurl/server.h>

int main(__attribute__((unused)) int argc, __attribute__((unused))  char** argv)
{
        struct wurl_server_config config;

        config.log_level = ZF_LOG_VERBOSE;

        config.hostname = "localhost"; 
        //config.hostname = "fe80::1c90:df4a:b1dc:8c70%en0";
        config.servname = "14000";
        config.servname = "";

        struct wurl_server server;
        wurl_server_init(&server, &config);

        int nsocks = wurl_server_listen(&server);
        ZF_LOGI("nsocks = %i", nsocks);

        wurl_server_start(&server);


        return 0;
}
