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
#include <stdio.h>
#include <string.h>

#include <assert.h>

struct wul_t_assert {
	bool pass;
	char *file;
	int line;
	char *reason;
};

void wul_t_assert_init(struct wul_t_assert *as, char *file, int line);
void wul_t_assert_destroy(struct wul_t_assert *as);

struct wul_t_test {
	const char *name;
	struct wul_t_assert *assert;
	size_t nassert;
	size_t nalloc;
	const char *assets;
	char *tmp;
};

void wul_t_test_init(struct wul_t_test *test, const char *name, const char *assets,
		   const char* tmp_dir);
void wul_t_test_destroy(struct wul_t_test *test);
void wul_t_test_expand(struct wul_t_test *test);
struct wul_t_assert *wul_t_test_new_assert(struct wul_t_test *test, char *file,
                                       int line);

struct wul_t_collect {
	struct wul_t_test *test;
	size_t ntest;
	size_t nalloc;
	size_t nfail;
};

void wul_t_collect_init(struct wul_t_collect *col);
void wul_t_collect_destroy(struct wul_t_collect *col);
void wul_t_collect_expand(struct wul_t_collect *col);
struct wul_t_test *wul_t_collect_new_test(struct wul_t_collect *col,
				      const char *name, const char *assets,
				      const char *tmp_dir);
void wul_t_collect_test_done(struct wul_t_collect *col, struct wul_t_test *test);
void wul_t_collect_done(struct wul_t_collect *col);

struct wul_t_fun {
	char *name;
	void (*fun)(struct wul_t_test *test);
};

size_t wul_t_fun_run(struct wul_t_fun *funs, size_t nfun, const char *writeurl_home);

typedef void(*wul_t_test_fun)(struct wul_t_test *test);

#define TEST(name) void test_##name(struct wul_t_test *test)

#define FUN(name) {#name, test_##name}

#define ASSERT(cond) do { \
	struct wul_t_assert *as = wul_t_test_new_assert(test, __FILE__, __LINE__); \
	if (!(cond)) \
		as->pass = false; \
	} while (false);

#define ASSERT_EQ(lhs, rhs) do { \
	intmax_t i1 = lhs; \
	intmax_t i2 = rhs; \
	struct wul_t_assert *as = wul_t_test_new_assert(test, __FILE__, __LINE__); \
	if (i1 != i2) \
		as->pass = false; \
		char *fmt = "actual = %jd, expected = %jd"; \
		asprintf(&as->reason, fmt, i1, i2); \
	} while (false);

#define ASSERT_STR_EQ(lhs, rhs) do { \
	int cmp = strcmp(lhs, rhs); \
	struct wul_t_assert *as = wul_t_test_new_assert(test, __FILE__, __LINE__); \
	if (cmp) \
		as->pass = false; \
		char *fmt = "actual = %s, expected = %s"; \
		asprintf(&as->reason, fmt, lhs, rhs); \
	} while (false);

#define ASSERT_MEM_EQ(lhs, rhs, n) do { \
	int cmp = memcmp(lhs, rhs, n); \
	struct wul_t_assert *as = wul_t_test_new_assert(test, __FILE__, __LINE__); \
	if (cmp) \
		as->pass = false; \
		as->reason = malloc(8 + 3 * n + 12 + 3 * n + 1); \
		sprintf(as->reason, "actual ="); \
		for (size_t i = 0; i < n; ++i) \
			sprintf(as->reason + 8 + 3 * i, " %02x", (unsigned char)lhs[i]); \
		sprintf(as->reason + 8 + 3 * n, ", expected ="); \
		for (size_t i = 0; i < n; ++i) \
			sprintf(as->reason + 8 + 3 * n + 12 + 3 * i, " %02x", (unsigned char)rhs[i]); \
	} while (false);
