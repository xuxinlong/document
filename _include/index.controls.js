(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        ext = core.ext;

    /**
     * 获取dom元素距离body顶部的距离。
     * @private
     *
     * @param {HTMLElement} el  获取位置的 Element 对象
     */
    function getOffset(el) {

        var top = 0,
            left = 0;
        for (; el !== document.body; ) {
            top += el.offsetTop;
            left += el.offsetLeft;
            if (el.tagName === 'TD' || el.tagName === 'TH' || el.tagName === 'TR' || el.tagName === 'TBODY' || el.tagName === 'THEAD') {
                el = dom.parent(el);
            } else {
                el = el.offsetParent;
            }
        }
        return { left: left, top: top };
    }

    ui.InputGroup.prototype.setMust = function (value) {
        ecui.dom[value ? 'removeClass' : 'addClass'](ecui.dom.first(this.getMain()), 'ui-hide');
    };

    yiche.ui = {
        Highlight: ecui.inherits(
            ui.Control,
            function (el, options) {
                this.code = el.innerHTML.trim().replace(/\/\* target:(.+) \*\//, '<!-- target:$1 -->');
                el.innerHTML = '';
                var copy = dom.insertBefore(dom.create('div', { innerHTML: '复制', className: 'code-copy' }), el);
                this._uCopy = ecui.$fastCreate(this.Copy, copy, this);

                ui.Control.call(this, el, options);
            },
            {
                Copy: ecui.inherits(
                    ui.Button,
                    {
                        onclick: function () {
                            try {
                                var tag = util.clipboard(this.getParent().code);
                                ecui.tip('success', 'copy成功');
                            } catch (e) {
                                ecui.tip('success', 'copy失败，请重试');
                            }
                        }
                    }
                ),
                init: function () {
                    var el = this.getMain();
                    el.innerText = this.code;
                    hljs.highlightBlock(el);
                }
            }
        ),
        /*
         * control
         * 公司combox控件
         */
        CompanyCombox: ecui.inherits(
            ui.Combox,
            {
                setSelected: function (event) {
                    ui.Combox.prototype.setSelected.call(this, event);
                    this._eTextInput.title = this.getText();
                },
                oninput: function () {
                    this._eTextInput.title = this.getText();
                }
            }
        ),
        /*
         * control
         * 资产列表搜索控件
         */
        AssetSearchButton: ecui.inherits(
            ui.BQueryButton,
            {
                $click: function (event) {
                    var form = this.getForm(),
                        elements = form.elements,
                        beforeCtime = elements.beforeCtime ? elements.beforeCtime.getControl().getValue() : '',
                        afterCtime = elements.afterCtime ? elements.afterCtime.getControl().getValue() : '',
                        beforeUtime = elements.beforeUtime ? elements.beforeUtime.getControl().getValue() : '',
                        afterUtime = elements.afterUtime ? elements.afterUtime.getControl().getValue() : '',
                        beforeReturnDate = elements.beforeReturnDate ? elements.beforeReturnDate.getControl().getValue() : '',
                        afterReturnDate = elements.afterReturnDate ? elements.afterReturnDate.getControl().getValue() : '';

                    if (beforeCtime && afterCtime && new Date(beforeCtime) > new Date(afterCtime)) {
                        ecui.tip('warn', '开始时间不能大于结束时间');
                        return;
                    }
                    if (beforeUtime && afterUtime && new Date(beforeUtime) > new Date(afterUtime)) {
                        ecui.tip('warn', '开始时间不能大于结束时间');
                        return;
                    }
                    if (beforeReturnDate && afterReturnDate && new Date(beforeReturnDate) > new Date(afterReturnDate)) {
                        ecui.tip('warn', '开始时间不能大于结束时间');
                        return;
                    }
                    ui.BQueryButton.prototype.$click.call(this, event);
                }
            }
        ),
        LockedTable: ecui.inherits(
            ui.LockedTable,
            {
                onscroll: function (event) {
                    if (firefoxVersion || ieVersion) {
                        var btns = dom.first(this._uHead.getMain().getElementsByTagName('TH')[0]);
                        btns.style.left = this._uLeftHead.getOuter().style.left;
                    }
                }
            }
        ),
        /*
         * control
         * 导航栏控件
         */
        ModuleLink: ecui.inherits(
            ui.TreeView,
            {
                /*
                 * @override
                 *
                 * 重写isCollapsed，强行将树节点，点击时判断是否收缩的返回值写死为true，让它点击时永远展开
                 */
                isCollapsed: function () {
                    return true;
                }
            }
        ),
        /*
         * control
         * 导航栏菜单控件
         */
        ModuleLinkItem: ecui.inherits(
            ui.Control,
            'ui-module-link',
            {
                onclick: function () {
                    ecui.query(function (item) { return item instanceof yiche.ui.ModuleLinkItem; }).forEach(function (item) {
                        item.alterStatus('-active');
                    });
                    util.timer(function () {
                        this.alterStatus('+active');
                    }.bind(this), 0);
                }
            }
        ),
        /*
         * control
         * 防止重复提交基础控件
         */
        Submit: ecui.inherits(
            ui.Button,
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
        ),
        /**
         * control
         * 编辑 新增行 - 按钮。
         */
        AddItem: ecui.inherits(
            ui.Button,
            'add',
            function (el, options) {
                ui.Button.call(this, el, options);
                this._sTarget = options.target;
            },
            {
                onclick: function () {
                    var el = dom.create({ innerHTML: ecui.esr.getEngine().render(this._sTarget, { timestamp: Date.now() }) });
                    var parent = dom.parent(this.getMain());
                    el = dom.insertAfter(dom.first(el), parent);
                    ecui.init(el);
                }
            }
        ),
        /**
         * control
         * 编辑 删除行 - 按钮。
         */
        DeleteItem: ecui.inherits(
            ui.Button,
            {
                onclick: function () {
                    var parent = dom.parent(this.getMain()),
                        children = dom.children(dom.parent(parent));
                    if (children.length <= 1) {
                        ecui.tip('warn', '至少添加一条配置');
                        return;
                    }
                    ecui.dispose(parent);
                    dom.remove(parent);
                }
            }
        ),
        /*
         * 新建资产按钮
         */
        EditAssetBtn: ecui.inherits(
            ui.Control,
            function (el, options) {
                ui.Control.call(this, el, options);
                this.tab = options.tab;
                this.eqStatus = options.eqStatus;
                this._sAssetId = options.assetId;
                this._sIsSyncErpSuccess = options.isSyncErpSuccess;
            },
            {
                onclick: function () {
                    var options = {
                        tab: this.tab,
                        eqStatus: this.eqStatus,
                        kinds: ecui.esr.getData('kinds'),
                        brands: ecui.esr.getData('brands'),
                        suppliers: ecui.esr.getData('suppliers'),
                        companys: ecui.esr.getData('companys'),
                        isSyncErpSuccess: this._sIsSyncErpSuccess
                    };
                    if (this._sAssetId) {
                        this.disable();
                        yiche.postRequest(
                            '/asset-api/equipment/getDetailById?id=' + this._sAssetId,
                            {},
                            function (data) {
                                this.enable();
                                options.detail = data;
                                var dialog = yiche.initDialog('dialogContainer', 'editAssetDialog', options);
                                dialog.showModal();
                                dialog.owner = this;
                            }.bind(this),
                            function () {
                                this.enable();
                            }.bind(this)
                        );
                    } else {
                        var dialog = yiche.initDialog('dialogContainer', 'editAssetDialog', options);
                        dialog.showModal();
                        dialog.owner = this;
                    }
                    util.timer(function () {
                        ecui.setFocused();
                    }, 0);
                }
            }
        ),
        /*
         * 点击打开弹框的 按钮，适用于  编辑信息、查看详情 弹窗打开按钮
         * options    属性：
         * optId       操作的记录id
         * detailId    获取详情信息的记录id
         * url         获取详情信息的接口路径
         * container   dialog容器id
         * target      dialog 的 内容target 模板名称
         *
         */
        ShowDialogBtn: ecui.inherits(
            ui.Control,
            function (el, options) {
                ui.Control.call(this, el, options);
                this._sOptId = options.optId;
                this._sUrl = options.url;
                this._sContainer = options.container || 'dialogContainer';
                this._sTarget = options.target;
                this._sOptions = options;
            },
            {
                onclick: function () {
                    if (this._sUrl && this._sOptId) {
                        yiche.postRequest(
                            this._sUrl + '?id=' + this._sOptId,
                            {},
                            function (data) {
                                if (data instanceof Object) {
                                    var dialog = yiche.initDialog(this._sContainer, this._sTarget, { NS: ecui.esr.getData('NS'), optId: this._sOptId, options: this._sOptions, detail: data });
                                    dialog.showModal();
                                    dialog.owner = this;
                                    dialog.detail = data;
                                }
                            }.bind(this)
                        );
                    } else {
                        var dialog = yiche.initDialog(this._sContainer, this._sTarget, { NS: ecui.esr.getData('NS'), optId: this._sOptId, options: this._sOptions });
                        dialog.showModal();
                        dialog.owner = this;
                    }
                }
            }
        ),
        /**
         * control
         * 品牌 - 按钮 - 模板配置新增。
         */
        BrandCombox: ecui.inherits(
            ui.Combox,
            {
                onchange: function () {
                    yiche.postRequest(
                        '/asset-api/equipmentMode/getMode?brandId=' + encodeURI(this.getValue()),
                        {},
                        function (data) {
                            var modeSelect = dom.next(dom.next(this.getMain())).getControl(),
                                value = modeSelect.getValue();
                            modeSelect.removeAll(true);
                            data.unshift({ name: '全部', id: '' });
                            var el = dom.create({ innerHTML: data.map(function (item) { return util.stringFormat('<div ui="value:{0}" title="{0}">{1}</div>', item.id, item.name); }).join('')});
                            modeSelect.add(dom.children(el));
                            modeSelect.setValue(value);
                        }.bind(this)
                    );
                },
                setSelected: function (event) {
                    ui.Combox.prototype.setSelected.call(this, event);
                    this._eTextInput.title = this.getText();
                },
                oninput: function () {
                    this._eTextInput.title = this.getText();
                }
            }
        ),
        /**
         * control
         * 型号联动 新增资产弹框 - 按钮。
         */
        ModeSelect: ecui.inherits(
            ui.Combox,
            function (el, options) {
                ui.Combox.call(this, el, options);
                if (options.value !== undefined) {
                    this.initValue = options.value;
                }
            },
            {
                onchange: function () {
                    this._eTextInput.title = this.getText();
                }
            }
        ),
        /**
         * control
         * 品牌联动 新增资产弹框 - 按钮。
         */
        BrandEditCombox: ecui.inherits(
            ui.Combox,
            {
                onchange: function () {
                    yiche.postRequest(
                        '/asset-api/equipmentMode/getMode?brandId=' + encodeURI(this.getValue()),
                        {},
                        function (data) {
                            var parent = dom.parent(dom.parent(this.getMain()));
                            var modeSelect = dom.first(dom.children(dom.next(parent))[1]).getControl();
                            modeSelect.removeAll(true);
                            var el = dom.create({ innerHTML: data.map(function (item) { return util.stringFormat('<div ui="value:{0}" title="{0}">{1}</div>', item.id, item.name); }).join('')});
                            modeSelect.add(dom.children(el));
                            if (modeSelect.initValue) {
                                modeSelect.setValue(modeSelect.initValue);
                                delete modeSelect.initValue;
                            }
                        }.bind(this)
                    );
                },
                setSelected: function (event) {
                    ui.Combox.prototype.setSelected.call(this, event);
                    this._eTextInput.title = this.getText();
                },
                oninput: function () {
                    this._eTextInput.title = this.getText();
                },
                onready: function () {
                    ecui.dispatchEvent(this, 'change');
                }
            }
        ),
        /**
         * control
         * 型号联动 新增资产弹框 - 按钮。
         */
        ModeEditSelect: ecui.inherits(
            ui.Combox,
            function (el, options) {
                ui.Combox.call(this, el, options);
                if (options.value !== undefined) {
                    this.initValue = options.value;
                }
            },
            {
                onchange: function () {
                    this._eTextInput.title = this.getText();
                }
            }
        ),
        /**
         * control
         * 导出 - 按钮。
         */
        Export: ecui.inherits(
            ui.Button,
            function (el, options) {
                ui.Button.call(this, el, options);
                this._sUrl = options.url;
            },
            {
                onclick: function () {
                    var route = yiche.util.getRoute(this);
                    if (route) {
                        route = ecui.esr.getRoute(route);
                        var exportForm = document.forms.exportForm;
                        if (!document.forms.exportForm) {
                            dom.insertHTML(document.body, 'beforeEnd', '<form name="exportForm" action="" method="post" target="_blank" style="display:none;"></form>');
                            exportForm = document.forms.exportForm;
                        }
                        exportForm.action = this._sUrl;
                        var paramstr = [];
                        for (var key in route.searchParm) {
                            if (route.searchParm.hasOwnProperty(key)) {
                                var item = route.searchParm[key];
                                if (key !== '' && item !== '' && key !== 'pageNo' && key !== 'pageSize') {
                                    if (item instanceof Array) {
                                        item.forEach(function (_item) {
                                            // paramstr.push('<input type="checkbox" checked name="' + key + '" value="' + _item + '" style="display:none;">');
                                            paramstr.push('<input type="hidden" name="' + key + '" value="' + _item + '" style="display:none;">');
                                        });
                                    } else {
                                        paramstr.push('<input type="hidden" name="' + key + '" value="' + route.searchParm[key] + '">');
                                    }
                                }
                            }
                        }
                        exportForm.innerHTML = paramstr.join('');
                        exportForm.submit();
                    }
                },
                getRoute: function () {
                    var route,
                        parent = dom.parent(this.getMain());
                    for (; parent; parent = dom.parent(parent)) {
                        if (parent === document.body) {
                            break;
                        }
                        if (parent.route !== undefined) {
                            route = parent.route;
                            break;
                        }
                    }
                    return route;
                }
            }
        ),
        /**
         * control
         * 资产分配 - dialog弹框。
         */
        AllotAssetDialog: ecui.inherits(
            ui.Dialog,
            {
                onready: function () {
                    core.dispatchEvent(this, 'initstafftree', { tree: yiche.info.staffs });
                },
                $initstafftree: function (event) {
                    var el = ecui.$('organisation_tree');
                    core.dispose(el);
                    el.innerHTML =  ecui.esr.getEngine().render('staffTree', { tree: event.tree });
                    ecui.init(el);
                },
                /**
                 * control
                 * 提交 资产分配 - 操作 - dialog弹框。
                 */
                onsubmit: function () {
                    var form = document.forms.staffSelectForm,
                        data = {},
                        allotAssetSubmit = ecui.get('allotAssetSubmit');
                    ecui.esr.parseObject(form, data);

                    if (!data.staff) {
                        ecui.tip('warn', '请选择责任人');
                        return;
                    }
                    data = {
                        tab: this.tab,
                        eqStatus: this.eqStatus,
                        domainAccount: data.staff.domainAccount,
                        eqIdList: this.idList instanceof Array ? this.idList : [this.idList]
                    };
                    if (this.operate === 'transfer') {
                        data.allocateIdList = this.allocateIdList;
                    } else if (this.operate === 'borrow') {
                        delete data.eqIdList;
                        var valid = ecui.esr.parseObject(document.forms.borrowAssetForm, data);
                        if (!valid) {
                            ecui.tip('warn', '请完善标红位置信息');
                            return;
                        }
                    }
                    allotAssetSubmit.disable();
                    yiche.postRequest(
                        '/asset-api/equipment/' + (this.operate === 'borrow' ? 'borrow' : (this.operate === 'transfer' ? 'transfer' : 'allocate')),
                        data,
                        function (data) {
                            allotAssetSubmit.enable();
                            if (data instanceof Object) {
                                ecui.tip('success', data.result + (this.operate === 'borrow' ? '条资产借用成功' : (this.operate === 'transfer' ? '条资产转移成功' : '条资产分配成功')));
                                this.hide();
                                ecui.esr.callRoute(yiche.util.getRoute(this.owner), true);
                            }
                        }.bind(this),
                        function () {
                            allotAssetSubmit.enable();
                        }.bind(this)
                    );
                }
            }
        ),
        /**
         * control
         * 资产列表操作按钮
         * 批量盘点资产 - 按钮 - 资产列表页面。
         */
        InventoryAssetDialog: ecui.inherits(
            ui.Dialog,
            {
                onsubmit: function () {
                    var data = {},
                        valid = ecui.esr.parseObject(document.forms.assetInventoryForm, data);
                    if (!valid) {
                        ecui.tip('warn', '请完善标红位置信息');
                        return;
                    }
                    data.idList = this.idList instanceof Array ? this.idList : [this.idList];
                    data.tab = this.tab;
                    data.eqStatus = this.eqStatus;
                    var str = [];
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            str.push(key + '=' + data[key]);
                        }
                    }
                    this.disable();
                    yiche.postRequest(
                        '/asset-api/equipment/checkEquipment?' + str.join('&'),
                        data,
                        function (data) {
                            this.enable();
                            if (data instanceof Object || data === 1 || data === 0) {
                                ecui.tip('success', '资产盘点成功');
                                this.hide();
                                ecui.esr.callRoute(yiche.util.getRoute(this.owner), true);
                            }
                        }.bind(this),
                        function () {
                            this.enable();
                        }.bind(this)
                    );
                },
                onsuccess: util.blank
            }
        ),
        /**
         * control
         * 资产列表操作按钮
         * 批量盘点资产 - 按钮 - 资产列表页面。
         */
        SyncErpAssetDialog: ecui.inherits(
            ui.Dialog,
            {
                onsubmit: function () {
                    this.disable();
                    yiche.postRequest(
                        '/asset-api/equipment/syncErp?orderCode=' + this.orderCode + '&tab=' + this.tab + '&eqStatus=' + this.eqStatus,
                        {},
                        function (data) {
                            this.enable();
                            if (data instanceof Object) {
                                ecui.tip('success', '同步ERP成功');
                                this.hide();
                                ecui.esr.callRoute(yiche.util.getRoute(this.owner), true);
                            }
                        }.bind(this),
                        function () {
                            this.enable();
                        }.bind(this)
                    );
                }
            }
        )
    };

    Object.assign(
        yiche.ui,
        {
            ChangeTypeRadio: ecui.inherits(
                ui.Radio,
                {
                    onclick: function () {
                        var form = document.forms.assetConfChangeForm,
                            memo = form.elements.memo,
                            baseIds = form.elements.baseIds,
                            container = dom.next(baseIds.length ? baseIds[0] : baseIds);

                        this[this.getValue() === '1' ? 'addClass' : 'removeClass'](dom.parent(dom.parent(memo[0].getControl().getMain())), 'ui-hide');
                        this[this.getValue() === '1' ? 'removeClass' : 'addClass'](dom.parent(dom.parent(memo[1].getControl().getMain())), 'ui-hide');
                        if (this.getValue() !== '1') {
                            ecui.dispose(container);
                            container.innerHTML = '';
                        } else {
                            ecui.dispose(container);
                            container.innerHTML = ecui.esr.getEngine().render('templateItems');
                            ecui.init(container);
                        }
                        dom.removeClass(container, 'ui-hide');
                    },
                    addClass: function (el, className) {
                        if (!dom.hasClass(el, className)) {
                            dom.addClass(el, className);
                        }
                    },
                    removeClass: function (el, className) {
                        dom.removeClass(el, className);
                    },
                    onready: function () {
                    }
                }
            ),
            KindSelect: ecui.inherits(
                ui.Select,
                {
                    onchange: function () {
                        ecui.dispatchEvent(this, 'error');
                        var tempSelect = dom.first(dom.children(dom.next(dom.parent(dom.parent(this.getMain()))))[1]).getControl(),
                            value = this.getValue();

                        yiche.postRequest(
                            '/asset-api/configgroup/getNameList?kindId=' + value,
                            {},
                            function (data) {
                                if (data instanceof Object && value === this.getValue()) {
                                    tempSelect.removeAll(true);
                                    tempSelect.add(data.map(function (item) { return { 'code': item.name, 'value': item.id }; }));
                                    ecui.dispatchEvent(tempSelect, 'change');
                                }
                            }.bind(this)
                        );
                    },
                    onready: function () {
                        ecui.dispatchEvent(this, 'change');
                    }
                }
            ),
            // 供应商combox
            SupplierCombox: ecui.inherits(
                ui.Combox,
                function (el, options) {
                    ui.Combox.call(this, el, options);
                    if (options.value !== undefined) {
                        this.initValue = options.value;
                    }
                },
                {
                    onready: function () {
                        util.timer(function () {
                            if (this.initValue && !this.getValue()) {
                                this.getInput().value = this.initValue;
                            }
                        }.bind(this), 0);
                    }
                }
            ),
            TempSelect: ecui.inherits(
                ui.Select,
                {
                    onchange: function () {
                        var container = dom.previous(dom.last(dom.parent(dom.parent(dom.parent(this.getMain()))))),
                            value = this.getValue();
                        if (value) {
                            yiche.postRequest(
                                '/asset-api/configgroup/getDetailById?id=' + value,
                                {},
                                function (data) {
                                    if (data instanceof Object && value === this.getValue()) {
                                        ecui.dispose(container);
                                        container.innerHTML = ecui.esr.getEngine().render('templateItems', { items: data.configBases });
                                        ecui.init(container);
                                    }
                                }.bind(this)
                            );
                        } else {

                        }
                    },
                    onready: function () {
                        ecui.dispatchEvent(this, 'change');
                    }
                }
            ),
            // 资产类型
            TempTypeSelect: ecui.inherits(
                ui.Select,
                {
                    onchange: function () {
                        var type = dom.next(this.getMain()),
                            tempTypeSelect = type.getControl(),
                            value = this.getValue();
                        yiche.postRequest(
                            '/asset-api/configbase/getNames?type=' + encodeURI(value),
                            {},
                            function (data) {
                                if (data instanceof Object && value === this.getValue()) {
                                    tempTypeSelect.removeAll(true);
                                    tempTypeSelect.add(data.map(function (item) { return { 'code': item, 'value': item }; }));
                                    if (tempTypeSelect.initValue) {
                                        tempTypeSelect.setValue(tempTypeSelect.initValue);
                                        delete tempTypeSelect.initValue;
                                    }
                                    ecui.dispatchEvent(tempTypeSelect, 'change');
                                }
                            }.bind(this)
                        );
                    },
                    onready: function () {
                        ecui.dispatchEvent(this, 'change');
                    }
                }
            ),
            // 品牌型号 - 联动
            TempBrandSelect: ecui.inherits(
                ui.Select,
                function (el, options) {
                    ui.Select.call(this, el, options);
                    if (options.value !== undefined) {
                        this.initValue = options.value;
                    }
                },
                {
                    onchange: function () {
                        var kind = dom.previous(this.getMain()),
                            content = dom.next(this.getMain()),
                            tempKindSelect = kind.getControl(),
                            contentTypeSelect = content.getControl(),
                            value = this.getValue();

                        yiche.postRequest(
                            '/asset-api/configbase/getValues?type=' + encodeURI(tempKindSelect.getValue()) + '&name=' + encodeURI(value),
                            {},
                            function (data) {
                                if (data instanceof Object && value === this.getValue()) {
                                    contentTypeSelect.removeAll(true);
                                    contentTypeSelect.add(data.map(function (item) { return { 'code': item.value, 'value': item.id }; }));
                                    if (contentTypeSelect.initValue) {
                                        contentTypeSelect.setValue(contentTypeSelect.initValue);
                                        delete contentTypeSelect.initValue;
                                    }
                                }
                            }.bind(this)
                        );
                    }
                }
            ),
            // 内容 - 联动
            TempContentSelect: ecui.inherits(
                ui.Select,
                function (el, options) {
                    ui.Select.call(this, el, options);
                    if (options.value !== undefined) {
                        this.initValue = options.value;
                    }
                }
            ),
        }
    );

    Object.assign(
        yiche.ui,
        {
            /**
             * control
             * 资产列表操作按钮
             * 保存 - 按钮 - 配置录入、变更配置 弹窗
             */
            AssetConfigEditSubmit: ecui.inherits(
                yiche.ui.Submit,
                function (el, options) {
                    yiche.ui.Submit.call(this, el, options);
                    this.change = options.change;
                },
                {
                    onclick: function () {
                        var form = document.forms[this.change ? 'assetConfChangeForm' : 'assetConfEditForm'],
                            baseIdels = form.elements.baseIds,
                            baseIds = baseIdels.length ? dom.toArray(baseIdels) : [baseIdels],
                            dialog = this.findControl(ui.Dialog),
                            ids = [],
                            failed = false;
                        baseIds.forEach(function (item) {
                            if (item.getControl) {
                                var control = item.getControl();
                                if (!(control instanceof ecui.esr.CreateArray)) {
                                    var value = control.getValue();
                                    if (!value) {
                                        failed = true;
                                        ecui.dispatchEvent(control, 'error');
                                        control = dom.previous(control.getMain()).getControl();
                                        if (!control.getValue()) {
                                            ecui.dispatchEvent(control, 'error');
                                        }
                                        control = dom.previous(control.getMain()).getControl();
                                        if (!control.getValue()) {
                                            ecui.dispatchEvent(control, 'error');
                                        }
                                    } else {
                                        ids.push(value);
                                    }
                                }
                            }
                        });
                        if (failed) {
                            ecui.tip('warn', '您有为录入的配置项');
                            return;
                        }

                        if (this.change && !ecui.util.checkUpdate(form)) {
                            var cbaseIds = dialog.detail.map(function (item) { return item.cbaseId; });

                            if (cbaseIds.length === ids.length && ids.every(function (item) { return cbaseIds.indexOf(item) >= 0; })) {
                                ecui.tip('sucess', '未修改任何内容，无需提交');
                                return;
                            }
                        }
                        this.request(
                            'data@FORM /asset-api/equipment/config/' + (this.change ? 'update?assetConfChangeForm' : 'add?assetConfEditForm'),
                            function () {
                                var data = ecui.esr.getData('data');
                                if (data instanceof Object) {
                                    ecui.tip('success', this.change ? '变更配置成功' : '录入配置成功');
                                    dialog.hide();
                                    ecui.esr.callRoute(yiche.util.getRoute(dialog.owner), true);
                                }
                            }.bind(this),
                            function () {
                            }
                        );
                    }
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 保存 - 按钮 - 弹窗
             */
            AssetRemarkSubmit: ecui.inherits(
                yiche.ui.Submit,
                function (el, options) {
                    yiche.ui.Submit.call(this, el, options);
                    this.change = options.change;
                },
                {
                    onclick: function () {
                        this.request(
                            'data@FORM /asset-api/equipment/config/update?assetRemarkForm',
                            function () {
                                ecui.esr.onafterrequest();
                                var data = ecui.esr.getData('data');
                                if (data instanceof Object) {
                                    ecui.tip('success', '备注成功');
                                    var dialog = this.findControl(ui.Dialog);
                                    dialog.hide();
                                    ecui.esr.callRoute(yiche.util.getRoute(dialog.owner), true);
                                }
                            }.bind(this),
                            function () {
                                ecui.esr.onafterrequest();
                                ecui.tip('warn', '请完善标红位置信息');
                            }
                        );
                    }
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 保存 - 按钮 - 新增资产弹窗
             */
            EditAssetSubmit: ecui.inherits(
                yiche.ui.Submit,
                function (el, options) {
                    yiche.ui.Submit.call(this, el, options);
                    this._sAssetId = options.assetId;
                },
                {
                    onclick: function () {

                        var form = this.getForm(),
                            params = {},
                            me = this;

                        if (ecui.util.checkUpdate(form)) {
                            if (ecui.esr.parseObject(form, params)) {
                                if (params.serial) {
                                    if (params.serial.replace('，', ',').split(',').length > params.newNumber) {
                                        ecui.tip('warn', '序列号与新增数量不符');
                                        return;
                                    }
                                    this.disable();
                                    ecui.esr.onbeforerequest();
                                    yiche.postRequest(
                                        '/asset-api/equipment/checkSerial?serial=' + encodeURI(params.serial) + '&type=' + (this._sAssetId ? 'update&id=' + this._sAssetId : 'add&id='),
                                        {},
                                        function (res) {
                                            ecui.esr.onafterrequest();
                                            this.enable();
                                            if (res.length > 0) {
                                                var dialog = yiche.initDialog('dialogContainer_2', 'assetOperateConfirmDialog', { NS: ecui.esr.getData('NS'), title: '序列号重复', text: '序列号有重复，确认提交吗？' });
                                                dialog.showModal();
                                                dialog.owner = this;
                                                dialog.onsubmit = function () {
                                                    dialog.hide();
                                                    me.save();
                                                };
                                            } else {
                                                me.save();
                                            }
                                        }.bind(this),
                                        function () {
                                            ecui.esr.onafterrequest();
                                            this.enable();
                                            return false;
                                        }.bind(this)
                                    );
                                } else {
                                    me.save();
                                }
                            } else {
                                ecui.tip('warn', '请完善标红位置信息');
                            }
                        } else {
                            if (this._sAssetId) {
                                ecui.tip('warn', '未修改任何内容，无需提交');
                            } else {
                                ecui.esr.parseObject(form, params);
                            }
                        }
                    },
                    save: function () {
                        var form = document.forms.editAssetForm,
                            elements = form.elements,
                            params = {},
                            kinds = ecui.esr.getData('kinds'),
                            disabledControls = [];

                        kinds.forEach(function (item) {
                            if (elements.ekindId.value === item.id) {
                                params.ekindName = item.name;
                                params.ekindCode = item.code;
                            }
                        });
                        params.ebrandName = elements.ebrandId.getControl().getText();
                        params.emodeName = elements.emodeId.getControl().getText();
                        params.underCompanyName = elements.underCompanyId.getControl().getText();

                        for (var i = 0, item; item = elements[i++]; ) {
                            if (item.getControl && item.getControl() && item.getControl().isDisabled()) {
                                disabledControls.push(item.getControl());
                                item.getControl().enable();
                            }
                        }
                        var viald = ecui.esr.parseObject(form, params);
                        for (i = 0, item = null; item = disabledControls[i++]; ) {
                            item.disable();
                        }
                        if (viald) {
                            params.storeName = elements.store.getControl().getText();
                            ecui.esr.onbeforerequest();
                            this.disable();
                            yiche.postRequest(
                                '/asset-api/equipment/save/' + (this._sAssetId ? 'update' : 'add'),
                                params,
                                function (data) {
                                    ecui.esr.onafterrequest();
                                    this.enable();
                                    if (data instanceof Object) {
                                        ecui.tip('success', this._sAssetId ? '修改资产成功' : '新增资产成功');
                                        var dialog = this.findControl(ui.Dialog);
                                        dialog.hide();
                                        ecui.esr.callRoute(yiche.util.getRoute(dialog.owner), true);
                                        ecui.esr.request(
                                            'suppliers@POST /asset-api/equipment/getSupplierList',
                                            function () {
                                                var suppliers = ecui.esr.getData('suppliers');
                                                if (suppliers instanceof Object) {
                                                    yiche.info.suppliers = suppliers;
                                                }
                                            }
                                        );
                                    }
                                }.bind(this),
                                function () {
                                    ecui.esr.onafterrequest();
                                    this.enable();
                                }.bind(this)
                            );
                        }
                    }
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 批量 待报废、报废  - 按钮 - 资产列表页面。
             */
            AssetBatchOperateBtn: ecui.inherits(
                yiche.ui.Submit,
                function (el, options) {
                    yiche.ui.Submit.call(this, el, options);
                    this._sUrl = options.url;
                    this._sTip = options.tip;
                    this._sTitle = options.title || '资产操作确认';
                    this._sText = options.text || '确认处理这条数据？';
                },
                {
                    onclick: function () {
                        var data = {};
                        ecui.esr.parseObject(this.getForm(), data);
                        if (data.idList === undefined) {
                            ecui.tip('warn', '请至少选择一条资产');
                            return;
                        }
                        var dialog = yiche.initDialog('dialogContainer', 'assetOperateConfirmDialog', { NS: ecui.esr.getData('NS'), options: this._sOptions, title: this._sTitle, text: this._sText });
                        dialog.showModal();
                        dialog.owner = this;
                        dialog.onsubmit = function () {
                            this.disable();
                            // dialog.disable();
                            yiche.postRequest(
                                this._sUrl,
                                {
                                    tab: ecui.esr.getData('tab'),
                                    eqStatus: ecui.esr.getData('eqStatus'),
                                    idList: data.idList instanceof Array ? data.idList : [data.idList]
                                },
                                function (data) {
                                    this.enable();
                                    // dialog.enable();
                                    if (data instanceof Object) {
                                        this.onsuccess(data);
                                        if (this._sTip) {
                                            ecui.tip('success', data.result + '条' + this._sTip);
                                        }
                                        dialog.hide();
                                        ecui.esr.callRoute(yiche.util.getRoute(this), true);
                                    }
                                }.bind(this),
                                function () {
                                    this.enable();
                                    // dialog.enable();
                                }.bind(this)
                            );
                        }.bind(this);
                    },
                    onsuccess: util.blank
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 单个 待报废、报废  - 按钮 - 资产列表页面。
             */
            AssetOperateBtn: ecui.inherits(
                yiche.ui.Submit,
                function (el, options) {
                    yiche.ui.Submit.call(this, el, options);
                    this._sUrl = options.url;
                    this._sTip = options.tip;
                    this._sAssetId = options.assetId;
                    this._sTitle = options.title || '资产操作确认';
                    this._sText = options.text || '确认处理这条数据？';
                },
                {
                    onclick: function () {

                        var dialog = yiche.initDialog('dialogContainer', 'assetOperateConfirmDialog', { NS: ecui.esr.getData('NS'), options: this._sOptions, title: this._sTitle, text: this._sText });
                        dialog.showModal();
                        dialog.owner = this;
                        dialog.onsubmit = function () {

                            this.disable();
                            // dialog.disable();
                            yiche.postRequest(
                                this._sUrl,
                                {
                                    tab: ecui.esr.getData('tab'),
                                    eqStatus: ecui.esr.getData('eqStatus'),
                                    idList: [this._sAssetId]
                                },
                                function (data) {
                                    this.enable();
                                    // dialog.enable();
                                    if (data instanceof Object) {
                                        this.onsuccess(data);
                                        if (this._sTip) {
                                            ecui.tip('success', data.result + '条' + this._sTip);
                                        }
                                        dialog.hide();
                                        ecui.esr.callRoute(yiche.util.getRoute(this), true);
                                    }
                                }.bind(this),
                                function () {
                                    this.enable();
                                    // dialog.enable();
                                }.bind(this)
                            );
                        }.bind(this);
                    },
                    onsuccess: util.blank
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 待报废、报废  - 按钮 - 资产列表页面。
             */
            AssetCheckbox: ecui.inherits(
                ui.Checkbox,
                function (el, options) {
                    ui.Checkbox.call(this, el, options);
                    this._sAllocateId = options.allocateId;
                    this._sOrderCode = options.orderCode;
                },
                {
                    getAllocateId: function () {
                        return this._sAllocateId;
                    },
                    getOrderCode: function () {
                        return this._sOrderCode;
                    }
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 批量 分配、转移  - 按钮 - 资产列表页面。
             */
            BatchAssetShowDialogBtn: ecui.inherits(
                ui.Button,
                function (el, options) {
                    ui.Button.call(this, el, options);
                    this._sOperate = options.operate;
                    this._sTarget = options.target;
                },
                {
                    onclick: function () {
                        var data = {},
                            form = this.getForm(),
                            idList = form.elements.idList,
                            idListEls = idList.length ? dom.toArray(idList) : [idList];
                        ecui.esr.parseObject(form, data);
                        if (data.idList === undefined) {
                            ecui.tip('warn', '请至少选择一条资产');
                            return;
                        }
                        // if (this._sOperate === 'inventory') {
                        //     if (data.idList instanceof Array) {
                        //         ecui.tip('warn', '资产盘点暂时不支持批量操作');
                        //         return;
                        //     }
                        // }
                        var dialog = yiche.initDialog('dialogContainer', this._sTarget, { NS: ecui.esr.getData('NS'), operate: this._sOpeate });
                        dialog.showModal();
                        dialog.idList = data.idList;
                        dialog.tab = ecui.esr.getData('tab');
                        dialog.eqStatus = ecui.esr.getData('eqStatus');
                        // dialog.idList = data.idList instanceof Array ? data.idList : [data.idList];

                        dialog.owner = this;
                        dialog.operate = this._sOperate;
                        if (this._sOperate === 'transfer') {
                            dialog.allocateIdList = [];
                            for (var i = 0, item; item = idListEls[i++]; ) {
                                if (item.getControl) {
                                    var control = item.getControl();
                                    if (control.isChecked()) {
                                        dialog.allocateIdList.push(control.getAllocateId());
                                    }
                                }
                            }
                        }
                    }
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 单个 分配、转移  - 按钮 - 资产列表页面。
             */
            AllotAssetBtn: ecui.inherits(
                ui.Control,
                function (el, options) {
                    ui.Button.call(this, el, options);
                    this._sOperate = options.operate;
                    this._sAssetId = options.assetId;
                    this.tab = options.tab;
                    this.eqStatus = options.eqStatus;
                    this._sAllocateId = options.allocateId;
                    this._sTarget = options.target;
                },
                {
                    onclick: function () {
                        var dialog = yiche.initDialog('dialogContainer', 'allotAssetDialog', { NS: ecui.esr.getData('NS'), operate: this._sOpeate, optId: this._sOptId });
                        dialog.showModal();
                        dialog.idList = [this._sAssetId];
                        dialog.owner = this;
                        dialog.operate = this._sOperate;
                        dialog.tab = this.tab;
                        dialog.eqStatus = this.eqStatus;
                        if (this._sOperate === 'transfer') {
                            dialog.allocateIdList = [this._sAllocateId];
                        }
                    }
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 单个 分配、转移  - 按钮 - 资产列表页面。
             */
            BorrowAssetBtn: ecui.inherits(
                ui.Control,
                function (el, options) {
                    ui.Button.call(this, el, options);
                    this._sOptId = options.optId;
                    this.tab = options.tab;
                    this.eqStatus = options.eqStatus;
                },
                {
                    onclick: function () {
                        var dialog = yiche.initDialog('dialogContainer', 'borrowAssetDialog', { NS: ecui.esr.getData('NS'), operate: this._sOpeate, optId: this._sOptId });
                        dialog.showModal();
                        dialog.idList = [this._sOptId];
                        dialog.owner = this;
                        dialog.operate = 'borrow';
                        dialog.tab = this.tab;
                        dialog.eqStatus = this.eqStatus;
                    }
                }
            ),
            /**
             * control
             * 资产列表操作按钮
             * 批量 同步ERP  - 按钮 - 资产列表页面。
             */
            AssetBatchSyncErpBtn: ecui.inherits(
                yiche.ui.Submit,
                function (el, options) {
                    yiche.ui.Submit.call(this, el, options);
                    this._sUrl = options.url || '/asset-api/equipment/checkSyncErp';
                    this._sTip = options.tip;
                },
                {
                    onclick: function () {
                        var data = {},
                            idList = this.getForm().elements.idList,
                            lists = idList.length ? dom.toArray(idList) : [idList],
                            tab = ecui.esr.getData('tab'),
                            eqStatus = ecui.esr.getData('eqStatus'),
                            orderCode;
                        ecui.esr.parseObject(this.getForm(), data);
                        if (data.idList === undefined) {
                            ecui.tip('warn', '请至少选择一条资产');
                            return;
                        }
                        if (data.idList instanceof Array) {
                            ecui.tip('warn', '同步ERP功能，暂时不支持批量操作');
                            return;
                        }
                        for (var i = 0, item; item = lists[i++]; ) {
                            if (item.getControl && item.getControl().isChecked()) {
                                orderCode = item.getControl().getOrderCode();
                                break;
                            }
                        }
                        this.disable();
                        yiche.postRequest(
                            this._sUrl + '?orderCode=' + orderCode + '&tab=' + tab + '&eqStatus=' + eqStatus,
                            {},
                            function (data) {
                                this.enable();
                                if (data instanceof Object) {
                                    this.onsuccess(data);

                                    var dialog = yiche.initDialog('dialogContainer', 'syncErpAssetDialog', { NS: ecui.esr.getData('NS'), orderCode: orderCode, number: data.number, tab: tab });
                                    dialog.showModal();
                                    dialog.owner = this;
                                    dialog.orderCode = orderCode;
                                    dialog.tab = tab;
                                    dialog.eqStatus = eqStatus;
                                }
                            }.bind(this),
                            function () {
                                this.enable();
                            }.bind(this)
                        );
                    },
                    onsuccess: util.blank
                }
            ),
            /**
             * control
             * 新增、编辑  弹框  提交 - 按钮。
             * options    属性：
             * modeId       型号id
             */
            EditAssetAddModeShowDialogBtn: ecui.inherits(
                ui.Button,
                {
                    onclick: function () {
                        var control = dom.first(dom.children(dom.previous(dom.parent(this.getMain())))[1]).getControl(),
                            id = control.getValue(),
                            name = control.getText(),
                            modeSelect = dom.first(dom.previous(this.getMain())).getControl();
                        if (!id) {
                            ecui.tip('warn', '请选择品牌');
                            return;
                        }
                        var dialog = yiche.initDialog('dialogContainer_1', 'editAssetAddModeDialog', { NS: ecui.esr.getData('NS'), id: id, name: name });
                        dialog.showModal();
                        dialog.owner = this;
                        dialog.onsubmit = function () {
                            var data = {},
                                form = document.forms.editAssetAddModeForm,
                                valid = ecui.esr.parseObject(form, data);
                            if (!valid) {
                                ecui.tip('warn', '请完善标红位置信息');
                                return;
                            }
                            yiche.postRequest(
                                '/asset-api/equipmentMode/save/add',
                                data,
                                function (res) {
                                    if (res instanceof Object) {
                                        ecui.tip('success', '新增型号成功');
                                        dialog.hide();
                                        modeSelect.add({ code: data.name, value: res.equipmentModeId });
                                        modeSelect.setValue(res.equipmentModeId);
                                    }
                                }.bind(this)
                            );
                        };
                    }
                }
            ),
            /**
             * control
             * 新增 品牌 弹框 - 按钮。
             * options    属性：
             * modeId       型号id
             */
            EditBrandBtn: ecui.inherits(
                ui.Button,
                {
                    onclick: function () {
                        var dialog = yiche.initDialog('dialogContainer_2', 'editBrandDialog', { NS: ecui.esr.getData('NS') });
                        dialog.showModal();
                    }
                }
            ),
            /**
             * control
             * 新增 品牌 弹框 - 按钮。
             * options    属性：
             * modeId       型号id
             */
            EditBrandSubmit: ecui.inherits(
                ui.Button,
                function (el, options) {
                    ui.Button.call(this, el, options);
                    this.brandId = options.brandId;
                },
                {
                    onclick: function () {
                        this.disable();
                        var data = {},
                            form = document.forms.editBrandForm,
                            valid = ecui.esr.parseObject(form, data);
                        if (!valid) {
                            ecui.tip('warn', '请完善标红位置信息');
                            return;
                        }
                        yiche.postRequest(
                            '/asset-api/equipmentBrand/save?name=' + encodeURI(data.name),
                            data,
                            function (data) {
                                this.enable();
                                if (data instanceof Object || data === 1) {
                                    ecui.tip('success', '添加成功');
                                    this.findControl(ecui.ui.Dialog).hide();
                                    ecui.esr.request(
                                        'brands@POST /asset-api/equipmentBrand/getList',
                                        function () {
                                            var brands = ecui.esr.getData('brands');
                                            if (brands instanceof Object) {
                                                yiche.info.brands = brands;
                                                var editModeBrandCombox = ecui.get('editModeBrandCombox'),
                                                    editAssetModeBrandCombox = ecui.get('editAssetModeBrandCombox'),
                                                    value = data.equipmentBrandId;
                                                if (editModeBrandCombox) {
                                                    editModeBrandCombox.removeAll(true);
                                                    editModeBrandCombox.add(brands.map(function (item) { return { code: item.name, value: item.id }; }));
                                                    editModeBrandCombox.setValue(value);
                                                    ecui.dispatchEvent(editModeBrandCombox, 'change');
                                                }
                                                if (editAssetModeBrandCombox) {
                                                    editAssetModeBrandCombox.removeAll(true);
                                                    editAssetModeBrandCombox.add(brands.map(function (item) { return { code: item.name, value: item.id }; }));
                                                    editAssetModeBrandCombox.setValue(value);
                                                    ecui.dispatchEvent(editAssetModeBrandCombox, 'change');
                                                }
                                            }
                                        }.bind(this),
                                        function () {}.bind(this)
                                    );
                                }
                            }.bind(this),
                            function () {
                                this.enable();
                            }.bind(this)
                        );
                    }
                }
            )
        }
    );

    function queryTree(obj, key, searchTree) {
        if (!obj) {
            return;
        }
        if (obj.name.indexOf(key) !== -1) {
            searchTree.push(obj);
        }
        obj.children.forEach(function (item) {
            queryTree(item, key, searchTree);
        });
    }
    /**
     * 人员选择相关控件  - 按钮 - 资产列表页面。
     */
    Object.assign(
        yiche.ui,
        {
            /**
             * control
             * 人员搜索输入框控件。
             */
            OrganTreeSearchText: ecui.inherits(
                ui.Text,
                function (el, options) {
                    ui.Text.call(this, el, options);
                    ecui.$fastCreate(this.SearchBtn, dom.last(el), this, options);
                },
                {
                    clearTimer: util.blank,
                    SearchBtn: ecui.inherits(
                        ui.Button,
                        {
                            onclick: function () {
                                this.getParent().searchStaff();
                            }
                        }
                    ),
                    oninput: function () {
                        this.clearTimer();
                        this.clearTimer = util.timer(function () {
                            this.searchStaff();
                        }.bind(this), 300);
                    },
                    onkeydown: function (event) {
                        if (event.which === 13) {
                            this.searchStaff();
                        }
                    },
                    searchStaff: function () {
                        var key  = this.getValue(),
                            staffs = yiche.info.staffs,
                            searchTree = [],
                            dialog = ecui.get('allotAssetDialog');
                        if (staffs) {
                            if (!key) {
                                ecui.dispatchEvent(dialog, 'initstafftree', {tree: staffs});
                            } else {
                                queryTree(staffs[0], key, searchTree);
                                ecui.dispatchEvent(dialog, 'initstafftree', {tree: searchTree});
                            }
                        }
                    }
                }
            ),
            /**
             * control
             * 部门、员工关系树 列表控件。
             */
            OrganTree: ecui.inherits(
                ui.TreeView,
                function (el, options) {
                    ui.TreeView.call(this, el, options);
                    this._sName = options.name;
                    this._sValue = options.value;
                    this._sPath = options.path;
                    this._sEmployeeNumber = options.employeeNumber;
                    this._sParentId = options.parentId;
                    this._sDomainAccount = options.domainAccount;
                },
                {
                    onnodeclick: function () {
                        if (!this._eChildren) {
                            var allotAssetStaffItems = ecui.get('allotAssetStaffItems');
                            if (!allotAssetStaffItems.isExist(this._sValue)) {
                                allotAssetStaffItems.add({
                                    name: this._sName,
                                    value: this._sValue,
                                    employeeNumber: this._sEmployeeNumber,
                                    parentId: this._sParentId,
                                    path: this._sPath,
                                    domainAccount: this._sDomainAccount
                                });
                            }
                        }
                    }
                }
            ),
            /**
             * control
             * 已选择员工 列表控件。
             */
            StaffItems: ecui.inherits(
                ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._sInputname = options.inputname;
                },
                ui.Items,
                {
                    Item: ecui.inherits(
                        ecui.ui.Item,
                        function (el, options) {
                            ecui.ui.Item.call(this, el, options);
                            this._eDeleteButton = el.children[1];
                            if (this._eDeleteButton) {
                                this._uDeleteButton = ecui.$fastCreate(this.DeleteButton, this._eDeleteButton, this, {});
                            }
                        },
                        {
                            DeleteButton: ecui.inherits(
                                ecui.ui.Control,
                                function (el, options) {
                                    ecui.ui.Control.call(this, el, options);
                                },
                                {
                                    $click: function (event) {
                                        ecui.ui.Control.prototype.$click.call(this, event);
                                        var items = this.getParent().getParent(),
                                            item = this.getParent();
                                        items.remove(item);
                                    }
                                }
                            )
                        }
                    ),
                    add: function (info) {
                        if (!info.value) {
                            return;
                        }
                        var el = ecui.dom.create('div');
                        el.innerHTML = ecui.esr.getEngine().render('staffItem', {
                            item: {
                                inputname: this._sInputname,
                                name: info.name,
                                value: info.value,
                                empNum: info.empNum,
                                parentId: info.parentId,
                                path: info.path,
                                domainAccount: info.domainAccount
                            }
                        });
                        var item = dom.first(el);
                        ecui.init(item);
                        this.removeAll(true);
                        ecui.ui.Items.Methods.add.call(this, item, info.index);
                    },
                    $alterItems: ecui.util.blank,
                    isExist: function (value) {
                        var res = false;
                        this.getItems().forEach(function (item) {
                            var curValue = item.getBody().getElementsByTagName('INPUT')[1].value;
                            if (value === curValue) {
                                res = true;
                            }
                        });
                        return res;
                    }
                }
            )
        }
    );

    Object.assign(
        yiche.ui,
        {
            UploadFile: ecui.inherits(
                ui.Upload,
                '',
                function (el, options) {
                    ui.Upload.call(this, el, options);
                    this._eFile = el.getElementsByTagName('INPUT')[0];
                    this._eInput = el.getElementsByTagName('INPUT')[1];
                },
                {
                    onclick: function () {
                        this._eFile.click();
                    },
                    setLoading: function () {
                    },
                    onbeforeupload: function () {
                    },
                    onready: function () {
                        dom.addEventListener(this._eFile, 'change', function () {
                            ecui.esr.onbeforerequest();
                            this.disable();
                        }.bind(this));
                    },
                    onupload: function (res) {
                        this.enable();
                        ecui.esr.onafterrequest();
                        res = JSON.parse(res);
                        dom.last(this.getMain()).innerHTML = this._eFile.files[0].name;
                        this._eFile.value = ''; // 解决连续操作上传删除同一张图片时，第二次上传失败问题
                        if (res.code === 0) { // 显示上传的图片
                            this._eInput.value = res.data.id;
                        } else if (res.code === 12020) {
                            ecui.tip('error', '最大支持10m图片，请重新选择');
                            ecui.dispatchEvent(this, 'error');
                        } else {
                            ecui.tip('error', res.msg);
                            ecui.dispatchEvent(this, 'error');
                        }
                    },
                    onerror: function () {
                        this.enable();
                        ecui.esr.onafterrequest();
                        this._eFile.value = '';
                    },
                    getInputEl: function () {
                        return this._eInput;
                    }
                }
            )
        }
    );

    yiche.ui.PicDelete = ecui.inherits(
        ui.Control,
        {
            $click: function (event) {
                var parent = this.getParent();
                parent.deleteImg();
                event.stopPropagation();
            }
        }
    );
    // 三级联动控件，选择到二级和三级时都可以提交
    yiche.ui.BankCardNo = ecui.inherits(
        ui.Text,
        function (el, options) {
            ui.Text.call(this, el, options);
            this.customerId = options.customerId;
            this.param = options.param;
        },
        {
            searchValue: '',
            $blur: function (event) {
                ui.Text.prototype.$blur.call(this, event);
                var value = this.getValue();
                if (value === this.searchValue) {
                    return;
                }
                if (this.getValue()) {
                    var url = 'CheckParamRepeat@FORM customer/check-param-repeat?businessSide=1&customerId=' + this.customerId + '&mapParamer.' + this.param + '=' + this.getValue();
                    ecui.esr.request(url, function () {
                        if (ecui.esr.getData('CheckParamRepeat').length) {
                            ecui.tip('error', ecui.esr.getData('CheckParamRepeat'));
                        }
                    });
                }
                this.searchValue = value;

                ecui.esr.request('bankInfo@GET customer/bank-card-info/' + value, function () {
                    var bankInfo = ecui.esr.getData('bankInfo');
                    if (bankInfo) {
                        if (bankInfo.bankCode) {
                            var bankName = ecui.query(function (item) {
                                return item instanceof yiche.ui.BankName;
                            })[0];
                            bankName.setBankByCode(bankInfo.bankCode);
                        }
                    }
                }, function () {

                });
            }
        }
    );
    yiche.ui.AddBankCardNo = ecui.inherits(
        ui.Text,
        function (el, options) {
            ui.Text.call(this, el, options);
            this.customerId = options.customerId;
            this.param = options.param;
        },
        {
            searchValue: '',
            $blur: function (event) {
                ui.Text.prototype.$blur.call(this, event);
                var value = this.getValue();
                if (value === this.searchValue) {
                    return;
                }
                if (this.getValue()) {
                    var url = 'CheckParamRepeat@FORM customer/check-param-repeat?businessSide=1&customerId=' + this.customerId + '&mapParamer.' + this.param + '=' + this.getValue();
                    ecui.esr.request(url, function () {
                        if (ecui.esr.getData('CheckParamRepeat').length) {
                            ecui.tip('error', ecui.esr.getData('CheckParamRepeat'));
                        }
                    });
                }
                this.searchValue = value;

                ecui.esr.request('bankInfo@GET customer/bank-card-info/' + value, function () {
                    var bankInfo = ecui.esr.getData('bankInfo');
                    if (bankInfo) {
                        if (bankInfo.bankCode) {
                            var bankName = ecui.query(function (item) {
                                return item instanceof yiche.ui.AddBankName;
                            })[0];
                            bankName.setBankByCode(bankInfo.bankCode);
                        }
                    }
                }, function () {

                });
            }
        }
    );
    // 银行名称下拉搜索选择
    yiche.ui.BankName = ecui.inherits(
        ui.Combox,
        function (el, options) {
            ui.Combox.call(this, el, options);
            this.cardAttribute = options.cardAttribute;
            this.bankList = JSON.parse(localStorage.getItem('bankList' + (this.cardAttribute === '2' ? '_public' : '')) || '[]');
        },
        {
            curLists: [],
            searchValue: '',
            inputTime: 0,
            clearTimer: ecui.util.blank,
            init: function () {
                this.getBankName();
                this.addItems(this.bankList.map(function (item) {
                    return {
                        code: item.bankName,
                        value: item.bankCode
                    };
                }));
            },
            getBankName: function () {
                ecui.esr.request(
                    'bankList@GET customer/bank-list?cardAttribute=' + this.cardAttribute,
                    function () {
                        var bankList = ecui.esr.getData('bankList');
                        if (bankList && bankList.length) {
                            localStorage.setItem('bankList' + (this.cardAttribute === '2' ? '_public' : ''), JSON.stringify(bankList));
                            this.bankList = bankList;
                            var value = this.tmp_value || this.getFormValue();
                            this.addItems(bankList.map(function (item) {
                                return {
                                    code: item.bankName,
                                    value: item.bankCode
                                };
                            }));
                            this.setValue(value);
                            delete this.tmp_value;
                        }
                    }.bind(this),
                    function () {

                    }.bind(this)
                );
            },
            $blur: function (event) {
                ui.Combox.prototype.$blur.call(this, event);
                this.clearTimer();
                this.checkValue();
            },
            addItems: function (data) {
                var text = this.getInput().value;
                this.curLists = data;
                this.removeAll(true);
                this.add(data);
                // removeAll 时会把输入框的值清除，在removeAll后重置输入框的值
                this.getInput().value = text;
                this.alterStatus('-placeholder');
            },
            setBankByCode: function (code) {
                this.setBank(this.bankList.filter(function (item) {
                    return item.bankCode === code;
                })[0]);
            },
            // 设置 银行选项
            setBank: function (bank) {
                var val = this.curLists.filter(function (item) {
                    return item.bankCode === bank.bankCode;
                });
                if (!val.length) {
                    this.addItems(this.bankList.map(function (item) {
                        return {
                            code: item.bankName,
                            value: item.bankCode
                        };
                    }));
                }
                this.setValue(bank.bankCode);

                var form = this.getInput().form;
                form.elements[this.cardAttribute === '2' ? 'customerBankName' : 'bankName'].value = bank.bankName;
                form.elements[this.cardAttribute === '2' ? 'customerBankType' : 'bankType'].value = bank.bankType;
            },
            // 检测输入银行是否存在
            checkValue: function () {
                var text = this.getInput().value,
                    bank;
                for (var i = 0, item; item = this.bankList[i++]; ) {
                    if (text === item.bankName) {
                        bank = item;
                        break;
                    }
                }

                if (bank) {
                    this.setValue(bank.bankCode);
                } else {
                    ecui.tip('error', '你输入的银行名称在银行列表中不存在，请重新输入');
                }
                return bank;
            },
            changeItems: function () {
                var value = this.getInput().value.trim(),
                    lists = [];

                this.bankList.forEach(function (item) {
                    if (item.bankName.indexOf(value) >= 0) {
                        lists.push({
                            code: item.bankName,
                            value: item.bankCode
                        });
                    }
                });
                this.addItems(lists);
            },
            $input: function (event) {
                ui.Combox.prototype.$input.call(this, event);
                this.clearTimer();
                // 搜索
                this.changeItems();
                // 输入两秒后校验输入 银行 是否存在
                this.clearTimer = ecui.util.timer(this.checkValue.bind(this), 2000);
            },
            // 设置 bankCode、bankName、bankType
            setValue: function (value) {
                if (this.bankList.length) {
                    ui.Combox.prototype.setValue.call(this, value);

                    var bank = this.bankList.filter(function (item) {
                        return value === item.bankCode;
                    }.bind(this))[0] || {};

                    var form = this.getInput().form;
                    form.elements[this.cardAttribute === '2' ? 'customerBankName' : 'bankName'].value = bank.bankName;
                    form.elements[this.cardAttribute === '2' ? 'customerBankType' : 'bankType'].value = bank.bankType;
                } else {
                    this.tmp_value = value;
                }
            }
        }
    );
    yiche.ui.AddBankName = ecui.inherits(
        ui.Combox,
        function (el, options) {
            ui.Combox.call(this, el, options);
            this.cardAttribute = options.cardAttribute;
            this.bankList = JSON.parse(localStorage.getItem('bankList' + (this.cardAttribute === '2' ? '_public' : '')) || '[]');
        },
        {
            curLists: [],
            searchValue: '',
            inputTime: 0,
            clearTimer: ecui.util.blank,
            init: function () {
                this.getBankName();
                this.addItems(this.bankList.map(function (item) {
                    return {
                        code: item.bankName,
                        value: item.bankCode
                    };
                }));
            },
            getBankName: function () {
                ecui.esr.request(
                    'bankList@GET customer/bank-list?cardAttribute=' + this.cardAttribute,
                    function () {
                        var bankList = ecui.esr.getData('bankList');
                        if (bankList && bankList.length) {
                            localStorage.setItem('bankList' + (this.cardAttribute === '2' ? '_public' : ''), JSON.stringify(bankList));
                            this.bankList = bankList;
                            var value = this.tmp_value || this.getFormValue();
                            this.addItems(bankList.map(function (item) {
                                return {
                                    code: item.bankName,
                                    value: item.bankCode
                                };
                            }));
                            this.setValue(value);
                            delete this.tmp_value;
                        }
                    }.bind(this),
                    function () {

                    }.bind(this)
                );
            },
            $blur: function (event) {
                ui.Combox.prototype.$blur.call(this, event);
                this.clearTimer();
                this.checkValue();
            },
            addItems: function (data) {
                var text = this.getInput().value;
                this.curLists = data;
                this.removeAll(true);
                this.add(data);
                // removeAll 时会把输入框的值清除，在removeAll后重置输入框的值
                this.getInput().value = text;
                this.alterStatus('-placeholder');
            },
            setBankByCode: function (code) {
                this.setBank(this.bankList.filter(function (item) {
                    return item.bankCode === code;
                })[0]);
            },
            // 设置 银行选项
            setBank: function (bank) {
                var val = this.curLists.filter(function (item) {
                    return item.bankCode === bank.bankCode;
                });
                if (!val.length) {
                    this.addItems(this.bankList.map(function (item) {
                        return {
                            code: item.bankName,
                            value: item.bankCode
                        };
                    }));
                }
                this.setValue(bank.bankCode);

                var form = this.getInput().form;
                form.elements[this.cardAttribute === '2' ? 'customerBankName' : 'name'].value = bank.bankName;
                form.elements[this.cardAttribute === '2' ? 'customerBankType' : 'type'].value = bank.bankType;
            },
            // 检测输入银行是否存在
            checkValue: function () {
                var text = this.getInput().value,
                    bank;
                for (var i = 0, item; item = this.bankList[i++]; ) {
                    if (text === item.bankName) {
                        bank = item;
                        break;
                    }
                }

                if (bank) {
                    this.setValue(bank.bankCode);
                } else {
                    ecui.tip('error', '你输入的银行名称在银行列表中不存在，请重新输入');
                }
                return bank;
            },
            changeItems: function () {
                var value = this.getInput().value.trim(),
                    lists = [];

                this.bankList.forEach(function (item) {
                    if (item.bankName.indexOf(value) >= 0) {
                        lists.push({
                            code: item.bankName,
                            value: item.bankCode
                        });
                    }
                });
                this.addItems(lists);
            },
            $input: function (event) {
                ui.Combox.prototype.$input.call(this, event);
                this.clearTimer();
                // 搜索
                this.changeItems();
                // 输入两秒后校验输入 银行 是否存在
                this.clearTimer = ecui.util.timer(this.checkValue.bind(this), 2000);
            },
            // 设置 bankCode、bankName、bankType
            setValue: function (value) {
                if (this.bankList.length) {
                    ui.Combox.prototype.setValue.call(this, value);

                    var bank = this.bankList.filter(function (item) {
                        return value === item.bankCode;
                    }.bind(this))[0] || {};

                    var form = this.getInput().form;
                    form.elements[this.cardAttribute === '2' ? 'customerBankName' : 'name'].value = bank.bankName;
                    form.elements[this.cardAttribute === '2' ? 'customerBankType' : 'type'].value = bank.bankType;
                } else {
                    this.tmp_value = value;
                }
            }
        }
    );
    yiche.ui.CheckParamRepeat = ecui.inherits(
        ui.Text,
        function (el, options) {
            ui.Text.call(this, el, options);
            this.param = options.param;
            this.customerId = options.customerId;
            this.regexp = options.regexp;
        },
        {
            searchValue: '',
            $blur: function (event) {
                ui.Text.prototype.$blur.call(this, event);
                var value = this.getValue();
                var reg = RegExp(this.regexp);
                var canCheck = reg.test(value);
                if (value === this.searchValue) {
                    return;
                }
                if (value && canCheck) {
                    var url = 'CheckParamRepeat@FORM customer/check-param-repeat?businessSide=1&customerId=' + this.customerId + '&mapParamer.' + this.param + '=' + value;
                    ecui.esr.request(url, function () {
                        if (ecui.esr.getData('CheckParamRepeat').flag === 0) {
                            var checkDialog = yiche.initDialog(ecui.$('dialogContainer'), 'checkDialog', {data: ecui.esr.getData('CheckParamRepeat')});
                            checkDialog.showModal();
                        }
                    });
                } else {
                    this.$error();
                }
                this.searchValue = value;
            }
        }
    );
}());
