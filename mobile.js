//{include file=".layers.js"}//
(function () {
    window.yiche = {
        initDialog: function (container, targetName, options) {
            ecui.dispose(container);
            container.innerHTML = ecui.esr.getEngine().render(targetName, options);
            ecui.init(container);
            return container.children[0].getControl();
        },
        baseInfo: {},
        baseInfoMap: {},
        ui: {},
        wx: {},
        iframeReady: {},
        info: {
            position: {
                longitude: 116.357114,
                latitude: 39.965134
            }
        },
        util: {
            initSocket: function () {
                if (socket) {
                    socket.close();
                }
                socket = ecui.io.openSocket(
                    //{if $prev}//'ws.oa.bitauto.com/barrage-api/barrage',
                    //{else}//
                    't.yinyueapp.com/erp-management/ws/notice/' + yiche.staffInfo.staffId,
                    //{/if}//
                    function (data) {
                        if (!(data instanceof Object)) {
                            return;
                        }
                        // type === 1 时是 消息数量
                        if (data.type === 1) {
                        // type === 2 时是签到人数信息
                            var navTab = ecui.get('navTab'),
                                approveListTab = ecui.get('approve-list-tab');
                            if (navTab) {
                                var count = dom.first(dom.first(navTab.getItem(0).getMain()));
                                if (data.content.newsCount) {
                                    count.innerHTML = data.content.newsCount > 99 ? '99+' : data.content.newsCount;
                                    dom.removeClass(count, 'ui-hide');
                                } else {
                                    count.innerHTML = '';
                                    dom.addClass(count, 'ui-hide');
                                }
                            }
                            if (approveListTab) {
                                dom.first(approveListTab.getItem(0).getBody()).innerHTML = '待我审批的(' + data.content.approvalCount + ')';
                            }
                        } else if (data.type === 2) {
                        // type === 3 节目流程
                        } else if (data.type === 3) {
                            // 设置当前正在进行节目
                        // type === 4 节目点赞数量
                        } else if (data.type === 4) {
                            // 设置点赞数量
                        }
                    }.bind(this),
                    function () {
                        this.tip('error');
                    }.bind(this),
                    {}
                );
            },
            // createStyle: function (cssText) {
            //     var el = document.getElementById('createStyle');
            //     if (!el) {
            //         el = document.createElement('STYLE');
            //         el.setAttribute('id', 'createStyle');
            //         document.head.appendChild(el);
            //     }
            //     el.setAttribute('type', 'text/less');
            //     if (ecui.ie < 10) {
            //         var reg = ecui.ie > 6 ? new RegExp('[_' + (ecui.ie > 7 ? '\\*\\+' : '') + ']\\w+:[^;}]+[;}]', 'g') : null;
            //         if (reg) {
            //             cssText = cssText.replace(reg, function (match) {
            //                 return match.slice(-1) === '}' ? '}' : '';
            //             });
            //         }
            //         el.setAttribute('lessText', cssText);
            //     } else {
            //         el.innerHTML = cssText;
            //     }
            //     window.less.refresh(true, undefined, false);
            // },
            // createTarget: function (htmlText) {
            //     var name = 'mobile_' + Date.now() + Math.round(Math.random() * 10000);
            //     // data = data.replace(/<!--\s*target:\s*([^>]+)-->/g, '<!-- target: ' + filename.slice(0, index + 1) + '$1 -->');
            //     // ecui.esr.getEngine(moduleName).compile(data.replace(/ui="type:NS\./g, 'ui="type:ecui.ns._' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '.ui.'));
            //     htmlText = ecui.util.stringFormat('<!-- target:{0} -->\n', name) + htmlText;
            //     /(\/.+\/)/.test(ecui.esr.getLocation());
            //     var moduleName = RegExp.$1.replace(/\//g, '.');
            //     ecui.esr.getEngine().compile(htmlText.replace(/ui="type:NS\./g, 'ui="type:ecui.ns._' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '.ui.'));
            //     console.log(moduleName, ecui.esr.getEngine().targets);
            //     return name;
            // },
            // createScript: function (scriptText) {
            //     var el = document.getElementById('createScript');
            //     if (!el) {
            //         el = document.createElement('SCRIPT');
            //         el.setAttribute('id', 'createScript');
            //         el.innerHTML = scriptText;
            //         document.head.appendChild(el);
            //     }
            //     return name;
            // },
            // changeTarget: function (target) {
            //     var routeName = ecui.esr.getLocation().split('~')[0];
            //     console.log(routeName);
            //     ecui.esr.getRoute(routeName).routeView = target;
            //     ecui.esr.redirect(routeName);
            // },
            // callRoute: function (routeName, target) {
            //     ecui.esr.getRoute(routeName).routeView = target;
            //     ecui.esr.redirect(routeName);
            // }
        }
    };

    var location_lon = '',location_lat = ''; // 经度,纬度
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function (position) {
            location_lon = position.coords.longitude;
            location_lat = position.coords.latitude;
            Object.assign(yiche.info.position, {
                longitude: position.coords.longitude,
                latitude: position.coords.latitude
            });
            console.log('h5经度：'+location_lon + '  h5纬度：'+location_lat);
        },function (e) {
            console.log(arguments);
        });
    }else {
        console.log("您的设备不支持定位功能");
    }
    var dom = ecui.dom;
    var socket;

    // 设置h5与后端请求的token，一般登录成功后 存进了 本地浏览器或原生APPwebview的localStorage
    //{if 1}//ecui.esr.headers = {};
    //{else}//
    ecui.esr.headers = {};
    //{/if}//
    //统一对请求成功返回参数做分类
    ecui.esr.onparsedata = function (url, data) {
        if (data.data.pageNo !== undefined && data.data.total === undefined &&  data.data.offset === undefined) {
            data.data.total = data.data.totalRecord;
            data.data.offset = data.data.pageSize * (data.data.pageNo - 1);
        }
        var code = data.code;
        if (0 === code) {
            data = data.data;
            return data;
        }
        if (code === 12011) {
            // 分支3.4：登录相关的错误
            //{if $prev}//window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=http%3A%2F%2Fu.yiche-livehouse.com/yichelive-app-c/bind.html&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
            //{else}//window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=http%3A%2F%2Ft.yinyueapp.com/yichelive-app-c/bind.html&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
            //{/if}//
        } else {
            if (code === 300000) {
                throw data.msg;
            }
            if (code !== 500016) {
                // 淘车拍同步接口，该code表示，需要弹dialog去编辑，不弹提示
                ecui.tip('error', data.msg);
            }
        }
        return code;
    };
    var iosVersion = /(iPhone|iPad).+OS (\d+)/i.test(navigator.userAgent) ?  +(RegExp.$2) : undefined;
    var textReady = ecui.ui.Text.prototype.$ready;
    ecui.ui.Text.prototype.$ready = function () {
        textReady.call(this);
        this.getInput().setAttribute('autocomplete', 'off');
    };
    ecui.esr.onexception = function (e) {
        console.error(e);
        ecui.esr.setGlobal('noNetwork', true);
        ecui.tip('warn', '请检查您的网络连接');
    };
    // 定义index单页应用下的全局对象，主要用来提供本项目的特有控件等
    ecui.ui.MCalendar.prototype.getFormValue = function () {
        return this.getValue() ? new Date(this.getValue()).pattern('yyyy-MM-dd HH:mm:ss') : '';
    };
    etpl.addFilter('dateFormat', function (value, format) {
        return value ? new Date(isNaN(Number(value)) ? value : Number(value)).pattern(format) : '';
    });
    etpl.addFilter('parseDefault', function (value, detault) {
        return value || detault;
    });
    etpl.addFilter('parseBaseInfo', function (value, nameSpace) {
        return value === undefined ? '--' : yiche.baseInfoMap[nameSpace][value.toString()] || '--';
    });
    etpl.addFilter('stringify', function (value) {
        return JSON.stringify(value);
    });
    etpl.addFilter('parseRegion', function (value) {
        return ecui.ui.BCities.prototype.getCity(value.toString(), yiche.cities).join(' - ');
    });

    etpl.addFilter('toFixed', function (value, digit) {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toFixed(digit === 0 ? 0 : 2);
    });

    /**
    * 根据基础字体大小 和 效果图宽度设置 根节点字体大小
    * @param baseFontSize 浏览器默认字体大小 [注]浏览器最小字体为12像素，所以该值必需大于等于12
    * @param baseWidth 设计稿的尺寸
    */
    function initFontSize(baseFontSize, baseWidth) {
        // 获取当前屏幕宽度
        var clientWidth = document.documentElement.clientWidth || window.innerWidth;
        // 根据宽度计算根节点字体大小
        var size =  clientWidth / baseWidth * baseFontSize;
        document.querySelector('html').style.fontSize = size + 'px';
    }
    //初始化 字体100px , 设计稿宽640px
    initFontSize(75, 750);
    // 窗口大小改变时设置根节点字体大小，通过字体大小来控制页面元素尺寸的缩放
    window.addEventListener('resize', initFontSize);

    /**
     * 权限验证
     * @private
     * @example
     * <input ui="type:input-control;ext-permission:aa||bb"> 判断两个是否有其中一个，有任何一个则显示
     * <li class="person-city" ui="ext-permission:system:read;">
            <a href="#operation.city">区域管理</a>
       </li>
     **/
    ecui.ext.permission = {
        constructor: function (value) {
            // 权限列表
            var permCodes = yiche.baseInfo.permission.permCodes;

            var array = value.split('||'),
                flag = false;
            array.forEach(function (item) {
                if (permCodes.indexOf(item) >= 0) {
                    flag = true;
                }
            });
            if (!flag) {
                this.hide();
            }
        }
    };
    ecui.esr.onready = function () {
        // target名字冲突时的处理策略设置，override 表示 target 重名时 覆盖现有 target
        etpl.config({
            namingConflict: 'override'
        });
        // 对单个路由，配置target名字冲突时的处理策略
        // context.engine.options.namingConflict = 'override';
        ecui.dom.getParent = ecui.dom.parent;
        Object.assign = Object.assign;
        ecui.ext.esr = ecui.ext.data;
        ecui.triggerEvent = ecui.dispatchEvent;

        // 设置 默认路由
        ecui.esr.DEFAULT_PAGE = '/preview/page.m-example';

        yiche.cities = ecui.ui.BCities.prototype.CITIES;
        ecui.ui.$AbstractSelect.prototype.TEXTNAME = 'code';
        ecui.render = {};
        ecui.render.select = function (data) {
            this.removeAll(true);
            this.add(data);
        };
        return {
            model: [
                //{if 0}//'weixin@GET /wechat/weixin/openid?code=' + CODE, //{/if}//
                // 'baseInfo@GET /wechat/base/info',
                // 'index@JSON /wechat/index?${position}',
                // // 'index@JSON /wechat/index?latitude=${position.latitude}&longitude=${position.longitude}',
                // 'userInfo@GET /wechat/base/user-info',
                // 'venues@GET /erp-management/venue/select-list-all',
                // 'venuearea@GET /erp-management/venue/select-area-venue',
                // 'permission@GET /erp-management/permission/perm-code',
                // 'staffInfo@GET /erp-management/staff/personal/info'
            ],
            children: {
                onbeforerender: function (context) {
                    ecui.delegate('navTab', null, function () {
                        var navTab = ecui.get('navTab');
                        var count = dom.first(dom.first(navTab.getItem(0).getMain()));
                        if (context.unreadCount.count) {
                            count.innerHTML = context.unreadCount.count > 99 ? '99+' : context.unreadCount.count;
                            dom.removeClass(count, 'ui-hide');
                        } else {
                            count.innerHTML = '';
                            dom.addClass(count, 'ui-hide');
                        }
                    });
                }
            },
            onbeforerequest: function (context) {
            },
            onbeforerender: function (context) {

                // yiche.util.initSocket();
            }
        };
    };
    // document.write('<script type="text/javascript" src="_include/index.controls.js"></script>');
    document.write('<script type="text/javascript" src="_include/index.common.js"></script>');
    document.write('<script type="text/javascript" src="_include/index.h5-control.js"></script>');

}());
