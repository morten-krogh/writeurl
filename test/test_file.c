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
	char *path = wul_resolve(test->assets, "non-existing");
	ASSERT(!wul_exists(path));
	free(path);

	path = wul_resolve(test->assets, "file1.txt");
	ASSERT(wul_exists(path));
	free(path);
}

TEST(file_read)
{
	char *path = wul_resolve(test->assets, "file1.txt");
	char *content;
	int rc = wul_read(path, &content);
	ASSERT_EQ(rc, 3);
	ASSERT_MEM_EQ(content, "abc", 3);
	free(content);
	free(path);
	
	path = wul_resolve(test->assets, "non-existing");
	rc = wul_read(path, &content);
	ASSERT_EQ(rc, -1);
	free(path);

	path = wul_resolve(test->assets, "empty");
	rc = wul_read(path, &content);
	ASSERT_EQ(rc, 0);
	//free(content);
	free(path);
}

TEST(file_write)
{
	char *path = wul_resolve(test->tmp, "file");
	ASSERT(!wul_exists(path));

	char buf[] = "abcdef\nghijkl\n";
	size_t size = sizeof(buf) - 1;
	int rc = wul_write(path, buf, size);
	ASSERT_EQ(rc, 0);

	ASSERT(wul_exists(path));

	char *content;
	rc = wul_read(path, &content);
	ASSERT_EQ(rc, size);
	ASSERT_MEM_EQ(content, "sajkasddakjdkhadskjasdjksabuf", size);

	free(content);
	free(path);
}
