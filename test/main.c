#include <stdio.h>
#include <library.h>

void fn1(struct wut_collect *col)
{
        struct wut_result res;
        wut_result_init(&res);
        res.name = "fn1";

        wut_collect_test_start(col, &res);

        struct wut_assert as1;
        as1.success = true;
        as1.file = __FILE__;
        as1.line = __LINE__;
        wut_add_assert(&res, &as1);

        wut_collect_test_end(col, &res);
}

void fn2(struct wut_collect *col)
{
        struct wut_result res;
        wut_result_init(&res);
        res.name = "fn2";

        wut_collect_test_start(col, &res);

        struct wut_assert as1;
        as1.success = true;
        as1.file = __FILE__;
        as1.line = __LINE__;
        wut_add_assert(&res, &as1);

        struct wut_assert as2;
        as2.success = false;
        as2.file = __FILE__;
        as2.line = __LINE__;
        wut_add_assert(&res, &as2);

        wut_collect_test_end(col, &res);
}

int main(int argc, char** argv)
{
        struct wut_collect col;
        wut_collect_init(&col);

        fn1(&col);
        fn2(&col);

        wut_collect_end(&col);
}
