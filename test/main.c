#include <stdlib.h>
#include <zf_log/zf_log.h>
#include <wut_library.h>

TEST(resolve);
TEST(file_exists);
TEST(file_read);
TEST(file_write);
TEST(simple_1);
TEST(simple_2);
TEST(simple_3);


struct wut_fun funs[] = {
	FUN(resolve),
	FUN(file_exists),
	FUN(file_read),
	FUN(file_write),
	FUN(simple_1),
	FUN(simple_2),
	FUN(simple_3),
};

int main(int argc, char** argv)
{
	const char* writeurl_home = getenv("WRITEURL_HOME");
	if (!writeurl_home) {
		fprintf(stderr, "WRITEURL_HOME must be set in the environment\n");
		return 1;
	}

	zf_log_set_output_level(0); // none
	// zf_log_set_output_level(0xFF); // none

	size_t nfun = sizeof(funs) / sizeof(funs[0]);
	size_t nfail = wut_fun_run(funs, nfun, writeurl_home);

	return nfail;
}
