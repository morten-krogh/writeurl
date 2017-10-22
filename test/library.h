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
#include <stdint.h>

struct wut_assert {
        bool pass;
        char *file;
        int line;
        char *reason;
};

void wut_assert_init(struct wut_assert *as, char *file, int line);
void wut_assert_destroy(struct wut_assert *as);

struct wut_test {
        char *name;
        struct wut_assert *assert;
        size_t nassert;
        size_t nalloc;
};

void wut_test_init(struct wut_test *test, char *name);
void wut_test_destroy(struct wut_test *test);
void wut_test_expand(struct wut_test *test);
struct wut_assert *wut_test_new_assert(struct wut_test *test, char *file,
                                       int line);

struct wut_collect {
        struct wut_test *test;
        size_t ntest;
        size_t nalloc;
        size_t nfail;
};

void wut_collect_init(struct wut_collect *col);
void wut_collect_destroy(struct wut_collect *col);
void wut_collect_expand(struct wut_collect *col);
struct wut_test *wut_collect_new_test(struct wut_collect *col, char *name);
void wut_collect_test_done(struct wut_collect *col, struct wut_test *test);
void wut_collect_done(struct wut_collect *col);

typedef void(*wut_test_fun)(struct wut_test *test);

#define ASSERT(cond) do { \
        struct wut_assert *as = wut_test_new_assert(test, __FILE__, __LINE__); \
        if (!(cond)) \
                as->pass = false; \
        } while (false);

#define ASSERT_EQ(lhs, rhs) do { \
        intmax_t i1 = lhs; \
        intmax_t i2 = rhs; \
        struct wut_assert *as = wut_test_new_assert(test, __FILE__, __LINE__); \
        if (i1 != i2) \
                as->pass = false; \
                char *fmt = "actual = %jd, expected = %jd"; \
                asprintf(&as->reason, fmt, i1, i2); \
        } while (false);


//void wut_assert(struct wut_collect *col, char *file, int line, int a, int b);
//void wut_add_assert_equal(struct wut_collect *col, char *file,
//                          int line, int a, int b);


