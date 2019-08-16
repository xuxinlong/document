
(function () {
    var core = ecui,
        util = core.util,
        ui = ecui.ui,
        dom = ecui.dom;
window.myCodeMirrors = [];
    Object.assign(
        NS.data,
        {
        }
    );
    Object.assign(
        NS.ui,
        {
            IframeContent: core.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._eIframe = el;
                    this._eIframe.onload = function () {
                        this._bIframeLoaded = true;
                    }.bind(this);
                },
                {
                    init: function () {
                        util.timer(function () {
                            var win = this._eIframe.contentWindow;

                            win.yiche.util.createStyle('body { div { color: red; font-size: 14px; } #test { color: #333; } }');
                            // var name = win.yiche.util.createTarget('<div>更换即可法国红酒-测试</div>');

                            var name = win.yiche.util.createTarget('<div ui="type:m-panel"><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div></div>');
                            win.yiche.util.changeTarget(name);
                        }.bind(this), this._bIframeLoaded ? 0 : 1000);

                    },
                    changeContent: function (html, css, js) {
                        var win = this._eIframe.contentWindow;
                        win.yiche.util.createStyle(css);

                        var name = win.yiche.util.createTarget(html);

                        win.yiche.util.createScript(js);

                        win.yiche.util.changeTarget(name);
                    }
                }
            ),
            CodeMirror: core.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._sMode = options.mode;
                    this._eTextArea = el.getElementsByTagName('textarea')[0];
                    this._uCopy = core.$fastCreate(this.Copy, dom.last(dom.first(el)), this);
                },
                {
                    Copy: ecui.inherits(
                        ui.Button,
                        {
                            onclick: function () {
                                try {
                                    var tag = util.clipboard(this.getParent()._uCodeMirror.getValue());
                                    ecui.tip('success', 'copy成功');
                                } catch (e) {
                                    ecui.tip('success', 'copy失败，请重试');
                                }
                            }
                        }
                    ),
                    init: function () {
                        this._eTextArea.innerHTML = this._eTextArea.innerHTML.replace(/\\n/g, '\n');
                        this._uCodeMirror = CodeMirror.fromTextArea(this._eTextArea, {
                            lineNumbers: true,
                            indentUnit: 4,         // 缩进单位为4
                            styleActiveLine: true, // 当前行背景高亮
                            matchBrackets: true,   // 括号匹配
                            // lineWrapping: true,    // 自动换行
                            theme: 'monokai',
                            mode: this._sMode
                        });
                    },
                    getCodeMirror: function () {
                        return this._uCodeMirror;
                    }
                }
            ),
            RunBtn: core.inherits(
                ui.Control,
                {
                    onclick: function () {
                        var iframe = ecui.get('iframe');
                        var html = ecui.get('code-html');
                        var css = ecui.get('code-css');
                        var js = ecui.get('code-js');
                        iframe.changeContent(html.getCodeMirror().getValue(), css.getCodeMirror().getValue(), js.getCodeMirror().getValue());
                    }
                }
            )
        }
    );
    ecui.esr.addRoute('mobile', {
        main: 'container',
        model: [''],
        onbeforerequest: function (context) {
        },
        onbeforerender: function (context) {
            context.code = {
                html: '<div ui="type:m-panel">\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n</div>',
                css: 'body {\n    div {\n    color: red;\n    font-size: 14px;\n    }\n    #test {\n    color: #333;\n    }\n}',
                js: 'function myScript () {\n   return 100; \n}'
            };
        },
        onafterrender: function (context) {
            // var iframeContent = ecui.$('iframeContent'),
            //     win = iframeContent.contentWindow,
            //     doc = iframeContent.contentWindow.document;

            // iframeContent.onload = function () {
            //     win.yiche.util.createStyle('body { div { color: red; font-size: 14px; } #test { color: #333; } }');
            //     var name = win.yiche.util.createTarget('<div>更换即可法国红酒-测试</div>');
            //     util.timer(function () {
            //         var name = win.yiche.util.createTarget('<div ui="type:m-panel"><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div><div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div></div>');
            //         win.yiche.util.changeTarget(name);
            //     }, 2000);
            // };
        }
    });
}());

