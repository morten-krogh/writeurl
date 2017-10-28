#include <string.h>
#include <writeurl/log.h>

static const char *descs[] = {
	"verbose",
	"debug",
	"info",
	"warn",
	"error",
	"fatal",
	"none"
};

static const int levels[] = {
	ZF_LOG_VERBOSE,
	ZF_LOG_DEBUG,
	ZF_LOG_INFO,
	ZF_LOG_WARN,
	ZF_LOG_ERROR,
	ZF_LOG_FATAL,
	ZF_LOG_NONE
};

int wul_log_level(const char* desc)
{
	for (size_t i = 0; i < sizeof(descs) / sizeof(descs[0]); ++i)
		if (!(strcmp(desc, descs[i])))
			return levels[i];
	return -1;
}

const char *wul_log_desc(int level)
{
	for (size_t i = 0; i < sizeof(levels) / sizeof(levels[0]); ++i)
		if (level == levels[i])
			return descs[i];
	return "unknown";
}
