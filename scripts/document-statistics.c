#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <time.h>
#include <dirent.h>

char int_to_char (int n) 
{
	return n < 26 ? 'a' + n : '0' + (n - 26);
}

struct file_times {
	time_t mtime;
	time_t birthtime;
};

struct file_times times_for_path (char *path)
{
	struct stat buf;
	struct file_times times;

	char path_noperation[200];
	char path_ids[200];

	sprintf(path_noperation, "%s/noperation", path);
	sprintf(path_ids, "%s/ids", path);

	if (stat(path_noperation, &buf)) {
		//printf("Error in %s\n", path);
	} else {
		times.mtime = buf.st_mtimespec.tv_sec;
	}

	if (stat(path_ids, &buf)) {
		//printf("Error in %s\n", path);
	} else {
		times.birthtime = buf.st_mtimespec.tv_sec;
	}

	return times;
}

struct statistics {
	int total;
	int mday;
	int mweek;
	int birthday;
	int birthweek;
};

void update_path (char *path, struct statistics *statistic, time_t now)
{

	struct file_times times = times_for_path(path);

	time_t mdiff = now - times.mtime;
	time_t birthdiff = now - times.birthtime;

	if (mdiff < 24 * 3600) {
		statistic->mday++;
	}

	if (mdiff < 7 * 24 * 3600) {
		statistic->mweek++;
	}

	if (birthdiff < 24 * 3600) {
		statistic->birthday++;
	}

	if (birthdiff < 7 * 24 * 3600) {
		statistic->birthweek++;
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
			sprintf(path, "%s/%s", dir, dp->d_name);
			update_path (path, statistic, now);
		}
	}
	closedir(dirp);
}

int main (int argv, char **argc) 
{
	struct statistics statistic = {0, 0, 0, 0, 0};

	time_t now = time(0);

	int N = 36;
	for (int d1 = 0; d1 < N; ++d1) {
		for (int d2 = 0; d2 < N; ++d2) {
			update_dir (d1, d2, &statistic, now);
		}
	}

	printf("The total number of documents is %i\n", statistic.total);
	printf("Created last 24 hours: %i\n", statistic.birthday);
	printf("Updated last 24 hours: %i\n", statistic.mday);
	printf("Created last week: %i\n", statistic.birthweek);
	printf("Updated last week: %i\n", statistic.mweek);
	return 0;
}
