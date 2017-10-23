#include <stdio.h>
#include <library.h>

TEST(simple_1);
TEST(simple_2);
TEST(simple_3);

struct wut_fun funs[] = {
	FUN(simple_1),
	FUN(simple_2),
	FUN(simple_3),
};

int main(int argc, char** argv)
{
	size_t nfun = sizeof(funs) / sizeof(funs[0]);
	size_t nfail = wut_fun_run(funs, nfun);

	return nfail;
}
