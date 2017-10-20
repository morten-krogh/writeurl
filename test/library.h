/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#pragma once

#include <stddef.h>
#include <stdbool.h>

struct wut_context {
        int dummy;

};

struct wut_assert {
        bool success;
        char *file;
        int line;
};

struct wut_result {
        char *name;
        struct wut_assert* assert;
        size_t nassert;
        size_t nalloc;
};

void wut_result_init(struct wut_result *res);
void wut_result_free(struct wut_result *res);
void wut_add_assert(struct wut_result *res, struct wut_assert *as);


struct wut_collect {
        size_t ntest;
        size_t nfail;
};

void wut_collect_init(struct wut_collect *col);
void wut_collect_test_start(struct wut_collect *col, struct wut_result *res);
void wut_collect_test_end(struct wut_collect *col, struct wut_result *res);
void wut_collect_end(struct wut_collect *col);

typedef void(*wut_test_fun)(struct wut_collect *col, struct wut_result *res);

void wut_add_assert_equal(struct wut_collect *col, char *file,
                          int line, int a, int b);


