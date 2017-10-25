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


//std::error_code file::rmdir_recursive(const std::string& path)
//{
//    std::string path_2 = path; // copy to avoid const
//    char* const path_argv[2] = {const_cast<char*>(path_2.c_str()), nullptr};
//    int options = FTS_PHYSICAL | FTS_NOCHDIR | FTS_NOSTAT;
//    FTS* fts = fts_open(path_argv, options, nullptr);
//    if (!fts)
//        return make_error_code(Error::file_unspecified_error);
//
//    FTSENT* ftsent;
//    while ((ftsent = fts_read(fts)) != nullptr) {
//        std::string acc_path {ftsent->fts_accpath};
//        if (ftsent->fts_info == FTS_NSOK) {
//            int rc = ::unlink(ftsent->fts_accpath);
//            if (rc == -1) {
//                fts_close(fts);
//                return make_error_code(Error::file_unspecified_error);
//            }
//        }
//        if (ftsent->fts_info == FTS_DP) {
//            int rc = ::rmdir(ftsent->fts_accpath);
//            if (rc == -1) {
//                fts_close(fts);
//                return make_error_code(Error::file_unspecified_error);
//            }
//        }
//    }
//
//    fts_close(fts);
//
//    return std::error_code{};
//}
//
int wul_read(const char *path, char **content)
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
	*content = malloc(file_size);

	ssize_t nread = read(fd, *content, file_size);
	if (nread != (ssize_t)file_size) {
		ZF_LOGE("read failed for path = %s with errno = %i, "
			"error = %s\n", path, errno, strerror(errno));
		return -1;
	}

	return file_size;
}
//std::error_code file::write(const std::string& path, const char* data, size_t size)
//{
//    mode_t mode = 0640;
//    int fd = open(path.c_str(), O_WRONLY | O_CREAT, mode);
//    if (fd == -1) {
//        if (errno == ENOENT)
//            return make_error_code(Error::file_no_exist);
//        else if (errno == EACCES)
//            return make_error_code(Error::file_write_access_denied);
//        else
//            return make_error_code(Error::file_unspecified_error);
//    }
//
//    ssize_t nwritten = ::write(fd, data, size);
//    if (nwritten == -1) {
//        if (errno == EDQUOT)
//            return make_error_code(Error::file_quota_exceeded);
//        else if (errno == EFBIG)
//            return make_error_code(Error::file_size_limit_exceeded);
//        else
//            return make_error_code(Error::file_unspecified_error);
//    }
//
//    if (size_t(nwritten) != size)
//        return make_error_code(Error::file_unspecified_error);
//
//    return std::error_code{};
//}
