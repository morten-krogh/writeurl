/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#include <string>

namespace writeurl {
namespace document {

class Document {
public:

    const std::string& get_id() const noexcept;
    void set_id(const std::string& id);

    const std::string& get_read_password() const noexcept;
    void set_read_password(const std::string& read_password);

    const std::string& get_write_password() const noexcept;
    void set_write_password(const std::string& write_password);

    uint_fast64_t get_noperation() const noexcept;
    void set_noperation(uint_fast64_t noperation);


private:
    std::string m_id;
    std::string m_read_password;
    std::string m_write_password;
    uint_fast64_t m_noperation = 0;
};



} // namespace document
} // namespace writeurl
