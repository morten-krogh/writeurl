set -e
set -o pipefail
set -u

if ! [[ -w ${WUL_HOME} ]]
then
    echo "WUL_HOME must be set to a writable directory"
    exit 1;
fi

if [ "$#" != 1 ]
then
    echo "Usage: $0 dest"
    exit 1
fi

css_dir=${WUL_HOME}/css
wu_format_path="${css_dir}/wu-format.css"
publish_path=${css_dir}/publish.css

content=`cat $wu_format_path`$'\n'`cat $publish_path`$'\n'

# escape ' for the javascript string
content=${content//\'/\\\'}

# escape newline with \n
content=${content//$'\n'/\\n}

output="'use strict';"$'\n\n'"nbe.css.publish = '${content}';"

printf "%s" "$output" > $1
