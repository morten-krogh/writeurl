#include <catch/catch.hpp>

#include <writeurl/buffer.hpp>

using namespace writeurl;

TEST_CASE("Buffer", "[buffer]")
{
    buffer::Buffer buf;

    CHECK(buf.size() == 0);

    buf.reserve(5);
    buf.resize(3);
    const std::string str_1 = "abc";
    std::copy(str_1.data(), str_1.data() + 3, buf.data());

    CHECK(buf.size() == 3);
    CHECK(buf.to_string() == "abc");

    buf.reserve(10);
    CHECK(buf.size() == 3);
    CHECK(buf.to_string() == "abc");

    buf.resize(5);
    const std::string str_2 = "de";
    std::copy(str_2.data(), str_2.data() + 2, buf.data() + 3);
    CHECK(buf.size() == 5);
    CHECK(buf.to_string() == "abcde");

    buf.reserve(2); // reserve to a smaller size is a no-op.
    CHECK(buf.size() == 5);
    CHECK(buf.to_string() == "abcde");
}
