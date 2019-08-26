(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
    ecui.esr.addRoute('list', {
        model: [''],
        main: 'container',
        view: 'search',
        children: 'searchListTable',
        onbeforerequest: function (context) {
            ecui.esr.getRoute(this.children).searchParm = {
                pageNo: 1,
                pageSize: 10
            };
        },
        onbeforerender: function (context) {
            dom.addClass(ecui.$('nav_bar'), 'ui-hide');
        },
        onleave: function () {
            yiche.util.removeDialog();
            dom.removeClass(ecui.$('nav_bar'), 'ui-hide');
        }
    });
    // 待报废列表
    ecui.esr.addRoute('searchListTable', new ecui.ui.BTableListRoute({
        NAME: 'searchListTable',
        url: '/asset-api/equipment/getListByPage?searchForm',
        searchParm: {
            pageNo: 1,
            pageSize: 10
        },
        onbeforerender: function (context) {
            context.searchList = Object.assign({}, yiche.info.list);
            ui.BTableListRoute.prototype.onbeforerender.call(this, context);


            context.searchList.offset = (Number(context.pageNo) - 1) * 10;
            context.offset = context.searchList.offset;
            var num = Math.round(Math.random() * 50);
            context.searchList.record = context.searchList.record.slice(num, num + 10);
            // context.waitScrapList.record = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        }
    }));
}());