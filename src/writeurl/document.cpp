#include <locale>
#include <cassert>

#include <writeurl/document.hpp>

using namespace writeurl;

namespace {

bool id_is_valid(const std::string& id)
{
    std::locale loc { "C" };

    if (id.size() < 3)
        return false;

    for (size_t i = 0; i < id.size(); ++i) {
        const char c = id[i];
        if (!std::islower(c, loc) && !std::isdigit(c))
            return false;
    }

    return true;
}



} // namespace



Document::Document(Store& store):
    m_store {store}
{
}

Document::CreateStatus Document::create_document(const std::string& id,
                                           const std::string& read_password,
                                           const std::string& write_password)
{
    assert(m_id.empty());

    if(!id_is_valid(id))
        return CreateStatus::invalid_id;

    if (!id_is_valid(read_password))
        return CreateStatus::invalid_read_password;

    if (!id_is_valid(write_password))
        return CreateStatus::invalid_write_password;

    if (m_store.exists(id))
        return CreateStatus::exist;

    if (!m_store.create(id, read_password, write_password))
        return CreateStatus::store_failure;

    m_id = id;
    m_read_password = read_password;
    m_write_password = write_password;

    return CreateStatus::ok;
}

Document::AttachStatus Document::attach_document(const std::string& id)
{
    assert(m_id.empty());

    if(!id_is_valid(id))
        return AttachStatus::invalid_id;

    if (!m_store.exists(id))
        return AttachStatus::no_exist;

    std::error_code ec;
    Store::Ids ids = m_store.get_ids(id, ec);
    if (ec)
        return AttachStatus::store_failure;

    m_id = id;
    m_read_password = ids.read_password;
    m_write_password = ids.write_password;
    m_noperation = ids.noperation;
    m_nstate = ids.nstate;

    return AttachStatus::ok;
}


bool add_consumer_for_document(bool new_document,
                               const std::string read_password,
                               const std::string write_password)
{


}



const std::string& Document::get_id() const noexcept
{
    return m_id;
}

const std::string& Document::get_read_password() const noexcept
{
    return m_read_password;
}

const std::string& Document::get_write_password() const noexcept
{
    return m_write_password;
}

uint_fast64_t Document::get_noperation() const noexcept
{
    return m_noperation;
}

void Document::set_noperation(uint_fast64_t noperation)
{
    m_noperation = noperation;
}
