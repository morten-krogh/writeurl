#include <stdlib.h>
#include <unistd.h>
#include <writeurl/server.h>

static bool sigint_sent = false;

static void signal_handler(__attribute__((unused)) int sig)
{
        sigint_sent = true;
}

static void* start_server(void* arg)
{
        wurl_server_start((struct wurl_server*)arg);
        return NULL;
}

int main(__attribute__((unused)) int argc, __attribute__((unused))  char** argv)
{
        signal(SIGINT, signal_handler);

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

        pthread_t server_thread;
        pthread_create(&server_thread, NULL, start_server, &server);

        while (!sigint_sent)
                sleep(1);

        ZF_LOGI("SIGINT caught. The Writeurl server is shutting down");
        wurl_server_stop(&server);

        void *value_ptr;
        pthread_join(server_thread, &value_ptr);

        wurl_server_free(&server);

        ZF_LOGI("The Writeurl server exits");

        return 0;
}
