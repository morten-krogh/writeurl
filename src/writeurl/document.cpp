#include <writeurl/document.hpp>

using namespace writeurl;

document::Document::Document(const Store::Ids& ids):
    m_id {ids.id},
    m_read_password {ids.read_password},
    m_write_password {ids.write_password},
    m_noperation {ids.noperation},
    m_nstate {ids.nstate}
{
}

const std::string& document::Document::get_id() const noexcept
{
    return m_id;
}

const std::string& document::Document::get_read_password() const noexcept
{
    return m_read_password;
}

const std::string& document::Document::get_write_password() const noexcept
{
    return m_write_password;
}

uint_fast64_t document::Document::get_noperation() const noexcept
{
    return m_noperation;
}

void document::Document::set_noperation(uint_fast64_t noperation)
{
    m_noperation = noperation;
}
