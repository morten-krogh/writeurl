#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <assert.h>
#include <sys/stat.h>
#include <wul_test_lib.h>
#include <wul/file.h>

void wul_t_assert_init(struct wul_t_assert *as, char *file, int line)
{
	as->pass = true;
	as->file = file;
	as->line = line;
	as->reason = NULL;
}

void wul_t_assert_destroy(struct wul_t_assert *as)
{
	free(as->reason);
}

void wul_t_test_init(struct wul_t_test *test, const char *name, const char *assets,
		   const char *tmp_dir)
{
	test->name = name;
	test->assert = NULL;
	test->nassert = 0;
	test->nalloc = 0;
	test->assets = assets;
	test->tmp = wul_resolve(tmp_dir, name);
	wul_rmdir_rec(test->tmp);
	assert(!wul_exist(test->tmp));
	int rc = mkdir(test->tmp, 0740);
	assert(!rc);
}

void wul_t_test_destroy(struct wul_t_test *test)
{
	for (size_t i = 0; i < test->nassert; ++i) {
		struct wul_t_assert *as = test->assert + i;
		wul_t_assert_destroy(as);
	}
	free(test->assert);
	free(test->tmp);
}

void wul_t_test_expand(struct wul_t_test *test)
{
	size_t nalloc = test->nalloc == 0 ? 1 : 2 * test->nalloc;
	test->assert = realloc(test->assert, nalloc * sizeof(*test->assert));
	test->nalloc = nalloc;
}

struct wul_t_assert *wul_t_test_new_assert(struct wul_t_test *test, char *file,
				       int line)
{
	if (test->nassert == test->nalloc)
		wul_t_test_expand(test);
	struct wul_t_assert *as = test->assert + test->nassert;
	wul_t_assert_init(as, file, line);
	++test->nassert;
	return as;
}

void wul_t_collect_init(struct wul_t_collect *col)
{
	printf("\n");
	printf("Start of test run\n");
	col->test = NULL;
	col->ntest = 0;
	col->nalloc = 0;
	col->nfail = 0;
}

void wul_t_collect_destroy(struct wul_t_collect *col)
{
	for (size_t i = 0; i < col->ntest; ++i) {
		struct wul_t_test *test = col->test + i;
		wul_t_test_destroy(test);
	}
	free(col->test);
}

void wul_t_collect_expand(struct wul_t_collect *col)
{
	size_t nalloc = col->nalloc == 0 ? 1 : 2 * col->nalloc;
	col->test = realloc(col->test, nalloc * sizeof(*col->test));
	col->nalloc = nalloc;
}

struct wul_t_test *wul_t_collect_new_test(struct wul_t_collect *col,
				      const char *name, const char *assets,
				      const char *tmp_dir)
{
	printf("Start test: %s\n", name);
	if (col->ntest == col->nalloc)
		wul_t_collect_expand(col);
	struct wul_t_test *test = col->test + col->ntest;
	wul_t_test_init(test, name, assets, tmp_dir);
	++col->ntest;
	return test;
}

static void print_assert_failure(const char *name, struct wul_t_assert *as)
{
	char *fmt = "Failure in test = %s, file = %s, line = %i, %s\n";
	printf(fmt, name, as->file, as->line,
	       as->reason ? as->reason : "false");
}

void wul_t_collect_test_done(struct wul_t_collect *col, struct wul_t_test *test)
{
	size_t fail = 0;
	for (size_t i = 0; i < test->nassert; ++i) {
		struct wul_t_assert *as = test->assert + i;
		if (!as->pass) {
			++fail;
			print_assert_failure(test->name, as);
		}
	}
	if (fail != 0)
		++col->nfail;
}

#define NORMAL "\x1b[0m"
#define RED "\x1B[31m"
#define GREEN "\x1B[32m"

void wul_t_collect_done(struct wul_t_collect *col)
{
	printf("\n");
	printf("End of test run\n");
	printf("Number of tests = %zu\n", col->ntest);
	printf("Number of failed tests = %zu\n", col->nfail);
	if (col->nfail == 0)
		printf("%sSuccess%s\n", GREEN, NORMAL);
	else
		printf("%sFailure%s\n", RED, NORMAL);
}

size_t wul_t_fun_run(struct wul_t_fun *funs, size_t nfun, const char *writeurl_home)
{
	char *test_dir = wul_resolve(writeurl_home, "test");
	char *assets = wul_resolve(test_dir, "assets");
	char *test_tmp = wul_resolve(test_dir, "tmp");
	assert(wul_exist(assets));
	assert(wul_exist(test_tmp));

	char *tmp_dir = wul_resolve(test_tmp, "tmp.XXXXXX");
	mktemp(tmp_dir);
	assert(!wul_exist(tmp_dir));
	mkdir(tmp_dir, 0740);
	assert(wul_exist(tmp_dir));

	struct wul_t_collect col;
	wul_t_collect_init(&col);
	printf("tmp_dir = %s\n\n", tmp_dir);

	for (size_t i = 0; i < nfun; ++i) {
		struct wul_t_fun *fun = funs + i;
		struct wul_t_test *test =
			wul_t_collect_new_test(&col, fun->name, assets, tmp_dir);
		fun->fun(test);
		wul_t_collect_test_done(&col, test);
	}

	size_t nfail = col.nfail;

	wul_t_collect_done(&col);
	wul_t_collect_destroy(&col);

	free(test_dir);
	free(assets);
	wul_rmdir_rec(tmp_dir);
	free(tmp_dir);

	return nfail;
}
