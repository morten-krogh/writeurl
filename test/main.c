#include <stdio.h>
#include <library.h>

void fn1(struct wut_test *test)
{
        struct wut_assert *as = wut_test_new_assert(test, __FILE__, __LINE__);
        as->pass = false;
        asprintf(&as->reason, "The error reason is ABC");

        as = wut_test_new_assert(test, __FILE__, __LINE__);
        as->pass = false;

}

int main(int argc, char** argv)
{
        struct wut_collect col;
        wut_collect_init(&col);

        char *fun_names[] = {
                "fn1",
        };

        wut_test_fun funs[] = {
                fn1,
        };

        size_t nfuns = sizeof(funs) / sizeof(*funs);

        for (size_t i = 0; i < nfuns; ++i) {
                struct wut_test *test = wut_collect_new_test(&col, fun_names[i]);
                funs[i](test);
                wut_collect_test_done(&col, test);
        }

        wut_collect_done(&col);
}
