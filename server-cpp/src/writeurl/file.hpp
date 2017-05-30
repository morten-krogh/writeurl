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

bool file_exists(const std::string& path);

std::string read_file(const std::string& path, std::error_code& ec);

void write_file(const std::string& path, const std::string& content, std::error_code& ec);



} // namespace file
} // namespace writeurl
