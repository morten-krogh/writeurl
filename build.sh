WRITEURL_HOME="$(dirname $0)" || exit 1;
export WRITEURL_HOME
cd "$WRITEURL_HOME";

MODE="$1"
[ $# -gt 0 ] && shift

usage()
{
    cat << EOF
    Available modes are:
        build-mac-debug
        test-mac-debug
EOF
}

case $MODE in

    build-mac-debug)
        tup build/server-mac-debug
        ;;
    test-mac-debug)
        tup build/server-mac-debug
        build/server-mac-debug/test/test --use-colour no $@
        ;;


    *)
        usage
        ;;
esac
