set -e
set -o pipefail
set -u

usage()
{
    cat << EOF
    Available modes are:
        libwriteurl
        libwriteurl-debug
        writeurl-server
        writerul-server-debug
        test
        test-debug
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

EXTRA_CFLAGS_RELEASE="-O3"
EXTRA_CFLAGS_DEBUG="-g -DDEBUG"

BUILD_DIR_RELEASE=${WUL_HOME}/build/release
mkdir -p ${BUILD_DIR_RELEASE}

BUILD_DIR_DEBUG=${WUL_HOME}/build/debug
mkdir -p ${BUILD_DIR_DEBUG}

MODE="$1"
[ $# -gt 0 ] && shift

case $MODE in

    "libwriteurl")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_RELEASE} EXTRA_CFLAGS=${EXTRA_CFLAGS_RELEASE} make -j 8 libwriteurl
        ;;
    "libwriteurl-debug")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_DEBUG} EXTRA_CFLAGS=${EXTRA_CFLAGS_DEBUG} make -j 8 libwriteurl
        ;;
    "writeurl-server")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_RELEASE} EXTRA_CFLAGS=${EXTRA_CFLAGS_RELEASE} make -j 8 writeurl-server
        ;;
    "writeurl-server-debug")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_DEBUG} EXTRA_CFLAGS=${EXTRA_CFLAGS_DEBUG} make -j 8 writeurl-server
        ;;
    "test")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_RELEASE} EXTRA_CFLAGS=${EXTRA_CFLAGS_RELEASE} make -j 8 test
        ;;
    "test-debug")
        WUL_HOME=${WUL_HOME} BUILD_DIR=${BUILD_DIR_DEBUG} EXTRA_CFLAGS=${EXTRA_CFLAGS_DEBUG} make -j 8 test
        ;;
    "clean")
        echo "rm -rf ${WUL_HOME}/build"
        rm -rf ${WUL_HOME}/build
        ;;
    *)
        usage
        ;;
esac
