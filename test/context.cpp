#include <vector>
#include <cassert>
#include <iostream>

#include <context.hpp>
#include <writeurl/file.hpp>

Context context;

using namespace writeurl;

void Context::set_writeurl_home(const std::string& writeurl_home)
{
    m_writeurl_home = writeurl_home;
    m_assets = file::resolve(std::vector<std::string> {writeurl_home, "test", "assets"});
    m_tmp = file::resolve(std::vector<std::string> {writeurl_home, "test", "tmp"});
    file::rmdir_recursive(m_tmp);
    std::error_code ec = file::mkdir(m_tmp);
    assert(!ec);
}

void Context::set_log_level(spdlog::level::level_enum log_level)
{
    m_log_level = log_level;
}

std::shared_ptr<spdlog::logger> Context::get_logger(const std::string& prefix)
{
    std::shared_ptr<spdlog::logger> logger = std::make_shared<spdlog::logger>(prefix, m_sink);
    logger->set_pattern("[" + prefix + "] [%l] %v");
    logger->set_level(m_log_level);
    return logger;
}

std::string Context::get_assets_dir()
{
    return m_assets;
}

std::string Context::get_tmp_dir()
{
    return get_tmp_dir(m_counter++);
}

std::string Context::get_tmp_dir(uint_fast64_t counter)
{
    std::string name = "dir-" + std::to_string(counter);
    std::string dir = file::resolve(m_tmp, name);
    file::mkdir(dir);
    return dir;
}

void Context::cleanup()
{
    file::rmdir_recursive(m_tmp);
}
