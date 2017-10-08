/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#ifndef WRITEURL_TEST_CONTEXT_H
#define WRITEURL_TEST_CONTEXT_H

#include <string>
#include <system_error>

#include <spdlog/spdlog.h>
#include <spdlog/sinks/stdout_sinks.h>

class Context {
public:

    void set_writeurl_home(const std::string& writeurl_home);

    void set_log_level(spdlog::level::level_enum log_level);
    std::shared_ptr<spdlog::logger> get_logger(const std::string& prefix);
    std::string get_assets_dir();
    std::string get_tmp_dir();
    void cleanup();
private:
    spdlog::sink_ptr m_sink = spdlog::sinks::stdout_sink_mt::instance();
    spdlog::level::level_enum m_log_level = spdlog::level::level_enum::info;
    std::string m_writeurl_home;
    std::string m_assets;
    std::string m_tmp;

    uint_fast64_t m_counter = 0;

    std::string get_tmp_dir(uint_fast64_t counter);
};

extern Context context;

#endif // WRITEURL_TEST_CONTEXT_H
