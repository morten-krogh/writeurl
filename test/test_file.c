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
	free(path);

    //std::string non_existing_file = file::resolve(context.get_assets_dir(), "non-existing");
    //buf.resize(0);
    //ec = file::read(non_existing_file, buf);
    //CHECK(ec);
    //CHECK(ec.value() == 1);
    //CHECK(ec.message() == "File does not exist");

    //std::string empty_file = file::resolve(context.get_assets_dir(), "empty");
    //buf.resize(0);
    //ec = file::read(empty_file, buf);
    //CHECK(!ec);
    //CHECK(buf.size() == 0);
    //CHECK(buf.to_string() == "");
}
