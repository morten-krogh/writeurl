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
#include <wul/server.h>

struct wul_worker {
	pthread_t thread;

	struct wul_server *server;


};

void wul_worker_init(struct wul_worker *worker, struct wul_server *server);

void wul_worker_destroy(struct wul_worker *worker);

void *wul_worker_start(void *arg);
