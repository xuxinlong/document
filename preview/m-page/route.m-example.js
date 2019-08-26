
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
    ecui.esr.addRoute('m-example', {
        model: [''],
        routeView: '', // 父页面改变路由渲染模板
        view: function (context, callback) {
            callback(this.routeView || 'm-example');
            return false;
        },
        onbeforerequest: function (context) {
            yiche.iframeReady['iframe-' + context.iframeId] = true;
        },
        onbeforerender: function (context) {
        },
        onafterrender: function (context) {
        }
    });
}());

