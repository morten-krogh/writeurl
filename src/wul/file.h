/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#pragma once

#include <stdbool.h>

char *wul_resolve(const char *base, const char *name);

bool wul_exist(const char *path);

// recursively remove the dir path and all its subdirs.
// returns 0 on success and -1 on failure.
int wul_rmdir_rec(char *path);

// returns the size of the file and puts the content in an allocated buffer
// returned in *content. -1 is returned in error cases.
size_t wul_read(const char *path, char **buf);


// wul_write() writes nbyte bytes in buf into the file specfied by path.
// The return value is 0 if the entire buf is written into the file, -1
// otherwise.
int wul_write(const char *path, const char* buf, size_t nbyte);
