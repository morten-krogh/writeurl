#include <unistd.h>
#include <zf_log/zf_log.h>
#include <wul/worker.h>

void wul_worker_init(struct wul_worker *worker, size_t id,
		     struct wul_server *server)
{
	worker->id = id;
	worker->server = server;
}

void wul_worker_destroy(struct wul_worker *worker)
{
}


void *wul_worker_start(void *arg)
{
	struct wul_worker *worker = (struct wul_worker*)arg;

	ZF_LOGD("Worker started, id = %ju", worker->id);

	while (true) {
		sleep(5);
		ZF_LOGD("Worker interation, id = %ju", worker->id);
	}
}

