#include <catch.hpp>
#include <context.hpp>

#include <writeurl/server.hpp>

using namespace writeurl;

TEST_CASE("http_request", "[server]")
{

    std::shared_ptr<spdlog::logger> logger = context.get_logger("server");

    logger->info("HEJ info");
    logger->debug("HEJ debug");


}

