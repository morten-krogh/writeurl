#include <stdlib.h>
#include <library.h>
#include <stdio.h>

void wut_result_init(struct wut_result *res)
{
        res->name = NULL;
        res->assert = NULL;
        res->nassert = 0;
        res->nalloc = 0;
}

void wut_result_free(struct wut_result *res)
{
        free(res->assert);
}

void wut_add_assert(struct wut_result *res,
                        struct wut_assert *as)
{
        if (res->nassert == res->nalloc) {
                res->nalloc = res->nalloc == 0 ? 1 : 2 * res->nalloc;
                res->assert = realloc(res->assert,
                                      res->nalloc * sizeof(*res->assert));
        }
        res->assert[res->nassert] = *as;
        ++res->nassert;
}

void wut_collect_init(struct wut_collect *col)
{
        printf("Start of test run\n");
        col->ntest = 0;
        col->nfail = 0;

        
}

void wut_collect_test_start(struct wut_collect *col, struct wut_result *res)
{
        printf("Start test: %s\n", res->name);
}

static void print_assert_failure(char *name, struct wut_assert *as)
{
        printf("Failure in test = %s, file = %s, line = %i\n",
               name, as->file, as->line);
}

void wut_collect_test_end(struct wut_collect *col, struct wut_result *res)
{
        ++col->ntest;
        size_t fail = 0;
        for (size_t i = 0; i < res->nassert; ++i) {
                if (!res->assert[i].success) {
                        ++fail;
                        print_assert_failure(res->name, res->assert + i);
                }
        }
        if (fail != 0)
                ++col->nfail;
}

void wut_collect_end(struct wut_collect *col)
{
        printf("End of test run\n");
        printf("Number of tests = %zu\n", col->ntest);
        printf("Number of failed tests = %zu\n", col->nfail);
}

void wut_add_assert_equal(struct wut_result *res, char *file,
                          int line, int a, int b)
{
        


}
