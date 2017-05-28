#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <dirent.h>
#include <unistd.h>
#include <sys/wait.h>

int make_child (char *parent, char first, char second) 
{
	char end[5];
	end[0] = '/';
	end[1] = first;
	if (second) {
		end[2] = '/';
		end[3] = second;
		end[4] = '\0';
	} else {
		end[2] = '\0';
	}

	char *child;
	child = malloc(strlen(parent) + 5);
	strcpy(child, parent);
	strcat(child, end);

	return mkdir(child, 0755);
}

char character (int num)
{
	return num < 26 ? 'a' + num : '0' + (num - 26);
}

void copy_entry(char *source, char *name, char *parent)
{
	char *src;
	src = malloc(strlen(source) + 1 + strlen(name) + 1);
	strcpy(src, source);
	strcat(src, "/");
	strcat(src, name);

	char *dst;
	int lparent = strlen(parent);
	dst = malloc(lparent + 4);
	strcpy(dst, parent);
	dst[lparent] = '/';
	dst[lparent + 1] = name[0];
	dst[lparent + 2] = '/';
	dst[lparent + 3] = name[1];
	dst[lparent + 4] = '\0';
	
	pid_t pid = fork();

	if (pid == 0) {
		execl("/bin/cp", "/bin/cp", "-r", src, dst, (char *)0);
	} else {
		int status;
		wait(&status);
	}
}

int main (int argc, char **argv) 
{
	
	if (argc != 3) {
		printf("There must be two arguments, the source directory and the parent directory for the documents\n");
		return 1;
	}

	char *source = argv[1];
	char *parent = argv[2];

	DIR *source_dir;
	if (!(source_dir = opendir(source)))
		return -1;

	struct dirent *dp;
	while ((dp = readdir(source_dir)) != NULL) {
		if (strlen(dp->d_name) > 2) {
			copy_entry(source, dp->d_name, parent);
		}
	}
	
	closedir(source_dir);

	return 0;
}
