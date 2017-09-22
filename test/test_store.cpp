#include <catch/include/catch.hpp>
#include <context.hpp>

#include <writeurl/store.hpp>
#include <writeurl/file.hpp>
#include <writeurl/error.hpp>

using namespace writeurl;

TEST_CASE("create_document_dirs", "[store]")
{
    const std::string root_dir = context.get_tmp_dir();
    
    store::create_document_dirs(root_dir);
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "a"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "z"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "0"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "9"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "a", "b"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "a", "d"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "0", "x"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "5", "9"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "z", "2"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "9", "a"})));
    CHECK(file::exists(file::resolve(std::vector<std::string>{root_dir, "a", "9"})));
    CHECK(!file::exists(file::resolve(std::vector<std::string>{root_dir, "aa", "9"})));

    file::rmdir_recursive(root_dir);
    CHECK(!file::exists(root_dir));
    CHECK(!file::exists(file::resolve(std::vector<std::string>{root_dir, "a", "9"})));
}

TEST_CASE("get_store_info_from_assets", "[store]")
{
    const std::string id = "o7frz2tyexl0s7ujtuv8";
    const std::string read = "vst3suh9s63v8sksjjfh";
    const std::string write = "6m57kvmdj4kcwl1otea1";
    const uint_fast64_t expected_noperation = 213;
    const uint_fast64_t expected_nstate = 0;

    const std::string root_dir = context.get_assets_dir();

    std::error_code ec;
    store::Ids ids = store::get_ids(root_dir, id, ec);
    CHECK(!ec);
    CHECK(ids.id == id);
    CHECK(ids.read == read);
    CHECK(ids.write == write);

    uint_fast64_t noperation = store::get_noperation(root_dir, id, ec);
    CHECK(!ec);
    CHECK(noperation == expected_noperation);

    uint_fast64_t nstate = store::get_nstate(root_dir, id, ec);
    CHECK(!ec);
    CHECK(nstate == expected_nstate);


}
