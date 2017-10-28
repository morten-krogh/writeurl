set -e
set -o pipefail
set -u

usage()
{
    cat << EOF
    Available modes are:
        build
        build-debug
        build-writeurl-debug
        test
        clean
EOF
}

dir="$(dirname $0)" || exit 1;
cd "$dir" || exit 1;
WURL_HOME="$(pwd)" || exit 1;
export WURL_HOME

if [ "$#" == 0 ]
then
    usage
    exit 1
fi

MODE="$1"
[ $# -gt 0 ] && shift


case $MODE in

    "build")
        BUILD_DIR=${WURL_HOME}/build/release
        mkdir -p ${BUILD_DIR}
        EXTRA_CFLAGS="-O3"
        WURL_HOME=${WURL_HOME} BUILD_DIR=${BUILD_DIR} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 static_lib
        ;;
    "build-debug")
        BUILD_DIR=${WURL_HOME}/build/debug
        mkdir -p ${BUILD_DIR}
        EXTRA_CFLAGS="-g -DDEBUG"
        WURL_HOME=${WURL_HOME} BUILD_DIR=${BUILD_DIR} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 static_lib
        ;;
    "build-writeurl-debug")
        BUILD_DIR=${WURL_HOME}/build/debug
        mkdir -p ${BUILD_DIR}
        EXTRA_CFLAGS="-g -DDEBUG"
        WURL_HOME=${WURL_HOME} BUILD_DIR=${BUILD_DIR} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 writeurl
        ;;
    "test")
        BUILD_DIR=${WURL_HOME}/build/release
        TEST_BUILD_DIR=${BUILD_DIR}/test
        TEST_MAIN=${TEST_BUILD_DIR}/main
        mkdir -p ${TEST_BUILD_DIR}
        EXTRA_CFLAGS="-O3"
        WURL_HOME=${WURL_HOME} BUILD_DIR=${BUILD_DIR} TEST_BUILD_DIR=${TEST_BUILD_DIR} \
            TEAST_MAIN=${TEST_MAIN} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 test
        ${TEST_MAIN}
        ;;
    "test-debug")
        BUILD_DIR=${WURL_HOME}/build/debug
        TEST_BUILD_DIR=${BUILD_DIR}/test
        TEST_MAIN=${TEST_BUILD_DIR}/main
        mkdir -p ${TEST_BUILD_DIR}
        EXTRA_CFLAGS="-g -DDEBUG"
        WURL_HOME=${WURL_HOME} BUILD_DIR=${BUILD_DIR} TEST_BUILD_DIR=${TEST_BUILD_DIR} \
            TEAST_MAIN=${TEST_MAIN} EXTRA_CFLAGS=${EXTRA_CFLAGS} make -j 8 test
        ${TEST_MAIN} --use-colour no $@
        ;;
    "clean")
        rm -rf ${WURL_HOME}/build
        ;;
    *)
        usage
        ;;
esac
