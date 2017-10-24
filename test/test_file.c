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

