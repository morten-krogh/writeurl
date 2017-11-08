set -e
set -o pipefail
set -u

usage()
{
    cat << EOF
    Available modes are:
        browser-debug
        browser-release
        writeurl-debug
        writeurl-release
        writeurl-asan
        writeurl-tsan
        test-debug
        test-release
        test-asan
        test-tsan
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

BUILD_DIR_RELEASE=${WUL_HOME}/build/release
EXTRA_CFLAGS_RELEASE="-O3"
EXTRA_LD_FLAGS_RELEASE=

BUILD_DIR_DEBUG=${WUL_HOME}/build/debug
EXTRA_CFLAGS_DEBUG="-g -DDEBUG"
EXTRA_LD_FLAGS_DEBUG=

BUILD_DIR_ASAN=${WUL_HOME}/build/asan
EXTRA_CFLAGS_ASAN="-g -DDEBUG -fsanitize=address -fno-omit-frame-pointer"
EXTRA_LD_FLAGS_ASAN="-fsanitize=address"

BUILD_DIR_TSAN=${WUL_HOME}/build/tsan
EXTRA_CFLAGS_TSAN="-g -DDEBUG -fsanitize=thread"
EXTRA_LD_FLAGS_TSAN="-fsanitize=thread"


MODE="$1"
[ $# -gt 0 ] && shift

case $MODE in
    "browser-debug")
        WUL_HOME=${WUL_HOME} ${WUL_HOME}/scripts/build-debug-browser.sh
        ;;
    "browser-release")

        ;;
    "writeurl-release")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_RELEASE} EXTRA_CFLAGS=${EXTRA_CFLAGS_RELEASE} EXTRA_LDFLAGS=${EXTRA_LD_FLAGS_RELEASE} make -j 8 writeurl
        ;;
    "writeurl-debug")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_DEBUG} EXTRA_CFLAGS=${EXTRA_CFLAGS_DEBUG} EXTRA_LDFLAGS=${EXTRA_LD_FLAGS_DEBUG} make -j 8 writeurl
        ;;
    "writeurl-asan")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_ASAN} EXTRA_CFLAGS=${EXTRA_CFLAGS_ASAN} EXTRA_LDFLAGS=${EXTRA_LD_FLAGS_ASAN} make -j 8 writeurl
        ;;
    "writeurl-tsan")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_TSAN} EXTRA_CFLAGS=${EXTRA_CFLAGS_TSAN} EXTRA_LDFLAGS=${EXTRA_LD_FLAGS_TSAN} make -j 8 writeurl
        ;;
    "test-release")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_RELEASE} EXTRA_CFLAGS=${EXTRA_CFLAGS_RELEASE} EXTRA_LDFLAGS=${EXTRA_LD_FLAGS_RELEASE} make -j 8 test
        ;;
    "test-debug")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_DEBUG} EXTRA_CFLAGS=${EXTRA_CFLAGS_DEBUG} EXTRA_LDFLAGS=${EXTRA_LD_FLAGS_DEBUG} make -j 8 test
        ;;
    "test-asan")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_ASAN} EXTRA_CFLAGS=${EXTRA_CFLAGS_ASAN} EXTRA_LDFLAGS=${EXTRA_LD_FLAGS_ASAN} make -j 8 test
        ;;
    "test-tsan")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_TSAN} EXTRA_CFLAGS=${EXTRA_CFLAGS_TSAN} EXTRA_LDFLAGS=${EXTRA_LD_FLAGS_TSAN} make -j 8 test
        ;;
    "clean")
        echo "rm -rf ${WUL_HOME}/build"
        rm -rf ${WUL_HOME}/build
        ;;
    *)
        usage
        ;;
esac
