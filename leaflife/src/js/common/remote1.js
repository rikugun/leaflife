/*
    Remote Widget for Internet Explorer (version 0.4.3)

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

/******************************************************************************
 * Remote Definition
 *****************************************************************************/
Remote.maxPoolSize = 6;
Remote.pool = [];
Remote.poolSize = 0;  // current Remote pool size

function Remote(className, config)
{
    if (className)
    {
        this.className = className;  // class name (include package name)
    }
    else
    {
        throw new Error("No class name specified.");
    }
    if (Remote.poolSize == Remote.maxPoolSize)
    {
        throw new Error(navigator.userLanguage == "zh-cn" ? "\u670D\u52A1\u5668\u6B63\u5FD9\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002" : "Server is busy, please retry later.");
    }
    var pool = Remote.pool, size = pool.length, result = size ? pool[size - 1] : this;
    result.setConfig(config);
    if (size)
    {
        -- pool.length;
        return result;
    }
    else  // create new object
    {
        result.listeners = [];
        ++ Remote.poolSize;
        document.addWidget(result);
    }
}

Remote.prototype =
{
    configurations: ["timeout", "asynchronous"],
    eventNames: ["onsuccess", "onexception", "ontimeout"],
    httpObjNames: ["Microsoft.XMLHTTP", "Msxml2.XMLHTTP", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP.4.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.6.0"],
    className: "",
    methodName: "",
    asynchronous: false,
    timeout: 0,  // default: browser http timeout (unit: second)
    serviceURL: document.contextPath + "/JSRPCService/",

    setConfig: function(config)  // public
    {
        config = config || {};
        // Configurations
        var val, i = 1, item;
        for (; i >= 0; -- i)
        {
            item = this.configurations[i];
            val = config[item];
            if (val != undefined)
            {
                this[item] = val;
            }
        }
        // Events
        for (i = 2; i >= 0; -- i)
        {
            item = this.eventNames[i];
            if (config[item])
            {
                this.listeners[i] = config[item];
            }
        }
    },

    invoke: function(methodName)
    {
        if (methodName)
        {
            this.methodName = methodName;
        }
        else if (this.methodName)
        {
            methodName = this.methodName;
        }
        else
        {
            throw new Error("No method name specified.");
        }
        var cls = this, url = cls.serviceURL + cls.className + '/' + methodName, asynchronous = cls.asynchronous, httpObj = cls.httpObj, createHttpObj = httpObj == undefined, timeout = cls.timeout, argCount = arguments.length, params = [], json, i;
        if (createHttpObj)
        {
            for (i = 5; i >= 0; -- i)
            {
                try
                {
                    this.httpObj = httpObj = new ActiveXObject(cls.httpObjNames[i]);
                    break;
                }
                catch (e)
                {
                }
            }
        }
        httpObj.open("POST", url, asynchronous);
        if (createHttpObj)
        {
            httpObj.onreadystatechange = Remote.stateChangeOnHttp.hook(window, cls);
        }
        httpObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        if (timeout)
        {
            cls.funcTimeout = setTimeout(Remote.timeoutOnHttp.hook(window, cls), timeout * 1000);
        }
        for (i = 1; i < argCount; ++ i)
        {
            json = arguments[i].toJSONString();
            params[i - 1] = json == null ? "null" : json;
        }
        try
        {
            httpObj.send('[' + params.join(',') + ']');
            if (cls.exception)
            {
                throw new Error(cls.response);
            }
        }
        catch (e)
        {
            if (! asynchronous)
            {
                throw e;
            }
        }
        return asynchronous ? undefined : cls.response;
    },

    fireEvent: function(eventType, defaultVal, arg1)
    {
        var listener = this.listeners[eventType], result;
        if (listener)
        {
            result = listener(arg1);
        }
        return result == undefined ? defaultVal : result;
    },

    abort: function()
    {
        var httpObj = this.httpObj;
        if (httpObj)
        {
            httpObj.abort();
        }
        this.release();
    },

    release: function()
    {
        // restore default configurations
        this.funcTimeout = null;
        this.asynchronous = false;
        this.listeners.length = this.timeout = 0;
        var pool = Remote.pool;
        pool[pool.length] = this;
    },

    destructor: function()
    {
        var httpObj = this.httpObj;
        if (httpObj)
        {
            httpObj.onreadystatechange = Remote.nullFunction;
            this.httpObj = null;
        }
        this.response = null;
    }
}

/******************************************************************************
 * Remote Events
 *****************************************************************************/
Remote.stateChangeOnHttp = function(cls)
{
    var httpObj = cls.httpObj, status, responseText;
    if (httpObj.readyState == 4)  // completed
    {
        clearTimeout(cls.funcTimeout);
        cls.release();
        status = httpObj.status;
        if (status == 200)  // OK
        {
            responseText = httpObj.responseText;
            if (responseText == undefined)
            {
                responseText = "";
            }
            if (cls.exception = httpObj.getResponseHeader("RemoteException"))  // exception
            {
                if (cls.asynchronous)  // fire onexception event only asynchronous
                {
                    cls.fireEvent(1, null, responseText);
                }
            }
            else  // success
            {
                if (responseText.length)
                {
                    responseText = eval("(" + responseText + ")");
                }
                cls.fireEvent(0, null, responseText);  // fire onsuccess event
            }
            cls.response = responseText;
        }
        else if (status < 100 && status >= 400 && cls.asynchronous)  // fire onexception event when client or server error
        {
            responseText = httpObj.statusText;
            cls.fireEvent(1, null, responseText ? responseText : "");
        }
    }
}

Remote.timeoutOnHttp = function(cls)
{
    try
    {
        if (! cls.fireEvent(2, false))
        {
            cls.abort();
        }
        else  // resend request
        {
            cls.invoke();
        }
    }
    catch (e)
    {
        cls.abort();
        throw e;
    }
}

Remote.nullFunction = function()
{
}
