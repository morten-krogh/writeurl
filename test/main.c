#include <stdio.h>
#include <library.h>

void fn1(struct wut_test *test)
{
        ASSERT(true);
    //    ASSERT(false);
  //      ASSERT_EQ(12, 14);
        ASSERT_EQ(12, 12);
}

void fn2(struct wut_test *test)
{
        int a = 5;
        int b = 7;
        int c = 20 * 8;
        ASSERT_EQ(a + b, c);
}

void fn3(struct wut_test *test)
{
        ASSERT_EQ(3 * 8, 24);
}

int main(int argc, char** argv)
{
        struct wut_collect col;
        wut_collect_init(&col);

        char *fun_names[] = {
                "fn1",
                "fn2",
        };

        wut_test_fun funs[] = {
                fn1,
                fn2,
        };

        size_t nfuns = sizeof(funs) / sizeof(*funs);

        for (size_t i = 0; i < nfuns; ++i) {
                struct wut_test *test = wut_collect_new_test(&col, fun_names[i]);
                funs[i](test);
                wut_collect_test_done(&col, test);
        }

        wut_collect_done(&col);
        wut_collect_destroy(&col);
}
