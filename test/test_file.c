#include <stdlib.h>
#include <writeurl/file.h>
#include <wut_library.h>

TEST(resolve)
{
	char *path = wul_resolve("/dir", "name");
	ASSERT_STR_EQ(path, "/dir/name");
	free(path);

	path = wul_resolve("", "name");
	ASSERT_STR_EQ(path, "/name");
	free(path);

	path = wul_resolve("/dir/subdir", "name");
	ASSERT_STR_EQ(path, "/dir/subdir/name");
	free(path);
}

TEST(file_exists)
{
	char *path = wul_resolve(test->assets, "non-ecisting");
	ASSERT(!wul_exists(path));
	free(path);

	path = wul_resolve(test->assets, "file1.txt");
	ASSERT(wul_exists(path));
	free(path);
}
