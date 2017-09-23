#include <writeurl/document.hpp>

using namespace writeurl;

const std::string& document::Document::get_id() const noexcept
{
    return m_id;
}

void document::Document::set_id(const std::string& id)
{
    m_id = id;
}

const std::string& document::Document::get_read_password() const noexcept
{
    return m_read_password;
}

void document::Document::set_read_password(const std::string& read_password)
{
    m_read_password = read_password;
}

const std::string& document::Document::get_write_password() const noexcept
{
    return m_write_password;
}

void document::Document::set_write_password(const std::string& write_password)
{
    m_write_password = write_password;
}

uint_fast64_t document::Document::get_noperation() const noexcept
{
    return m_noperation;
}

void document::Document::set_noperation(uint_fast64_t noperation)
{
    m_noperation = noperation;
}
