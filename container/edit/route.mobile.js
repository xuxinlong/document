
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
            SnippetSubmitBtn: core.inherits(
                ui.Button,
                function (el, options) {
                    ui.Button.call(this, el, options);
                    this._sOptId = options.optId;
                },
                {
                    onclick: function () {
                        var id = this.$ID.split('-')[1];
                        var codeCss = ecui.get('code-css-' + id).getCodeMirror().getValue();
                        var codeJs = ecui.get('code-js-' + id).getCodeMirror().getValue();
                        var codeHtml = ecui.get('code-html-' + id).getCodeMirror().getValue();
                        ecui.esr.request(
                            util.stringFormat('data@FORM /snippet-api/snippet/{0}?snippetInfoForm', this._sOptId ? 'update' : 'add'),
                            function () {
                                var data = ecui.esr.getData('data');
                                if (data instanceof Object) {
                                    ecui.tip('success', this._sOptId ? '代码段更新成功' : '代码段添加成功');
                                }
                            }
                        );
                    }
                }
            )
        }
    );
    ecui.esr.addRoute('mobile', {
        main: 'container',
        model: [''],
        onbeforerequest: function (context) {
            context.detail = {
                codeHtml: '<div ui="type:m-panel">\n    <div style="height: 100px">这里是你代码段的内容</div>\n    </div>',
                codeCss: 'body {\n    .page-cont {\n        padding: 10px 20px;\n    }\n    .ui-test-button {\n     margin: 10px 0;\n    }\n    #test {\n       color: red;\n    }\n}\n',
                codeJs: 'yiche.ui.TestBtn = ecui.inherits(\n    ecui.ui.Button,\n    \'ui-test-button\',\n    {\n       onclick: function () {\n            ecui.$(\'test\').innerHTML = ecui.util.formatDate(new Date(), \'yyyy-MM-dd HH:mm:ss\');\n           ecui.tip(\'success\', \'显示当前时间\');\n        },\n        onready: function () {\n            ecui.$(\'test\').innerHTML = ecui.util.formatDate(new Date(), \'yyyy-MM-dd HH:mm:ss\');\n           ecui.tip(\'success\', \'显示当前时间\');\n        }\n    }\n);\n'
            };
        },
        onbeforerender: function (context) {
        },
        onafterrender: function (context) {
        }
    });
    ecui.esr.addRoute('mobile.edit', {
        main: 'container',
        model: ['detail@GET /snippet-api/snippet/getById/${id}'],
        view: 'edit.mobile',
        onbeforerequest: function (context) {
        },
        onbeforerender: function (context) {
        },
        onafterrender: function (context) {
        }
    });
}());

