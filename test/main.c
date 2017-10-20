#include <stdio.h>
#include <library.h>

void fn1(struct wut_collect *col, struct wut_result *res)
{
        struct wut_assert as1;
        as1.success = true;
        as1.file = __FILE__;
        as1.line = __LINE__;
        wut_add_assert(res, &as1);
}

void fn2(struct wut_collect *col, struct wut_result *res)
{
        struct wut_assert as1;
        as1.success = true;
        as1.file = __FILE__;
        as1.line = __LINE__;
        wut_add_assert(res, &as1);

        struct wut_assert as2;
        as2.success = false;
        as2.file = __FILE__;
        as2.line = __LINE__;
        wut_add_assert(res, &as2);
}

int main(int argc, char** argv)
{
        struct wut_collect col;
        wut_collect_init(&col);

        char *fun_names[] = {
                "fn1",
                "fn2"
        };

        wut_test_fun funs[] = {
                fn1,
                fn2
        };

        size_t nfuns = sizeof(funs) / sizeof(*funs);

        for (size_t i = 0; i < nfuns; ++i) {
                struct wut_result res;
                wut_result_init(&res);
                res.name = fun_names[i];
                wut_collect_test_start(&col, &res);
                funs[i](&col, &res);
                wut_collect_test_end(&col, &res);
        }

        wut_collect_end(&col);
}
