text="server {
    listen       7070;
    server_name  localhost;

    location / {
        root ${WRITEURL_HOME}/html;
        try_files \$uri /index.html =404;
    }

    location /embed {
        root ${WRITEURL_HOME}/html;
        try_files \$uri /embed/index.html =404;
    }

    location /serviceworker.js {
        root ${WRITEURL_HOME}/js;
    }

    location /favicon.ico {
        root ${WRITEURL_HOME}/img;
    }

    location ~ ^/(css|js|img)/ {
        root ${WRITEURL_HOME};
    }

    location /publish/ {
        rewrite ^/publish/(.*)$ /\$1.html break;
        root ${WRITEURL_DATA}/publish;
    }

	location /operations {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection Upgrade;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /xhr {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host \$http_host;
    }
}"

echo "${text}" > writeurl.conf
