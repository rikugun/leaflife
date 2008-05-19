/*
    Map Widget for Internet Explorer (version 1.0.17)

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
function Map(componentClass)
{
    this.dict = new ActiveXObject("Scripting.Dictionary");  // <key, value>
    if (componentClass)
    {
        this.componentClass = componentClass;
    }
}

Map.prototype =
{
    put: function(key, value)
    {
        this.dict.Item(key) = value;
    },

    get: function(key)
    {
        var dict = this.dict;
        return dict.Exists(key) ? dict.Item(key) : null;
    },

    keys: function()
    {
        return new VBArray(this.dict.Keys()).toArray();
    },

    values: function()
    {
        return new VBArray(this.dict.Items()).toArray();
    },

    remove: function(key)
    {
        var value = this.get(key);
        if (value)
        {
            this.dict.Remove(key);
        }
        return value;
    },

    clear: function()
    {
        this.dict.RemoveAll();
    },

    size: function()
    {
        return this.dict.Count;
    },

    containsKey: function(key)
    {
        return this.dict.Exists(key);
    },

    each: function(func, owner)
    {
        var values = this.values(), i = values.length - 1;
        for (; i >= 0; -- i)
        {
            if (values[i] != undefined)
            {
                func.call(owner, values[i]);
            }
        }
    },

    invoke: function(func)
    {
        var values = this.values(), i = values.length - 1;
        for (; i >= 0; -- i)
        {
            if (values[i] != undefined)
            {
                func.apply(values[i]);
            }
        }
    },

    toJSONString: function()
    {
        var keys = this.keys(), i = keys.length - 1, items = [], json;
        for (; i >= 0; -- i)
        {
            if (json = this.dict.Item(keys[i]).toJSONString())
            {
                items[i] = keys[i] + ':' + json;
            }
        }
        return '{' + items.join(",") + '}';
    }
}
