#include <unistd.h>
#include <zf_log/zf_log.h>
#include <wul/worker.h>

void wul_worker_init(struct wul_worker *worker, struct wul_server *server)
{
	worker->server = server;
}

void wul_worker_destroy(struct wul_worker *worker)
{
}


void *wul_worker_start(void *arg)
{
	struct wul_worker *worker = (struct wul_worker*)arg;

	ZF_LOGD("Worker started");

	pthread_mutex_lock(&worker->server->mutex);
	while (!worker->server->stopped) {
		pthread_cond_wait(&worker->server->cond,
				  &worker->server->mutex);
		ZF_LOGD("Worker received condition variable signal");
	}
	pthread_mutex_unlock(&worker->server->mutex);
	ZF_LOGD("Worker exits");
	return NULL;
}
