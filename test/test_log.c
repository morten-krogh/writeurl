#include <wul_test_lib.h>
#include <wul/log.h>

TEST(log_level)
{
	ASSERT_EQ(wul_log_level("verbose"), ZF_LOG_VERBOSE);
	ASSERT_EQ(wul_log_level("debug"), ZF_LOG_DEBUG);
	ASSERT_EQ(wul_log_level("info"), ZF_LOG_INFO);
	ASSERT_EQ(wul_log_level("warn"), ZF_LOG_WARN);
	ASSERT_EQ(wul_log_level("error"), ZF_LOG_ERROR);
	ASSERT_EQ(wul_log_level("fatal"), ZF_LOG_FATAL);
	ASSERT_EQ(wul_log_level("none"), ZF_LOG_NONE);
	ASSERT_EQ(wul_log_level("unknown"), -1);
}

TEST(log_desc)
{
	ASSERT_STR_EQ(wul_log_desc(ZF_LOG_VERBOSE), "verbose");
	ASSERT_STR_EQ(wul_log_desc(ZF_LOG_DEBUG), "debug");
	ASSERT_STR_EQ(wul_log_desc(ZF_LOG_INFO), "info");
	ASSERT_STR_EQ(wul_log_desc(ZF_LOG_WARN), "warn");
	ASSERT_STR_EQ(wul_log_desc(ZF_LOG_ERROR), "error");
	ASSERT_STR_EQ(wul_log_desc(ZF_LOG_FATAL), "fatal");
	ASSERT_STR_EQ(wul_log_desc(ZF_LOG_NONE), "none");
	ASSERT_STR_EQ(wul_log_desc(156), "unknown");
}
