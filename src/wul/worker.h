/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#pragma once

#include <stdbool.h>
#include <pthread.h>

struct wul_worker {
	size_t id;
	pthread_t thread;

	struct wul_server *server;


};

void wul_worker_init(struct wul_worker *worker, size_t id,
		     struct wul_server *server);

void wul_worker_destroy(struct wul_worker *worker);

void *wul_worker_start(void *arg);
