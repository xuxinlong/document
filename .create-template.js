/***route.js-begin***/
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
    ecui.esr.addRoute('{route}', {
        model: [''],
        onbeforerequest: function (context) {
        },
        onbeforerender: function (context) {
        },
        onafterrender: function (context) {
        }
    });
}());
/***route.js-end***/

/***route.html-begin***/
<!-- target:{route} -->
<div class="page-container">
    <div class="page-title">{route}页面的内容区域</div>
</div>
/***route.html-end***/

/***route.css-begin***/

/***route.css-end***/

/***layer.html-begin***/
<header>
    <div class="left-wrap">
        <span ui="type:mao.ui.Back" class="back">
            <img src='images/base/back.png'/>
        </span>
    </div>
    <div class="title-wrap">
        <strong>{route}</strong>
    </div>
    <div class="right-wrap">
    </div>
</header>
<container></container>
/***layer.html-end***/