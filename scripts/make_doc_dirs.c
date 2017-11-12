#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>

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

int main (int argc, char **argv) 
{
	
	if (argc != 2) {
		printf("There must be one argument for the parent directory\n");
		return 1;
	}

	char *parent = argv[1];

	for (int n1 = 0; n1 < 36; n1++) {
		if (make_child(parent, character(n1), 0)) {
			printf("Error in creating directories\n");
			return 1;
		}
		for (int n2 = 0; n2 < 36; n2++) {
			if (make_child(parent, character(n1), character(n2))) {
				printf("Error in creating directories\n");
				return 1;
			}
		}
	}

	return 0;
}
