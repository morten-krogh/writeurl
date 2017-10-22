#include <stdio.h>
#include <library.h>

TEST(simple_1);
TEST(simple_2);
TEST(simple_3);

int main(int argc, char** argv)
{
        struct wut_funs funs;
        wut_funs_init(&funs);

        REGISTER(simple_1);
        REGISTER(simple_2);
        REGISTER(simple_3);

        wut_funs_run(&funs);

        wut_funs_destroy(&funs);
}
