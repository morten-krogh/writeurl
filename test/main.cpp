#define CATCH_CONFIG_RUNNER
#include <catch.hpp>
#include <context.hpp>

#include <stdlib.h>
#include <iostream>

namespace {

spdlog::level::level_enum convert_log_level(const char* writeurl_log_level)
{
    int n_levels = sizeof(spdlog::level::level_names) / sizeof(char*);
    for (int i = 0; i < n_levels; ++i) {
        if (strcmp(writeurl_log_level, spdlog::level::level_names[i]) == 0)
            return static_cast<spdlog::level::level_enum>(i);
    }
    std::cerr << "The log level " << writeurl_log_level << " is invalid" << std::endl;
    exit(1);
}

}

int main(int argc, char** argv)
{
    char* writeurl_home = getenv("WRITEURL_HOME");
    if (!writeurl_home) {
        std::cerr << "WRITEURL_HOME must be set in the environment" << std::endl;
        return 1;
    }
    context.set_writeurl_home(std::string(writeurl_home));

    const char* writeurl_log_level = getenv("WRITEURL_LOG_LEVEL");
    if (!writeurl_log_level)
        writeurl_log_level = "info";

    context.set_log_level(convert_log_level(writeurl_log_level));

    int result = Catch::Session().run(argc, argv);

    context.cleanup();

    return ( result < 0xff ? result : 0xff );
}
