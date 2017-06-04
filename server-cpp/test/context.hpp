/*************************************************************
 *
 * Writeurl is an online collaborative editor.
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Writeurl
 *
************************************************************/

#include <string>
#include <system_error>

struct Context {

    std::string writeurl_home;
    std::string assets;

    void set_writeurl_home(const std::string& writeurl_home);

};

extern Context context;
