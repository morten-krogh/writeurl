#include <stdlib.h>
#include <unistd.h>
#include <wul/server.h>

static volatile bool sigint_sent = false;

static void signal_handler(__attribute__((unused)) int sig)
{
        sigint_sent = true;
}

static void* start_server(void* arg)
{
        wul_server_start((struct wul_server*)arg);
        return NULL;
}

int main(__attribute__((unused)) int argc, __attribute__((unused))  char** argv)
{
        signal(SIGINT, signal_handler);

        struct wul_server_config config;

        config.log_level = ZF_LOG_VERBOSE;

        config.hostname = "localhost"; 
        //config.hostname = "fe80::1c90:df4a:b1dc:8c70%en0";
        config.servname = "14000";
        config.servname = "";

	config.nworker = 2;

        struct wul_server server;
        wul_server_init(&server, &config);

        int nsocks = wul_server_listen(&server);
        ZF_LOGI("nsocks = %i", nsocks);

        pthread_t server_thread;
        pthread_create(&server_thread, NULL, start_server, &server);

        while (!sigint_sent)
                sleep(1);

        ZF_LOGI("SIGINT caught. The Writeurl server is shutting down");
        wul_server_stop(&server);

        void *value_ptr;
        pthread_join(server_thread, &value_ptr);

        wul_server_destroy(&server);

        ZF_LOGI("The Writeurl server exits");

        return 0;
}
