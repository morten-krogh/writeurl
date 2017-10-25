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

bool wul_exists(const char *path);

// returns the size of the file and puts the content in an allocated buffer
// returned in *content. -1 is returned in error cases.
int wul_read(const char *path, char **content);

//std::error_code rmdir_recursive(const std::string& path);
//
//std::error_code write(const std::string& path, const char* data, size_t size);
