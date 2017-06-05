#include <catch/catch.hpp>
#include <context.hpp>

#include <writeurl/file.hpp>

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
    std::error_code ec;
    std::string file_1 = file::resolve(context.assets, "file1.txt");
    std::string content_1 = file::read(file_1, ec);
    CHECK(!ec);
    CHECK(content_1 == "abc");
}
