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
        build/server-mac-debug/test/test $@
        ;;

        
    *)
        usage
        ;;
esac
