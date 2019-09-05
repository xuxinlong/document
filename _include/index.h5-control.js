(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
    function getQueryUrl(listview, route, pageNo) {
        var url = route[listview._sUrlName || 'queryUrl'];
        var listName = listview._sUrlName || route.view;
        var resUrl = listName + 'Data' + url;
        if (!listview._bNoPage) {
            resUrl = resUrl  + (url.indexOf('?') < 0 ? '?' : '&') + 'pageNo=' + pageNo;
        }
        return resUrl;
    }
    // 头部导航栏 点击 返回 上一页
    yiche.ui.Back = ecui.inherits(
        ecui.ui.Control,
        'ui-back',
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        },
        {
            onclick: function () {
                util.timer(function () {
                    window.history.go(-1);
                }, 100);
            }
        }
    );
    // 关闭按钮 点击 返回 首页
    yiche.ui.Close = ecui.inherits(
        ecui.ui.Control,
        'ui-close',
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        },
        {
            onclick: function () {
                ecui.esr.redirect('/index');
            }
        }
    );
    // 头部导航栏 分享按钮
    yiche.ui.Share = ecui.inherits(
        ecui.ui.Control,
        'ui-share',
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        },
        {
            onclick: function () {
                window.history.go(-1);
            }
        }
    );
    yiche.ui.Map = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);

            this.map = new BMap.Map(this.getMain());
        }
    );
    yiche.ui.MTimerCalendar = core.inherits(
        ecui.ui.MCalendar,
        function (el, options) {
            ecui.ui.MCalendar.call(this, el, options);
            this._uHour = this.getOptions(3);
            this._uMinute = this.getOptions(4);
            this._uSecond = this.getOptions(5);
        },
        {
            /**
             * 确认事件的默认处理。
             * @event
             */
            $confirm: function () {
                var month = this._uMonth.getValue(),
                    date = this._uDate.getValue(),
                    hour = this._uHour.getValue(),
                    minute = this._uMinute.getValue(),
                    second = this._uSecond.getValue();

                this.setValue(this._uYear.getValue() + '-' + (+month < 10 ? '0' + month : month) + '-' + (+date < 10 ? '0' + date : date) + ' ' + (+hour < 10 ? '0' + hour : hour) + ':' + (+minute < 10 ? '0' + minute : minute) + ':' + (+second < 10 ? '0' + second : second));
            },
            getFormValue: function () {
                return this.getValue();
            }
        }
    );

    yiche.ui.UeContent = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            el.innerHTML = ecui.dom.getText(el);
        }
    );

    var autoRequestListView = {
        HTML_PREPARE: '<img class="refresh-gif" src="images1/base/refresh.gif"><span>正在刷新...</span>',

        $headerleave: function () {
            ecui.ui.MListView.prototype.$headerleave.call(this);
            // ecui.get('indexBanner').enable();
            // this.enable();
        },
        $headerenter: function () {
            ecui.ui.MListView.prototype.$headerenter.call(this);
            // ecui.get('indexBanner').disable();
            // this.disable();
        },
        $loaddata: function () { // 拖拽到底部的事件，上拉加载数据
            if (this._pullupLoad === '0') {         // ### 只是为了解决同步列表上拉不加载新数据问题
                this.HTML_LOADING = '没有更多数据';   // ###
                this.requestData(-1);               // ###
            } else {                                // ###
                this.requestData(this._nPageNo + 1);
            }                                       // ###
        },
        $refresh: function () { // 在顶部下拉刷新数据, 只取第一页的数据
            this.requestData(1, true);
        },
        setUrlName: function (name) {
            this._sUrlName = name;
        },
        setPosition: function (x, y) {
            // workaround 解决隐藏的时候会影响定位
            // if (!this.isShow()) {
            //     return;
            // }
            // if (this._bHomepage) {
            //     if (ecui.get('indexPad')) {
            //         if (this.isInertia() && this.getY() < 0 && y <= 0 && this.$$bodyHeight <= this.getHeight()) {
            //             return;
            //         }
            //         ecui.get('indexPad').setPosition(x, Math.max(ecui.get('auctionTab').getHeight() - ecui.get('indexPad').getHeight(), y));
            //     }
            // }
            ecui.ui.MListView.prototype.setPosition.call(this, x, y);
        },
        requestData: function (pageNo, refresh) {
            var route = ecui.esr.findRoute(this),
                url = getQueryUrl(this, route, pageNo),
                urlName = this._sUrlName;

            if (!this._bNoPage) {
                url = url + '&pageSize=' + this._nPageSize;
            }
            ecui.esr.request(url, function () {
                var listName = this._sUrlName || route.view,
                    data = ecui.esr.getData(listName + 'Data'),
                    listData = data.record || data;
                ecui.dispatchEvent(this, 'request', { data: data });
                if (listData.length || this._bPage === 'sp-com-det-list') {
                    var el = ecui.dom.create('div'),
                        ElList = [],
                        renderer = ecui.esr.getEngine().getRenderer(route.view + 'Item'),
                        global = ecui.esr.getGlobal();

                    listData.forEach(function (item, index) {
                        // 根据一条条列表数据生成一个个对应的div
                        ElList.push(
                            renderer({
                                item: item,
                                Global: global,
                                NS: ecui.esr.getData('NS'),
                                pageNo: pageNo,
                                index: index,
                                urlName: urlName
                            })
                        );
                    }.bind(this));
                    el.innerHTML = ElList.join('');
                    if (pageNo !== -1) {// ###
                        if (refresh) {
                            this.reload(ecui.dom.children(el));
                        // 下拉后重置页面索引为1，确保上拉加载重新累加
                        } else {
                            this.add(ecui.dom.children(el)); // 调用ecui滚动列表控件添加选项
                        }
                    } else {            // ###
                        this.add([]);   // ###
                    }                   // ###
                } else {
                    if (refresh) {
                        if (this._bHomepage && !this.firstRefreshed) {
                            this.firstRefreshed = true;
                        }
                        this.reload([]);
                    } else {
                        this.add([]);
                    }
                }
                this._nPageNo = pageNo;
            }.bind(this), function (error) {
                this.add([]);
                if (error && error[0].xhr.status >= 500) {
                    ecui.esr.showSelect(ecui.esr.getEngine().render('server-error', {}), function () {}, '服务器错误');
                }
                return false;
            }.bind(this));
        }
    };

    // 继承ecui中的滚动列表控件，实现上拉加载和下拉刷新
    yiche.ui.AppListView = ecui.inherits(
        ecui.ui.MListView,
        function (el, options) {
            ecui.ui.MListView.call(this, el, options);
            this._nPageSize = +options.pageSize || 10;
            this._sUrlName = options.urlName;
            this._bPage = options.page;
            this._sPageName = options.pageName;
            this._pullupLoad = options.pullupLoad; //是否上拉加载, 1.5.1(包含)之前的同步列表没做分页,故做此处理, 如果接口完善,请删除有###注释的行
            this._bNoPage = options.noPage;
        },
        autoRequestListView
    );

    yiche.ui.AppOpListView = ecui.inherits(
        ecui.ui.MOpListView,
        function (el, options) {
            ecui.ui.MOpListView.call(this, el, options);
            this._nPageSize = +options.pageSize || 10;
            this._sUrlName = options.urlName;
        },
        autoRequestListView
    );

    yiche.ui.ShowImg = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._sImg = options.img;
            this._sTitle = options.title;
        },
        {
            onclick: function (event) {
                ecui.esr.showSelect(ecui.esr.getEngine().render('show_img', {src: this._sImg}), function (event) {
                }, this._sTitle);
            }
        }
    );
    // 提供本项目tab切换使用的控件
    yiche.ui.TabPanel = ecui.inherits(
        ecui.ui.MPanel,
        {
            ondragmove: function (event) {
                if (event.track && Math.abs(event.track.speedY) > Math.abs(event.track.speedX)) {
                    ecui.drag();
                    ecui.dispatchEvent(this.findControl(ecui.ui.Panel), 'activate', event);
                }
            }
        }
    );
    // 提供本项目tab切换使用的控件
    yiche.ui.Tab = ecui.inherits(
        ecui.ui.Tab,
        function (el, options) {
            ecui.ui.Tab.call(this, el, options);
        },
        {
            onready: function () {
                this.getItems().forEach(function (item) {
                    item.value = {};
                    stableFormData(item);
                });

            },
            ontitleclick: function (event) {
                // 重置所有其它搜索栏选项
                this.getItems().forEach(function (item, index) {
                    if (index > 0) {
                        resetChecked(item);
                    }
                }.bind(this));

                if (this.getSelected() === event.item) {
                    this.setSelected(0);
                    return false;
                }
            },
            onconfirm: function (event) {
                if (event.showText) {
                    event.selected.getMain().getElementsByTagName('TABNAME')[0].innerHTML = event.text;
                }

                if (event.showNum && event.number !== undefined) {
                    event.selected.getMain().getElementsByTagName('STRONG')[0].innerHTML = event.number;
                }
                //ecui.dom.first(ecui.dom.first(event.selected.getMain())).innerHTML = event.text;
                ecui.dom[event.number ? 'addClass' : 'removeClass'](event.selected.getMain(), 'active');
            }
        }
    );
    // 重置tab搜索栏选项值
    function resetChecked(control) {
        var inputs = control.getContainer().getElementsByTagName('INPUT');
        Array.prototype.slice.call(inputs).forEach(function (item) {
            if (item.getControl) {
                var subControl = item.getControl(),
                    value = control.value[subControl.getName ? subControl.getName() : item.name];
                if (!(subControl instanceof ecui.esr.CreateArray) && !(subControl instanceof ecui.esr.CreateObject) && subControl.setChecked && (subControl.getValue() === value || ((value === undefined || value === null) && subControl.getValue() === ''))) {
                    subControl.setChecked(true);
                }
            }
        });
    }
    // select 编辑项 控件
    yiche.ui.SelectEdit = core.inherits(
        ecui.ui.InputControl,
        'ui-common-select',
        function (el, options) {
            ecui.ui.InputControl.call(this, el, options);

            if (options.regexp) {
                this._oRegExp = new RegExp('^' + options.regexp + '$');
            }
            this._eInput = el.getElementsByTagName('INPUT')[0];
            dom.insertBefore(
                this._eText = dom.create({className: 'select-text'}),
                this._eInput
            );
            this._eInput.classList.add('ui-hide');
            this._eText.innerHTML = options.text;
            this._sItems = JSON.parse(options.selects || '[]');
            this._sView = options.view;
            this._sTitle = options.title;
            this._sTip = options.tip;
        },
        {
            $click: function () {
                ecui.esr.showSelect(ecui.esr.getEngine().render(this._sView || 'single_select', { 'items': this._sItems, value: this.getFormValue() }), function (event) {
                    this.setSelected(event);
                    if (this.getBody().classList.value.indexOf('placeholder') !== -1) {
                        ecui.dom.removeClass(this.getBody(), 'placeholder');
                    }
                }.bind(this), this._sTitle);
            },
            setSelected: function (event) {
                this._eInput.value = event.value !== undefined ? event.value : (!event.item.length ? event.item.getValue() : event.item.map(function (item) {return item.getValue(); }).join(','));
                this._eText.innerHTML = event.text !== undefined ? event.text : (!event.item.length ? event.item.getText() : event.item.map(function (item) {return item.getText(); }).join(','));
                // ecui.dom[this._eInput.value === '' ? 'addClass' : 'removeClass'](this.getMain(), 'placeholder');

                this.alterStatus((this._eInput.value === '' ? '+' : '-') + 'placeholder');
            },
            getValue: function () {
                return this._eText.innerHTML;
            },
            getFormValue: function () {
                return this._eInput.value;
            },
            setValue: function (e) {
                if (typeof e === 'object') {
                    this._eText.innerHTML = e.salesName;
                    this._eInput.value = e.salesId;
                } else {
                    for (var i = 0, length = this._sItems.length; i < length; i++) {
                        if (String(this._sItems[i].id) === String(e)) {
                            this._eText.innerHTML = this._sItems[i].text || this._sItems[i].name;
                        }
                    }
                    if (e && (!this._eText.innerHTML || this._eText.innerHTML === '请选择') && e !== '-1' && e !== '0') {
                        this._eText.innerHTML = e;
                    }
                    ecui.ui.InputControl.prototype.setValue.call(this, e);
                }
                this.alterStatus(((this._eInput.value === '' || this._eText.innerHTML === '请选择') ? '+' : '-') + 'placeholder');
                ecui.dom[(this._eInput.value === '' || this._eText.innerHTML === '请选择') ? 'addClass' : 'removeClass'](this.getMain(), 'placeholder');
            },
            $validate: function () {
                ecui.ui.InputControl.prototype.$validate.call(this);
                var value = this.getFormValue(),
                    result = true;

                if (this._bTrim) {
                    value = value.trim();
                }
                if ((this._oRegExp && !this._oRegExp.test(value)) || (isNaN(+value) && (this._nMinValue !== undefined || this._nMaxValue !== undefined))) {
                    result = false;
                }

                if (!result) {
                    core.dispatchEvent(this, 'error');
                }
                return result;
            },
            onerror: function () {
                toast('请选择' + this._sTitle, this);
            }
        }
    );
    // select 编辑项 控件
    yiche.ui.SelectRoute = core.inherits(
        ecui.ui.InputControl,
        'ui-common-select',
        function (el, options) {
            ecui.ui.InputControl.call(this, el, options);

            if (options.regexp) {
                this._oRegExp = new RegExp('^' + options.regexp + '$');
            }
            this._eInput = el.getElementsByTagName('INPUT')[0];
            dom.insertBefore(
                this._eText = dom.create({className: 'select-text'}),
                this._eInput
            );
            this._eInput.classList.add('ui-hide');
            this._eText.innerHTML = options.text;
            this._sTitle = options.title;
            this._sRoute = options.route;
            this._sTip = options.tip;
        },
        {
            onclick: function () {
                var route = ecui.esr.getRoute(this._sRoute);
                route.owner = this;
                ecui.esr.findRoute(this).notleave = false;
                ecui.esr.redirect(this._sRoute);
            },
            getValue: function () {
                return this._eTe;
            },
            getFormValue: function () {
                return this._eInput.value;
            },
            setText: function (text) {
                this._eText.innerHTML = text;
            }
        }
    );
    // 搜索栏
    yiche.ui.SearchText = core.inherits(
        ecui.ui.Text,
        'ui-search-text',
        function (el, options) {
            ecui.ui.Text.call(this, el, options);

            var clear = ecui.dom.create({ className: 'ui-search-clear' });
            dom.insertAfter(clear, this.getInput());
            this._uClear = core.$fastCreate(this.Clear, clear, this, {});
        },
        {
            Clear: core.inherits(
                ecui.ui.Control,
                {
                    onclick: function (event) {
                        this.getParent().setValue('');
                        ecui.dispatchEvent(this.getParent(), 'input');
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            )
        }
    );
    // 上传图片控件
    yiche.ui.ImageAdd = core.inherits(
        ecui.ui.Upload,
        'ui-image-add',
        function (el, options) {
            options.url = '/erp-management/file/upload';
            ecui.ui.Upload.call(this, el, options);
            this._eFile = el.getElementsByTagName('INPUT')[0];
            this._eInput = el.getElementsByTagName('INPUT')[1];
            this._eImg = el.getElementsByTagName('IMG')[0];
            this._sDefaultImg = options.defaultImg || 'images1/order/add_gray.png';
        },
        {
            onclick: function () {
                // this._eFile.name = '';
                // this._eFile.click();
            },
            onupload: function (res) {
                // this._eFile.name = ecui.dom.getAttribute(this._eFile, 'data-name');
                // alert(res);
                res = JSON.parse(res);
                this._eFile.value = ''; // 解决连续操作上传删除同一张图片时，第二次上传失败问题
                if (res.code === 0) { // 显示上传的图片
                    this._eImg.src = res.data.imageUrl || this._sDefaultImg;
                    this._eInput.value = res.data.id;
                } else if (res.code === 12020) {
                    ecui.tip('error', '最大支持10m图片，请重新选择');
                }
            },
            onerror: function (err) {
                // this._eFile.name = ecui.dom.getAttribute(this._eFile, 'data-name');
                this._eFile.value = '';
            },
            getInputEl: function () {
                return this._eInput;
            }
        }
    );
    // // 上传图片控件
    // yiche.ui.ImageAdd = core.inherits(
    //     ecui.ui.InputControl,
    //     'ui-image-add',
    //     function (el, options) {
    //         ecui.ui.InputControl.call(this, el, options);
    //     },
    //     {
    //         onclick: function () {
    //             alert('ImageAdd');
    //             wx.chooseImage({
    //                 count: 1, // 默认9
    //                 sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    //                 sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    //                 success: function (res) {
    //                     var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
    //                     console.log(localIds);
    //                     alert(JSON.stringify(localIds));
    //                 }
    //             });
    //         }
    //     }
    // );
    // 音乐人编辑控件
    yiche.ui.MusicPople = core.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._uArrayInput = core.$fastCreate(ecui.esr.CreateArray, dom.first(el), this, options);
            this._uPeoples = core.$fastCreate(this.Peoples, dom.children(el)[1], this);
            this._uAdd = core.$fastCreate(this.Add, dom.last(el), this, options);
        },
        {
            Peoples: core.inherits(
                core.ui.MPanel,
                function (el, options) {
                    ecui.ui.MPanel.call(this, el, options);
                    this._aChildren = [];
                    dom.children(dom.first(el)).forEach(function (item) {
                        this._aChildren.push(core.$fastCreate(this.People, item, this, core.getOptions(item, 'ui')));
                    }.bind(this));
                },
                {
                    People: core.inherits(
                        core.ui.InputControl,
                        function (el, options) {
                            // var option = core.getOptions(el, 'ui');
                            dom.addClass(el, 'people-item');
                            if (options.headPortrait) {
                                el.innerHTML = util.stringFormat('<img src="{0}" /><input name="musicianIds" class="ui-hide" value="{1}" /><span class="close"></span>', options.headPortrait, options.value);
                            } else {
                                el.innerHTML = util.stringFormat('<div class="head">{0}</div><input name="musicianIds" class="ui-hide" value="{1}" /><span class="close"></span>', options.name, options.value);
                            }
                            this._sData = { 'headPortrait': options.headPortrait, 'name': options.name, 'value': options.value };
                            core.ui.InputControl.call(this, el, options);

                            this._uClose = core.$fastCreate(this.Close, dom.last(el), this, options);
                        },
                        {
                            Close: core.inherits(
                                core.ui.Control,
                                {
                                    onclick: function () {
                                        this.getParent().remove();
                                    }
                                }
                            ),
                            remove: function () {
                                var parent = this.getParent(),
                                    main = this.getMain();

                                parent._aChildren.splice(parent._aChildren.indexOf(this), 1);
                                this.dispose();
                                main.remove();
                            },
                            getData: function () {
                                return this._sData;
                            }
                        }
                    ),
                    add: function (data) {
                        var people;
                        this._aChildren.push(people = core.$fastCreate(this.People, dom.create('LI'), this, data));
                        dom.first(this.getMain()).appendChild(people.getMain());
                    },
                    getChildrens: function () {
                        return this._aChildren;
                    }
                }
            ),
            Add: core.inherits(
                core.ui.Control,
                function (el, options) {
                    core.ui.Control.call(this, el, options);
                    this.route = options.route;
                },
                {
                    onclick: function () {
                        ecui.esr.getRoute(this.route).owner = this.getParent();
                        // ecui.esr.delegate(ecui.esr.getRoute(this.route), 'owner', this.getParent());
                        ecui.esr.findRoute(this).notleave = false;
                        core.esr.redirect(this.route);
                    }
                }
            ),
            onready: function () {
                ecui.util.timer(function () {
                    this._uPeoples.getMain().style.maxWidth = this.getWidth() - this._uAdd.getWidth() - 20 + 'px';
                }.bind(this), 0);
            },
            getPeoples: function () {
                return this._uPeoples;
            }
        }
    );
    yiche.ui.CommentSave = core.inherits(
        ecui.ui.Text,
        function (el, options) {
            ecui.ui.Text.call(this, el, options);
            this._uOperates = [];
            dom.children(dom.last(el)).forEach(function (item) {
                if (item.tagName === 'INPUT') {
                    this._uOperates.push(core.$fastCreate(this.Operate, item, this, core.getOptions(item)));
                }
            }.bind(this));
        },
        {
            action: undefined,
            Operate: ecui.inherits(
                ecui.ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._sAction = options.action;
                },
                {
                    onmousedown: function (event) {
                        var parent = this.getParent(),
                            value = parent.getValue();
                        parent.action = this._sAction;
                        var elements = parent.getInput().form.elements;
                        if (elements.action) {
                            elements.action.value = this._sAction;
                        } else {
                            elements.auditStatus.value = this._sAction;
                        }
                        event.preventDefault();
                        core.setFocused(parent);
                        parent.getInput().focus();
                        return false;
                    },
                    onfocus: function () {
                        var parent = this.getParent(),
                            value = parent.getValue();
                        parent.action = this._sAction;
                        var elements = parent.getInput().form.elements;
                        if (elements.action) {
                            elements.action.value = this._sAction;
                        } else {
                            elements.auditStatus.value = this._sAction;
                        }
                        // 获取光标
                        if (value === '') {
                            this._bEmpty = true;
                            parent.setValue('请输入');
                            parent.setSelection(value.legnth - 1);
                        } else {
                            parent.setSelection(0, 0);
                        }
                        util.timer(function () {
                            if (this._bEmpty) {
                                delete this._bEmpty;
                                parent.setValue('');
                                parent.setSelection(0, 0);
                            } else {
                                parent.setSelection(value.legnth - 1);
                            }
                            ecui.setFocused(parent);
                        }, 0, this);
                    }
                }
            ),
            // onfocus: function () {
            //     if (this.getInput().focusin) {
            //         this.getInput().focusin();
            //     }
            // },
            onkeydown: function (event) {
                if (event.which === 13) {
                    this.getInput().blur();
                    ecui.dispatchEvent(this, 'blur');
                    this.actionRequest();
                }
            },
            actionRequest: util.blank
        }
    );
    yiche.ui.VenueSelected = core.inherits(
        ecui.ui.MPanel,
        {
            ondragmove: function () {
                var scrollTop = this.$MScrollData.scrollTop,
                    fixedTitle = dom.first(dom.first(this.getBody())),
                    title;
                if (!this._eTitle) {
                    this.getTitleTop();
                }
                if (scrollTop > this._eTitle[0].top) {
                    dom.removeClass(fixedTitle, 'ui-hide');
                } else if (!dom.hasClass(fixedTitle, 'ui-hide')) {
                    dom.addClass(fixedTitle, 'ui-hide');
                }

                for (var i = 0, item; item = this._eTitle[i++]; ) {
                    if (scrollTop >= item.top) {
                        if (this._eTitle[i] && scrollTop < this._eTitle[i].top) {
                            title = item;
                            fixedTitle.innerHTML = title.el.innerHTML;
                            break;
                        }
                    } else {
                        break;
                    }
                }
            },
            getTitleTop: function () {
                this._eTitle = [];
                var items = dom.children(dom.first(this.getBody()));
                for (var i = 2, item; item = items[i++]; ) {
                    if (dom.hasClass(item, 'venue-title')) {
                        this._eTitle.push({ el: item, top: item.offsetTop});
                    }
                }
            }
        }
    );

    yiche.ui.SelectSaveBtn = ecui.inherits(
        ecui.ui.Button,
        'ui-select-save-btn',
        {
            $click: function () {
                var item = this;
                for (; item = item.getParent(); ) {
                    if (item instanceof ecui.esr.AppLayer) {
                        break;
                    }
                }
                var radios = core.query(function (_item) {
                    return _item instanceof ecui.ui.Radio && _item.isChecked() && ecui.dom.contain(item.getMain(), _item.getMain());
                });
                if (radios.length) {
                    core.dispatchEvent(item, 'confirm', { 'item': radios[0] });
                }
            }
        }
    );
    // 场馆选择 - 单选 - 按钮
    yiche.ui.VenueRadioEdit = core.inherits(
        ecui.ui.Radio,
        function (el, options) {
            ecui.ui.Radio.call(this, el, options);
            this._sValue = options.value;
            this._sText = options.text;
        },
        {
            $click: function (event) {
                ecui.ui.Radio.prototype.$click.call(this, event);
                var parent = this;
                for (; parent = parent.getParent(); ) {
                    if (parent instanceof ecui.esr.AppLayer) {
                        break;
                    }
                }
                core.dispatchEvent(
                    parent,
                    'confirm',
                    {
                        'value': this.getValue(),
                        'item': this,
                        'text':  this.text,
                        'showNum': 1
                    }
                );
            },
            getText: function () {
                return this._sText;
            }
        }
    );
    yiche.ui.SelectRadio = ecui.inherits(
        ecui.ui.Radio,
        function (el, options) {
            ecui.ui.Radio.call(this, el, options);
            this._sValue = options.value;
            this._sText = options.text;
        },
        {
            $click: function (e) {
                ecui.ui.Radio.prototype.$click.call(this, e);
                var item = this;
                for (; item = item.getParent(); ) {
                    if (item instanceof ecui.esr.AppLayer) {
                        break;
                    }
                }
                var radios = core.query(function (_item) {
                    return _item instanceof ecui.ui.Radio && _item.isChecked() && ecui.dom.contain(item.getMain(), _item.getMain());
                });
                if (radios.length) {
                    core.dispatchEvent(item, 'confirm', { 'item': radios[0] });
                }
            },
            getText: function () {
                return this._sText;
            }
        }
    );
    // 公共的 搜索栏 tab控件
    yiche.ui.SortTab = core.inherits(
        ecui.ui.Tab,
        'ui-sort-tab',
        function (el, options) {
            ecui.ui.Tab.call(this, el, options);
        },
        {
            $ready: ecui.util.blank,
            onready: function (event) {
                ecui.ui.Control.prototype.$ready.call(this, event.options);
                this.getItems().forEach(function (item) {
                    item.value = {};
                    stableFormData(item);
                });
            },
            ontitleclick: function (event) {
                this.getItems().forEach(function (item, index) {
                    if (index > 0) {
                        resetChecked(item);
                    }
                }.bind(this));
                // change前选中的tab项，清除上次操作
                var _cSelected = this.getSelected();
                if (_cSelected === event.item) {
                    this.setSelected(0);
                    return false;
                }
                for (var form = this.getMain().parentNode; form; form = form.parentNode) {
                    if (form.tagName === 'FORM') {
                        break;
                    }
                }
                if (event.index === 1) {
                    ecui.esr.showSelect(dom.first(event.item.getContainer()), function (event) {
                        core.dispatchEvent(
                            this,
                            'confirm',
                            event
                        );
                        ecui.esr.findRoute(this).refreshList = true;
                    }.bind(this), ecui.esr.getData('month'));
                    return false;
                }
            },
            onconfirm: function (event) {
                if (event.showText) {
                    event.selected.getMain().getElementsByTagName('TABNAME')[0].innerHTML = event.text;
                }
                if (event.number !== undefined) {
                    event.selected.getMain().getElementsByTagName('STRONG')[0].innerHTML = event.number;
                }
                //ecui.dom.first(ecui.dom.first(event.selected.getMain())).innerHTML = event.text;
                ecui.dom[event.number ? 'addClass' : 'removeClass'](event.selected.getMain(), 'active');
            },
            setSelected: function (item) {
                ecui.ui.Tab.prototype.setSelected.call(this, item);
                if (item === 0) {
                    if (this.getItem(0) && this.getItem(0)._eContainer) {
                        ecui.dom.addClass(this.getItem(0)._eContainer, 'ui-hide');
                    }
                }
            }
        }
    );
    // 场馆选择 - 单选 - 按钮
    yiche.ui.VenueRadio = core.inherits(
        ecui.ui.Radio,
        function (el, options) {
            ecui.ui.Radio.call(this, el, options);
            this._sText = options.text;
        },
        {
            $click: function (event) {
                ecui.ui.Radio.prototype.$click.call(this, event);
                var sortTab = this.findControl(yiche.ui.SortTab),
                    parent = sortTab.getMain();
                for (; parent = dom.getParent(parent); ) {
                    if (parent.tagName === 'FORM') {
                        break;
                    }
                }
                parent.elements.venueId.value = this.getValue();
                // core.dispatchEvent(this.findControl(ecui.esr.AppLayer), 'confirm', { 'selected': this });
                core.dispatchEvent(ecui.$('AppSelectContainer').getControl(), 'confirm', { 'selected': this });
                // history.go(-1);
                // var route = ecui.esr.getRoute(ecui.esr.getLocation().split('~')[0]);
                // if (route.refresh) {
                //     route.refresh();
                // }

            },
            getText: function () {
                return this._sText;
            }
        }
    );
    // 场馆订单搜索按钮 控件
    yiche.ui.SearchBtn = core.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this.route = options.route;
        },
        {
            onclick: function () {
                var route = ecui.esr.getRoute(ecui.esr.getLocation().split('~')[0]);
                var sortTab = ecui.query(function (item) {
                    return item instanceof yiche.ui.SortTab && ecui.dom.contain(ecui.$(route.main), item.getBody());
                })[0];
                dom.addClass(dom.parent(sortTab.getMain()), 'ui-hide');

                ecui.esr.redirect(this.route);
            }
        }
    );
    // 场馆订单筛选按钮 控件
    yiche.ui.SortTabIndex = core.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this.index = +options.index;
        },
        {
            $click: function (event) {
                var route = ecui.esr.getRoute(ecui.esr.getLocation().split('~')[0]);
                var sortTab = ecui.query(function (item) {
                    return item instanceof yiche.ui.SortTab && ecui.dom.contain(ecui.$(route.main), item.getBody());
                })[0];
                event.item = sortTab.getItem(this.index);
                event.index = this.index;
                event.target = event.item.getBody();
                if (sortTab.getSelected() === event.item) {
                    dom.addClass(dom.parent(sortTab.getMain()), 'ui-hide');
                } else {
                    if (event.index !== 2) {
                        dom.addClass(dom.parent(sortTab.getMain()), 'ui-hide');
                    } else {
                        dom.removeClass(dom.parent(sortTab.getMain()), 'ui-hide');
                    }
                }
                if (event.index === 1) {
                    ecui.dom.addClass(sortTab.getItem(2).getContainer(), 'ui-hide');
                }

                ecui.dispatchEvent(sortTab, 'itemclick', event);
                console.log(sortTab.getItems().indexOf(sortTab.getSelected()));
            }
        }
    );
    yiche.ui.VenueRadioFilter = ecui.inherits(
        ecui.ui.Radio,
        function (el, options) {
            ecui.ui.Radio.call(this, el, options);
            this._sValue = options.value;
            this._sText = options.text;
        },
        {
            $click: function (e) {
                ecui.ui.Radio.prototype.$click.call(this, e);
                for (var parent = this.getParent(); parent; parent = parent.getParent()) {
                    if (parent instanceof ecui.ui.Tab) {
                        stableFormData(parent.getSelected());
                        break;
                    }
                }

                refreshListView(this);
            },
            getText: function () {
                return this._sText;
            }
        }
    );
    yiche.ui.FilterRadio = ecui.inherits(
        ecui.ui.Radio,
        function (el, options) {
            ecui.ui.Radio.call(this, el, options);
            this._sValue = options.value;
            this._sText = options.text;
        },
        {
            $click: function (e) {
                ecui.ui.Radio.prototype.$click.call(this, e);
                for (var parent = this.getParent(); parent; parent = parent.getParent()) {
                    if (parent instanceof ecui.ui.Tab) {
                        stableFormData(parent.getSelected());
                        break;
                    }
                }

                refreshListView(this);
            },
            getText: function () {
                return this._sText;
            }
        }
    );
    // 筛选：区间选择控件
    yiche.ui.Slider = ecui.inherits(
        ecui.ui.InputControl,
        function (el, options) {
            ecui.ui.InputControl.call(this, el, options);
            this.scale = JSON.parse(options.scale);

            this._eInput = el.getElementsByTagName('INPUT')[0];
            this._eToast = el.children[1].children[1];
            this._sFlag = options.flag;

            var slider = ecui.dom.create('DIV', {className: 'ui-couple-slider'});
            el.insertBefore(slider, el.children[el.children.length - 1]);
            this._uSlider = ecui.$fastCreate(this.CoupleSlider, slider, this, {segment: 50});
        },
        {
            CoupleSlider: ecui.inherits(
                ecui.ui.CoupleSlider,
                {
                    onchange: function (event) {
                        var parent = this.getParent(),
                            min = Math.round(event.min),
                            max = Math.round(event.max),
                            scale = parent.scale, // 定义的刻度
                            start = '',
                            end = '',
                            toast = '';

                        if ((min === 0 && max === scale.length - 1) || (min === max && max === scale.length - 1)) { // 0-15 || 15-15 || 0-0
                            start = '';
                            end = '';
                            toast = '不限';
                        } else if (min === max && max !== scale.length - 1) { // 1-1、14-14
                            start = min;
                            end = max;
                            toast = this.toFixed(min) + '场';
                        } else { // 1-15、2-14
                            if (min !== 0 && max === scale.length - 1) { // 1-15
                                start = min;
                                end = '';
                            } else { // 0-14、2-15、2-14
                                start = min;
                                end = max;
                            }
                            toast = scale[this.toFixed(min)] + '-' + scale[this.toFixed(max)] + (this.toFixed(max) === scale.length - 1 ? '' : '场');
                        }
                        parent._eInput.value = start + ',' + end;
                        parent._eToast.innerHTML = toast;
                    },
                    toFixed: function (value) {
                        return value === 0 ? 0 : Math.ceil(value / 2);
                    }
                }
            ),
            $initStructure: function (width, height) {
                ecui.ui.CoupleSlider.prototype.$initStructure.call(this, width, height);
                // this.setValue(0, (this.scale.length - 1) * 2);
            },
            setValue: function (min, max) {
                var scale = this.scale; // 定义的刻度
                if (!this.$$border) {
                    this.handler = ecui.util.timer(function () {
                        if (this.$$border) {
                            this.handler();
                            if ((!min && !max) || (min === max && +max === scale.length - 1)) {
                                min = 0;
                                max = scale.length - 1;
                            } else if (min > 0 && max === '') {
                                max = scale.length - 1;
                            }
                            this._uSlider.setValue(+min, +max);
                            ecui.dispatchEvent(this._uSlider, 'change', {min: min, max: max});
                        }
                    }, -100, this);
                } else {
                    if ((!min && !max) || (min === max && +max === scale.length - 1)) {
                        min = 0;
                        max = scale.length - 1;
                    } else if (min > 0 && max === '') {
                        max = scale.length - 1;
                    }
                    this._uSlider.setValue(+min, +max);
                    ecui.dispatchEvent(this._uSlider, 'change', {min: min, max: max});
                }
            },
            onready: function () {
                this.setValue(0, (this.scale.length - 1) * 2);
                this._eInput.value = 0 + ',' + (this.scale.length - 1) * 2;
            },
            getValue: function () {
                return this._eInput.value;
            },
            getFormValue: function () {
                return this._eInput.value.split(',').map(function (item) { return +item; });
            },
            getFlag: function () {
                return this._sFlag;
            }
        }
    );
    // 公共的搜索栏的 重置 按钮控件
    yiche.ui.FilterSingleSelectReset = core.inherits(
        ecui.ui.Control,
        {
            $click: function (event) {
                var _cSelected;
                for (var parent = this.getParent(); parent; parent = parent.getParent()) {
                    if (parent instanceof ecui.ui.Tab) {
                        _cSelected = parent.getSelected();
                        break;
                    }
                }
                var inputs = _cSelected.getContainer().getElementsByTagName('INPUT');
                // 将选中的值设置在tab的container控件的value属性上
                Array.prototype.slice.call(inputs).forEach(function (item) {
                    var control = item.getControl();
                    control.setChecked(control.getValue() === '');
                });
            }
        }
    );
    // 选择页面 确认按钮 控件
    yiche.ui.FilterSingleSelectSure = core.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this.showtext = options.showtext;
            this.shownum = options.shownum;
            this.outOfTab = options.outOfTab;
        },
        {
            $click: function (event) {
                ecui.ui.Control.prototype.$click.call(this, event);
                var text;
                for (var parent = this.getParent(); parent; parent = parent.getParent()) {
                    if (parent instanceof ecui.ui.Tab) {
                        text = stableFormData(parent.getSelected());
                        break;
                    }
                }

                core.dispatchEvent(
                    parent,
                    'confirm',
                    {
                        'selected': parent.getSelected(),
                        'text':  text.join(','),
                        'showNum': this.shownum
                    }
                );
                // parent.setSelected(0);
                refreshListView(this, this.outOfTab);
            }
        }
    );

    // 将选中的值保存在当前tab的 value 属性上，并返回选中的有效值的数量
    function getSelectedNumber(control) {
        var inputs = control.getContainer().getElementsByTagName('INPUT'),
            num = 0,
            value = {};
        Array.prototype.slice.call(inputs).forEach(function (item) {
            if (item.getControl) {
                if (item.type === 'text') {
                    if (item.value !== '') {
                        num += 1;
                    }
                } else {
                    var subControl = item.getControl();
                    if (subControl.isChecked()) {
                        value[subControl.getName()] = subControl.getValue();
                        if (subControl.getValue() !== '') {
                            num += 1;
                        }
                    }
                }
            } else {
                //TODO 不是ecui控件的，以后再说
            }
        });
        control.value = value;
        return num;
    }
    function stableFormData(control) {
        var inputs = control.getContainer().getElementsByTagName('INPUT'),
            text = [];
        Array.prototype.slice.call(inputs).forEach(function (item) {
            if (item.getControl) {
                var subControl = item.getControl();
                if (item.type === 'text' && item.value !== '') {
                    setStableFormValue(control, subControl, text);
                } else if (item.type === 'radio') {
                    if (subControl.isChecked && subControl.isChecked()) {
                        setStableFormValue(control, subControl, text);
                    }
                }
            } else {
                //TODO 不是ecui控件的，以后再说
            }
        });
        return text;
    }
    function setStableFormValue(control, subControl, text) {
        control.value[subControl.getName()] = subControl.getValue();
        var textArray = subControl.getOuter().outerHTML.replace(/\s+/g, '').match(/>[^<]+/g);
        var temp = '';
        if (textArray && textArray.length > 0) {
            if (textArray[0].length > 1) {
                temp = textArray[0].slice(1);
            }
        }
        text.push(temp);
    }
    /**
     * [refreshListView description]
     * @param  {[type]} control [description]
     * @param  {[type]} outOfTab   listview是否在tab里面
     * @return {[type]}         [description]
     */
    function refreshListView(control, outOfTab) {
        for (var parent = control.getParent(); parent; parent = parent.getParent()) {
            if (parent instanceof ecui.ui.Tab) {
                parent.setSelected(0);
                if (outOfTab) {
                    parent = parent.getParent();
                }
                break;
            }
        }
        var listView = ecui.query(
            function (item) {
                return item instanceof ecui.ui.MListView && parent.contain(item);
            }
        )[0];
        if (listView) {
            ecui.dispatchEvent(listView, 'refresh');
        }
    }
    yiche.ui.BrandIndexItem = ecui.inherits(
        ecui.ui.Control,
        {
            onmouseover: function () {
                ecui.ext.anchor.go(this.getContent());
            }
        }
    );
    // 品牌选择项 控件
    yiche.ui.MBrandSelect = core.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._aSelect = [];
            ecui.dom.children(el).forEach(function (item) {
                if (item.tagName === 'INDEX') {
                    return;
                }
                item.className += this.Select.CLASS;
                this._aSelect.push(core.$fastCreate(this.Select, item, this));
            }, this);
        },
        {
            Select: core.inherits(
                ecui.ui.MPanel,
                'ui-base-select',
                function (el, options) {
                    ecui.ui.MPanel.call(this, el, options);
                    this._sUrl =  ecui.dom.getAttribute(el, 'href');
                    this._sView =  ecui.dom.getAttribute(el, 'view');
                    this._cSelected = null;
                },
                {
                    Item: ecui.inherits(
                        ecui.ui.Item,
                        function (el, options) {
                            ecui.ui.Item.call(this, el, options);
                            this._eValue = options.value;
                            this._eCode = options.code;
                        },
                        {
                            onclick: function (event) {
                                ecui.ui.Item.prototype.$click.call(this, event);
                                var parent = this.getParent();
                                if (parent._cSelected) {
                                    parent._cSelected.alterStatus('-selected');
                                }
                                parent._cSelected = this;
                                this.alterStatus('+selected');
                                this.getParent().setSelected(this);

                                core.dispatchEvent(this.getParent(), 'change', event);
                            },
                            getValue: function () {
                                return this._eValue;
                            }
                        }
                    ),
                    setSelected: function (item) {
                        this._cSelected = item;
                    },
                    setData: function () {
                        var parent = this.getParent(),
                            prev = parent._aSelect[parent._aSelect.indexOf(this) - 1],
                            id = prev ? prev._cSelected.getValue() : '',
                            preSelected = prev ? prev._cSelected : null;
                        ecui.esr.request('data@GET ' + this._sUrl.replace(':value', id), function () {
                            var data = ecui.esr.getData('data');
                            if (data instanceof Object) {
                                if (prev) {
                                    data.unshift(
                                        {
                                            capturable: false,
                                            code: '*',
                                            primary: 'title',
                                            value: ''
                                        },
                                        {
                                            code: '不限',
                                            value: ''
                                        }
                                    );
                                } else {
                                    data.unshift(
                                        {
                                            spell: '*',
                                            brands: [{
                                                brandid: '',
                                                brandname: '不限',
                                                pic: ''
                                            }]
                                        }
                                    );
                                }

                                if (!prev || preSelected === prev._cSelected) {
                                    this.setSelected(null);
                                    this.removeAll(true);
                                    var _el = ecui.dom.create('div');
                                    _el.innerHTML = ecui.esr.getEngine().render(this._sView, { 'items': data });
                                    this.add(ecui.dom.children(_el));
                                    if (!prev) {
                                        var brandIndexArray = [];
                                        data.forEach(function (item) {
                                            brandIndexArray.push(item.spell);
                                        });
                                        var brandIndex = ecui.esr.getEngine().render('brandIndex', { brandIndexes: brandIndexArray });
                                        ecui.get('brandIndexContainer').setContent(brandIndex);
                                        ecui.init(ecui.get('brandIndexContainer').getBody());
                                    }
                                }
                            }
                        }.bind(this));
                    },
                    $change: function (event) {
                        var parent = this.getParent(),
                            index = parent._aSelect.indexOf(this),
                            value = this._cSelected.getValue(),
                            next = parent._aSelect[++index];
                        if (index - 1 === 0) {
                            ecui.get('brandIndexContainer').hide();
                        }
                        if (next) {
                            for (var i = index, item; item = parent._aSelect[i++]; ) {
                                item.setSelected(null);
                                item.getMain().style.display = 'none';
                                item.getMain().style.left = '100%';
                            }
                            if (value === null || value === '' || value === undefined) {
                                core.dispatchEvent(this.getParent(), 'change', event);
                                return;
                            }
                            next.setData();
                            next.getMain().style.display = '';
                            ecui.effect.grade('this.style.left=#100->' + (25 * index) + '%#', 600, { $: next.getOuter() });
                        } else {
                            core.dispatchEvent(this.getParent(), 'change', event);
                        }
                    },

                    $alterItems: ecui.util.blank
                },
                ecui.ui.Items
            ),
            $change: function () {
               // var form = ecui.ui.Button.prototype.getForm.call(this),
                var _cBrand = this._aSelect[0],
                    _cSeries = this._aSelect[1],
                    _cMotorcycleTypeId = this._aSelect[2],
                    tab = this,
                    text = [],
                    num = 0;
                for (; tab = tab.getParent(); ) {
                    if (tab instanceof ecui.ui.Tab) {
                        break;
                    }
                }
                this._aSelect.forEach(function (item, index) {
                    if (item._cSelected) {
                        text.push(item._cSelected.getContent());
                    }
                    if (item._cSelected && item._cSelected.getValue() !== '') {
                        num += 1;
                    }
                    if (index) {
                        item.getMain().style.display = 'none';
                        item.getMain().style.left = '100%';
                    }
                });
                ecui.dispatchEvent(this.getParent(), 'confirm', {
                    brand: _cBrand._cSelected ? _cBrand._cSelected.getValue() : '',
                    series: _cSeries._cSelected ? _cSeries._cSelected.getValue() : '',
                    motorcycle: _cMotorcycleTypeId._cSelected ? _cMotorcycleTypeId._cSelected.getValue() : '',
                    tabText: text,
                    tabNumber: num
                });

                // core.dispatchEvent(
                //     tab,
                //     'confirm',
                //     {
                //         'selected': tab.getSelected(),
                //         // 'text':  text.join(','),
                //         'number': num
                //     }
                // );
            },
            $ready: function () {
                this._aSelect[0].setData();
            }
        }
    );
    yiche.ui.MBrandSelectNew = core.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._aSelect = [];
            ecui.dom.children(el).forEach(function (item) {
                if (item.tagName === 'INDEX') {
                    return;
                }
                item.className += this.Select.CLASS;
                this._aSelect.push(core.$fastCreate(this.Select, item, this));
            }, this);
        },
        {
            Select: core.inherits(
                ecui.ui.MPanel,
                'ui-base-select',
                function (el, options) {
                    ecui.ui.MPanel.call(this, el, options);
                    this._sUrl =  ecui.dom.getAttribute(el, 'href');
                    this._sView =  ecui.dom.getAttribute(el, 'view');
                    this._cSelected = null;
                },
                {
                    Item: ecui.inherits(
                        ecui.ui.Item,
                        function (el, options) {
                            ecui.ui.Item.call(this, el, options);
                            this._eValue = options.value;
                            this._eCode = options.code;
                        },
                        {
                            onclick: function (event) {
                                ecui.ui.Item.prototype.$click.call(this, event);
                                var parent = this.getParent();
                                if (parent._cSelected) {
                                    parent._cSelected.alterStatus('-selected');
                                }
                                parent._cSelected = this;
                                this.alterStatus('+selected');
                                this.getParent().setSelected(this);

                                core.dispatchEvent(this.getParent(), 'change', event);
                            },
                            getValue: function () {
                                return this._eValue;
                            }
                        }
                    ),
                    setSelected: function (item) {
                        this._cSelected = item;
                    },
                    setData: function () {
                        var parent = this.getParent(),
                            prev = parent._aSelect[parent._aSelect.indexOf(this) - 1],
                            id = prev ? prev._cSelected.getValue() : '',
                            preSelected = prev ? prev._cSelected : null;
                        ecui.esr.request('data@GET ' + this._sUrl.replace(':value', id), function () {
                            var data = ecui.esr.getData('data');
                            if (data instanceof Object) {
                                if (!prev || preSelected === prev._cSelected) {
                                    this.setSelected(null);
                                    this.removeAll(true);
                                    var _el = ecui.dom.create('div');
                                    _el.innerHTML = ecui.esr.getEngine().render(this._sView, { 'items': data });
                                    this.add(ecui.dom.children(_el));
                                    if (!prev) {
                                        var brandIndexArray = [];
                                        data.forEach(function (item) {
                                            brandIndexArray.push(item.spell);
                                        });
                                        var brandIndex = ecui.esr.getEngine().render('brandIndex', { brandIndexes: brandIndexArray });
                                        ecui.get('brandIndexContainer').setContent(brandIndex);
                                        ecui.init(ecui.get('brandIndexContainer').getBody());
                                    }
                                }
                            }
                        }.bind(this));
                    },
                    $change: function (event) {
                        var parent = this.getParent(),
                            index = parent._aSelect.indexOf(this),
                            value = this._cSelected.getValue(),
                            next = parent._aSelect[++index];
                        if (index - 1 === 0) {
                            ecui.get('brandIndexContainer').hide();
                        }
                        if (next) {
                            for (var i = index, item; item = parent._aSelect[i++]; ) {
                                item.setSelected(null);
                                item.getMain().style.display = 'none';
                                item.getMain().style.left = '100%';
                            }
                            if (value === null || value === '' || value === undefined) {
                                core.dispatchEvent(this.getParent(), 'change', event);
                                return;
                            }
                            next.setData();
                            next.getMain().style.display = '';
                            ecui.effect.grade('this.style.left=#100->' + (25 * index) + '%#', 600, { $: next.getOuter() });
                        } else {
                            core.dispatchEvent(this.getParent(), 'change', event);
                        }
                    },

                    $alterItems: ecui.util.blank
                },
                ecui.ui.Items
            ),
            $change: function () {
               // var form = ecui.ui.Button.prototype.getForm.call(this),
                var _cBrand = this._aSelect[0],
                    _cSeries = this._aSelect[1],
                    _cMotorcycleTypeId = this._aSelect[2],
                    tab = this,
                    text = [],
                    num = 0;
                for (; tab = tab.getParent(); ) {
                    if (tab instanceof ecui.ui.Tab) {
                        break;
                    }
                }
                this._aSelect.forEach(function (item, index) {
                    if (item._cSelected) {
                        text.push(item._cSelected.getContent());
                    }
                    if (item._cSelected && item._cSelected.getValue() !== '') {
                        num += 1;
                    }
                    if (index) {
                        item.getMain().style.display = 'none';
                        item.getMain().style.left = '100%';
                    }
                });
                ecui.dispatchEvent(this.getParent(), 'confirm', {
                    brand: _cBrand._cSelected ? _cBrand._cSelected.getValue() : '',
                    series: _cSeries._cSelected ? _cSeries._cSelected.getValue() : '',
                    motorcycle: _cMotorcycleTypeId._cSelected ? _cMotorcycleTypeId._cSelected.getValue() : '',
                    tabText: text,
                    tabNumber: num
                });

                // core.dispatchEvent(
                //     tab,
                //     'confirm',
                //     {
                //         'selected': tab.getSelected(),
                //         // 'text':  text.join(','),
                //         'number': num
                //     }
                // );
            },
            $ready: function () {
                this._aSelect[0].setData();
            }
        }
    );
    // 品牌多选控件
    yiche.ui.interestsSave = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        },
        {
            $click: function () {
                var saleRegions = ecui.esr.getGlobal().saleRegions,
                    purchaseRegions = ecui.esr.getGlobal().purchaseRegions,
                    focusMasterAndBrands = ecui.esr.getGlobal().focusMasterAndBrands.map(function (item) {
                        var tmp = Object.assign({}, item);
                        if (tmp.serials[0] && +tmp.serials[0].serialId === -1) {
                            tmp.serials = [];
                        }
                        return tmp;
                    });
                var ele = document.forms.MinePreferForm.elements;
                ele.focusMasterAndBrands.getControl().setValue(JSON.stringify(focusMasterAndBrands));
                ele.saleRegions.getControl().setValue(JSON.stringify(saleRegions));
                ele.purchaseRegions.getControl().setValue(JSON.stringify(purchaseRegions));
                var price = document.forms.MinePreferForm.purchasePriceRange.value,
                    arr = price.split('-'),
                    l = parseInt(arr[0]),
                    r = parseInt(arr[1]);
                if (l > r) {
                    ecui.tip('warn', '请正确选择购车价格区间');
                } else {
                    ecui.esr.request('data@FORM /v1/company/preference?MinePreferForm', function () {
                        var data = ecui.esr.getData('data');
                        if (data instanceof Object) {
                            ecui.tip('success', '操作成功');
                            ecui.esr.getGlobal().isFinishPrefernceInfo.state = data.preferenceInfo;
                            ecui.esr.getGlobal().focusMasterAndBrands = [];
                            ecui.esr.getGlobal().saleRegions = [];
                            ecui.esr.getGlobal().purchaseRegions = [];
                            ecui.esr.getGlobal().sum = {};
                            history.go(-1);
                        }
                    });
                }
            }
        }
    );

    /*//
       使用方式
        <div ui="type:yiche.ui.MBrandSelect;">
           <ul view="common_select_items"></ul>
           <ul view="common_select_items"></ul>
           <ul view="common_select_items"></ul>
        </div>
    */
    // 多级选择联动 控件
    yiche.ui.MMultiSelect = core.ui.MMultilevelSelect;
    var citySelectInstance;
    function getCITYS(type) {
        var code,
            key,
            key2,
            citys,
            area,
            item,
            item2,
            PROVINCE = {},
            CITY = {},
            AREA = {};
        for (code in yiche.cities) {
            if (yiche.cities.hasOwnProperty(code)) {
                if (code.slice(2) === '0000') {
                    PROVINCE[code] = yiche.cities[code];
                } else if (code.slice(4) === '00') {
                    if (!CITY[code.slice(0, 2) + '0000']) {
                        CITY[code.slice(0, 2) + '0000'] = {};
                    }
                    CITY[code.slice(0, 2) + '0000'][code] = yiche.cities[code];
                } else {
                    if (!AREA[code.slice(0, 4) + '00']) {
                        AREA[code.slice(0, 4) + '00'] = {};
                    }
                    AREA[code.slice(0, 4) + '00'][code] = yiche.cities[code];
                }
            }
        }
        // debugger
        var CITYS = [];
        for (code in  PROVINCE) {
            citys = {
                value: code,
                code: PROVINCE[code],
                children: []
            };
            item = CITY[code];
            for (key in item) {
                if (item.hasOwnProperty(key)) {
                    if (type === '3') {
                        area = {
                            value: key,
                            code: item[key],
                            children: []
                        };
                        item2 = AREA[key];
                        for (key2 in item2) {
                            if (item2.hasOwnProperty(key2)) {
                                area.children.push({
                                    value: key2,
                                    code: item2[key2]
                                });
                            }
                        }
                        if (area.children.length <= 0) {
                            delete area.children;
                        }
                        citys.children.push(area);
                    } else if (type === '2') {
                        citys.children.push({
                            value: key,
                            code: item[key]
                        });
                    }
                }
            }
            if (citys.children.length <= 0) {
                delete citys.children;
            }
            CITYS.push(citys);
        }
        return CITYS;
    }
    var CitySelect = ecui.inherits(
        core.ui.MMultilevelSelect,
        true,
        function (el, options) {
            core.ui.MMultilevelSelect.call(this, el, options);
            this._nLevel = options.level;
        },
        {
            onready: function () {
                var self = this;
                ecui.util.timer(function () {
                    // 目前是两级，如果用3级传3
                    if (self._nLevel === 2) {
                        citySelectInstance.setData(getCITYS('2'));
                    } else {
                        citySelectInstance.setData(getCITYS('3'));
                    }
                    var owner = ecui.esr.getGlobal().cityOwner;
                    if (owner) {
                        defaultSelect(owner);
                    }
                }, 0); //延后执行setData方法
            }
        }
    );
    var setSelectInView = function (item) {
        return function () {
            item.getOuter().scrollIntoViewIfNeeded();
        };
    };
    var defaultSelect = function (owner) {
        var region = owner.getValue().split('-');
        if (region[0] !== '请选择') {
            for (var i = 0; i < region.length - 1; i++) {
                var select = citySelectInstance.getSelect(i);
                var items = select.getItems();
                for (var m = 0; m < items.length; m++) {
                    if (items[m].getBody().innerHTML === region[i]) {
                        citySelectInstance.getSelect(i).setSelected(null);
                        citySelectInstance.getSelect(i).setSelected(items[m]);
                        ecui.util.timer(setSelectInView(items[m]), 500);
                        break;
                    }
                }
            }
        } else {
            ecui.util.timer(function () {
                citySelectInstance.getSelect(0).setSelected(null);
            }, 0);
        }
    };
    yiche.ui.popCitySelect = function (level) {
        var owner = ecui.esr.getGlobal().cityOwner;
        citySelectInstance = ecui.getSingleton(CitySelect, function () {
            return dom.create(
                {
                    className: 'ui-popup ui-city',
                    innerHTML: level === 2 ? '<ul></ul><ul></ul>' : '<ul></ul><ul></ul><ul></ul>'
                }
            );
        }, '', {level: level});
        citySelectInstance.onrequest = function (event) {
            event.data.forEach(function (item) {
                item['#text'] = item.code;
            });
        };
        // 重置选择项
        defaultSelect(owner);
        ecui.esr.showSelect(citySelectInstance, function (event) {
            var text = [], value;
            event.items.forEach(function (item) {
                text.push(item.getContent());
                value = item.getValue();
            });
            owner.setValue(text);
            owner.setFormValue(value);
        }, '城市选择');
    };
    yiche.ui.CitySelect = ecui.inherits(
        ecui.ui.InputControl,
        function (el, options) {
            options = Object.assign({ 'readOnly': true }, options);
            options = Object.assign({ 'inputType': 'text' }, options);
            this.inputEl = el.getElementsByTagName('INPUT')[0] || el.getElementsByTagName('TEXTAREA')[0];
            if (!this.inputEl) {
                this.inputEl = dom.setInput(null, options.name, options.inputType);
                this.inputEl.defaultValue = this.inputEl.value = options.value || '';
                el.appendChild(this.inputEl);
            }
            this.textEl = ecui.dom.insertBefore(dom.create({ className: 'ui-city-text', innerHTML: options.text }), this.inputEl);
            ecui.ui.InputControl.call(this, el, options);
            this._nLevel = options.level || 2;
            this.alterStatus('+placeholder');
        },
        {
            $click: function () {
                ecui.esr.setGlobal('cityOwner', this);
                yiche.ui.popCitySelect(this._nLevel);
            },
            setFormValue: function (value) {
                this.inputEl.value = value;
            },
            setValue: function (text) {
                if (text === '0' || !text) {
                    this.alterStatus('+placeholder');
                    return;
                }
                if (isNaN(text)) {
                    this.textEl.innerHTML = text instanceof Array ? text.join('-') : text;
                } else {
                    this.textEl.innerHTML = yiche.getCity(text, yiche.cities).join('-');
                    this.setFormValue(text);
                }
                this.alterStatus('-placeholder');
            },
            getValue: function () {
                return this.textEl.innerHTML;
            },
            getFormValue: function () {
                return +this.inputEl.value;
            }
        }
    );
    // 表单输入页编辑框
    yiche.ui.EditItem = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            var must = el.getElementsByTagName('MUST');
            this._eMust = must[0];
            if (this._eMust && options.must !== undefined && !options.must) {
                ecui.dom.addClass(this._eMust, 'ui-hide');
            }
        },
        {
            setMust: function (value) {
                if (this._eMust) {
                    if (value) {
                        ecui.dom.removeClass(this._eMust, 'ui-hide');
                    } else {
                        ecui.dom.addClass(this._eMust, 'ui-hide');
                    }
                }
            }
        }
    );

    // 表单选择select
    yiche.ui.MPopSelect = ecui.inherits(
        ecui.ui.MSelect,
        function (el, options) {
            ecui.ui.MSelect.call(this, el, options);
            this._sTitle = options.title;
            this._sValue = options.value;
            if (this._sValue) {
                this.setValue(this._sValue);
            }
        },
        {
            $error: ecui.util.blank,
            onerror: function () {
                toast('请选择' + this._sTitle, this);
            },
            setValue: function (value) {
                var hasItem = this.getItems().some(function (item) {
                    return item.getValue() === value;
                });
                ecui.ui.MSelect.prototype.setValue.call(this, hasItem ? value : '');
            },
            $confirm: function (event) {
                var item = core.getFocused();
                if ((item === null || item instanceof this.Item)) {
                    if (!item || item === this.getItems()[0]) {
                        item = this.getItems()[1];
                    }
                    this.setSelected(item);
                    core.dispatchEvent(this, 'change', event);
                }
            }
        }
    );
    yiche.ui.CityControl = ecui.inherits(
        ecui.ui.InputControl,
        function (el, options) {
            options = Object.assign({ 'readOnly': true }, options);
            options = Object.assign({ 'inputType': 'text' }, options);
            this.inputEl = el.getElementsByTagName('INPUT')[0] || el.getElementsByTagName('TEXTAREA')[0];
            if (!this.inputEl) {
                this.inputEl = dom.setInput(null, options.name, options.inputType);
                this.inputEl.defaultValue = this.inputEl.value = options.value || '';
                el.appendChild(this.inputEl);
            }
            ecui.ui.InputControl.call(this, el, options);
        },
        {
            onclick: function () {
                yiche.ui.popCitySelect(this);
            }
        }
    );
    yiche.ui.PopControl = ecui.inherits(
        ecui.ui.Control,
        'ui-pop-control',
        function (el, options) {
            options = Object.assign({ 'readOnly': true }, options);
            options = Object.assign({ 'inputType': 'text' }, options);
            this.inputEl = el.getElementsByTagName('SPAN')[0];
            this.formEl = ecui.dom.children(el.getElementsByTagName('section')[0]);
            this.title = options.title;
            this.sum = options.sum;
            ecui.ui.Control.call(this, el, options);

            var popEl = dom.create({ className: 'form-pop'}),
                cPopEl = ecui.$fastCreate(ecui.ui.Control, popEl);
            this._cPopEl = cPopEl;
            for (var i = 0, len = this.formEl.length; i < len; i++) {
                popEl.appendChild(this.formEl[i]);
            }
            var saveBtn = core.$fastCreate(this.BUTTON, dom.create(
                {
                    className: 'ui-save-btn',
                    innerHTML: '保存'
                }
            ));
            saveBtn.owner = this;
            popEl.appendChild(saveBtn.getMain());
            el.getElementsByTagName('section')[0].appendChild(popEl);
            this.alterStatus('+placeholder');
        },
        {
            BUTTON: ecui.inherits(
                ecui.ui.Control,
                {
                    onclick: function (e) {
                        e.stopPropagation();
                        var cParent = this.owner;
                        var formContent = cParent.getMain().getElementsByTagName('section')[0];
                        ecui.util.timer(function () {
                            var data = {},
                                count = 0;
                            var f = ecui.dom.create('FORM');
                            f.appendChild(cParent._cPopEl.getMain());
                            ecui.esr.parseObject(f, data);
                            for (var key in data) {
                                if (data.hasOwnProperty(key)) {
                                    var sub = data[key];
                                    if (sub instanceof Object) {
                                        for (var key1 in sub) {
                                            if (sub.hasOwnProperty(key1)) {
                                                var sub1 = sub[key1];
                                                if (sub1 instanceof Object) {
                                                    for (var key2 in sub1) {
                                                        if (sub1.hasOwnProperty(key2)) {
                                                            var el = f.elements[key + '.' + key1 + '.' + key2];
                                                            if (el[0] && el[0].type === 'radio' && el[0].value !== '-1') {
                                                                count++;
                                                            } else if (sub1[key2] && sub1[key2] !== '0') {
                                                                count++;
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    var el1 = f.elements[key + '.' + key1];
                                                    if (el1[0] && el1[0].type === 'radio' && el1[0].value !== '-1') {
                                                        count++;
                                                    } else if (sub[key1] && sub[key1] !== '0') {
                                                        count++;
                                                    }
                                                }
                                                // // 如果是 checkbox 如果没有选择是字符串0
                                                // if (sub[key1] && sub[key1] !== '0') {
                                                //     count++;
                                                // }
                                            }
                                        }
                                    } else {
                                        if (sub && sub !== '0') {
                                            count++;
                                        }
                                    }
                                }
                            }
                            if (f.elements.length === 1) {
                                cParent.setValue(f.elements[0].value);
                            } else {
                                if (count) {
                                    cParent.setValue((count ? '已选择' + count + '项' : '') + '/' + cParent.sum + '项');
                                    cParent.alterStatus('-placeholder');
                                } else {
                                    cParent.setValue('请选择');
                                    cParent.alterStatus('+placeholder');
                                }
                            }
                            formContent.appendChild(cParent._cPopEl.getMain());
                        }, 500);
                        history.go(-1);
                    }
                }
            ),
            onclick: function () {
                ecui.esr.showSelect(this._cPopEl, function () {}, this.title || '手续名称');
            },
            setValue: function (value) {
                this.alterStatus(value ? '-placeholder' : '+placeholder');
                this.inputEl.innerHTML = value || '请选择';
            },
            showText: function () {
                var data = {},
                    cParent = this,
                    formContent = cParent.getMain().getElementsByTagName('section')[0],
                    count = 0;
                var f = ecui.dom.create('FORM');
                f.appendChild(cParent._cPopEl.getMain());
                ecui.esr.parseObject(f, data);
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        var sub = data[key];
                        if (sub instanceof Object) {
                            for (var key1 in sub) {
                                if (sub.hasOwnProperty(key1)) {
                                    var sub1 = sub[key1];
                                    if (sub1 instanceof Object) {
                                        for (var key2 in sub1) {
                                            if (sub1.hasOwnProperty(key2)) {
                                                var el = f.elements[key + '.' + key1 + '.' + key2];
                                                if (el[0] && el[0].type === 'radio' && el[0].value !== '-1') {
                                                    count++;
                                                } else if (sub1[key2] && sub1[key2] !== '0') {
                                                    count++;
                                                }
                                            }
                                        }
                                    } else {
                                        var el1 = f.elements[key + '.' + key1];
                                        if (el1[0] && el1[0].type === 'radio' && el1[0].value !== '-1') {
                                            count++;
                                        } else if (sub[key1] && sub[key1] !== '0') {
                                            count++;
                                        }
                                    }
                                    // // 如果是 checkbox 如果没有选择是字符串0
                                    // if (sub[key1] && sub[key1] !== '0') {
                                    //     count++;
                                    // }
                                }
                            }
                        } else {
                            if (sub && sub !== '0') {
                                count++;
                            }
                        }
                    }
                }
                if (f.elements.length === 1) {
                    cParent.setValue(f.elements[0].value);
                } else {
                    if (count) {
                        cParent.setValue((count ? '已选择' + count + '项' : '') + '/' + cParent.sum + '项');
                        cParent.alterStatus('-placeholder');
                    } else {
                        cParent.setValue('请选择');
                        cParent.alterStatus('+placeholder');
                    }
                }
                formContent.appendChild(cParent._cPopEl.getMain());
            }
        }
    );
    var toast = function (toastString, target) {
        var route = ecui.esr.findRoute(target);
        // 设置全局global变量，在点击提交按钮的位置上，需要手动setGlobal为true
        var showToastGlobal = ecui.esr.getGlobal().showToast;
        if ((route && route.showToast) || showToastGlobal) {
            ecui.tip('warn', toastString);
            if (route) {
                route.showToast = false;
            }
            ecui.esr.setGlobal('showToast', false);
        }
    };
    yiche.ui.PopRemark = ecui.inherits(
        ecui.ui.InputControl,
        function (el, options) {

            options = Object.assign({ 'readOnly': true }, options);
            options = Object.assign({ 'inputType': 'text' }, options);
            this.inputEl = el.getElementsByTagName('INPUT')[0] || el.getElementsByTagName('TEXTAREA')[0];
            if (!this.inputEl) {
                this.inputEl = dom.setInput(null, options.name, options.inputType);
                this.inputEl.defaultValue = this.inputEl.value = options.value || '';
                el.appendChild(this.inputEl);
            }
            ecui.ui.InputControl.call(this, el, options);

            var popEl = dom.create({ className: 'form-pop'}),
                cPopEl = ecui.$fastCreate(ecui.ui.Control, popEl);
            this._cPopEl = cPopEl;
            var saveBtn = core.$fastCreate(this.BUTTON, dom.create(
                {
                    className: 'ui-save-btn',
                    innerHTML: '保存'
                }
            ));
            if (!options.maxlength) {
                options.maxlength = 100;
            }
            this.maxlength = options.maxlength;
            saveBtn.owner = this;
            this._cInputEl = ecui.$fastCreate(this.INPUT, dom.create({
                className: 'ui-remark-input',
                innerHTML: '<textarea rows="5" maxlength="' + options.maxlength + '" placeholder="' + options.placeholder + '" class="remark-text-area"></textarea>'
            }));
            this._cInputEl.owner = this;
            popEl.appendChild(this._cInputEl.getMain());
            this.eShowPart = dom.create('SPAN', {
                className: 'ui-remark-spart xxx',
                innerHTML: '0/' + options.maxlength
            });
            this._cInputEl.getMain().appendChild(this.eShowPart);
            popEl.appendChild(saveBtn.getMain());

        },
        {
            BUTTON: ecui.inherits(
                ecui.ui.Control,
                {
                    onclick: function (e) {
                        e.stopPropagation();
                        var cParent = this.owner;
                        cParent.setValue(cParent._cInputEl.getValue());
                        history.go(-1);
                    }
                }
            ),
            INPUT: ecui.inherits(
                ecui.ui.InputControl,
                {
                    oninput: function () {
                        var x = this.owner.eShowPart.innerHTML.substring(this.owner.eShowPart.innerHTML.length - 4);
                        this.owner.eShowPart.innerHTML = this.getValue().length + x;
                    }
                }
            ),
            onclick: function () {
                this.eShowPart.innerHTML = this.getValue().length + '/' + this.maxlength;
                this._cInputEl.setValue(this.getValue());
                ecui.esr.showSelect(this._cPopEl, function () {}, '备注');
            }
        }
    );
    yiche.ui.LengthText = ecui.inherits(
        ecui.ui.Text,
        function (el, options) {
            ecui.ui.Text.call(this, el, options);
            this._sTitle = options.title;
            this._sErrorMsg = options.errorMsg;
        },
        {
            $error: ecui.util.blank,
            onerror: function () {
                toast(this._sErrorMsg || '请正确输入' + this._sTitle, this);
            },
            oninput: function () {
                var x = this._eInput.value.length;
                var msg = 'VIN (' + x + '/17)';
                this._cParent._eBody.parentElement.querySelector('span').innerHTML = msg;
            },
            setValue: function (value) {
                ecui.ui.Text.prototype.setValue.call(this, value);
                if (!value || value === 0) {
                    this.oninput();
                }
            }
        }
    );
    yiche.ui.Text = ecui.inherits(
        ecui.ui.Text,
        function (el, options) {
            ecui.ui.Text.call(this, el, options);
            this._sTitle = options.title;
            this._sErrorMsg = options.errorMsg;
        },
        {
            $error: ecui.util.blank,
            onerror: function () {
                toast(this._sErrorMsg || '请正确输入' + this._sTitle, this);
            },
            onclick: function () {
            }
        }
    );
    yiche.ui.InputGroup = ecui.inherits(
        ecui.ui.InputGroup,
        function (el, options) {
            ecui.ui.InputGroup.call(this, el, options);
            this._sTip = options.tip;
        },
        {
            /**
             * 控件组格式校验错误的默认处理。
             * @event
             */
            $error: function () {
                ecui.tip('warn', this._sTip);
            }
        }
    );
    yiche.ui.Number = ecui.inherits(
        ecui.ui.Number,
        function (el, options) {
            ecui.ui.Number.call(this, el, options);
            this._sTitle = options.title;
            this._sErrorMsg = options.errorMsg;
        },
        {
            $error: ecui.util.blank,
            onerror: function () {
                toast(this._sErrorMsg || '请正确输入' + this._sTitle, this);
            }
        }
    );
    yiche.ui.Submit = ecui.inherits(
        ecui.ui.Button,
        {
            request: function (url, onsuccess, onerror) {
                this.disable();
                ecui.esr.request(url, function () {
                    this.enable();
                    onsuccess.call(this);
                }.bind(this), function () {
                    this.enable();
                    if (onerror) {
                        onerror.call(this);
                    } else {
                        onsuccess.call(this);
                    }
                }.bind(this));
            }
        }
    );
    yiche.ui.Checkbox = ecui.inherits(
        ecui.ui.Checkbox,
        {
            getFormValue: function () {
                return this.isChecked() ? this.getValue() : '0';
            },
            isFormChecked: function () {
                return true;
            }
        }
    );
    yiche.ui.FeedTextArea = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._eTextarea = el.getElementsByTagName('TEXTAREA')[0];
            this._eNum = el.getElementsByTagName('STRONG')[0];
            this.maxlength = options.maxlength;
        },
        {
            $ready: function () {
                ecui.dom.addEventListener(this._eTextarea, 'input', function () {
                    this._eNum.innerHTML = this._eTextarea.value.length + '/' + this.maxlength;
                }.bind(this));
            }
        }
    );
    yiche.ui.FeedbackSave = ecui.inherits(
        ecui.ui.Control,
        {
            onclick: function () {
                var length = document.feedBackForm.elements.content.value.length;
                if (length === 0) {
                    ecui.tip('warn', '请输入您的建议');
                } else {
                    ecui.esr.request('data@FORM /erp-management/sys/feedback/add?feedBackForm', function () {
                        var data = ecui.esr.getData('data');
                        if (data instanceof Object) {
                            ecui.tip('success', '操作成功');
                            history.go(-1);
                        }
                    });
                }
            }
        }
    );
    yiche.ui.modifyPassword = ecui.inherits(
        ecui.ui.Control,
        {
            onclick: function () {
                ecui.esr.request('data@FORM /erp-management/staff/personal/modify-pwd?modifyPasswordForm', function () {
                    var data = ecui.esr.getData('data');
                    if (data instanceof Object) {
                        ecui.tip('success', '操作成功');
                        history.go(-1);
                    }
                });
            }
        }
    );
    yiche.ui.picUpCont = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        },
        {
            $click: function () {
                ecui.ui.Control.prototype.$click.call(this);
                this.hide();
            }
        }
    );
    yiche.ui.imagesShow = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        },
        {
            $click: function () {
                ecui.get('picUpCont').show();
            }
        }
    );
    yiche.ui.intereststwooptions = ecui.inherits(
        ecui.ui.MMultiOptions,
        'ui-mobile-calendar',
        function (el, options) {
            ecui.ui.MMultiOptions.call(this, el, options);
            this._startYear = this.getOptions(0);
            this._endYear = this.getOptions(2);
        },
        {
            /**
             * 弹出层部件。
             * @unit
             */
            Popup: ecui.inherits(
                ecui.ui.Control,
                {
                    /**
                     * @override
                     */
                    $cache: function (style) {
                        ecui.ui.Control.prototype.$cache.call(this, style);
                        this.getParent()._aOptions.forEach(function (item) {
                            item.cache();
                        });
                    }
                },
                ecui.ui.MConfirm
            ),

            $change: function () {
                var nYear = parseInt(this._startYear.getValue());
                this._endYear._aItems.forEach(function (item) {
                    item[parseInt(item._sValue) <= nYear ? 'hide' : 'show']();
                });
                this._endYear.$alterItems();
                if (nYear > +this._endYear.getValue()) {
                    this._endYear.setValue(nYear);
                } else {
                    this._endYear.setValue(this._endYear.getValue());
                }
            },

            /**
             * 确认事件的默认处理。
             * @event
             */
            $confirm: function () {
                this.setValue(this._startYear.getValue() + '-' + this._endYear.getValue());
            },

            /**
             * 选项框部件。
             * @unit
             */
            Options: ecui.inherits(
                ecui.ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);

                    this.value = options.value;
                    var values = [];
                    values = options.values.split(',');
                    var ret = [];
                    if (Array.isArray(values)) {
                        values.forEach(function (i) {
                            ret.push('<div ui="value:' + i + '" class="' + options.classes.join('-item ') + 'ui-item">' + (options.format ? ecui.util.stringFormat(options.format, i) : i) + '</div>');
                        });
                    }
                    this.getBody().innerHTML = ret.join('');

                    this._aItems = [];
                    ecui.dom.children(el).forEach(function (item) {
                        this._aItems.push(ecui.$fastCreate(this.Item, item, this, ecui.getOptions(item)));
                    }, this);

                    this.setOptionSize(3);
                },
                {
                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: ecui.inherits(
                        ecui.ui.Control,
                        function (el, options) {
                            ecui.ui.Control.call(this, el, options);
                            this._sValue = options.value || this.getContent();
                        }
                    )
                },
                ecui.ui.MOptions,
                {
                    $ready: function (event) {
                        ecui.ui.Control.prototype.$ready.call(this, event);
                        this.setValue(this.value);
                    },
                    /**
                     * @override
                     */
                    $dragend: function (event) {
                        ecui.ui.MScroll.Methods.$dragend.call(this, event);
                        core.dispatchEvent(this.getParent(), 'change');
                    },

                    /**
                     * 获取选中控件的值。
                     * @public
                     *
                     * @return {string} 选中控件的值
                     */
                    getValue: function () {
                        return this._cSelect ? this._cSelect._sValue : '';
                    },

                    /**
                     * 设置控件的值，如果不存在，选中空数据。
                     * @public
                     *
                     * @param {string} value 控件的值
                     */
                    setValue: function (value) {
                        value = String(value);
                        for (var i = 0, item; item = this._aItems[i]; i++) {
                            if (item._sValue === value) {
                                this.setPosition(0, (3 - i) * this.$$itemHeight);
                                this.setSelected(item);
                                return;
                            }
                        }
                        this.setSelected();
                    }
                }
            )
        }
    );
    yiche.ui.Year2YearCalendar = ecui.inherits(
        ecui.ui.MMultiOptions,
        'ui-mobile-calendar',
        function (el, options) {
            ecui.ui.MMultiOptions.call(this, el, options);
            this._startYear = this.getOptions(0);
            this._endYear = this.getOptions(1);
        },
        {
            /**
             * 选项改变事件的默认处理。
             * @event
             */
            $change: function () {
                var nYear = +this._startYear.getValue();
                this._endYear._aItems.forEach(function (item) {
                    item[+item._sValue < nYear ? 'hide' : 'show']();
                });
                this._endYear.$alterItems();
                if (nYear > +this._endYear.getValue()) {
                    this._endYear.setValue(nYear);
                } else {
                    this._endYear.setValue(this._endYear.getValue());
                }
            },
            Options: ecui.inherits(
                ecui.ui.MMultiOptions.prototype.Options,
                {
                    setValue: function (value) {
                        value = String(value);

                        var items = this._aItems.filter(function (item) {
                            return item.isShow();
                        });

                        for (var i = 0, item; item = items[i]; i++) {
                            if (item._sValue === value) {
                                this.setPosition(0, (3 - i) * this.$$itemHeight);
                                this.setSelected(item);
                                return;
                            }
                        }
                        this.setSelected();
                    }
                }
            ),
            /**
             * @override
             */
            $click: function (event) {
                ecui.ui.MMultiOptions.prototype.$click.call(this, event);
                if (ecui.dom.contain(this.getMain(), event.target)) {
                    var value = this.getValue();
                    if (value) {
                        value = value.split('-');
                        this._startYear.setValue(value[0]);
                        this._endYear.setValue(+value[1]);
                    } else {
                        value = new Date();
                        this._startYear.setValue(value.getFullYear());
                        ecui.dispatchEvent(this, 'change');
                        this._endYear.setValue(value.getFullYear() + 1);
                    }
                    ecui.dispatchEvent(this, 'change');
                }
            },

            /**
             * 确认事件的默认处理。
             * @event
             */
            $confirm: function () {
                this.setValue(this._startYear.getValue() + '-' + this._endYear.getValue());
            }
        }
    );
    var titleButton = core.inherits(
        ecui.ui.Control,
        {
            onclick: function (event) {
                this.getParent().getParent().setValue('');
                var popup = this.getParent();
                popup.hide();
            }
        }
    );
    yiche.ui.IfDayCalendar = core.inherits(
        ecui.ui.MMultiOptions,
        'ui-mobile-calendar',
        function (el, options) {
            ecui.ui.MMultiOptions.call(this, el, options);
            this.daynotShow = options.daynotShow;
            this.hourMinShow = options.hourMinShow;
            this.secondShow = options.secondShow;
            this._uYear = this.getOptions(0);
            this._uMonth = this.getOptions(1);
            this._uDate = this.getOptions(2);
            this._uHour = this.getOptions(3);
            this._uMinute = this.getOptions(4);
            this._uSecond = this.getOptions(5);
        },
        {
            /**
             * 选项改变事件的默认处理。
             * @event
             */
            $change: function () {
                if (!this.daynotShow) {
                    var days = new Date(+this._uYear.getValue(), +this._uMonth.getValue(), 0).getDate();
                    if (this._uDate.getValue() > days) {
                        this._uDate.setValue(days);
                    }
                    for (var day = 28; day <= 31; day++) {
                        this._uDate._aItems[day - 1][day <= days ? 'show' : 'hide']();
                    }
                    this._uDate.$alterItems();
                }
            },

            /**
             * @override
             */
            $click: function (event) {
                ecui.ui.MMultiOptions.prototype.$click.call(this, event);
                if (dom.contain(this.getMain(), event.target)) {
                    var value = this.getValue();
                    if (value) {
                        value = value.split(' ');
                        if (value instanceof Array && value.length === 2) {
                            value[0] = value[0].split('-');
                            value[1] = value[1].split(':');
                            value = value[0].concat(value[1]);
                        } else {
                            value = value[0].split('-');
                        }
                        this._uYear.setValue(value[0]);
                        this._uMonth.setValue(+value[1]);
                        if (!this.daynotShow) {
                            this._uDate.setValue(+value[2]);
                        }
                        if (this.hourMinShow) {
                            this._uHour.setValue(+value[3]);
                            this._uMinute.setValue(+value[4]);
                        }
                        if (this.secondShow) {
                            this._uSecond.setValue(+value[5]);
                        }
                    } else {
                        value = new Date();
                        this._uYear.setValue(value.getFullYear());
                        this._uMonth.setValue(value.getMonth() + 1);
                        if (!this.daynotShow) {
                            this._uDate.setValue(value.getDate());
                        }
                        if (this.hourMinShow) {
                            this._uHour.setValue(value.getHours());
                            this._uMinute.setValue(value.getMinutes());
                        }
                        if (this.secondShow) {
                            this._uSecond.setValue(value.getSeconds());
                        }
                    }
                    ecui.dispatchEvent(this, 'change');
                }
            },

            /**
             * 确认事件的默认处理。
             * @event
             */
            $confirm: function () {
                var month = this._uMonth.getValue(),
                    hour,
                    second,
                    minute,
                    date;
                if (!this.daynotShow && this.hourMinShow && this.secondShow) {
                    date = this._uDate.getValue();
                    hour = this._uHour.getValue();
                    minute = this._uMinute.getValue();
                    second = this._uSecond.getValue();
                    this.setValue(this._uYear.getValue() + '-' + (+month < 10 ? '0' + month : month) + '-' + (+date < 10 ? '0' + date : date) + ' ' + (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + ':' + (second < 10 ? '0' + second : second));
                } else if (!this.daynotShow && this.hourMinShow) {
                    hour = this._uHour.getValue();
                    minute = this._uMinute.getValue();
                    date = this._uDate.getValue();
                    this.setValue(this._uYear.getValue() + '-' + (+month < 10 ? '0' + month : month) + '-' + (+date < 10 ? '0' + date : date) + ' ' + (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute));
                } else if (!this.daynotShow) {
                    date = this._uDate.getValue();
                    this.setValue(this._uYear.getValue() + '-' + (+month < 10 ? '0' + month : month) + '-' + (+date < 10 ? '0' + date : date));
                } else {
                    // 不加01不能初始化
                    this.setValue(this._uYear.getValue() + '-' + (+month < 10 ? '0' + month : month));

                }
            },
            getFormValue: function () {
                var value = this.getValue();
                var tmpStr = '';
                if (value) {
                    if (/\d+-\d+-.+/ig.test(value) || !isNaN(Number(value))) {
                        tmpStr = isNaN(Number(value)) ? value.replace(/-/g, '/') : Number(value);
                    } else {
                        value += '-01';
                        tmpStr = isNaN(Number(value)) ? value.replace(/-/g, '/') : Number(value);
                    }
                }
                return Date.parse(new Date(tmpStr)) || '';
            },
            setValue: function (value) {
                var formatStr = 'yyyy-MM';
                if (!this.daynotShow) {
                    formatStr += '-dd';
                }
                if (this.hourMinShow) {
                    formatStr += ' HH:mm';
                }
                if (this.secondShow) {
                    formatStr += ':ss';
                }
                var tmpStr = '';
                if (value) {
                    if (/\d+-\d+-.+/ig.test(value) || !isNaN(Number(value))) {
                        tmpStr = isNaN(Number(value)) ? value.replace(/-/g, '/') : Number(value);
                    } else {
                        value += '-01';
                        tmpStr = isNaN(Number(value)) ? value.replace(/-/g, '/') : Number(value);
                    }
                }
                ecui.ui.MMultiOptions.prototype.setValue.call(this, value ? new Date(tmpStr).pattern(formatStr) : '');
            }
        }
    );
    yiche.ui.MoreOptionCalendar = core.inherits(
        yiche.ui.IfDayCalendar,
        function (el, options) {
            yiche.ui.IfDayCalendar.call(this, el, options);
            var titleEl = dom.create('div', {className: 'callbackOption', innerHTML: '放弃回访'});
            this.getPopup().getOuter().children[1].appendChild(titleEl);
            ecui.$fastCreate(titleButton, titleEl, this.getPopup());
        },
        {
            $initStructure: function (event) {
                yiche.ui.IfDayCalendar.prototype.$click.call(this, event);
            }
        }
    );

    yiche.ui.BubbleItem = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this.args = options.args;
            this.routeName = options.routeName;
            this.funcName = options.funcName;
        },
        {
            onclick: function () {
                ecui.esr.getRoute(this.routeName).callback(this.args, this.funcName);
            }
        }
    );

    yiche.ui.Bubble = ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            options = Object.assign({ 'readOnly': true }, options);
            ecui.ui.Control.call(this, el, options);
            var bubble = ecui.dom.create('DIV', {
                className: 'ui-hide'
            });
            this._cBubble = ecui.$fastCreate(this.Options, bubble, this);
            el.appendChild(bubble);
            this._cBubble.hide();
        },
        {
            Options: ecui.inherits(
                ecui.ui.Control,
                {
                    onclick: function (ev) {
                        ev.stopPropagation();
                        ecui.ui.Control.prototype.$click.call(this);
                        ecui.util.timer(function () {
                            this.getParent()._cBubble.hide();
                        }.bind(this));
                    }
                    // onmouseup: function (ev) {
                    //     ev.stopPropagation();
                    //     ecui.ui.Control.prototype.$click.call(this);
                    //     ecui.util.timer(function () {
                    //         debugger;
                    //         this.getParent()._cBubble.hide();
                    //     }.bind(this));
                    // }
                }
            ),
            setBubbleData: function (data) {
                this._data = data;
            },
            showBubble: function () {
                if (this._cBubble.isShow()) {
                    this._cBubble.hide();
                } else {
                    this._cBubble.getMain().innerHTML = ecui.esr.getEngine().render('index-inventory-right', {data: this._data});
                    ecui.init(this._cBubble.getMain());
                    this._cBubble.show();
                }
            },
            hideBubble: function () {
                this._cBubble.hide();
            }
        }
    );

    function formatTime(time) {
        var hours = Math.floor(time / 3600),
            minutes = Math.floor((time % 3600) / 60),
            second = time % 60;

        second = this._bMillisecond ? Math.floor(second * 1000) / 1000 : Math.floor(second);

        return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (second < 10 ? '0' + second : second);
    }
    // 定时器控件
    yiche.ui.Countdown = ecui.inherits(
        ecui.ui.CountDown,
        function (el, options) {
            ecui.ui.CountDown.call(this, el, options);
            this._bRunning = false;
        },
        {
            start: function () {
                if (this._oTimer) {
                    this._oTimer();
                }
                var lastTime = Date.now();

                if (this._nTime > 0) {
                    this.show();
                    this._bRunning = true;
                } else {
                    return false;
                }
                this._oTimer = ecui.util.timer(function () {
                    var time = Date.now();
                    this._nTime = Math.max(0, this._nTime + (lastTime - time) / 1000);
                    lastTime = time;
                    this.setContent(formatTime(this._nTime));
                    if (this._nTime <= 0) {
                        this._oTimer();
                        this._bRunning = false;
                        this.hide();
                        ecui.dispatchEvent(this, 'end');
                    }
                }, -1, this);
            },
            getTime: function () {
                return this._nTime;
            },
            isRunning: function () {
                return this._bRunning;
            },
            stop: function () {
                this._oTimer && this._oTimer();
                this._bRunning = false;
            }
        }
    );
    yiche.ui.ImgInput = ecui.inherits(
        ecui.ui.InputControl,
        'img-input',
        {
            onclick: function () {
                window.callBridge('camera', function (e) {
                    this.getMain().querySelector('img').src = 'data:image/png;base64,' + e;
                    function dataURLtoFile(dataurl, filename) {//将base64转换为文件
                        var  bstr = atob(dataurl), n = bstr.length, u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        return new File([u8arr], '1.jpg', {type: 'image/jpeg'});
                    }
                    var data = new FormData();
                    data.append('file', dataURLtoFile(e, 'file'));
                    ecui.io.ajax('/v1/file/upload/4/8', {
                        method: 'POST',
                        headers: {
                            'x-app-version': ecui.esr.headers['x-app-version'],
                            'x-access-token-tct': ecui.esr.headers['x-access-token-tct'],
                            'x-access-token': ecui.esr.headers['x-access-token']
                        },
                        data: data,
                        onsuccess: function (e) {
                            var obj = JSON.parse(e);
                            this.getInput().value = obj.data.id;
                        }.bind(this)
                    });
                }.bind(this));
            }
        }
    );
}());