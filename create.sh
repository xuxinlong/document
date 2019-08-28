# !/bin/bash
function create() {
    if [[ ! -d $module ]]; then
        mkdir -p $module
    fi

    # 创建_define_.js,_define_.css
    isCreateDefineJs="false"
    array=(${module//\// })
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

    # echo '创建 '$definepath'/_define_.js 文件'

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
            loadRoute=${loadRoute//\//.}.$routeName
        else
            loadRoute=$routeName
        fi

    else
        echo '已经存在'$definepath'/_define_.js文件'
        if [ $route ]; then
            loadRoute=$route.$routeName
            # echo "loadRoute " $loadRoute
        else
            loadRoute=$routeName
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
    if [[ ! -f $module/route.$routeName.js ]]; then
        if [ $h5 ]; then
            touch $module/layer.$routeName.html
        fi
        touch $module/route.$routeName.html
        touch $module/route.$routeName.js
        touch $module/route.$routeName.css

        if [ $h5 ]; then
            layerStr=${template%%\/\*\*\*layer.html-end\*\*\*\/*}
            layerStr=${layerStr##*/\*\*\*layer.html-begin\*\*\*/}
            layerStr=${layerStr//\{route\}/$routeName} 
            echo "$layerStr" >> $module/layer.$routeName.html
        fi

        # 设置初始化文件内容
        template=`cat .create-template.js`
        jsStr=${template%%\/\*\*\*route.js-end\*\*\*\/*}
        jsStr=${jsStr##*/\*\*\*route.js-begin\*\*\*/}
        jsStr=${jsStr//\{route\}/$routeName} 
        # $jsStr 加上引号，可以在输出到文件时保留换行符
        echo "$jsStr" >> $module/route.$routeName.js

        htmlStr=${template%%\/\*\*\*route.html-end\*\*\*\/*}
        htmlStr=${htmlStr##*/\*\*\*route.html-begin\*\*\*/}
        htmlStr=${htmlStr//\{route\}/$routeName} 
        echo "$htmlStr" >> $module/route.$routeName.html

        cssStr=${template%%\/\*\*\*route.css-end\*\*\*\/*}
        cssStr=${cssStr##*/\*\*\*route.css-begin\*\*\*/}
        cssStr=${cssStr//\{route\}/$routeName} 
        echo "$cssStr" >> $module/route.$routeName.css

        if [ $h5 ]; then
            echo "初始化路由文件文件$module/layer.$routeName.html"
        fi
        echo "初始化路由文件文件 $module/route.$routeName.html"
        echo "初始化路由文件文件 $module/route.$routeName.js"
        echo "初始化路由文件文件 $module/route.$routeName.css"
    else
        echo "已经存在路由文件"
    fi

    echo "访问路由链接: localhost/xxx/index.html#${definepath}/$loadRoute"

}
usage_str=`cat <<EOF
ECUI 路由创建工具
    -p    添加一个路由
          语法格式: sh ./create.sh -p 路径  路由名
          

    -m    创建移动端h5模块路由
    
    -h    帮助，查看使用方法

使用示例：
    cd进入到项目中 create.sh 文件所在目录

    sh ./create.sh info/car list

    PS：
    命令执行后，会在 当前目录下创建 info/car/rote.list.js info/car/rote.list.html info/car/rote.list.css 文件

    在info目录以及子目录下，如果没有 _define_.js 文件，向 _define_.js 文件中添加 ecui.esr.loadRoute('list')
    如果没有 _define_.js 文件，则会在info目录下创建info/_define_.js和info/_define_.css 并向 _define_.js 文件中添加 ecui.esr.loadRoute('list')

    向文件 $defineJs 中添加 ecui.esr.loadRoute('$loadRoute')


    如果带上参数 -m

    sh ./create.sh -m info/car list

    会在当前目录下多创建一个 info/car/layer.html 文件

EOF
`
function usage() {
    echo "$usage_str"
}

# echo $@
while getopts 'mph' OPT; do
    case $OPT in
        m)
            # 文件夹
            hasopts=1
            # echo 'm: '$2
            h5=1
            module=$2
            routeName=$3
            ;;
        p)
            hasopts=1
            # echo 'p: '$2
            module=$2
            routeName=$3
            ;;
        h)
            not_create=1
            hasopts=1
            # echo 'h: '$2
            usage
            ;;
        ?)
            not_create=1
            hasopts=1
            # echo '无参数'
            module=$2
            routeName=$3
            usage
            ;;
    esac
done

if [[ $hasopts != 1 ]]; then
    module=$1
    routeName=$2
fi
# echo "h5: $h5    module: $module    routeName: $routeName   hasopts: $hasopts "

if [[ $not_create != 1 ]]; then
    create
fi
