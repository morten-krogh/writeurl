#include <library.h>

TEST(simple_1)
{
	ASSERT_EQ(12 + 13, 25);
}

TEST(simple_2)
{
	ASSERT_EQ(12 + 13 + 10, 35);
}

TEST(simple_3)
{
	ASSERT_EQ(12 * 13, 156);
}
