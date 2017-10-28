set -e
set -o pipefail
set -u

usage()
{
    cat << EOF
    Available modes are:
        build
        build-debug
        build-wul-debug
        test
        clean
EOF
}

dir="$(dirname $0)" || exit 1;
cd "$dir" || exit 1;
WUL_HOME="$(pwd)" || exit 1;
export WUL_HOME

if [ "$#" == 0 ]
then
    usage
    exit 1
fi

MODE="$1"
[ $# -gt 0 ] && shift


case $MODE in

    "build")
        BUILD_DIR=${WUL_HOME}/build/release
        mkdir -p ${BUILD_DIR}
        EXTRA_CFLAGS="-O3"
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 static_lib
        ;;
    "build-debug")
        BUILD_DIR=${WUL_HOME}/build/debug
        mkdir -p ${BUILD_DIR}
        EXTRA_CFLAGS="-g -DDEBUG"
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 static_lib
        ;;
    "build-wul-debug")
        BUILD_DIR=${WUL_HOME}/build/debug
        mkdir -p ${BUILD_DIR}
        EXTRA_CFLAGS="-g -DDEBUG"
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 wul
        ;;
    "test")
        BUILD_DIR=${WUL_HOME}/build/release
        TEST_BUILD_DIR=${BUILD_DIR}/test
        TEST_MAIN=${TEST_BUILD_DIR}/main
        mkdir -p ${TEST_BUILD_DIR}
        EXTRA_CFLAGS="-O3"
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR} TEST_BUILD_DIR=${TEST_BUILD_DIR} \
            TEAST_MAIN=${TEST_MAIN} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 test
        ${TEST_MAIN}
        ;;
    "test-debug")
        BUILD_DIR=${WUL_HOME}/build/debug
        TEST_BUILD_DIR=${BUILD_DIR}/test
        TEST_MAIN=${TEST_BUILD_DIR}/main
        mkdir -p ${TEST_BUILD_DIR}
        EXTRA_CFLAGS="-g -DDEBUG"
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR} TEST_BUILD_DIR=${TEST_BUILD_DIR} \
            TEAST_MAIN=${TEST_MAIN} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 test
        ${TEST_MAIN} --use-colour no $@
        ;;
    "clean")
        rm -rf ${WUL_HOME}/build
        ;;
    *)
        usage
        ;;
esac
