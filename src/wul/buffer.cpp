#include <cassert>
#include <algorithm>

#include <writeurl/buffer.hpp>

using namespace writeurl;

buffer::Buffer::Buffer(size_t capacity):
    m_size{0},
    m_capacity{capacity}
{
    if (capacity > 0)
        m_data.reset(new char[capacity]);
}

size_t buffer::Buffer::size() const
{
    return m_size;
}

void buffer::Buffer::resize(size_t size)
{
    assert(size <= m_capacity);
    m_size = size;
}

const char* buffer::Buffer::data() const
{
    return m_data.get();
}

char* buffer::Buffer::data()
{
    return m_data.get();
}

void buffer::Buffer::reserve(size_t capacity)
{
    if (m_capacity >= capacity)
        return;

    std::unique_ptr<char[]> new_data {new char[capacity]};
    std::copy(m_data.get(), m_data.get() + m_size, new_data.get());
    m_data = std::move(new_data);
    m_capacity = capacity;
}

std::string buffer::Buffer::to_string() const
{
    return std::string{m_data.get(), m_size};
}
