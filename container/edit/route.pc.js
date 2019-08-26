
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
    ecui.esr.addRoute('pc', {
        main: 'container',
        model: [''],
        onbeforerequest: function (context) {
        },
        onbeforerender: function (context) {
            context.pcCode = {
                html: '<div class="page-cont">\n    <div>点击下面的按钮显示当前时间</div>\n    <div ui="type:yiche.ui.TestBtn" class="blue-btn">当前时间</div>\n    <div id="test"></div>\n</div>\n',
                css: 'body {\n    .page-cont {\n        padding: 10px 20px;\n    }\n    .ui-test-button {\n     margin: 10px 0;\n    }\n    #test {\n       color: red;\n    }\n}\n',
                js: 'yiche.ui.TestBtn = ecui.inherits(\n    ecui.ui.Button,\n    \'ui-test-button\',\n    {\n       onclick: function () {\n            ecui.$(\'test\').innerHTML = ecui.util.formatDate(new Date(), \'yyyy-MM-dd HH:mm:ss\');\n           ecui.tip(\'success\', \'显示当前时间\');\n        },\n        onready: function () {\n            ecui.$(\'test\').innerHTML = ecui.util.formatDate(new Date(), \'yyyy-MM-dd HH:mm:ss\');\n           ecui.tip(\'success\', \'显示当前时间\');\n        }\n    }\n);\n'
            };
        },
        onafterrender: function (context) {
        }
    });
}());

