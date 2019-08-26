#!/bin/sh
cd ..
./ECUI/build.sh doc

scp doc.tar.gz root@172.20.4.61:/usr/share/nginx/html/fe-doc

# rm -rf doc.tar.gz
echo ' 服务器处理 '
ssh root@172.20.4.61 << eeooff
    if [ ! -d '/usr/share/nginx/html/fe-doc' ]
    then
        mkdir -p /usr/share/nginx/html/fe-doc
    fi

    cd /usr/share/nginx/html/fe-doc
    rm -rf doc/*
    mv doc.tar.gz doc/doc.tar.gz

    cd doc
    tar -zxf doc.tar.gz
    rm -rf doc.tar.gz

    exit 
eeooff
echo Finished: SUCCESS!
