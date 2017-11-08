set -e
set -o pipefail
set -u

if ! [[ -w ${WUL_HOME} ]]
then
    echo "WUL_HOME must be set to a writable directory"
    exit 1;
fi

build_dir=${WUL_HOME}/build/debug/browser

# remove the build directory if it exists and create an empty build directory.
[[ -d ${build_dir} ]] && rm -r ${build_dir}
mkdir -p ${build_dir}
mkdir -p ${build_dir}/html
mkdir -p ${build_dir}/js
mkdir -p ${build_dir}/js/css
mkdir -p ${build_dir}/css
mkdir -p ${build_dir}/img

# symbolic links to the source directories
cp -R ${WUL_HOME}/html/* ${build_dir}/html
cp -R ${WUL_HOME}/js/* ${build_dir}/js
cp -R ${WUL_HOME}/css/* ${build_dir}/css
cp -R ${WUL_HOME}/img/* ${build_dir}/img



publish_js_path=${build_dir}/js/css/publish.js
echo ${publish_js_path}
${WUL_HOME}/scripts/build-js-css.sh "${publish_js_path}"
