#include <catch/catch.hpp>
#include <context.hpp>

#include <writeurl/store.hpp>
#include <writeurl/file.hpp>
#include <writeurl/error.hpp>

using namespace writeurl;

TEST_CASE("create_document_dirs", "[store]")
{
    std::string root_dir = context.get_tmp_dir();
    
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

    file::rmdir_recursive(root_dir);
    CHECK(!file::exists(root_dir));
    CHECK(!file::exists(file::resolve(std::vector<std::string>{root_dir, "a", "9"})));
}
