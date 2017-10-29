#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <zf_log/zf_log.h>
#include <wul/server.h>
#include <wul/log.h>

void wul_server_init(struct wul_server *server, const struct wul_server_config *config)
{
        zf_log_set_output_level(config->log_level);
        ZF_LOGI("The Writeurl server is initialized with log level = %s",
		wul_log_desc(config->log_level));

        server->hostname = strdup(config->hostname);
        server->servname = strdup(config->servname);

        pthread_mutex_init(&server->mutex, NULL);
        server->stopped = false;

        ZF_LOGD("The Writeurl server is initialized with nworker = %ju", config->nworker);
	server->nworker = config->nworker;
	server->worker = malloc(config->nworker * sizeof(*server->worker));
	for (size_t i = 0; i < server->nworker; ++i)
		wul_worker_init(server->worker + i, i, server);
}

void wul_server_destroy(struct wul_server *server)
{
        ZF_LOGI("The Writeurl server stops listening and is freed");

	for (size_t i = 0; i < server->nworker; ++i)
		wul_worker_destroy(server->worker + i);

        for (int i = 0; i < server->nsocks; ++i) {
                int fd = server->socks[i].fd;
                ZF_LOGD("Closing listening socket, fd = %i", fd);
                close(fd);
        }
        free(server->hostname);
        free(server->servname);

        pthread_mutex_destroy(&server->mutex);
}

int wul_server_listen(struct wul_server *server)
{
        server->nsocks = wul_net_listen(server->hostname, server->servname, &server->socks);
        ZF_LOGI("The Writeurl server listens on %i sockets", server->nsocks);

        return server->nsocks;
}

static void wul_server_start_workers(struct wul_server *server)
{
	ZF_LOGI("The server starts the %ju workers", server->nworker);
	for (size_t i = 0; i < server->nworker; ++i) {
		struct wul_worker *worker = server->worker + i;
		pthread_create(&worker->thread, NULL, wul_worker_start, worker);
	}
}

static void wul_server_finish(struct wul_server *server)
{
	ZF_LOGI("The server joins the %ju workers", server->nworker);
	for (size_t i = 0; i < server->nworker; ++i) {
		struct wul_worker *worker = server->worker + i;
		pthread_join(worker->thread, NULL);
	}
}

void wul_server_start(struct wul_server *server)
{
	wul_server_start_workers(server);

        ZF_LOGI("The server starts the event loop");

        while (true) {
                ZF_LOGD("Iteration of the event loop");
                bool stopped = false;
                pthread_mutex_lock(&server->mutex);
                stopped = server->stopped;
                pthread_mutex_unlock(&server->mutex);
                if (stopped) {
			wul_server_finish(server);
                        ZF_LOGI("The event loop is terminating");
                        return;
                }
                sleep(1);
        }
}

void wul_server_stop(struct wul_server *server)
{
        ZF_LOGI("The Writeurl server stops the event loop");
        sleep(1);
        pthread_mutex_lock(&server->mutex);
        server->stopped = true;
        pthread_mutex_unlock(&server->mutex);
}
