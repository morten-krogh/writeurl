#include <catch/catch.hpp>
#include <context.hpp>

#include <writeurl/file.hpp>
#include <writeurl/error.hpp>

#include <iostream>

using namespace writeurl;

TEST_CASE("Resolve components", "[file]")
{
    CHECK(file::resolve(std::vector<std::string> {"abc"}) == "abc");
    CHECK(file::resolve(std::vector<std::string> {"abc", "def"}) == "abc/def");
    CHECK(file::resolve(std::vector<std::string> {"abc", "def", "ghi"}) == "abc/def/ghi");
}

TEST_CASE("Resolve prefix and name", "[file]")
{
    CHECK(file::resolve("prefix", "name") == "prefix/name");
}

TEST_CASE("Exists", "[file]")
{
    std::string non_existing_file = file::resolve(context.get_assets_dir(), "non-existing");
    CHECK(!file::exists(non_existing_file));

    std::string existing_file = file::resolve(context.get_assets_dir(), "file1.txt");
    CHECK(file::exists(existing_file));
}

TEST_CASE("Read", "[file]")
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

TEST_CASE("Write, read and unlink", "[file]")
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

TEST_CASE("Directory depth", "[file]")
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
