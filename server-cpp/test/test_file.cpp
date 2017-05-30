#include <catch/catch.hpp>

#include <writeurl/file.hpp>

using namespace writeurl;

TEST_CASE("File exists", "file")
{
    CHECK(!file::file_exists("assets/foo"));
    CHECK(file::file_exists("/Users/mkrogh/writeurl/server-cpp/test/assets/file1.txt"));

}
