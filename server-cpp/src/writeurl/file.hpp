/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#include <string>
#include <system_error>

#include <writeurl/buffer.hpp>

namespace writeurl {
namespace file {

std::string resolve(const std::vector<std::string>& components);

std::string resolve(const std::string& prefix, const std::string& name);

bool exists(const std::string& path);

std::error_code mkdir(const std::string& path);
std::error_code rmdir(const std::string& path);

std::error_code unlink(const std::string& path);

std::error_code read(const std::string& path, buffer::Buffer& buf);

std::error_code write(const std::string& path, const char* data, size_t size);

} // namespace file
} // namespace writeurl
