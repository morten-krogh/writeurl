#include <stdlib.h>
#include <zf_log/zf_log.h>
#include <wut_library.h>

TEST(resolve);
TEST(file_exist);
TEST(file_read);
TEST(file_write);
TEST(file_rmdir_rec);

struct wut_fun funs[] = {
	FUN(resolve),
	FUN(file_exist),
	FUN(file_read),
	FUN(file_write),
	FUN(file_rmdir_rec),
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
