#define CATCH_CONFIG_RUNNER
#include <catch/catch.hpp>
#include <context.hpp>

#include <stdlib.h>
#include <iostream>

std::string assets = "/Users/mkrogh/writeurl/server-cpp/test/assets";

int main(int argc, char** argv)
{
    char* writeurl_home = getenv("WRITEURL_HOME");
    if (!writeurl_home) {
        std::cerr << "WRITEURL_HOME must be set in the environment" << std::endl;
        return 1;
    }

    context.set_writeurl_home(std::string(writeurl_home));

    int result = Catch::Session().run( argc, argv );

    return ( result < 0xff ? result : 0xff );
}
