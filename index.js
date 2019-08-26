(function () {
    Date.prototype.pattern = function (fmt) {
        var o = {
            'M+': this.getMonth() + 1, //月份
            'd+': this.getDate(), //日
            'h+': this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, //小时
            'H+': this.getHours(), //小时
            'm+': this.getMinutes(), //分
            's+': this.getSeconds(), //秒
            'q+': Math.floor((this.getMonth() + 3) / 3), //季度
            'S': this.getMilliseconds() //毫秒
        };
        var week = ['日', '一', '二', '三', '四', '五', '六'];
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear().toString()).substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[this.getDay()]);
        }
        for (var k in o) {
            if (o.hasOwnProperty(k) && new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(o[k].toString().length)));
            }
        }
        return fmt;
    };
    var ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
    function onkeydown(event) {
        var tags = ['INPUT', 'TEXTNAME', 'BUTTON', 'SUBMIT'];
        var target = event.target || event.srcElement.tagName;
        if (event.keyCode === 8 && tags.indexOf(target.tagName) < 0) {
            event.keyCode = 0;
            event.returnValue = false;
            return false;
        }
    }
    if (ieVersion < 9) {
        document.attachEvent('onkeydown', onkeydown);
    } else {
        window.addEventListener('keydown', onkeydown);
    }
    window.yiche = {
        'cities': ecui.ui.BCities.prototype.CITIES,
        info: {
            budgetYears: [],
            permissionList: [],
            tabpermission: ['', 'it.fixed', 'it.physical', 'it.other', 'admin.fixed', 'admin.physical', 'admin.low', 'it.parts'],
            now: new Date().pattern('yyyy-MM-dd')
        },
        ui: {},
        util: {
            /**
             * 获取单签导航栏的 有权访问的第一个链接地址
             * @public
             *
             * @param {string} prefixUrl url前缀
             * @param {string} prefixPermission 权限名前缀
             */
            parseNavLink: function (prefixUrl, prefixPermission) {
                var detault = ' javascript: void(0);';
                var arr = [
                    {
                        url: 'storage',
                        permission: 'storeList'
                    },
                    {
                        url: 'allot',
                        permission: 'allocateList'
                    },
                    {
                        url: 'waitScrap',
                        permission: 'scrapingList'
                    },
                    {
                        url: 'scrap',
                        permission: 'scrapedList'
                    },
                    {
                        url: 'borrow',
                        permission: 'borrowList'
                    }
                ];
                for (var i = 0, item; item = arr[i++]; ) {
                    if (yiche.info.permissionList.indexOf(prefixPermission + '.' + item.permission) >= 0) {
                        return prefixUrl + '.' + item.url;
                    }
                }
                return detault;
            },
            /**
             * 获取当前 dom/control 所属路由。
             * @public
             *
             * @param {Element | Control} el 当前元素
             */
            getRoute: function (el) {
                var route,
                    parent = ecui.dom.parent(el instanceof ecui.ui.Control ? el.getMain() : el);
                for (; parent; parent = ecui.dom.parent(parent)) {
                    if (parent === document.body) {
                        break;
                    }
                    if (parent.route !== undefined) {
                        route = parent.route;
                        break;
                    }
                }
                return route;
            },
            /**
             * 将带 <br/> 的字符串 通过<br/> 分割成数组。
             * @public
             *
             * @param {String} value 带 <br/> 的字符串
             */
            parseBR: function (value) {
                return value.split('<br/>');
            },
            /**
             * 移除并释放已打开的dialog控件，用于离开路由时调用
             * @public
             *
             */
            removeDialog: function () {
                var dialogContainer = ecui.$('dialogContainer'),
                    dialogContainer_1 = ecui.$('dialogContainer_1'),
                    dialogContainer_2 = ecui.$('dialogContainer_2');
                if (dialogContainer) {
                    ecui.dispose(dialogContainer);
                    dialogContainer.innerHTML = '';
                }
                if (dialogContainer_2) {
                    ecui.dispose(dialogContainer_1);
                    dialogContainer_1.innerHTML = '';
                }
                if (dialogContainer_2) {
                    ecui.dispose(dialogContainer_2);
                    dialogContainer_2.innerHTML = '';
                }
            },
            /**
             * 资产列表页面路由 将请求的数据 存储在全局变量上
             * @public
             *
             * @param {object} context route上下文
             */
            setStorageModelFn: function (context) {
                yiche.info.types = context.types;
                yiche.info.kinds = context.kinds;
                yiche.info.brands = context.brands;
                yiche.info.suppliers = context.suppliers;
                yiche.info.companys = context.companys;
                yiche.info.offices = context.offices;
            }
        },

        /**
         * 获取code的省市区字符串
         * @public
         *
         * @param {Number|string} code Element 对象
         * @param {Object} city_data 省市区code码map集合
         * @return {Array} 省市区字符串数组
         */
        getCity: function (code, city_data) {
            if (code === 0) {
                return [' '];
            }
            code = code.toString();
            var pro = code.slice(0, 2) + '0000',
                city = code.slice(0, 4) + '00',
                area = code.slice(0, 6),
                arr = [];
            arr.push(city_data[pro]);
            if (code.slice(2, 4) !== '00') {
                arr.push(city_data[city] || '');
            }
            if (code.slice(4, 6) !== '00') {
                arr.push(city_data[area] || '');
            }
            return arr;
        },

        /**
         * 信息提示框
         * @public
         *
         * @param {string} type 信息类型 successHint： 成功， errorHint： 失败， warnHint： 警告
         * @param {string} msg 提示内容
         * @param {number} dely 信息展示时间，n秒后自动关闭，单位：ms
         */
        showHint: function (type, msg) {
            var className = {
                success: 'successHint',
                error: 'errorHint',
                warn: 'warnHint'
            }[type];
            var hintContainer = ecui.$('hintContainer') || ecui.dom.create({id: 'hintContainer'});
            ecui.dom.removeClass(hintContainer, 'ui-hide');
            hintContainer.innerHTML = ecui.util.stringFormat('<div class="{0}">{1}</div>', className, msg);
            ecui.dom.insertAfter(hintContainer, ecui.dom.last(document.body));
            ecui.util.timer(function () {
                ecui.dom.addClass(hintContainer, 'ui-hide');
            }, 2000);
        },
        /**
         * 初始化dialog控件。
         * @public
         *
         * @param {string|Element} container dialog控件容器
         * @param {string} targetName 模板名称
         * @param {object} options 成功回调函数
         *
         * @return {Control} dialog 控件
         */
        initDialog: function (container, targetName, options) {
            if (typeof container === 'string') {
                container = ecui.$(container);
            }
            ecui.dispose(container);
            container.innerHTML = ecui.esr.getEngine().render(targetName, options);
            ecui.init(container);
            return container.children[0].getControl();
        },
        /**
         * post方式的ajax请求，传参方式使用url传参。
         * @public
         *
         * @param {string} url 请求地址
         * @param {object} data 请求参数
         * @param {function} onsuccess 成功回调函数
         * @param {function} onsuccess 失败回调函数
         *
         */
        postRequest: function (url, data, onsuccess, onerror) {
            // var param = [];
            // for (var key in data) {
            //     if (data.hasOwnProperty(key)) {
            //         param.push(key + '=' + data[key]);
            //     }
            // }
            // if (param.length > 0) {
            //     if (url.indexOf('?') < 0) {
            //         url += '?';
            //     }
            //     url += param.join('&');
            // }
            if (!ecui.esr.headers) {
                ecui.esr.headers = {};
            }
            ecui.esr.onbeforerequest();
            ecui.io.ajax(url, {
                method: 'post',
                headers: Object.assign({}, ecui.esr.headers, { 'Content-Type': 'application/json;charset=UTF-8' }),
                data: JSON.stringify(data),
                onsuccess: function (text) {
                    try {
                        ecui.esr.onafterrequest();
                        var data = JSON.parse(text);
                        data = ecui.esr.onparsedata ? ecui.esr.onparsedata(url, data) : data.data;
                        onsuccess(data);
                    } catch (e) {
                        console.warn(e);
                    }
                },
                onerror: function () {
                    ecui.esr.onafterrequest();
                    onerror();
                }
            });
        }
    };

    /* 自定义etpl过滤器 - begin */

    /*定义etpl过滤器
     *
     *addFilter参数
     *{string}name - 过滤器名称
     *{Function}filter - 过滤函数
     */
    etpl.addFilter('stringify', function (value) {
        return JSON.stringify(value || {});
    });
    etpl.addFilter('parseRegion', function (value) {
        return yiche.getCity(value.toString(), yiche.cities).join(' - ');
    });
    etpl.addFilter('parseCity', function (value) {
        return yiche.getCity(value.toString(), yiche.cities)[1];
    });
    etpl.addFilter('toFixed', function (value, divisor, fixedNum) {
        return (Number(value) / divisor).toFixed(fixedNum);
    });
    // 根据 code 从 baseInfoMap 中解析数据
    etpl.addFilter('parseBaseInfo', function (value, nameSpace) {
        return yiche.info.baseInfoMap[nameSpace][value.toString()] || '--';
    });
    //数据为空时用 --代替
    etpl.addFilter('parseNone', function (value) {
        return value || '--';
    });
    // 时间转换过滤器
    etpl.addFilter('dateFormat', function (value, format) {
        return value ? new Date(Number(value)).pattern(format) : '';
    });
    //数据为空时用 --代替
    etpl.addFilter('default', function (value) {
        return value || '--';
    });

    /* 自定义etpl过滤器 - end */

    /**
     * request请求前处理函数。
     * @public
     *
     */
    ecui.esr.onbeforerequest = function () {
        ecui.dom.addClass(document.body, 'ui-loading');
    };

    /**
     * request请求后处理函数。
     * @public
     *
     */
    ecui.esr.onafterrequest = function () {
        ecui.dom.removeClass(document.body, 'ui-loading');
    };

    /**
     * esr执行异常处理函数。
     * @public
     *
     * @param {object} e 异常对象
     *
     */
    ecui.esr.onexception = function (e) {
        console.warn(e);
    };

    /**
     * request请求结果统一处理函数
     * @public
     *
     * @param {string} url 请求地址
     * @param {object} data 请求参数
     *
     * @return {Object|numer} data.code为0时，返回 data.data ，否则返回 data.code
     */
    ecui.esr.onparsedata = function (url, data) {
        var code = data.code;
        if (0 === code) {
            return data.data;
        }
        if (code === 10302) {
            location.href = data.data;
            return;
        } else if (code === 12011) {
            ecui.esr.headers['x-access-token'] = '';
            window.location = './login.html';
        } else if (code === 12012) {
            // ecui.tip('error', data.msg);
            ecui.esr.redirect((ecui.esr.DEFAULT_PAGE));
        } else {
            if (code === 300000) {
                throw data.msg;
            }
            if (code !== 500016) {
                // ecui.tip('error', data.msg);
            }
        }
        return data.code;
    };

    /**
     * esr加载完毕后执行函数
     * @public
     *
     */
    ecui.esr.onready = function () {
        ecui.esr.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'customReferer': window.location.href
        };
        // 配合后端重定向，地址栏地址改变时，将 location.href 更新到请求头的 customReferer 字段
        ecui.dom.addEventListener(window, 'hashchange', function () {
            ecui.esr.headers.customReferer = window.location.href;
        });
        ecui.util.extend = Object.assign;
        // 设置 默认路由
        ecui.esr.DEFAULT_PAGE = '/index';
        // 设置 选项控件的文本在 options 中的名称
        ecui.ui.$AbstractSelect.prototype.TEXTNAME = 'code';

        // text输入框 禁用输入历史记录
        var textReady = ecui.ui.Text.prototype.$ready;
        ecui.ui.Text.prototype.$ready = function (event) {
            this.getInput().setAttribute('autocomplete', 'off');
            textReady.call(this, event);
        };
        // combox输入框 禁用输入历史记录
        var comboxReady = ecui.ui.Combox.prototype.$ready;
        ecui.ui.Combox.prototype.$ready = function (event) {
            this.getInput().setAttribute('autocomplete', 'off');
            this._eTextInput.setAttribute('autocomplete', 'off');
            comboxReady.call(this, event);
            ecui.util.timer(function () {
                ecui.setFocused();
                ecui.dispatchEvent(this, 'blur');
            }.bind(this), 100);
        };

        return {
            model: [
                /* 调用公共数据接口 - begin */

                /* 调用公共数据接口 - end */
            ],
            main: 'main',
            view: 'content',
            onbeforerender: function (context) {
                var permission = [];
                /**
                 * 权限统一处理 ext扩展控件
                 * @public
                 *
                 */
                ecui.ext.permission = {
                    /**
                     * 构造函数
                     * @public
                     *
                     * @param {string} value 权限名称字符串
                     */
                    constructor: function (value) {
                        this.permission = context.permissionList.indexOf(value) >= 0;
                        if (!this.permission) {
                            if (value.indexOf('getDetailById') > 0) {
                                this.getMain().target = '';
                                this.onclick = function (event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    ecui.tip('warn', '您没有查看详情的权限');
                                    return false;
                                };
                            } else {
                                this.hide();
                            }
                        }
                        permission.push(value);
                    },
                    Events: {

                    }
                };
            },
            onafterrender: function () {
            }
        };
    };

    ecui.esr.addRoute('index', {
        main: 'container',
        view: 'index'
    });

    ecui.esr.addRoute('example', {
        main: 'container',
        view: 'example'
    });
    /* 全局路由定义 - end */

    document.write('<script type="text/javascript" src="_include/index.controls.js"></script>');
    // document.write('<script type="text/javascript" src="_include/index.data.js"></script>');
}());
