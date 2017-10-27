#include <string.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/types.h>
#include <fts.h>
#include <sys/uio.h>
#include <unistd.h>
#include <errno.h>
#include <zf_log/zf_log.h>
#include <writeurl/file.h>

char *wul_resolve(const char *base, const char *name)
{
	size_t len_base = strlen(base);
	size_t len_name = strlen(name);
	size_t len = len_base + 1 + len_name;
	char *path = malloc(len + 1);
	memcpy(path, base, len_base);
	path[len_base] = '/';
	memcpy(path + len_base + 1, name, len_name);
	path[len] = '\0';
	return path;
}

bool wul_exists(const char *path)
{
	struct stat buf;
	return stat(path, &buf) == 0;
}


int wul_rmdir_rec(char *path)
{
	char* const path_argv[2] = {path, NULL};
	int options = FTS_PHYSICAL | FTS_NOCHDIR | FTS_NOSTAT;
	FTS* fts = fts_open(path_argv, options, NULL);
	if (!fts) {
		ZF_LOGE("fts_open failed for path = %s with errno = %i, "
			"error = %s\n", path, errno, strerror(errno));
		return -1;
	}

	FTSENT* ftsent;
	while (ftsent = fts_read(fts)) {
		if (ftsent->fts_info == FTS_NSOK) {
			int rc = unlink(ftsent->fts_accpath);
			if (rc == -1) {
				fts_close(fts);
				ZF_LOGE("unlink failed for path = %s with "
					"errno = %i, error = %s\n",
					ftsent->fts_accpath, errno,
					strerror(errno));
				return -1;
			}
		}
		if (ftsent->fts_info == FTS_DP) {
			int rc = rmdir(ftsent->fts_accpath);
			if (rc == -1) {
				fts_close(fts);
				ZF_LOGE("rmdir failed for path = %s with "
					"errno = %i, error = %s\n",
					ftsent->fts_accpath, errno,
					strerror(errno));
				return -1;
			}
		}
	}
	int rc = fts_close(fts);
	return rc;
}

size_t wul_read(const char *path, char **buf)
{
	int fd = open(path, O_RDONLY);
	if (fd == -1) {
		ZF_LOGE("open failed for path = %s with errno = %i, "
			"error = %s\n", path, errno, strerror(errno));
		return -1;
	}

	struct stat buffer;
	int rc = fstat(fd, &buffer);
	if (rc == -1) {
		ZF_LOGE("stat failed for path = %s with errno = %i, "
			"error = %s\n", path, errno, strerror(errno));
		return -1;
	}

	size_t file_size = (size_t)buffer.st_size;
	*buf = malloc(file_size);

	ssize_t nread = read(fd, *buf, file_size);
	if (nread != (ssize_t)file_size) {
		ZF_LOGE("read failed for path = %s with errno = %i, "
			"error = %s\n", path, errno, strerror(errno));
		free(*buf);
		return -1;
	}

	return file_size;
}

int wul_write(const char *path, const char* buf, size_t nbyte)
{
	mode_t mode = 0640;
	int fd = open(path, O_WRONLY | O_CREAT, mode);
	if (fd == -1) {
		ZF_LOGE("open failed for path = %s with errno = %i, "
			"error = %s\n", path, errno, strerror(errno));
		return -1;
	}

	ssize_t nwritten = write(fd, buf, nbyte);
	if (nwritten == -1) {
		ZF_LOGE("write failed for path = %s with errno = %i, "
			"error = %s\n", path, errno, strerror(errno));
		return -1;
	}

	if ((size_t)nwritten != nbyte) {
		ZF_LOGE("write was partial for path = %s, nwritten = %zu, "
			"nbyte = %zu\n", path, nwritten, nbyte);
		return -1;
	}

	return 0;
}
