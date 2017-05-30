#include <string>

#include <writeurl/error.hpp>

using namespace writeurl;

namespace {

class ErrorCategory: public std::error_category {
public:
    const char* name() const noexcept final override
    {
        return "writeurl::Error";
    }

    std::string message(int value) const override final
    {
        switch(Error(value)) {
            case Error::file_no_exist:
                return "File does not exist";
            case Error::file_read_access_denied:
                return "Read access denied for file";
            case Error::file_write_access_denied:
                return "Write access denied for file";
            case Error::file_quota_exceeded:
                return "File quota exceeded";
            case Error::file_size_limit_exceeded:
                return "File size limit exceeded";
            case Error::file_unspecified_error:
                return "Unspecified file error";

        }
        return "unknown error";
    }
};

ErrorCategory g_error_category;

} // anonymous namespace

const std::error_category& writeurl_error_category() noexcept
{
    return g_error_category;
}

std::error_code make_error_code(Error error) noexcept
{
    return std::error_code(int(error), g_error_category);
}
