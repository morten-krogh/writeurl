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

namespace writeurl {
namespace file {

std::string resolve(const std::vector<std::string>& components);

std::string resolve(const std::string& prefix, const std::string& name);

bool exists(const std::string& path);

std::string read(const std::string& path, std::error_code& ec);

void write(const std::string& path, const std::string& content, std::error_code& ec);

} // namespace file
} // namespace writeurl
