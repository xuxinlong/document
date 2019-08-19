
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
    ecui.esr.addRoute('mobile', {
        main: 'container',
        model: [''],
        onbeforerequest: function (context) {
        },
        onbeforerender: function (context) {
            context.pcCode = {
                html: '<div>代码片段 - pc端 - 效果预览<div>',
                css: 'body {\n    div {\n    color: #333;\n    font-size: 14px;\n    }\n    #test {\n    color: #333;\n    }\n}',
                js: 'function myScript () {\n   console.log(\'动态js\');\n   return 100; \n}\necui.tip(\'success\', \'动态js\');\nmyScript();\n'
            };
            context.mCode = {
                html: '<div ui="type:m-panel">\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n    <div style="height: 100px">飞规划局快乐一进门，UI看，更换即可</div>\n</div>',
                css: 'body {\n    div {\n    color: #333;\n    font-size: 14px;\n    }\n    #test {\n    color: #333;\n    }\n}',
                js: 'function myScript () {\n   console.log(\'动态js\');\n   return 100; \n}\necui.tip(\'success\', \'动态js\');\nmyScript();\n'
            };
        },
        onafterrender: function (context) {
        }
    });
}());

