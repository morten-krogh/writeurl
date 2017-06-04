#include <catch/catch.hpp>

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
    CHECK(!file::exists("assets/foo"));
    CHECK(file::exists("/Users/mkrogh/writeurl/server-cpp/test/assets/file1.txt"));
}
