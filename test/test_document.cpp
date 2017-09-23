#include <catch.hpp>
#include <context.hpp>

#include <writeurl/document.hpp>
#include <writeurl/error.hpp>

using namespace writeurl;

TEST_CASE("invalid_ids", "[document]")
{
    const std::string store_dir = context.get_tmp_dir();
    Store store {store_dir};

    Document document {store};

    using Status = Document::CreateStatus;

    CHECK(document.create_document("", "", "") == Status::invalid_id);
    CHECK(document.create_document("6", "", "") == Status::invalid_id);
    CHECK(document.create_document("ab", "", "") == Status::invalid_id);
    CHECK(document.create_document("ab&", "", "") == Status::invalid_id);
    CHECK(document.create_document("abc", "", "") == Status::invalid_read_password);
    CHECK(document.create_document("abc", "abæ", "") == Status::invalid_read_password);
    CHECK(document.create_document("abc", "ab123", "") == Status::invalid_write_password);
    CHECK(document.create_document("666", "ab123", "02") == Status::invalid_write_password);
    CHECK(document.create_document("666", "ab123eiueiwur", "0233443") == Status::ok);
}


TEST_CASE("create_and_attach_document", "[document]")
{
    const std::string store_dir = context.get_tmp_dir();
    Store store {store_dir};

    {
        Document document {store};
        CHECK(document.create_document("abc", "def", "ghi") == Document::CreateStatus::ok);
    }

    {
        Document document {store};
        CHECK(document.create_document("abc", "def", "ghi") == Document::CreateStatus::exist);
    }





}
