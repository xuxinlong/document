(function () {
    Object.assign(
        window.yiche.util,
        {
            createStyle: function (cssText) {
                var el = document.getElementById('createStyle');
                if (el) {
                    el.remove();
                }
                el = document.createElement('STYLE');
                el.setAttribute('id', 'createStyle');
                document.head.appendChild(el);
                el.setAttribute('type', 'text/less');
                if (ecui.ie < 10) {
                    var reg = ecui.ie > 6 ? new RegExp('[_' + (ecui.ie > 7 ? '\\*\\+' : '') + ']\\w+:[^;}]+[;}]', 'g') : null;
                    if (reg) {
                        cssText = cssText.replace(reg, function (match) {
                            return match.slice(-1) === '}' ? '}' : '';
                        });
                    }
                    el.setAttribute('lessText', cssText);
                } else {
                    el.innerHTML = cssText;
                }
                window.less.refresh(true, undefined, false);
            },
            createTarget: function (htmlText) {
                // 检查html中是否有target,默认取第一个target作为路由的 view
                var targets = htmlText.match(/<!--\s*target:\s*([^>]+)-->/g),
                    name = 'mobile_' + Date.now() + Math.round(Math.random() * 10000);
                if (targets && targets.length) {
                    /<!--\s*target:\s*([^>]+)-->/.test(targets[0]);
                    name = RegExp.$1.trim();
                } else {
                    // data = data.replace(/<!--\s*target:\s*([^>]+)-->/g, '<!-- target: ' + filename.slice(0, index + 1) + '$1 -->');
                    // ecui.esr.getEngine(moduleName).compile(data.replace(/ui="type:NS\./g, 'ui="type:ecui.ns._' + moduleName.replace(/[._]/g, '-').replace(/\//g, '_') + '.ui.'));
                    htmlText = ecui.util.stringFormat('<!-- target:{0} -->\n', name) + htmlText;   
                }
                /(\/.+\/)/.test(ecui.esr.getLocation());
                var moduleName = RegExp.$1;
                etpl.compile(htmlText.replace(/ui="type:NS\./g, 'ui="type:ecui.ns.' + moduleName.replace(/\//g, '_') + '.ui.'));
                // console.log(moduleName, ecui.esr.getEngine().targets);
                return name;
            },
            createScript: function (scriptText) {
                var el = document.getElementById('createScript');
                if (el) {
                    el.remove();
                }
                el = document.createElement('SCRIPT');
                el.setAttribute('id', 'createScript');
                el.setAttribute('type', 'text/javascript');
                el.innerHTML = scriptText;
                document.body.appendChild(el);
                return name;
            },
            changeTarget: function (target) {
                var routeName = ecui.esr.getLocation().split('~')[0];
                // console.log(routeName);
                ecui.esr.getRoute(routeName).routeView = target;
                ecui.esr.redirect(routeName);
            },
            callRoute: function (routeName, target) {
                ecui.esr.getRoute(routeName).routeView = target;
                ecui.esr.redirect(routeName);
            }
        }
    );
}());