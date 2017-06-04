#include <context.hpp>
#include <writeurl/file.hpp>

#include <vector>

Context context;

void Context::set_writeurl_home(const std::string& writeurl_home)
{
    this->writeurl_home = writeurl_home;
    assets = writeurl::file::resolve(std::vector<std::string> {writeurl_home, "server-cpp", "test", "assets"});
}
