
(function () {
    var core = ecui,
        util = core.util,
        ui = ecui.ui,
        dom = ecui.dom;

    Object.assign(
        NS.data,
        {
        }
    );
    Object.assign(
        NS.ui,
        {
        }
    );
    ecui.esr.addRoute('example', {
        model: [''],
        routeView: '', // 父页面改变路由渲染模板
        view: function (context, callback) {
            callback(this.routeView || 'page.example');
            return false;
        },
        onbeforerequest: function (context) {
        },
        onbeforerender: function (context) {
        },
        onafterrender: function (context) {
        }
    });
}());

