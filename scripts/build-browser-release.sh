set -e
set -o pipefail
set -u

if ! [[ -w ${WUL_HOME} ]]
then
    echo "WUL_HOME must be set to a writable directory"
    exit 1;
fi

# The release build uses the file js/css/publish.js created
# by the debug build
${WUL_HOME}/scripts/build-browser-debug.sh

build_dir=${WUL_HOME}/build/release/browser

# remove the build directory if it exists and create an empty build directory.
[[ -d ${build_dir} ]] && rm -r ${build_dir}
mkdir -p ${build_dir}
mkdir -p ${build_dir}/img

# copy source directories
cp -R ${WUL_HOME}/img/* ${build_dir}/img

# build index.html, a unified css file, and a unified js file.

node ${WUL_HOME}/scripts/build-index-html
