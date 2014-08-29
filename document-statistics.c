#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <time.h>
#include <dirent.h>

char int_to_char (int n) 
{
	return n < 26 ? 'a' + n : '0' + (n - 26);
}

time_t mtime_for_path (char *path)
{
	struct stat buf;
	if (stat(path, &buf)) {
		//printf("Error in %s\n", path);
		return 0;
	}

	return buf.st_mtimespec.tv_sec;
}

struct statistics {
	int total;
	int day;
	int week;
};

void update_path (char *path, struct statistics *statistic, time_t now)
{
	time_t mtime = mtime_for_path(path);
	time_t timediff = now - mtime;

	if (timediff < 24 * 3600) {
		statistic->day++;
	}

	if (timediff < 7 * 24 * 3600) {
		statistic->week++;
	}

	statistic->total++;
}

void update_dir (int d1, int d2, struct statistics *statistic, time_t now)
{
	char dir[20];
	sprintf(dir, "./writeurl/docs/%c/%c", int_to_char(d1), int_to_char(d2));

	//printf("%s\n", dir);
	char path[200];

	DIR *dirp = opendir(dir);
	struct dirent *dp;
	while ((dp = readdir(dirp)) != NULL) {	
		if (dp->d_name[0] != '.') {
			sprintf(path, "%s/%s/noperation", dir, dp->d_name);
			update_path (path, statistic, now);
		}
	}
	closedir(dirp);
}

int main (int argv, char **argc) 
{
	struct statistics statistic = {0, 0, 0};

	time_t now = time(0);

	int N = 36;
	for (int d1 = 0; d1 < N; ++d1) {
		for (int d2 = 0; d2 < N; ++d2) {
			update_dir (d1, d2, &statistic, now);
		}
	}

	printf("The total number of documents is %i\n", statistic.total);
	printf("Updated last 24 hours: %i\n", statistic.day);
	printf("Updated last week: %i\n", statistic.week);
	return 0;
}
