#! /bin/bash
if [[ ! -d $1 ]]; then
    mkdir -p $1
fi

# 创建_define_.js,_define_.css
isCreateDefineJs="false"
array=(${1//\// })
for str in ${array[@]}
do
    # 拼接当前路径
    if [ $pathname ];
    then
        pathname=$pathname"/"$str
    else
        pathname=$str
    fi

    # 检测是否创建 _define_.js 和 _define_.css
    if [ $isCreateDefineJs == "false" ]; then

        if [[ -f $pathname/_define_.js ]]; then
            definepath=$pathname
            isCreateDefineJs=true
        else
            if [ ! $definepath ]; then
                definepath=$pathname
            fi
        fi

    else # 拼接loadRoute路径
        if [ $route ]; then
            route=$route"."$str
        else
            route=$str
        fi
    fi

done

echo '创建 '$definepath'/_define_.js 文件'

if [ $isCreateDefineJs = "false" ]; then


    echo '创建 '$definepath'/_define_.js 文件'
    touch $definepath/_define_.js

    echo '创建 '$definepath'/_define_.css 文件'
    touch $definepath/_define_.css

    # echo "${array[*]}"
    # echo "${#array[*]}"
    echo "${1#*/}"

    if [ ${#array[*]} -gt 1 ]; then
        echo "大于"
        loadRoute="${1#*/}"
        loadRoute=${loadRoute//\//.}.$2
    else
        loadRoute=$2
    fi

else
    echo '已经存在'$definepath'/_define_.js文件'
    if [ $route ]; then
        loadRoute=$route.$2
        # echo "loadRoute " $loadRoute
    else
        loadRoute=$2
    fi
    # echo "loadRoute " $loadRoute
fi

defineJs=${definepath}/_define_.js

# echo "defineJs " $defineJs
# echo "loadRoute " $loadRoute


# 添加加载路由代码 ecui.esr.loadRoute('xxx')
define_str=`cat $defineJs`
result=$(echo $define_str | grep "ecui.esr.loadRoute('$loadRoute')")
result1=$(echo $define_str | grep "ecui.esr.loadRoute(\"$loadRoute\")")

if [[ $result == "" && $result1 == "" ]]
then
    echo "ecui.esr.loadRoute('$loadRoute');" >> $defineJs
    echo "向文件 $defineJs 中添加 ecui.esr.loadRoute('$loadRoute')"
else
    echo "文件 $defineJs 中已经存在 ecui.esr.loadRoute('$loadRoute')"
fi


# 判断route.xxx.js是否存在，不存在则创建文件
if [[ ! -f $1/route.$2.js ]]; then
    # touch $1/layer.$2.html
    touch $1/route.$2.html
    touch $1/route.$2.js
    touch $1/route.$2.css

    # 设置初始化文件内容
    template=`cat .create-template.js`
    jsStr=${template%%\/\*\*\*route.js-end\*\*\*\/*}
    jsStr=${jsStr##*/\*\*\*route.js-begin\*\*\*/}
    jsStr=${jsStr//\{route\}/$2} 
    # $jsStr 加上引号，可以在输出到文件时保留换行符
    echo "$jsStr" >> $1/route.$2.js

    htmlStr=${template%%\/\*\*\*route.html-end\*\*\*\/*}
    htmlStr=${htmlStr##*/\*\*\*route.html-begin\*\*\*/}
    htmlStr=${htmlStr//\{route\}/$2} 
    echo "$htmlStr" >> $1/route.$2.html

    cssStr=${template%%\/\*\*\*route.css-end\*\*\*\/*}
    cssStr=${cssStr##*/\*\*\*route.css-begin\*\*\*/}
    cssStr=${cssStr//\{route\}/$2} 
    echo "$cssStr" >> $1/route.$2.css

    # layerStr=${template%%\/\*\*\*layer.html-end\*\*\*\/*}
    # layerStr=${layerStr##*/\*\*\*layer.html-begin\*\*\*/}
    # layerStr=${layerStr//\{route\}/$2} 
    # echo "$layerStr" >> $1/layer.$2.html

    # echo "初始化路由文件文件$1/layer.$2.html"
    echo "初始化路由文件文件 $1/route.$2.html"
    echo "初始化路由文件文件 $1/route.$2.js"
    echo "初始化路由文件文件 $1/route.$2.css"
else
    echo "已经存在路由文件"
fi

echo "访问路由链接: localhost/xxx/index.html#${definepath}/$loadRoute"
