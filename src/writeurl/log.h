/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#pragma once

#include <zf_log/zf_log.h>

int wul_log_level(const char* desc);
const char *wul_log_desc(int level);



        // The Writeurl server will output log messages
        // whose level is at least log_level. The logger
        // is zf_log. The available levels are
        // ZF_LOG_VERBOSE 1
        // ZF_LOG_DEBUG   2
        // ZF_LOG_INFO    3
        // ZF_LOG_WARN    4
        // ZF_LOG_ERROR   5
        // ZF_LOG_FATAL   6
        // ZF_LOG_NONE    0xFF
