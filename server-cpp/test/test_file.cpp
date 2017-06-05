#include <catch/catch.hpp>
#include <context.hpp>

#include <writeurl/file.hpp>

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
    std::string non_existing_file = file::resolve(context.assets, "non-existing");
    CHECK(!file::exists(non_existing_file));

    std::string existing_file = file::resolve(context.assets, "file1.txt");
    CHECK(file::exists(existing_file));
}

TEST_CASE("Read", "[file]")
{
    std::string file_1 = file::resolve(context.assets, "file1.txt");

    buffer::Buffer buf;
    std::error_code ec = file::read(file_1, buf);
    CHECK(!ec);
    CHECK(buf.size() == 3);
    CHECK(buf.to_string() == "abc");

    std::string non_existing_file = file::resolve(context.assets, "non-existing");
    buf.resize(0);
    ec = file::read(non_existing_file, buf);
    CHECK(ec);
    CHECK(ec.value() == 1);
    CHECK(ec.message() == "File does not exist");

    std::string empty_file = file::resolve(context.assets, "empty");
    buf.resize(0);
    ec = file::read(empty_file, buf);
    CHECK(!ec);
    CHECK(buf.size() == 0);
    CHECK(buf.to_string() == "");
}
