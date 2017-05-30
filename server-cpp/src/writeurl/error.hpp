/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#include <system_error>

namespace writeurl {

enum class Error {
    file_no_exist,
    file_read_access_denied,
    file_write_access_denied,
    file_quota_exceeded,
    file_size_limit_exceeded,
    file_unspecified_error,


};

const std::error_category& error_category() noexcept;

std::error_code make_error_code(Error) noexcept;

} // namespace writeurl


namespace std {

template <> struct is_error_code_enum<writeurl::Error> {
    static const bool value = true;
};

} // namespace std
