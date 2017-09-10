/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#include <cstddef>
#include <memory>
#include <string>

namespace writeurl {
namespace buffer {


class Buffer {
public:

    Buffer(size_t capacity = 0);

    size_t size() const;
    void resize(size_t size);

    const char* data() const;
    char* data();

    void reserve(size_t capacity);

    std::string to_string() const;
private:
    size_t m_size;
    size_t m_capacity;
    std::unique_ptr<char[]> m_data;
};

} // namespace buffer
} // namespace writeurl
