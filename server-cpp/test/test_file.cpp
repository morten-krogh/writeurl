#include <catch/catch.hpp>
#include <context.hpp>

#include <writeurl/file.hpp>

using namespace writeurl;

TEST_CASE("Resolve components", "file")
{
    CHECK(file::resolve(std::vector<std::string> {"abc"}) == "abc");
    CHECK(file::resolve(std::vector<std::string> {"abc", "def"}) == "abc/def");
    CHECK(file::resolve(std::vector<std::string> {"abc", "def", "ghi"}) == "abc/def/ghi");
}

TEST_CASE("Resolve prefix and name", "file")
{
    CHECK(file::resolve("prefix", "name") == "prefix/name");
}

TEST_CASE("Exists", "file")
{
    std::string non_existing_file = file::resolve(context.assets, "non-existing");
    CHECK(!file::exists(non_existing_file));

    std::string existing_file = file::resolve(context.assets, "file1.txt");
    CHECK(file::exists(existing_file));
}
