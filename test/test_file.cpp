#include <catch/catch.hpp>
#include <context.hpp>

#include <writeurl/file.hpp>
#include <writeurl/error.hpp>

using namespace writeurl;

TEST_CASE("resolve_components", "[file]")
{
    CHECK(file::resolve(std::vector<std::string> {"abc"}) == "abc");
    CHECK(file::resolve(std::vector<std::string> {"abc", "def"}) == "abc/def");
    CHECK(file::resolve(std::vector<std::string> {"abc", "def", "ghi"}) == "abc/def/ghi");
}

TEST_CASE("resolve prefix and name", "[file]")
{
    CHECK(file::resolve("prefix", "name") == "prefix/name");
}

TEST_CASE("exists", "[file]")
{
    std::string non_existing_file = file::resolve(context.get_assets_dir(), "non-existing");
    CHECK(!file::exists(non_existing_file));

    std::string existing_file = file::resolve(context.get_assets_dir(), "file1.txt");
    CHECK(file::exists(existing_file));
}

TEST_CASE("mkdir_and_rmdir", "[file]")
{
    std::string root = context.get_tmp_dir();
    CHECK(file::exists(root));

    std::string dir = file::resolve(root, "dir");
    file::mkdir(dir);
    CHECK(file::exists(dir));

    std::error_code ec = file::rmdir(dir);
    CHECK(!ec);
    CHECK(!file::exists(dir));

    std::string dir_1 = file::resolve(root, "dir_1");
    file::mkdir(dir_1);
    std::string dir_2 = file::resolve(root, "dir_2");
    file::mkdir(dir_2);
    std::string dir_1_1 = file::resolve(dir_1, "dir_1_1");
    file::mkdir(dir_1_1);
    std::string dir_1_1_1 = file::resolve(dir_1_1, "dir_1_1_1");
    file::mkdir(dir_1_1_1);

    const std::string str = "abc";
    std::string path = file::resolve(root, "path");
    file::write(path, str.data(), str.size());
    std::string path_1 = file::resolve(dir_1, "path_1");
    file::write(path_1, str.data(), str.size());
    std::string path_2 = file::resolve(dir_1, "path_2");
    file::write(path_2, str.data(), str.size());
    std::string path_1_1 = file::resolve(dir_1_1, "path_1_1");
    file::write(path_1_1, str.data(), str.size());
    std::string path_1_2 = file::resolve(dir_1_1, "path_1_2");
    file::write(path_1_2, str.data(), str.size());

    CHECK(file::exists(dir_1_1_1));
    CHECK(file::exists(dir_2));
    CHECK(file::exists(path_1_2));

    ec = file::rmdir_recursive(root);
    CHECK(!ec);
    CHECK(!file::exists(dir_1_1_1));
    CHECK(!file::exists(root));
}

TEST_CASE("read", "[file]")
{
    std::string file_1 = file::resolve(context.get_assets_dir(), "file1.txt");

    buffer::Buffer buf;
    std::error_code ec = file::read(file_1, buf);
    CHECK(!ec);
    CHECK(buf.size() == 3);
    CHECK(buf.to_string() == "abc");

    std::string non_existing_file = file::resolve(context.get_assets_dir(), "non-existing");
    buf.resize(0);
    ec = file::read(non_existing_file, buf);
    CHECK(ec);
    CHECK(ec.value() == 1);
    CHECK(ec.message() == "File does not exist");

    std::string empty_file = file::resolve(context.get_assets_dir(), "empty");
    buf.resize(0);
    ec = file::read(empty_file, buf);
    CHECK(!ec);
    CHECK(buf.size() == 0);
    CHECK(buf.to_string() == "");
}

TEST_CASE("write_read_unlink", "[file]")
{
    std::string path = file::resolve(context.get_assets_dir(), "dummy.txt");

    file::unlink(path);
    CHECK(!file::exists(path));

    const std::string str = "abc";
    std::error_code ec = file::write(path, str.data(), str.size());
    CHECK(!ec);
    CHECK(file::exists(path));

    buffer::Buffer buf;
    ec = file::read(path, buf);
    CHECK(!ec);
    CHECK(buf.size() == str.size());
    CHECK(buf.to_string() == str);

    file::unlink(path);
    CHECK(!file::exists(path));

    ec = file::unlink(path);
    CHECK(Error(ec.value()) == Error::file_no_exist);
}

TEST_CASE("directory_depth", "[file]")
{
    std::string dir = file::resolve(context.get_tmp_dir(), "dir");
    CHECK(!file::exists(dir));
    file::mkdir(dir);
    CHECK(file::exists(dir));

    std::string path = file::resolve(dir, "file.txt");
    CHECK(!file::exists(path));

    const std::string str = "abcdef\nghijkl\n";
    std::error_code ec = file::write(path, str.data(), str.size());
    CHECK(!ec);
    CHECK(file::exists(path));

    buffer::Buffer buf;
    ec = file::read(path, buf);
    CHECK(!ec);
    CHECK(buf.size() == str.size());
    CHECK(buf.to_string() == str);

    file::unlink(path);
    CHECK(!file::exists(path));
    file::rmdir(dir);
    CHECK(!file::exists(dir));
}
