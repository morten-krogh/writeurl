#include <stdlib.h>
#include <unistd.h>
#include <sys/stat.h>
#include <wul_test_lib.h>
#include <wul/file.h>

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

TEST(file_exist)
{
	char *path = wul_resolve(test->assets, "non-existing");
	ASSERT(!wul_exist(path));
	free(path);

	path = wul_resolve(test->assets, "file1.txt");
	ASSERT(wul_exist(path));
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
	free(content);
	free(path);
}

TEST(file_write)
{
	char *path = wul_resolve(test->tmp, "file");
	ASSERT(!wul_exist(path));

	char buf[] = "abcdef\nghi\tjkl\n";
	size_t size = sizeof(buf) - 1;
	buf[1] = 0;
	buf[2] = 0xff;
	int rc = wul_write(path, buf, size);
	ASSERT_EQ(rc, 0);

	ASSERT(wul_exist(path));

	char *content;
	rc = wul_read(path, &content);
	ASSERT_EQ(rc, size);
	ASSERT_MEM_EQ(content, buf, size);

	rc = unlink(path);
	ASSERT_EQ(rc, 0);
	ASSERT(!wul_exist(path));

	free(content);
	free(path);
}

TEST(file_rmdir_rec)
{
	char *root = wul_resolve(test->tmp, "root");
	char *dir_1 = wul_resolve(root, "dir_1");
	char *dir_2 = wul_resolve(root, "dir_2");
	char *dir_1_1 = wul_resolve(dir_1, "dir_1_1");
	char *dir_1_1_1 = wul_resolve(dir_1_1, "dir_1_1_1");
	char *path_1 = wul_resolve(root, "file_1");
	char *path_2 = wul_resolve(dir_1, "file_2");
	char *path_3 = wul_resolve(dir_1, "file_3");
	char *path_4 = wul_resolve(dir_2, "file_4");
	char *path_5 = wul_resolve(dir_1_1, "file_5");
	char *path_6 = wul_resolve(dir_1_1_1, "file_6");

	ASSERT(!wul_exist(root));
	mkdir(root, 0740);
	ASSERT(wul_exist(root));
	ASSERT(!wul_exist(dir_1));
	mkdir(dir_1, 0740);
	ASSERT(wul_exist(dir_1));
	ASSERT(!wul_exist(dir_2));
	mkdir(dir_2, 0740);
	ASSERT(wul_exist(dir_2));
	ASSERT(!wul_exist(dir_1_1));
	mkdir(dir_1_1, 0740);
	ASSERT(wul_exist(dir_1_1));
	ASSERT(!wul_exist(dir_1_1_1));
	mkdir(dir_1_1_1, 0740);
	ASSERT(wul_exist(dir_1_1_1));

	char *str = "abc";

	ASSERT(!wul_exist(path_1));
	wul_write(path_1, str, 3);
	ASSERT(wul_exist(path_1));
	ASSERT(!wul_exist(path_2));
	wul_write(path_2, str, 3);
	ASSERT(wul_exist(path_2));
	ASSERT(!wul_exist(path_3));
	wul_write(path_3, str, 3);
	ASSERT(wul_exist(path_3));
	ASSERT(!wul_exist(path_4));
	wul_write(path_4, str, 3);
	ASSERT(wul_exist(path_4));
	ASSERT(!wul_exist(path_5));
	wul_write(path_5, str, 3);
	ASSERT(wul_exist(path_5));
	ASSERT(!wul_exist(path_6));
	wul_write(path_6, str, 0);
	ASSERT(wul_exist(path_6));

	int rc = wul_rmdir_rec(root);
	ASSERT_EQ(rc, 0);

	ASSERT(!wul_exist(root));
	ASSERT(!wul_exist(dir_1));
	ASSERT(!wul_exist(dir_2));
	ASSERT(!wul_exist(dir_1_1));
	ASSERT(!wul_exist(dir_1_1_1));
	ASSERT(!wul_exist(path_1));
	ASSERT(!wul_exist(path_2));
	ASSERT(!wul_exist(path_3));
	ASSERT(!wul_exist(path_4));
	ASSERT(!wul_exist(path_5));
	ASSERT(!wul_exist(path_6));
}
