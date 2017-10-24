#include <library.h>
#include <stdlib.h>

#include <writeurl/file.h>

TEST(resolve)
{
	char *path = wul_resolve("/dir", "name");

	printf("path = %s\n", path);

	free(path);
}

