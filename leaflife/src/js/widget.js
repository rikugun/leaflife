/*
    WidgetLoader (version 1.0.3)

    Copyright 2008 Huangchao.

    This file is part of LeafLife.

    LeafLife is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 2 as
    published by the Free Software Foundation.

    LeafLife is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with LeafLife. If not, see <http://www.gnu.org/licenses/>.
*/
(function()
{
    var doc = document, platform = doc.expando ? 1 : 0, head = doc.getElementsByTagName("head")[0], headChildren = head.childNodes, i, idx, scriptSrc,
    jsFile =
    {
        map: "common/map" + platform,
        remote: "common/remote" + platform,
        tree: "tree/tree" + platform,
        grid: "grid/grid" + platform
    },
    jsVer =
    {
        map: "1.0.17",
        remote: "0.4.3",
        tree: "1.2.27",
        grid: "0.1"
    },
    cssFile =
    {
        tree: ["tree/tree", "tree/themes/default/default"],
        grid: ["grid/grid", "grid/themes/default/default"]
    },
    jsDep =
    {
        tree: ["map"],
        grid: ["map"]
    };
    for (i = headChildren.length - 1; i >= 0; -- i)
    {
        scriptSrc = headChildren[i].src;
        if (scriptSrc && (idx = scriptSrc.search(/\bwidget.js\b/)) > -1)
        {
            if (! doc.contextPath)
            {
                doc.contextPath = headChildren[i].getAttribute("contextPath") || "";
            }
            var widgetPath = scriptSrc.substring(0, idx), widgetsImport = headChildren[i].getAttribute("imports"), widgetList, imports, jsList, widgetName, widgetClass, jsDepList, cssList, j, k, elem;
            if (widgetsImport)
            {
                widgetList = widgetsImport.toLowerCase().split(","), imports = {}, jsList = [];
                for (j = widgetList.length - 1; j >= 0; -- j)
                {
                    widgetName = widgetList[j].replace(/^\s+/, "").replace(/\s+$/, "");
                    widgetClass = widgetName.replace(/^[a-z]/, function(a)
                    {
                        return a.toUpperCase();
                    });
                    if (! window[widgetClass] && ! imports[widgetName])
                    {
                        imports[widgetName] = 1;
                        jsList[jsList.length] = widgetName, cssList = cssFile[widgetName];
                        if (jsDepList = jsDep[widgetName])
                        {
                            for (k = jsDepList.length - 1; k >= 0; -- k)
                            {
                                widgetName = jsDepList[k];
                                widgetClass = widgetName.replace(/^[a-z]/, function(a)
                                {
                                    return a.toUpperCase();
                                });
                                if (! imports[widgetName] && ! window[widgetClass])
                                {
                                    jsList[jsList.length] = widgetName;
                                    imports[widgetName] = 1;
                                }
                            }
                        }
                        if (cssList)
                        {
                            for (k = cssList.length - 1; k >= 0; -- k)
                            {
                                elem = doc.createElement("link");
                                head.appendChild(elem);
                                elem.href = widgetPath + cssList[k] + ".css";
                                elem.rel = "stylesheet";
//                                doc.write("<link rel='stylesheet' href='" + widgetPath + cssList[k] + ".css'\/>");
                            }
                        }
                    }
                }
                for (j = jsList.length - 1; j >= 0; -- j)
                {
                    widgetClass = jsList[j];
                    if (jsFile[widgetClass])
                    {
                        elem = doc.createElement("script");
                        head.appendChild(elem);
                        elem.src = widgetPath + jsFile[widgetClass] + ".js?ver=" + jsVer[widgetClass];
                    }
                }
            }
            break;
        }
    }
    if (! doc.widgets)
    {
        doc.widgets = [];
        doc.addWidget = function(widget, widgetName)
        {
            var widgetList = document.widgets;
            widgetList[widgetList.length] = widget;
            if (widgetName)
            {
                widgetList["_" + widgetName] = widget;
            }
        };
        doc.getWidgetById = function(widgetName)
        {
            return document.widgets["_" + widgetName];
        };
        doc.removeWidgetById = function(widgetName)
        {
            var widget = document.widgets["_" + widgetName];
            if (widget)
            {
                widget.destructor();
            }
        };
        var destructor = function()
        {
            // prevent from memory leak
            var w = document.widgets, i = w.length - 1;
            for (; i >= 0; -- i)
            {
                w[i].destructor();
            }
            document.widgets = null;
        };
        if (platform)
        {
            doc.execCommand("BackgroundImageCache", false, true);
            window.attachEvent("onunload", destructor);
        }
        else
        {
            window.addEventListener("unload", destructor, false);
        }
        Function.prototype.hook = function(thisObj, arg1, arg2, arg3, arg4, arg5, arg6)
        {
            var method = this;
            return function()
            {
                method.call(thisObj, arg1, arg2, arg3, arg4, arg5, arg6);
            }
        };
        String.prototype.trim = function()
        {
            return this.replace(/^\s+/, "").replace(/\s+$/, "");
        };
        String.prototype.toJSONString = function()
        {
            // replace control characters, quote characters, and backslash characters with safe sequences
            var result = this;
            if (/["\\\x00-\x1f]/.test(result))
            {
                // character substitutions
                result = result.replace(/[\x00-\x1f\\"]/g, function(a)
                {
                    var m =
                    {
                        '\b': "\\b",
                        '\t': "\\t",
                        '\n': "\\n",
                        '\f': "\\f",
                        '\r': "\\r",
                        '"' : "\\\"",
                        '\\': "\\\\"
                    }, c = m[a];
                    if (c)
                    {
                        return c;
                    }
                    c = a.charCodeAt();
                    return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                });
            }
            return '"' + result + '"';
        };
        Boolean.prototype.toJSONString = function()
        {
            return "" + this;
        };
        Date.prototype.toJSONString = function()
        {
            return '@' + this.getTime();
        };
        Number.prototype.toJSONString = function()
        {
            return isFinite(this) ? "" + this : null;  // encode non-finite numbers as null
        };
        Array.prototype.toJSONString = function(level)
        {
            if (! level)
            {
                level = 0;
            }
            else if (level > 2)
            {
                return null;
            }
            ++ level;
            var result = [], i = 0, val;
            for (; i < this.length; ++ i)
            {
                val = this[i];
                switch (typeof val)
                {
                    case "object":
                    {
                        if (val == null || typeof val.toJSONString !== "function")  // ignore null
                        {
                            break;
                        }
                    }
                    case "string":
                    case "number":
                    case "boolean":
                    {
                        val = val.toJSONString(level);
                        if (val != null)
                        {
                            result[result.length] = val;
                        }
                    }
                }
            }
            return '[' + result.join(',') + ']';
        };
        Object.prototype.toJSONString = function(level)
        {
            if (! level)
            {
                level = 0;
            }
            else if (level > 2)
            {
                return null;
            }
            ++ level;
            var result = [], k, val, valStr;
            for (k in this)
            {
                if (typeof k === "string")
                {
                    val = this[k];
                    valStr = null;
                    switch (typeof val)
                    {
                        case "object":
                        {
                            if (val == null)  // null value
                            {
                                valStr = "null";
                                break;
                            }
                            else if (typeof val.toJSONString !== "function")
                            {
                                break;
                            }
                        }
                        case "boolean":
                        case "number":
                        case "string":
                        {
                            valStr = val.toJSONString(level);
                            break;
                        }
                        case "undefined":
                        {
                            valStr = "null";
                        }
                    }
                    if (valStr != null)
                    {
                        result[result.length] = k.toJSONString() + ':' + valStr;
                    }
                }
            }
            return '{' + result.join(',') + '}';
        };
    }
}
)();
