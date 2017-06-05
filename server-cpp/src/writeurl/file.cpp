#include <sys/stat.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/uio.h>
#include <unistd.h>
#include <vector>
#include <cassert>

#include <writeurl/file.hpp>
#include <writeurl/error.hpp>

using namespace writeurl;

std::string file::resolve(const std::vector<std::string>& components)
{
    assert(components.size() != 0);
    std::string result = components[0];
    for (size_t i = 1; i < components.size(); ++i) {
        result.append(1, '/');
        result.append(components[i]);
    }
    return result;
}

std::string file::resolve(const std::string& prefix, const std::string& name)
{
    std::vector<std::string> components(2);
    components[0] = prefix;
    components[1] = name;
    return resolve(components);
}

bool file::exists(const std::string& path)
{
    struct stat buffer;
    return (stat(path.c_str(), &buffer) == 0);
}

std::error_code file::read(const std::string& path, buffer::Buffer& buf)
{
    int fd = open(path.c_str(), O_RDONLY);
    if (fd == -1) {
        if (errno == ENOENT)
            return make_error_code(Error::file_no_exist);
        else if (errno == EACCES)
            return make_error_code(Error::file_read_access_denied);
        else
            return make_error_code(Error::file_unspecified_error);
    }

    struct stat buffer;
    int rc = fstat(fd, &buffer);
    if (rc == -1)
        return make_error_code(Error::file_unspecified_error);

    size_t file_size = size_t(buffer.st_size);

    buf.reserve(file_size);
    buf.resize(file_size);

    ssize_t nread = ::read(fd, (void*) buf.data(), file_size);
    if (nread != ssize_t(file_size))
        return make_error_code(Error::file_unspecified_error);

    return std::error_code{};
}

void file::write(const std::string& path, const std::string& content, std::error_code& ec)
{
    int fd = open(path.c_str(), O_WRONLY | O_CREAT);
    if (fd == -1) {
        if (errno == ENOENT)
            ec = make_error_code(Error::file_no_exist);
        else if (errno == EACCES)
            ec = make_error_code(Error::file_write_access_denied);
        else
            ec = make_error_code(Error::file_unspecified_error);

        return;
    }

    ssize_t nwritten = ::write(fd, content.data(), content.size());
    if (nwritten == -1) {
        if (errno == EDQUOT)
            ec = make_error_code(Error::file_quota_exceeded);
        else if (errno == EFBIG)
            ec = make_error_code(Error::file_size_limit_exceeded);
        else
            ec = make_error_code(Error::file_unspecified_error);

        return;
    }

    if (size_t(nwritten) != content.size()) {
        ec = make_error_code(Error::file_unspecified_error);
        return;
    }

    ec = std::error_code{};
    return;
}
