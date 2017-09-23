set -e
set -o pipefail
set -u

usage()
{
    cat << EOF
    Available modes are:
        build
        build-debug
        test
        clean
EOF
}

dir="$(dirname $0)" || exit 1;
cd "$dir" || exit 1;
WRITEURL_HOME="$(pwd)" || exit 1;
export WRITEURL_HOME

if [ "$#" == 0 ]
then
    usage
    exit 1
fi

MODE="$1"
[ $# -gt 0 ] && shift


case $MODE in

    "build")
        BUILD_DIR=${WRITEURL_HOME}/build/release
        mkdir -p ${BUILD_DIR}
        EXTRA_CFLAGS="-O3"
        WRITEURL_HOME=${WRITEURL_HOME} BUILD_DIR=${BUILD_DIR} EXTRA_CFLAGS=${EXTRA_CFLAGS} make static_lib
        ;;
    "build-debug")
        BUILD_DIR=${WRITEURL_HOME}/build/debug
        mkdir -p ${BUILD_DIR}
        EXTRA_CFLAGS="-g -DDEBUG"
        WRITEURL_HOME=${WRITEURL_HOME} BUILD_DIR=${BUILD_DIR} EXTRA_CFLAGS=${EXTRA_CFLAGS} make static_lib
        ;;
    "test")
        BUILD_DIR=${WRITEURL_HOME}/build/release
        TEST_BUILD_DIR=${BUILD_DIR}/test
        TEST_MAIN=${TEST_BUILD_DIR}/main
        mkdir -p ${TEST_BUILD_DIR}
        EXTRA_CFLAGS="-O3"
        WRITEURL_HOME=${WRITEURL_HOME} BUILD_DIR=${BUILD_DIR} TEST_BUILD_DIR=${TEST_BUILD_DIR} \
            TEAST_MAIN=${TEST_MAIN} EXTRA_CFLAGS=${EXTRA_CFLAGS} make test
        ${TEST_MAIN} --use-colour no $@
        ;;
    "test-debug")
        BUILD_DIR=${WRITEURL_HOME}/build/debug
        TEST_BUILD_DIR=${BUILD_DIR}/test
        TEST_MAIN=${TEST_BUILD_DIR}/main
        mkdir -p ${TEST_BUILD_DIR}
        EXTRA_CFLAGS="-g -DDEBUG"
        WRITEURL_HOME=${WRITEURL_HOME} BUILD_DIR=${BUILD_DIR} TEST_BUILD_DIR=${TEST_BUILD_DIR} \
            TEAST_MAIN=${TEST_MAIN} EXTRA_CFLAGS=${EXTRA_CFLAGS} make test
        ${TEST_MAIN} --use-colour no $@
        ;;
    "clean")
        rm -rf ${WRITEURL_HOME}/build
        ;;
    *)
        usage
        ;;
esac
