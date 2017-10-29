#include <stdlib.h>
#include <zf_log/zf_log.h>
#include <wul_test_lib.h>
#include <wul/log.h>

TEST(resolve);
TEST(file_exist);
TEST(file_read);
TEST(file_write);
TEST(file_rmdir_rec);
TEST(log_level);
TEST(log_desc);

struct wul_t_fun funs[] = {
	FUN(resolve),
	FUN(file_exist),
	FUN(file_read),
	FUN(file_write),
	FUN(file_rmdir_rec),
	FUN(log_level),
	FUN(log_desc),
};

int main(int argc, char** argv)
{
	const char* wul_home = getenv("WUL_HOME");
	if (!wul_home) {
		fprintf(stderr, "WUL_HOME must be set in the environment\n");
		return 1;
	}

	const char* log_desc = getenv("WUL_LOG_LEVEL");
	if (!log_desc)
		log_desc = "none";

	int log_level = wul_log_level(log_desc);
	if (log_level == -1) {
		fprintf(stderr, "WUL_LOG_LEVEL = %s is invalid\n", log_desc);
		return 1;
	}

	zf_log_set_output_level(log_level);

	size_t nfun = sizeof(funs) / sizeof(funs[0]);
	size_t nfail = wul_t_fun_run(funs, nfun, wul_home);

	return nfail;
}
