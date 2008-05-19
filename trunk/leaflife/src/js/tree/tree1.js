/*
    Tree Widget for Internet Explorer (version 1.2.27)

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
 * Tree Definition
 *****************************************************************************/
Tree.nodeList = [];
Tree.nodeSequence = 0;

function Tree(containerId, config)
{
    var treeObj = this, doc = document, containerObj;
    if (! (containerObj = doc.getElementById(treeObj.containerId = containerId)))
    {
        throw new Error("Invalid tree container element.");
    }
    var navObj = treeObj._18 = doc.createElement("div"), i = 11, navStyle;
    containerObj.appendChild(navObj);
    navObj.className = "hidden";
    config = config || {};
    doc.addWidget(treeObj, treeObj._16 = config.id || "");  // name
    treeObj.setStyleSheet(config.styleSheet);  // styleSheet
    // Configurations
    for (; i >= 0; -- i)
    {
        var configVal = config[treeObj.configurations[i]];
        if (configVal != undefined)
        {
            treeObj["_" + i] = configVal;
        }
    }
    navStyle = navObj.style;
    navStyle.width = treeObj._7;
    navStyle.height = treeObj._8;
    // Methods
    if (! Tree.prototype.getId)
    {
        var methodName = ["isHierarchyVisible", "isNodeIconVisible", "getPrefix", "getCheckCascade", "getRadioGroup", "isExpandAllOnload", "isAutoSort", "getWidth", "getHeight", "isDraggable", "getDropEffect", "getTarget", "getSelectionMode", "getRecheckOnload", "isAutoCollapse", "isEditable", "getId", "getStyleSheet", "getContainer"];
        for (i = 18; i >= 0; -- i)
        {
            Tree.prototype[methodName[i]] = Function("return this._" + i);
        }
    }
    treeObj.setConfig(config);
    (treeObj.rootNode = new TreeNode()).treeObj = treeObj;
    treeObj.listeners = {};  // <event type, [listener function]>
    treeObj.nodeMap = {};  // <node name, TreeNode>
    treeObj.nodeSelected = new Map();  // <node id, TreeNode>
    treeObj.nodeChecked = new Map();  // <node id, TreeNode>
    treeObj.nodeCheckedPartial = new Map();  // <node id, TreeNode>
    treeObj.nodeRadioed = new Map();  // <node id, TreeNode>
    if (! Tree.nodesLazyCheck)
    {
        Tree.nodesLazyCheck = new Map();
    }
}

Tree.prototype =
{
    configurations: ["hierarchyVisible", "nodeIconVisible", "prefix", "checkCascade", "radioGroup", "expandAllOnload", "autoSort", "width", "height", "draggable", "dropEffect", "target", "selectionMode", "recheckOnload", "autoCollapse", "editable", "id", "styleSheet"],
    _0: true,  // hierarchyVisible
    _1: true,  // nodeIconVisible
    _2: "none",  // prefix: none/checkbox/radio/...
    _3: "three-state",  // checkCascade: none/two-state/three-state
    _4: "all",  // radioGroup: all/children
    _5: false,  // expandAllOnload
    _6: false,  // autoSort
    _7: "100%",  // width
    _8: "100%",  // height
    _9: false,  // draggable
    _10: "none",  // dropEffect: none/move/copy
    _11: "_self",  // target
    _12: "single",  // selectionMode: single/multiple
    _13: "old",  // recheckOnload: new/old/none (correct checkbox or radiobox's state when add child node)
    _14: false,  // autoCollapse
    _15: false,  // editable
    _16: "",  // name
    _17: "",  // styleSheet
    oncompare: Tree.defaultComparator,

    setStyleSheet: function(styleSheet)
    {
        if (styleSheet)
        {
            this._17 = styleSheet;
            var styleSheetObj = this.styleSheetObj;
            if (styleSheetObj)
            {
                styleSheetObj.href = styleSheet;
            }
            else
            {
                styleSheetObj = this.styleSheetObj = document.createStyleSheet(styleSheet);
            }
            var styleTxt = "", rules = styleSheetObj.rules, i = rules.length - 1;
            for (; i >= 0; -- i)
            {
                styleTxt += '#' + this.containerId + ' ' + rules[i].selectorText + '{' + rules[i].style.cssText + '}';
            }
            styleSheetObj.cssText = styleTxt;
        }
    },

    setConfig: function(config)  // public
    {
        config = config || {};
        // Configurations
        var val, i = 15, items = ["onbeforeload", "onafterload", "onbeforeinsert", "onafterinsert", "onclickhierarchy", "onclickicon", "onclickprefix", "onclicknode", "ondblclicknode", "onrightclicknode", "onbeforeselectchange", "onafterselectchange", "onbeforecheckchange", "onaftercheckchange", "onexpand", "oncollapse", "ondragstart", "ondragging", "ondrop", "onmove", "oncopy", "onbeforeedit", "onafteredit", "oncompare", "onbeforeremove", "onafterremove"];
        // selectionMode, recheckOnload, autoCollapse, editable
        for (; i >= 12; -- i)
        {
            val = config[this.configurations[i]];
            if (val != undefined)
            {
                this["_" + i] = val;
            }
        }
        // Events
        for (i = 25; i >= 0; -- i)
        {
            val = items[i];
            if (config[val])
            {
                this[val] = config[val];
            }
        }
    },

    cancelEdit: function()
    {
        var funcEdit = this.funcEdit;
        if (funcEdit)
        {
            this.funcEdit = null;
            clearTimeout(funcEdit);
            this.nodeSelected.invoke(function()
            {
                if (this.linkObj.onblur)
                {
                    this.linkObj.blur();
                }
            });
        }
    },

    /**
     * The listener doesn't capture or cancel the event even if it return false
     * @param eventType: event name (without "on")
     * @param listener: listener function
     */
    addEventListener: function(eventType, listener)
    {
        var listeners = this.listeners, events = listeners[eventType], i;
        if (! events)
        {
            listeners[eventType] = events = [];
        }
        for (i = events.length - 1; i >= 0; -- i)
        {
            if (events[i] == listener)
            {
                return;
            }
        }
        events.splice(0, 0, listener);
    },

    /**
     * @param eventType: event name (without "on")
     * @param listener: listener function
     */
    removeEventListener: function(eventType, listener)
    {
        var events = this.listeners[eventType], i;
        if (events)
        {
            for (i = events.length - 1; i >= 0; -- i)
            {
                if (events[i] == listener)
                {
                    events.splice(i, 1);
                }
            }
        }
    },

    fireEvent: function(eventType, defaultVal, nodeObj, arg1, arg2, arg3)
    {
//        this.cancelEdit();
        var result;
        if (! nodeObj[eventType])  // prevent event from triggering recusively
        {
            var listener = this["on" + eventType], beforeEvt = eventType.indexOf("before") == 0, events = this.listeners[eventType], args = arg1 == undefined ? [] : arg2 == undefined ? [arg1] : arg3 == undefined ? [arg1, arg2] : [arg1, arg2, arg3], i;
            args.splice(0, 0, this, nodeObj == this.rootNode ? null : nodeObj);
            if (beforeEvt)
            {
                nodeObj[eventType] = true;
            }
            if (listener)
            {
                result = listener.apply(window, args);
            }
            if (events)
            {
                for (i = events.length - 1; i >= 0; -- i)
                {
                    events[i].apply(window, args);
                }
            }
            if (beforeEvt)
            {
                nodeObj[eventType] = null;
            }
        }
        return result == undefined ? defaultVal : result;
    },

    loadJSON: function(json)  // public
    {
        this.rootNode.loadJSON(json);
    },

    toJSONString: function()
    {
        var result = [], i = 16, val;
        for (; i >= 0; -- i)
        {
            val = this["_" + i];
            if (val != undefined && val !== "")
            {
                result[result.length] = '"' + this.configurations[i] + '":' + val.toJSONString();
            }
        }
        result[result.length] = '"childNodes":' + this.rootNode.toJSONString();
        return '{' + result.join(',') + '}';
    },

    loadXML: function(xml)
    {
        this.rootNode.loadXML(xml);
    },

    reload: function()
    {
        this.rootNode.reload();
    },

    unselectAll: function()
    {
        this.nodeSelected.invoke(TreeNode.prototype.unselect);
    },

    getRootNodes: function()
    {
        return this.rootNode.children;
    },

    appendRoot: function(node)
    {
        var rootNode = this.rootNode;
        rootNode.insert(node, "lastChild");
        if (rootNode.nChildren == 1)
        {
            node.draw(null);
            this._18.className = "tree";
        }
    },

    attachNode: function(nodeObj)  // private
    {
        var name = nodeObj.name;
        if (name)
        {
            var nodeMap = this.nodeMap, nodes = nodeMap[name];
            if (! nodes)
            {
                nodes = nodeMap[name] = [];
            }
            nodes[nodes.length] = nodeObj;
        }
    },

    getNodeById: function(nodeName)
    {
        var nodes = this.nodeMap[nodeName];
        return nodes ? nodes[0] : null;
    },

    getNodesById: function(nodeName)
    {
        return this.nodeMap[nodeName];
    },

    getNodesSelected: function()
    {
        return this.nodeSelected.values();
    },

    getNodesChecked: function()
    {
        return this.nodeChecked.values();
    },

    getNodesCheckedPartial: function()
    {
        return this.nodeCheckedPartial.values();
    },

    getNodesRadioed: function()
    {
        return this.nodeRadioed.values();
    },

    destructor: function()
    {
        Tree.xmlParser = Tree.dragHint = Tree.droppableSibling = null;
        var nodeList = Tree.nodeList, i = nodeList.length - 1;
        for (; i >= 0; -- i)
        {
            nodeList[i].destructor();
        }
        nodeList.length = 0;
    }
}

/******************************************************************************
 * Tree Events
 *****************************************************************************/
Tree.captureEvent = function()
{
    event.cancelBubble = true;
    event.returnValue = false;
}

Tree.clickOnHierarchy = function()
{
    var nodeObj = this.nodeObj, treeObj = nodeObj.treeObj;
    if (treeObj.fireEvent("clickhierarchy", true, nodeObj) && nodeObj.children)
    {
        nodeObj.expanded ? nodeObj.collapse() : nodeObj.expand();
    }
}

Tree.selectByEvent = function(nodeObj)
{
    var multiSelect = event.ctrlKey && nodeObj.treeObj._12 == "multiple";
    if (multiSelect && nodeObj.isSelected())
    {
        nodeObj.unselect();
    }
    else
    {
        nodeObj.select(multiSelect);
    }
}

Tree.clickOnIcon = function()
{
    var nodeObj = this.nodeObj, treeObj = nodeObj.treeObj;
    if (treeObj.fireEvent("clickicon", true, nodeObj))
    {
        Tree.selectByEvent(nodeObj);
    }
}

Tree.clickOnNode = function()
{
//alert("clickOnNode()");
    var nodeObj = this.nodeObj, treeObj = nodeObj.treeObj;
    if (! nodeObj.href)
    {
        Tree.captureEvent();
    }
    if (this.contentEditable != "true")
    {
        treeObj.cancelEdit();
        if (treeObj._15 && this.tagName == "A" && treeObj.nodeSelected.size() == 1 && treeObj.nodeSelected.containsKey(nodeObj.id))  // click on node text and show editbox
        {
            treeObj.funcEdit = setTimeout(TreeNode.prototype.edit.hook(nodeObj), 600);  // delay n seconds
        }
        else
        {
            if (treeObj.fireEvent("clicknode", true, nodeObj))
            {
                if (treeObj._14)  // auto collapse sibling node
                {
                    nodeObj.collapseSiblings();
                }
                nodeObj.expand();
            }
            Tree.selectByEvent(nodeObj);
        }
    }
}

Tree.blurOnEditbox = function()
{
//alert("blurOnEditbox()");
    var nodeObj = this.nodeObj, treeObj = nodeObj.treeObj, keyCode = this.keyCode;
    this.keyCode = treeObj.funcEdit = nodeObj.linkObj.onblur = nodeObj.linkObj.onkeypress = null;
    nodeObj.removeTextStyle("editbox");
    this.contentEditable = "inherit";
    if (treeObj.fireEvent("afteredit", true, nodeObj, this.innerText, keyCode == 13 ? "enter" : keyCode == 27 ? "esc" : "unknown"))
    {
        nodeObj.setText(this.innerText);  // save changes
    }
}

Tree.keyPressOnEditbox = function()
{
    var key = event.keyCode;
    if (key == 13 || key == 27)  // Enter or Esc
    {
        this.keyCode = key;
        this.blur();
    }
}

Tree.dblClickOnNode = function()
{
//alert("dblClickOnNode()");
    var nodeObj = this.nodeObj, treeObj = nodeObj.treeObj;
    treeObj.fireEvent("dblclicknode", true, nodeObj);
}

Tree.rightClickOnNode = function()
{
//alert("rightClickOnNode()");
    Tree.captureEvent();
    var nodeObj = this.nodeObj, treeObj = nodeObj.treeObj;
    if (treeObj.fireEvent("rightclicknode", true, nodeObj))
    {
        nodeObj.select();
    }
}

Tree.clickOnPrefix = function()
{
//alert("clickOnPrefix()");
    var nodeObj = this.nodeObj, treeObj = nodeObj.treeObj;
    if (treeObj.fireEvent("clickprefix", true, nodeObj) && nodeObj.checkState != undefined)
    {
        if ((nodeObj.prefix || treeObj._2) == "checkbox" && nodeObj.checkState == 1)
        {
            nodeObj.uncheck();
        }
        else
        {
            nodeObj.check();
        }
    }
}

Tree.dragStartOnNode = function()
{
//alert("dragStartOnNode()");
    var nodeObj = this.nodeObj, treeObj = nodeObj.treeObj;
    if (treeObj.fireEvent("dragstart", true, nodeObj))
    {
        var doc = document, droppableSibling = Tree.droppableSibling, dragHint = Tree.dragHint;
        nodeObj.addTextStyle("draggedText");
        Tree.nodeDragged = nodeObj;
        event.dataTransfer.effectAllowed = "copyMove";
        if (! droppableSibling)
        {
            droppableSibling = Tree.droppableSibling = doc.createElement("span");
            doc.body.appendChild(droppableSibling);
            droppableSibling.className = "hidden";
            droppableSibling.ondragenter = droppableSibling.ondragover = Tree.dragOverOnHint;
            droppableSibling.ondrop = Tree.dropOnHint;
            treeObj._18.ondragover = Tree.dragEndOnSibling;
        }
        if (! dragHint)
        {
            dragHint = Tree.dragHint = doc.createElement("span");
            doc.body.appendChild(dragHint);
            dragHint.className = "hidden";
        }
        dragHint.innerText = nodeObj.text;
        Tree.draggingOnNode();
        dragHint.className = "dragHint";
    }
    else
    {
        Tree.captureEvent();
    }
}

Tree.draggingOnNode = function()
{
    var dragStyle = Tree.dragHint.style, body = document.body;
    dragStyle.pixelLeft = event.clientX + body.scrollLeft + body.offsetLeft + 14;
    dragStyle.pixelTop = event.clientY + body.scrollTop + body.offsetTop;
}

Tree.dragEnterOnNode = function()
{
    var nodeObj = this.nodeObj;
    nodeObj.setDropEffect();
}

Tree.dragOverOnNode = function()
{
//alert("dragOverOnNode()");
    var tgtNodeObj = this.nodeObj, tgtTree = tgtNodeObj.treeObj, dropEffect = tgtNodeObj.setDropEffect();
    if (dropEffect != "none")
    {
        tgtNodeObj.addTextStyle("droppableText");
        var funcTimeout = tgtTree.funcTimeout;
        if (! (funcTimeout || tgtNodeObj.expanded))
        {
            tgtTree.funcTimeout = setTimeout(TreeNode.prototype.expand.hook(tgtNodeObj), 500);
        }
    }
}

Tree.dragLeaveOnNode = function()
{
    var nodeObj = this.nodeObj, tree = nodeObj.treeObj;
    nodeObj.removeTextStyle("droppableText");
    clearTimeout(tree.funcTimeout);
    tree.funcTimeout = null;
}

Tree.dropNode = function(tgtNodeObj, position)
{
//alert("Tree.dropNode(" + tgtNodeObj.text + "," + position + ")");
    Tree.captureEvent();
    var srcNodeObj = Tree.nodeDragged, tgtTreeObj = tgtNodeObj.treeObj, dropEffect = tgtNodeObj.setDropEffect(), newNode;
    if (srcNodeObj)
    {
        dropEffect = tgtTreeObj.fireEvent("drop", dropEffect, srcNodeObj, tgtTreeObj, tgtNodeObj, position);
        if (dropEffect == "move")
        {
            newNode = srcNodeObj.moveTo(tgtNodeObj, position);
        }
        else if (dropEffect == "copy")
        {
            newNode = srcNodeObj.copyTo(tgtNodeObj, position);
        }
        if (newNode)
        {
            newNode.select();
        }
    }
}

Tree.dropOnNode = function()
{
//alert("dropOnNode()");
    this.nodeObj.removeTextStyle("droppableText");
    Tree.dropNode(this.nodeObj, "lastChild");
}

Tree.dragEndOnNode = function()
{
    Tree.dragHint.className = "hidden";
    Tree.dragEndOnSibling();
    Tree.nodeDragged.removeTextStyle("draggedText");
    this.nodeObj.treeObj.funcTimeout = Tree.nodeDragged = null;
}

Tree.dragOverOnSibling = function()
{
    var tgtNodeObj = this.firstChild.nodeObj, posPreviousSibling = event.offsetY < tgtNodeObj.linkObj.offsetTop, dropEffect = tgtNodeObj.setDropEffect(posPreviousSibling);
    if (dropEffect != "none")
    {
        tgtNodeObj.treeObj._18.insertBefore(Tree.droppableSibling, posPreviousSibling ? tgtNodeObj.navObj : tgtNodeObj.navObj.nextSibling);
        Tree.droppableSibling.dropEffect = dropEffect;
        Tree.droppableSibling.className = "droppableSibling";
    }
}

Tree.dragLeaveOnSibling = function()
{
    if (event.offsetY > -1 && event.offsetY < this.offsetHeight)
    {
        Tree.dragEndOnSibling();
    }
}

Tree.dropOnSibling = function()
{
    var mode, tgtNodeObj = this.firstChild.nodeObj;
    if (event.offsetY < tgtNodeObj.linkObj.offsetTop)
    {
        mode = "previousSibling";
    }
    else
    {
        if (tgtNodeObj.isExpanded())
        {
            mode = "firstChild";
        }
        else
        {
            mode = "nextSibling";
            while (tgtNodeObj.parentNode != tgtNodeObj.treeObj.rootNode && tgtNodeObj.isLastNode)
            {
                tgtNodeObj = tgtNodeObj.parentNode;
            }
        }
    }
    Tree.dropNode(tgtNodeObj, mode);
}

Tree.dragEndOnSibling = function()
{
    var droppableSibling = Tree.droppableSibling;
    if (droppableSibling)
    {
        droppableSibling.className = "hidden";
    }
}

Tree.dragOverOnHint = function()
{
    Tree.captureEvent();
    event.dataTransfer.dropEffect = this.dropEffect;
}

Tree.dropOnHint = function()
{
    var mode, tgtNodeObj;
    if (this.nextSibling)
    {
        mode = "previousSibling";
        tgtNodeObj = this.nextSibling.nodeObj;
    }
    else if (this.previousSibling)
    {
        mode = "nextSibling";
        tgtNodeObj = this.previousSibling.nodeObj;
        while (! tgtNodeObj.isRootNode() && tgtNodeObj.isLastNode)
        {
            tgtNodeObj = tgtNodeObj.parentNode;
        }
    }
    Tree.dropNode(tgtNodeObj, mode);
}

Tree.defaultComparator = function(nodeObjA, nodeObjB)
{
    var nodeTextA = nodeObjA.text, nodeTextB = nodeObjB.text;
    return nodeTextA < nodeTextB ? -1 : nodeTextA > nodeTextB ? 1 : 0;
}

/******************************************************************************
 * TreeNode Definition
 *****************************************************************************/
function TreeNode(obj)
{
//alert("new TreeNode(" + obj + ")");
    Tree.nodeList[this.id = Tree.nodeSequence ++] = this;
    if (obj)
    {
        var reg = /^true$/i, name, text, iconInactive, iconActive, prefix, checked, textStyle, href, target, hint, hasChildren, expanded, data, orderIndex;
        if (obj instanceof ActiveXObject)
        {
            name = obj.getAttribute("id");
            text = obj.getAttribute("text");
            iconInactive = obj.getAttribute("iconInactive");
            iconActive = obj.getAttribute("iconActive");
            prefix = obj.getAttribute("prefix");
            checked = reg.test(obj.getAttribute("checked"));
            textStyle = obj.getAttribute("textStyle");
            href = obj.getAttribute("href");
            target = obj.getAttribute("target");
            hint = obj.getAttribute("hint");
            expanded = reg.test(obj.getAttribute("expanded"));
            data = obj.getAttribute("data");
            hasChildren = obj.hasChildNodes() || reg.test(obj.getAttribute("childNodes"));
        }
        else if (typeof obj == "string")  // text
        {
            text = obj;
        }
        else  // json object
        {
            name = obj.id;  // user defined id
            text = obj.text;  // display text
            iconInactive = obj.iconInactive;
            iconActive = obj.iconActive;
            prefix = obj.prefix;  // none/checkbox/radio/...
            checked = obj.checked;
            textStyle = obj.textStyle;
            href = obj.href;
            target = obj.target;  // frame/window name/_blank/_parent/_search/_self/_top
            hint = obj.hint;
            expanded = obj.expanded;
            data = obj.data;
            hasChildren = obj.childNodes ? true : false;
            orderIndex = obj.orderIndex;
        }
        this.name = name;
        this.text = text;
        this.iconInactive = iconInactive;
        this.iconActive = iconActive;
        this.prefix = prefix;
        if (checked)
        {
            this.checkState = 1;  // 0: unchecked, 1: checked, 2: gray checked
        }
        this.textStyle = textStyle;
        this.href = href;
        this.target = target;
        this.hint = hint;
        this.orderIndex = orderIndex;
        this.data = data;
        this.readyState = hasChildren ^ 1;  // 0: uninitialize, 1: loaded, 2: loading
        if (hasChildren)
        {
            this.children = [];
            this.expanded = expanded || false;
        }
    }
    if (! TreeNode.prototype.getId)
    {
        var i = 11, methodName = ["getId", "getText", "getIconStyleInactive", "getIconStyleActive", "getPrefix", "getTextStyle", "getHref", "getTarget", "getHint", "getOrderIndex", "getLevel", "getOwnerTree"];
        for (; i >= 0; -- i)
        {
            TreeNode.prototype[methodName[i]] = Function("var a=this." + this.properties[i] + ";return a==undefined?'':a;");
//            TreeNode.prototype[methodName[i]] = Function("var a=this._" + i + ";return a==undefined?'':a;");
        }
    }
/*
    this.children;
    this.isLastNode;
    this.code;
    this.orderIndex;
    this.parentNode;
    this.navObj;
    this.linkObj;
    this.prefixImg;
    this.hierarchyImg;
    this.iconImg;
    this.callbacks;  // [Function, Object, [arguments]] (perform only once)
*/
}

TreeNode.prototype =
{
    nChildren: 0,
    level: 0,  // level
    readyState: 1,  // 0: uninitialize, 1: loaded, 2: loading
    properties: ["name", "text", "iconInactive", "iconActive", "prefix", "textStyle", "href", "target", "hint", "orderIndex", "level", "treeObj"],

    setText: function(text)  // public
    {
        if (text)
        {
            this.text = text;
            var linkObj = this.linkObj;
            if (linkObj)
            {
                linkObj.innerText = text;
            }
        }
    },

    setTextStyle: function(textStyle)  // public
    {
//        alert(this.id + ".setTextStyle(" + textStyle + ")");
        if (textStyle)
        {
            this.removeTextStyle(this.textStyle || "nodeText");
            this.addTextStyle(this.textStyle = textStyle);
        }
    },

    addTextStyle: function(textStyle)
    {
//        alert(this.id + ".addTextStyle(" + textStyle + ")");
        if (this.navObj)
        {
            var curStyleClass = this.linkObj.className;
            if (! RegExp('\\b' + textStyle + '\\b').test(curStyleClass))
            {
                this.linkObj.className = curStyleClass + ' ' + textStyle;
            }
        }
    },

    removeTextStyle: function(textStyle)
    {
//        alert(this.id + ".removeTextStyle(" + textStyle + ")");
        if (this.navObj)
        {
            this.linkObj.className = this.linkObj.className.replace(RegExp("\\s\\b" + textStyle + '\\b'), '');
        }
    },

    getData: function(key)  // public
    {
        var data = this.data;
        return key && typeof data == "object" ? data[key] : data || "";
    },

    setData: function(val, key)  // public
    {
        if (key)
        {
            if (! this.data)
            {
                this.data = {};
            }
            this.data[key] = val;
        }
        else
        {
            this.data = val;
        }
    },

    setHint: function(hint)  // public
    {
        this.hint = hint;
        if (this.linkObj)
        {
            this.linkObj.title = hint;
        }
    },

    isSelected: function()  // public
    {
        return this.treeObj.nodeSelected.containsKey(this.id);
    },

    getParentNode: function()  // public
    {
        return this.isRootNode() ? null : this.parentNode;
    },

    hasChildNodes: function()
    {
        return this.children ? true : false;
    },

    getChildNodes: function()  // public
    {
        return this.children || [];
    },

    getPreviousSibling: function()  // public
    {
        return this.orderIndex ? this.parentNode.children[this.orderIndex - 1] : null;
    },

    getNextSibling: function()  // public
    {
        var nextIndex = this.orderIndex + 1;
        return nextIndex == this.parentNode.nChildren ? null : this.parentNode.children[nextIndex];
    },

    isAncestorOf: function(nodeObj)  // public
    {
        var parentNodeObj = nodeObj;
        while (parentNodeObj && this != parentNodeObj)
        {
            parentNodeObj = parentNodeObj.parentNode;
        }
        return this == nodeObj ? false : this == parentNodeObj;
    },

    isSiblingOf: function(nodeObj)  // public
    {
        return this.parentNode == nodeObj.parentNode;
    },

    isRootNode: function()  // public
    {
        return this.parentNode == this.treeObj.rootNode;
    },

    isLeafNode: function()  // public
    {
        return this.children ? false : true;
    },

    setHierarchyIcon: function(iconStyle)
    {
        if (this.hierarchyImg)
        {
            if (! iconStyle)
            {
                var isFirstRoot = this.level == 1 && this.orderIndex == 0;
                if (this.isLastNode)
                {
                    if (this.children)
                    {
                        if (this.expanded)
                        {
                            iconStyle = isFirstRoot ? "imgMinus1" : "imgMinus3";
                        }
                        else
                        {
                            iconStyle = isFirstRoot ? "imgPlus1" : "imgPlus3";
                        }
                    }
                    else
                    {
                        iconStyle = isFirstRoot ? "imgLine1" : "imgLine3";
                    }
                }
                else
                {
                    if (this.children)
                    {
                        if (this.expanded)
                        {
                            iconStyle = isFirstRoot ? "imgMinus2" : "imgMinus4";
                        }
                        else
                        {
                            iconStyle = isFirstRoot ? "imgPlus2" : "imgPlus4";
                        }
                    }
                    else
                    {
                        iconStyle = isFirstRoot ? "imgLine2" : "imgLine5";
                    }
                }
            }
            this.hierarchyImg.className = iconStyle;
        }
    },

    setIconStyleInactive: function(iconInactive)  // public
    {
        this.iconInactive = iconInactive;
        this.setIconStyle();
    },

    setIconStyleActive: function(iconActive)  // public
    {
        this.iconActive = iconActive;
        this.setIconStyle();
    },

    setIconStyle: function()
    {
//        alert(this.id + ".setIconStyle()");
        if (this.iconImg)
        {
            var iconStyle;
            if (this.children)
            {
                iconStyle = this.expanded ? (this.iconActive || "imgBranchActive") : (this.iconInactive || "imgBranchInactive");
            }
            else
            {
                iconStyle = this.isSelected() ? (this.iconActive || "imgLeafActive") : (this.iconInactive || "imgLeafInactive");
            }
            this.iconImg.className = iconStyle;
        }
    },

    setPrefixIcon: function()
    {
        if (this.prefixImg)
        {
            var treeObj = this.treeObj, iconStyle = this.prefix || treeObj._2;  // prefix
            switch (this.checkState)
            {
                case 0:
                {
                    iconStyle = iconStyle == "checkbox" ? "imgBoxUnchecked" : "imgRadioUnchecked";
                    break;
                }
                case 1:
                {
                    iconStyle = iconStyle == "checkbox" ? "imgBoxChecked" : "imgRadioChecked";
                    break;
                }
                case 2:
                {
                    iconStyle = treeObj._3 == "three-state" ? "imgBoxCheckedPartial" : "imgBoxUnchecked";
                }
            }
            this.prefixImg.className = iconStyle;
        }
    },

    draw: function(insertAtObj)
    {
//        alert(this.id + ".draw(" + insertAtObj + ")");
        var treeObj = this.treeObj, parentNode = this.parentNode;
        this.isLastNode = this.orderIndex == parentNode.nChildren - 1;
        var doc = document, tbObj = this.navObj = doc.createElement("table"), divObj = doc.createElement("div"), i = 0, cellObj, code = this.code = this.level > 1 ? parentNode.code + (parentNode.isLastNode ? '0' : '1') : '';
        treeObj._18.insertBefore(tbObj, insertAtObj);
        tbObj.cellPadding = tbObj.cellSpacing = 0;
        tbObj.nodeObj = this;
        tbObj = tbObj.insertRow();
        divObj.className = "icon";
        for (; i < code.length; ++ i)  // draw hierarchy line
        {
            cellObj = doc.createElement("td");
            tbObj.appendChild(cellObj);
            cellObj.className = treeObj._0 && code.charAt(i) == '1' ? "imgLine4" : "";
            cellObj.appendChild(divObj.cloneNode());
        }
        if (treeObj._0)  // draw hierarchy image
        {
            this.hierarchyImg = cellObj = doc.createElement("td");
            tbObj.appendChild(cellObj);
            cellObj.nodeObj = this;
            cellObj.onclick = Tree.clickOnHierarchy;
            cellObj.oncontextmenu = Tree.captureEvent;
            cellObj.appendChild(divObj.cloneNode());
            this.setHierarchyIcon();
        }
        if ((this.prefix || treeObj._2) != "none")  // draw prefixImg
        {
            this.prefixImg = cellObj = doc.createElement("td");
            tbObj.appendChild(cellObj);
            cellObj.nodeObj = this;
            cellObj.onclick = Tree.clickOnPrefix;
            cellObj.oncontextmenu = Tree.captureEvent;
            cellObj.appendChild(divObj.cloneNode());
            this.setPrefixIcon();
        }
        if (treeObj._1)  // draw node image
        {
            this.iconImg = cellObj = doc.createElement("td");
            tbObj.appendChild(cellObj);
            cellObj.nodeObj = this;
            cellObj.onclick = Tree.clickOnIcon;
            cellObj.oncontextmenu = Tree.captureEvent;
            cellObj.appendChild(divObj.cloneNode());
            this.setIconStyle();
        }
        cellObj = doc.createElement("td");
        tbObj.appendChild(cellObj);
        cellObj.UNSELECTABLE = "on";
        var anchorObj = this.linkObj = doc.createElement("a");
        cellObj.appendChild(anchorObj);
        anchorObj.hideFocus = true;
        anchorObj.nodeObj = this;
        anchorObj.href = this.href || "#";
        anchorObj.target = this.target || treeObj._11;
        anchorObj.className = this.textStyle || "nodeText" + (treeObj.nodeSelected.containsKey(this.id) ? " highlightedText" : "");
        anchorObj.title = this.hint || "";
        anchorObj.onclick = Tree.clickOnNode;
        anchorObj.ondblclick = Tree.dblClickOnNode;
        anchorObj.oncontextmenu = Tree.rightClickOnNode;
        if (treeObj._9)
        {
            anchorObj.ondragstart = Tree.dragStartOnNode;
            anchorObj.ondrag = Tree.draggingOnNode;
            anchorObj.ondragend = Tree.dragEndOnNode;
        }
        if (treeObj._10 != "none")
        {
            cellObj.ondragenter = cellObj.ondragover = Tree.dragOverOnSibling;
            cellObj.ondragleave = Tree.dragLeaveOnSibling;
            cellObj.ondrop = Tree.dropOnSibling;
            anchorObj.ondragenter = Tree.dragEnterOnNode;
            anchorObj.ondragover = Tree.dragOverOnNode;
            anchorObj.ondragleave = Tree.dragLeaveOnNode;
            anchorObj.ondrop = Tree.dropOnNode;
        }
        anchorObj.innerText = this.text || "";
    },

    drawIfRendered: function()  // draw if sibling node is rendered
    {
//alert(this.text + ".drawIfRendered()");
        var parentNodeObj = this.parentNode;
        if (parentNodeObj.nChildren > 1)
        {
            var siblingNodeObj = this.orderIndex == 0 ? parentNodeObj.children[1] : parentNodeObj.children[this.orderIndex - 1];
            if (siblingNodeObj.navObj)
            {
                this.redraw(true);
                if (this.isLastNode && siblingNodeObj.isLastNode)
                {
                    siblingNodeObj.isLastNode = false;
                    siblingNodeObj.resetCode(parentNodeObj.level, 1);
                }
                siblingNodeObj.setHierarchyIcon();
            }
        }
    },

    redraw: function(render)
    {
//        alert(this.text + ".redraw(" + render + ")");
        var parentNodeObj = this.parentNode;
        if (parentNodeObj)
        {
            this.isLastNode = this.orderIndex == parentNodeObj.nChildren - 1;
            if (this.navObj)
            {
                this.resetCode(parentNodeObj.level, this.isLastNode ? 0 : 1);
                this.setHierarchyIcon();
                this.setPrefixIcon();
                this.setIconStyle();
            }
            else if (render && parentNodeObj.nChildren > 1)
            {
                var insertAtObj, ppNode;
                if (this.isLastNode)
                {
                    parentNodeObj = parentNodeObj.children[this.orderIndex - 1];
                    while (parentNodeObj.nChildren)
                    {
                        ppNode = parentNodeObj.children[parentNodeObj.nChildren - 1];
                        if (ppNode.navObj)
                        {
                            parentNodeObj = ppNode;
                        }
                        else
                        {
                            break;
                        }
                    }
                    insertAtObj = parentNodeObj.navObj.nextSibling;
                }
                else
                {
                    insertAtObj = parentNodeObj.children[this.orderIndex + 1].navObj;
                }
                this.draw(insertAtObj || null);
            }
        }
    },

    resetCode: function(pos, code)
    {
//        alert(this.id + ".resetCode(" + pos + "," + code + ")");
        var nodeObj = this;
        if (nodeObj.treeObj._0)
        {
            var nodes = [], len = 0, childNode, nodeCode, i;
            while (nodeObj)
            {
                for (i = nodeObj.nChildren - 1; i >= 0; -- i)
                {
                    childNode = nodeObj.children[i];
                    nodeCode = childNode.code;
                    if (! childNode.navObj || nodeCode.charAt(pos) == code)
                    {
                        break;
                    }
                    childNode.code = nodeCode.substring(0, pos) + code + nodeCode.substring(pos + 1);
                    childNode.navObj.cells[pos].className = code ? "imgLine4" : "";
                    nodes[len ++] = childNode;
                }
                nodeObj = nodes[-- len];
            }
        }
    },

    erase: function()
    {
        var navObj = this.navObj;
        if (navObj)
        {
            if (this.prefixImg)
            {
                this.prefixImg.nodeObj = null;
                this.prefixImg = null;
            }
            if (this.linkObj)
            {
                this.linkObj.nodeObj = null;
                this.linkObj = null;
            }
            if (this.hierarchyImg)
            {
                this.hierarchyImg.nodeObj = null;
                this.hierarchyImg = null;
            }
            if (this.iconImg)
            {
                this.iconImg.nodeObj = null;
                this.iconImg = null;
            }
            navObj.nodeObj = null;
            navObj.removeNode(true);
            this.navObj = null;
        }
    },

    eraseChildren: function()
    {
        var nodeObj = this, len = 0, nodes = [], childNode, i;
        while (nodeObj)
        {
            for (i = nodeObj.nChildren - 1; i >= 0; -- i)
            {
                childNode = nodeObj.children[i];
                if (childNode.navObj)
                {
                    childNode.erase();
                    if (childNode.nChildren)
                    {
                        nodes[len ++] = childNode;
                    }
                }
                else
                {
                    break;
                }
            }
            nodeObj = nodes[-- len];
        }
    },

    isChecked: function()  // public
    {
        return this.checkState == 1;
    },

    check: function()  // public
    {
//alert(this + ".check()");
        if (this.checkState != undefined)
        {
            this.setCheckState(1, this);
            this.checkCascade(this);
        }
    },

    uncheck: function()
    {
        if (this.checkState)
        {
            this.setCheckState(0, this);
            this.checkCascade(this);
        }
    },

    checkCascade: function(srcNode)
    {
        var treeObj = this.treeObj;
        if ((this.prefix || treeObj._2) == "checkbox" && treeObj._3 != "none")
        {
            this.checkDescendants(srcNode);
            this.parentNode.checkAncestors(srcNode);
        }
    },

    /**
     * Check or uncheck checkbox/radio
     * @param checkState: 0: uncheck, 1: check, 2: grayed check
     * @param srcNode: source node trigger this action
     */
    setCheckState: function(checkState, srcNode)
    {
//        alert(this + ".setCheckState(" + checkState + "," + srcNode + ")");
        var treeObj = this.treeObj, stateChange = checkState % 2 != this.checkState % 2;
        if ((! stateChange || treeObj.fireEvent("beforecheckchange", true, this, checkState == 1, srcNode)) && checkState != this.checkState)
        {
            this.checkState = checkState;
            this.setPrefixIcon();
            this.setNodeChecked(checkState);
            if (stateChange)
            {
                treeObj.fireEvent("aftercheckchange", true, this, srcNode);
            }
        }
    },

    setNodeChecked: function(checkState)
    {
        var treeObj = this.treeObj, radiobox = (this.prefix || treeObj._2) == "radio", nodeChecked = radiobox ? treeObj.nodeRadioed : treeObj.nodeChecked;
        if (checkState == 2)  // checked gray
        {
            nodeChecked.remove(this.id);
            treeObj.nodeCheckedPartial.put(this.id, this);
        }
        else
        {
            var checkIdObj = radiobox ? this.parentNode : this, oldNodeObj;
            if (checkState)  // checked
            {
                if (radiobox)
                {
                    if (treeObj._4 == "all")
                    {
                        checkIdObj = treeObj.rootNode;
                    }
                    oldNodeObj = nodeChecked.get(checkIdObj.id);
                    if (oldNodeObj && oldNodeObj != this)
                    {
                        oldNodeObj.setCheckState(0, this);
                    }
                }
                nodeChecked.put(checkIdObj.id, this);
            }
            else  // unchecked
            {
                nodeChecked.remove(checkIdObj.id);
            }
            if (! radiobox)
            {
                treeObj.nodeCheckedPartial.remove(this.id);
            }
        }
    },

    checkDescendants: function(srcNode)
    {
//        alert(this + ".checkDescendants(" + srcNode + ")");
        var nodeObj = this, nodes = [], len = 0, treePrefix = nodeObj.treeObj._2, childNode, i;
        if (! srcNode)
        {
            srcNode = nodeObj;
        }
        while (nodeObj)
        {
            for (i = nodeObj.nChildren - 1; i >= 0; -- i)
            {
                childNode = nodeObj.children[i];
                if ((childNode.prefix || treePrefix) == "checkbox")
                {
                    childNode.setCheckState(nodeObj.checkState, srcNode);
                    if (childNode.nChildren)
                    {
                        nodes[len ++] = childNode;
                    }
                }
            }
            nodeObj = nodes[-- len];
        }
    },

    checkAncestors: function(srcNode)
    {
//        alert(this.text + ".checkAncestors(" + srcNode + ")");
        var nodeObj = this, treeObj = nodeObj.treeObj, treePrefix = treeObj._2;
        if (! srcNode)
        {
            srcNode = nodeObj;
        }
        if (treeObj._3 != "none")  // cascade check/uncheck
        {
            while ((nodeObj.prefix || treePrefix) == "checkbox" && nodeObj.level)
            {
                var isAllChecked = true, isPatialchecked = false, isAllRadio = true, i = nodeObj.nChildren - 1;
                for (; i >= 0; -- i)
                {
                    var childNode = nodeObj.children[i], checkState = childNode.checkState;;
                    if ((childNode.prefix || treePrefix) == "checkbox")
                    {
                        isAllRadio = false;
                        if (checkState != 1)
                        {
                            isAllChecked = false;
                        }
                        if (checkState != 0)
                        {
                            isPatialchecked = true;
                        }
                    }
                }
                if (! isAllRadio)
                {
                    nodeObj.setCheckState(isAllChecked ? 1 : isPatialchecked ? 2 : 0, srcNode);
                }
                nodeObj = nodeObj.parentNode;
            }
        }
    },

    getOrderIndexByMode: function(mode, moveSibling)
    {
        if (this.treeObj._6)
        {
            return null;
        }
        switch (mode)
        {
            case "previousSibling":
            {
                return moveSibling ? this.orderIndex - 1 : this.orderIndex;
            }
            case "nextSibling":
            {
                return moveSibling ? this.orderIndex : this.orderIndex + 1;
            }
            case "firstChild":
            {
                return 0;
            }
            default:  // lastChild
            {
                return this.nChildren;
            }
        }
    },

    /*
        {
            id: "",
            text: "",
            iconInactive: "",
            iconActive: "",
            prefix: "none/checkbox/radio/...",
            textStyle: "",
            href: "",
            target: "",
            hint: "",
            expanded: true/false,
            checked: true/false,
            data:
            {
                prop1: ...,
                ...
            },
            childNodes:
            [
                ...
            ]
        },
        ...
    */
    loadJSON: function(json)  // public
    {
        var nodeObj = this, jsonObj;
        if (! nodeObj.nChildren)
        {
            try
            {
                if (jsonObj = typeof json == "string" ? eval("(" + json + ")") : json)
                {
                    var treeObj = nodeObj.treeObj, objs = [], nodes = [], objLen = 0, jsonLen, childNodes, newNodeObj, i;
                    Tree.nodesLazyCheck.clear();
                    if (! (jsonObj instanceof Array))
                    {
                        treeObj.attachNode(newNodeObj = new TreeNode(jsonObj));
                        nodeObj.insertChild(newNodeObj);
                        jsonObj = jsonObj.childNodes;
                        nodeObj = newNodeObj;
                    }
                    while (jsonObj)  // array
                    {
                        jsonLen = jsonObj.length;
                        for (i = 0; i < jsonLen; ++ i)
                        {
                            treeObj.attachNode(newNodeObj = new TreeNode(jsonObj[i]));
                            nodeObj.insertChild(newNodeObj);
                            childNodes = jsonObj[i].childNodes;
                            if (childNodes instanceof Array)
                            {
                                nodes[objLen] = newNodeObj;
                                objs[objLen ++] = childNodes;
                            }
                        }
                        nodeObj = nodes[-- objLen];
                        jsonObj = objs[objLen];
                    }
                }
            }
            catch (e)
            {
                throw new Error("invalid JSON data");
            }
            finally
            {
                this.completeLoading();
            }
        }
    },

    toJSONString: function()
    {
        if (this == this.treeObj.rootNode)
        {
            return this.children.toJSONString();
        }
        else
        {
            var result = [], i = 9, j = 0, jsonName = ["id", "text", "iconInactive", "iconActive", "prefix", "textStyle", "href", "target", "hint", "orderIndex"], children = this.children, data = this.data, propVal;
            for (; i >= 0; -- i)
            {
                propVal = this["_" + i];
                if (propVal != undefined && propVal !== "")
                {
                    result[j ++] = '"' + jsonName[i] + '":' + propVal.toJSONString();
                }
            }
            if (this.checkState != undefined)
            {
                result[j ++] = '"checked":' + this.isChecked().toJSONString();
            }
            if (data)
            {
                propVal = data.toJSONString();
                if (propVal)
                {
                    result[j ++] = '"data":' + propVal;
                }
            }
            if (children)
            {
                result[j ++] = '"expanded":' + this.isExpanded().toJSONString();
                result[j ++] = '"childNodes":' + children.toJSONString();
            }
            return '{' + result.join(',') + '}';
        }
    },

    /*
        <?xml version="1.0" encoding="UTF-8"?>
        <Nodes>
            <Node text="" id="" iconInactive="" iconActive="" textStyle="" href="" target="" childNodes="true/false" prefix="none/checkbox/radio/..." checked="true/false" expanded="true/false" hint="" data="...">
                ...
            </Node>
            ...
        </Nodes>
    */
    loadXML: function(xml)
    {
        var nodeObj = this, xmlElem = xml, xmlParser, err;
        if (! nodeObj.nChildren)
        {
            try
            {
                if (typeof xml == "string")
                {
                    xmlParser = Tree.xmlParser;
                    if (! xmlParser)
                    {
                        try
                        {
                            xmlParser = new ActiveXObject("Msxml2.DOMDocument.3.0");
                        }
                        catch (e)
                        {
                            xmlParser = new ActiveXObject("Microsoft.XMLDOM");
                        }
                        Tree.xmlParser = xmlParser;
                    }
                    xmlParser.loadXML(xml);
                    err = xmlParser.parseError;
                    if (err.errorCode)
                    {
                        throw new Error(err.reason);
                    }
                    xmlElem = xmlParser.documentElement;
                }
                if (xmlElem)
                {
                    var xmlList = xmlElem.childNodes, treeObj = nodeObj.treeObj, objs = [], nodes = [], objLen = 0, newNodeObj;
                    Tree.nodesLazyCheck.clear();
                    while (xmlList)
                    {
                        xmlElem = xmlList[0];
                        while (xmlElem)
                        {
                            treeObj.attachNode(newNodeObj = new TreeNode(xmlElem));
                            nodeObj.insertChild(newNodeObj);
                            if (xmlElem.hasChildNodes())
                            {
                                nodes[objLen] = newNodeObj;
                                objs[objLen ++] = xmlElem.childNodes;
                            }
                            xmlElem = xmlElem.nextSibling;
                        }
                        nodeObj = nodes[-- objLen];
                        xmlList = objs[objLen];
                    }
                }
            }
            finally
            {
                this.completeLoading();
            }
        }
    },

    waitLoading: function(funcCallback, thisObj, arg1, arg2)
    {
//        alert(this + ".waitLoading(" + funcCallback + "," + thisObj + "," + arg1 + "," + arg2 + ")");
        var node = this, ready;
        switch (node.readyState)
        {
            case 0:  // uninitialized
            {
                node.setHierarchyIcon("imgLoading");
                node.readyState = 2;
                node.treeObj.fireEvent("beforeload", true, node);  // Event: loading children nodes
            }
            case 2:  // loading
            {
                ready = node.readyState == 1;
                if (ready)
                {
                    node.setHierarchyIcon();
                }
                else
                {
                    this.addEventHook(funcCallback, thisObj, arg1, arg2);
                }
                return ready;
            }
            case 1:  // loaded
            {
                return true;
            }
        }
    },

    addEventHook: function(funcCallback, thisObj, arg1, arg2)
    {
        var callbacks = this.callbacks, args = arg1 == undefined ? [] : arg2 == undefined ? [arg1] : [arg1, arg2];
        if (callbacks)  // [Function, Object, [arguments]]
        {
            if (callbacks[0] != funcCallback)
            {
                callbacks.splice(0, 0, args);
                callbacks.splice(0, 0, thisObj);
                callbacks.splice(0, 0, funcCallback);
            }
        }
        else
        {
            this.callbacks = [funcCallback, thisObj, args];
        }
    },

    completeLoading: function()
    {
//        alert(this.text + ".completeLoading()");
        var treeObj = this.treeObj, callbacks = this.callbacks, i;
        this.readyState = 1;  // load complete
        if (! this.nChildren)
        {
            this.children = null;
        }
        if (callbacks)
        {
            i = callbacks.length - 1;
            while (i >= 0)
            {
                var args = callbacks[i --], thisObj = callbacks[i --], funcCallback = callbacks[i];
                if (funcCallback)
                {
                    callbacks.length = i --;
                    funcCallback.apply(thisObj, args);
                }
            }
        }
        Tree.nodesLazyCheck.invoke(TreeNode.prototype.checkAncestors);
        if (this == treeObj.rootNode)
        {
            this.expand(treeObj._5);
            treeObj._18.className = "tree";
        }
        treeObj.fireEvent("afterload", true, this);
    },

    /*
     * nodeObj: source node (object/TreeNode)
     * position: insert position (firstChild/lastChild/previousSibling/nextSibling), default: sorted position/last child
     */
    insert: function(nodeObj, position)  // public
    {
//alert(this + ".insert(" + nodeObj + "," + position + ")");
        var treeObj = this.treeObj, parentNodeObj = (position == "previousSibling" || position == "nextSibling") ? this.parentNode : this;
        if (nodeObj && this.waitLoading(this.insert, this, nodeObj, position) && treeObj.fireEvent("beforeinsert", true, this, position, nodeObj))
        {
            treeObj.attachNode(nodeObj);
            parentNodeObj.insertChild(nodeObj);
            this.checkAncestors();
            nodeObj.drawIfRendered();
            treeObj.fireEvent("afterinsert", true, this, position, nodeObj);
        }
    },

    getOrderIndexSorted: function(nodeObj)
    {
        var orderIndex = this.nChildren;
        if (orderIndex)
        {
            var treeObj = this.treeObj;
            if (treeObj.oncompare(this.children[0], nodeObj) == 1)
            {
                orderIndex = 0;
            }
            else if (orderIndex > 1 && treeObj.oncompare(this.children[orderIndex - 1], nodeObj) == 1)
            {
                var indexStart = 1, indexEnd = orderIndex - 1;
                while (indexStart <= indexEnd)
                {
                    var indexSearch = parseInt((indexStart + indexEnd) / 2), result = treeObj.oncompare(this.children[indexSearch], nodeObj);
                    if (result == 1)
                    {
                        indexEnd = indexSearch - 1;
                    }
                    else if (result == -1)
                    {
                        indexStart = indexSearch + 1;
                    }
                    else
                    {
                        break;
                    }
                }
                orderIndex = indexSearch;
            }
        }
        return orderIndex;
    },

    insertChild: function(nodeObj)
    {
//        alert(this.text + ".insertChild(" + nodeObj.text + ")");
        var parentNode = this, childNodes = parentNode.children, orderIndex = nodeObj.orderIndex, treeObj = nodeObj.treeObj = parentNode.treeObj, i = parentNode.nChildren ++, checkState = nodeObj.checkState, treePrefix = treeObj._2, recheckOnload = treeObj._13;
        orderIndex = treeObj._6 ? parentNode.getOrderIndexSorted(nodeObj) : orderIndex == undefined || orderIndex > i ? i : orderIndex;
        if (! childNodes)
        {
            childNodes = parentNode.children = [];
        }
        childNodes.splice(orderIndex, 0, nodeObj);
        for (; i >= orderIndex; -- i)
        {
            childNodes[i].orderIndex = i;  // orderIndex
        }
        parentNode.readyState = 1;
        nodeObj.parentNode = parentNode;
        nodeObj.level = parentNode.level + 1;  // root node level start from 1
        // validate check state
        switch (nodeObj.prefix || treePrefix)
        {
            case "checkbox":
            {
                if (checkState == undefined)
                {
                    checkState = 0;
                }
                if (treeObj._3 != "none" && parentNode.level && (parentNode.prefix || treePrefix) == "checkbox" && recheckOnload != "none")  // non-root
                {
                    var parentCheckState = parentNode.checkState;
                    if (checkState != parentCheckState)
                    {
                        if (recheckOnload == "new")
                        {
                            Tree.nodesLazyCheck.put(parentNode.id, parentNode);  // lazy check ancestors
                        }
                        else if (parentCheckState < 2)  // recheck children
                        {
                            checkState = parentCheckState;
                        }
                    }
                }
                break;
            }
            case "radio":
            {
                if (checkState == undefined || checkState == 2)
                {
                    checkState = 0;
                }
                else if (checkState == 1 && recheckOnload != "none")
                {
                    var nodeRechecked = treeObj.nodeRadioed.get(treeObj._4 == "all" ? treeObj.rootNode.id : parentNode.id);
                    if (nodeRechecked && nodeRechecked != nodeObj)
                    {
                        if (recheckOnload == "new")
                        {
                            nodeRechecked.setNodeChecked(0);
                        }
                        else
                        {
                            checkState = 0;
                        }
                    }
                }
                break;
            }
            default:
            {
                checkState = undefined;
            }
        }
        nodeObj.checkState = checkState;
        if (checkState == 1)
        {
            nodeObj.setNodeChecked(checkState);
        }
    },

    detachFromTree: function(newTreeObj)
    {
        var nodeObj = this, treeObj = nodeObj.treeObj, treePrefix = treeObj._2, nodes = [], len = 0, i;
        while (nodeObj)
        {
            var namedNodes = treeObj.nodeMap[nodeObj.name], radiobox, nodeChecked, checkIdObj;
            if (namedNodes)
            {
                for (i = namedNodes.length - 1; i >= 0; -- i)
                {
                    if (namedNodes[i] == nodeObj)
                    {
                        namedNodes.splice(i, 1);
                        break;
                    }
                }
            }
            treeObj.nodeSelected.remove(nodeObj.id);
            switch (nodeObj.checkState)
            {
                case 1:
                {
                    radiobox = (nodeObj.prefix || treePrefix) == "radio", nodeChecked = radiobox ? treeObj.nodeRadioed : treeObj.nodeChecked, checkIdObj = radiobox ? treeObj._4 == "all" ? treeObj.rootNode : nodeObj.parentNode : nodeObj;
                    nodeChecked.remove(checkIdObj.id);
                    break;
                }
                case 2:
                {
                    treeObj.nodeCheckedPartial.remove(nodeObj.id);
                }
            }
            nodeObj.checkState = 0;
            nodeObj.erase();
            nodeObj.treeObj = newTreeObj;
            nodeObj.expanded = false;
            if (nodeObj.nChildren)
            {
                nodes = nodes.concat(nodeObj.children);
            }
            nodeObj = nodes[len ++];
        }
    },

    remove: function()  // public
    {
//        alert(this.text + ".remove()");
        var treeObj = this.treeObj;
        if (treeObj.fireEvent("beforeremove", true, this))
        {
            this.detachFromTree();
            this.detachFromParent();
            this.parentNode.checkAncestors();
            treeObj.fireEvent("afterremove", true, this);
        }
    },

    detachFromParent: function()
    {
//        alert(this + ".detachFromParent()");
        var nodeObj = this, orderIndex = nodeObj.orderIndex, i = orderIndex, parentNode = nodeObj.parentNode, childNodes = parentNode.children;
        childNodes.splice(orderIndex, 1);
        -- parentNode.nChildren;
        for (; i < parentNode.nChildren; ++ i)
        {
            childNodes[i].orderIndex = i;  // orderIndex
        }
        if (parentNode.nChildren)
        {
            if (nodeObj.level == 1 && ! orderIndex)  // redraw sibling of root node
            {
                childNodes[0].redraw(false);
            }
            if (nodeObj.isLastNode)  // redraw previous sibling node
            {
                childNodes[nodeObj.orderIndex - 1].redraw(false);
            }
        }
        else
        {
            parentNode.children = null;
            parentNode.expanded = false;
            parentNode.setHierarchyIcon();
            parentNode.setIconStyle();
        }
        nodeObj.parentNode = null;
    },

    edit: function()  // public
    {
        var treeObj = this.treeObj, linkObj = this.linkObj, stateChange = linkObj.contentEditable != "true";
        if (linkObj && stateChange && treeObj.fireEvent("beforeedit", true, this))
        {
            linkObj.onblur = Tree.blurOnEditbox;
            linkObj.onkeypress = Tree.keyPressOnEditbox;
            this.addTextStyle("editbox");
            linkObj.contentEditable = "true";
            linkObj.focus();
        }
    },

    reload: function()  // public
    {
        var nodeObj = this;
        if (nodeObj.readyState == 1)
        {
            for (var i = nodeObj.nChildren - 1; i >= 0; -- i)
            {
                nodeObj.children[i].detachFromTree();
            }
            nodeObj.children = null;
            nodeObj.nChildren = 0;
            nodeObj.readyState = 2;
            nodeObj.checkAncestors();
            nodeObj.expanded = false;
            nodeObj.treeObj.fireEvent("beforeload", true, nodeObj);  // Event: loading children nodes
        }
    },

    isExpanded: function()  // public
    {
        return this.children ? this.expanded : false;
    },

    expand: function(expandChildren)  // public
    {
//alert(this.text + ".expand()");
        var nodeObj = this;
        if (nodeObj.children)
        {
            var treeObj = nodeObj.treeObj, trigger = true, nodes = [], len = 0, expanding = true, i, childNode;
            while (nodeObj)
            {
                if ((expandChildren || expanding) && nodeObj.waitLoading(nodeObj.expand, nodeObj, expandChildren))
                {
                    for (i = nodeObj.nChildren - 1; i >= 0; -- i)
                    {
                        childNode = nodeObj.children[i];
                        if (childNode.navObj)
                        {
                            childNode.navObj.className = "visible";
                        }
                        else if (nodeObj.navObj)
                        {
                            childNode.draw(nodeObj.navObj.nextSibling);
                        }
                        else if (nodeObj == treeObj.rootNode)
                        {
                            childNode.draw(treeObj._18.firstChild);
                        }
                        if (childNode.children)
                        {
                            nodes[len ++] = childNode;
                        }
                    }
                    if (trigger && nodeObj.nChildren)
                    {
                        nodeObj.expanded = true;
                        nodeObj.setHierarchyIcon();
                        nodeObj.setIconStyle();
                        treeObj.fireEvent("expand", true, nodeObj);
                    }
                    if (! expandChildren)
                    {
                        trigger = false;
                    }
                }
                if (nodeObj = nodes[-- len])
                {
                    expanding = nodeObj.expanded;
                }
            }
        }
    },

    expandAncestors: function()  // public
    {
        var nodeObj = this, rootNode = nodeObj.treeObj.rootNode;
        while (nodeObj.parentNode != rootNode)
        {
            nodeObj = nodeObj.parentNode;
            nodeObj.expand();
        }
    },

    collapse: function(collapseChildren)  // public
    {
        var nodeObj = this;
        if (nodeObj.nChildren)
        {
            var treeObj = nodeObj.treeObj, trigger = true, nodes = [], len = 0, expanded, i, childNode;
            while (nodeObj)
            {
                expanded = nodeObj.expanded;
                if (collapseChildren || expanded)
                {
                    for (i = nodeObj.nChildren - 1; i >= 0; -- i)
                    {
                        childNode = nodeObj.children[i];
                        if (expanded && childNode.navObj)
                        {
                            childNode.navObj.className = "hidden";
                        }
                        if (childNode.nChildren)
                        {
                            nodes[len ++] = childNode;
                        }
                    }
                    if (trigger && expanded)
                    {
                        nodeObj.expanded = false;
                        nodeObj.setHierarchyIcon();
                        nodeObj.setIconStyle();
                        treeObj.fireEvent("collapse", true, nodeObj);
                    }
                    if (! collapseChildren)
                    {
                        trigger = false;
                    }
                }
                nodeObj = nodes[-- len];
            }
        }
    },

    collapseSiblings: function()  // public
    {
        var parentNode = this.parentNode, i = parentNode.nChildren - 1, childNode;
        for (; i >= 0; -- i)
        {
            childNode = parentNode.children[i];
            if (childNode != this)
            {
                childNode.collapse();
            }
        }
    },

    select: function(preserveSelected)
    {
        this.expandAncestors();
        var treeObj = this.treeObj, nodeId = this.id, nodeSelected = treeObj.nodeSelected;
        if (! nodeSelected.containsKey(nodeId) && treeObj.fireEvent("beforeselectchange", true, this, true) && ! nodeSelected.containsKey(nodeId))
        {
            if (! preserveSelected)
            {
                treeObj.unselectAll();
            }
            nodeSelected.put(nodeId, this);
            this.addTextStyle("highlightedText");
            this.setIconStyle();
            var treeNavObj = treeObj._18, navObj = this.navObj, scrollTop = treeNavObj.scrollTop, scrollHeight = scrollTop + treeNavObj.clientHeight;
            if (navObj.offsetTop < scrollTop || navObj.offsetTop + navObj.offsetHeight > scrollHeight)  // scroll to middle area
            {
                treeNavObj.scrollTop = navObj.offsetTop - parseInt(treeNavObj.clientHeight / 2);
            }
            treeObj.fireEvent("afterselectchange", true, this);
        }
    },

    unselect: function()
    {
        var treeObj = this.treeObj, nodeId = this.id, nodeSelected = treeObj.nodeSelected;
        if (nodeSelected.containsKey(nodeId) && treeObj.fireEvent("beforeselectchange", true, this, false) && nodeSelected.containsKey(nodeId))
        {
            nodeSelected.remove(nodeId);
            this.removeTextStyle("highlightedText");
            this.setIconStyle();
            treeObj.fireEvent("afterselectchange", true, this);
        }
    },

    /*
     * mode (null: child node auto determined (sorted position / last child), firstChild, lastChild, previousSibling, nextSibling)
     */
    moveTo: function(tgtNodeObj, mode)
    {
//        alert(this.text + ".moveTo(" + tgtNodeObj.text + "," + mode + ")");
        var node = this, toSibling = mode == "previousSibling" || mode == "nextSibling";
        if (tgtNodeObj && node != tgtNodeObj && (toSibling || tgtNodeObj.waitLoading(node.moveTo, node, tgtNodeObj, mode)))
        {
            var srcTreeObj = node.treeObj, srcParentNodeObj = node.parentNode, srcOrderIndex = node.orderIndex, tgtTreeObj = tgtNodeObj.treeObj, tgtParentNode = toSibling ? tgtNodeObj.parentNode : tgtNodeObj, tgtOrderIndex;
            if (srcTreeObj != tgtTreeObj)  // move between trees
            {
                node.detachFromTree(tgtTreeObj);
                node.detachFromParent();
                node.orderIndex = tgtNodeObj.getOrderIndexByMode(mode);  // orderIndex
                tgtParentNode.insertChild(node);
            }
            else if (toSibling || ! node.isAncestorOf(tgtNodeObj))  // move inside a tree
            {
                tgtOrderIndex = tgtNodeObj.getOrderIndexByMode(mode, srcParentNodeObj == tgtNodeObj.parentNode && srcOrderIndex < tgtNodeObj.orderIndex);
                node.collapse();
                node.setNodeChecked(0);
                node.detachFromParent();  // remove this node from it's parent
                node.eraseChildren();
                node.erase();
                node.orderIndex = tgtOrderIndex;
                tgtParentNode.insertChild(node);
                tgtParentNode.setHierarchyIcon();
            }
            else
            {
                return;
            }
            node.drawIfRendered();
            srcParentNodeObj.checkAncestors();  // check source node's ancestors
            tgtNodeObj.checkAncestors();
            tgtTreeObj.fireEvent("move", true, srcParentNodeObj, srcOrderIndex, tgtTreeObj, node);
            return node;
        }
        return null;
    },

    /*
     * mode (null: child node auto determined (sorted position / last child), firstChild, lastChild, previousSibling, nextSibling)
    */
    copyTo: function(tgtNodeObj, mode)
    {
//        alert(this.text + ".copyTo(" + tgtNodeObj + "," + mode + ")");
        var srcNode = this, toSibling = mode == "previousSibling" || mode == "nextSibling";
        if (tgtNodeObj && srcNode != tgtNodeObj && (toSibling || tgtNodeObj.waitLoading(srcNode.copyTo, srcNode, tgtNodeObj, mode) || ! srcNode.isAncestorOf(tgtNodeObj)))
        {
            var tgtTreeObj = tgtNodeObj.treeObj, tgtParentNode = toSibling ? tgtNodeObj.parentNode : tgtNodeObj, nodeCloned = srcNode.clone(), nodes = [], nodesCloned = [], len = 0, childNode, newNode, i;
            nodeCloned.orderIndex = tgtNodeObj.getOrderIndexByMode(mode);
            tgtParentNode.insertChild(nodeCloned);
            tgtTreeObj.attachNode(nodeCloned);
            tgtParentNode = nodeCloned;
            while (srcNode)
            {
                for (i = 0; i < srcNode.nChildren; ++ i)
                {
                    childNode = srcNode.children[i];
                    newNode = childNode.clone();
                    tgtParentNode.insertChild(newNode);
                    tgtTreeObj.attachNode(newNode);
                    if (childNode.nChildren)
                    {
                        nodesCloned[len] = newNode;
                        nodes[len ++] = childNode;
                    }
                }
                tgtParentNode = nodesCloned[-- len];
                srcNode = nodes[len];
            }
            tgtNodeObj.checkAncestors();
            nodeCloned.drawIfRendered();
            tgtTreeObj.fireEvent("copy", true, this.parentNode, this.orderIndex, tgtTreeObj, nodeCloned);
            return nodeCloned;
        }
        return null;
    },

    /**
     * exclude child nodes
     */
    clone: function()
    {
        var newNode = new TreeNode(), nodeObj = this, srcNodeData = nodeObj.data, newNodeData = srcNodeData, hasChildren = nodeObj.children ? true : false, p, obj;
        if (typeof srcNodeData == "object")
        {
            newNodeData = {};
            for (p in srcNodeData)
            {
                newNodeData[p] = srcNodeData[p];
            }
        }
        newNode.name = nodeObj.name;
        newNode.text = nodeObj.text;
        newNode.iconInactive = nodeObj.iconInactive;
        newNode.iconActive = nodeObj.iconActive;
        newNode.prefix = nodeObj.prefix;
        newNode.textStyle = nodeObj.textStyle;
        newNode.href = nodeObj.href;
        newNode.target = nodeObj.target;
        newNode.hint = nodeObj.hint;
        newNode.checkState = nodeObj.checkState;  // 0: unchecked, 1: checked, 2: gray checked
        newNode.data = newNodeData;
        newNode.readyState = hasChildren ^ 1;  // 0: uninitialize, 1: loaded, 2: loading
        if (hasChildren)
        {
            newNode.children = [];
            newNode.expanded = false;
        }
        return newNode;
    },

    sort: function()  // public
    {
        if (this.nChildren)
        {
            var childNodes = this.children, expanded = this.expanded, i = this.nChildren - 1;
            if (expanded)
            {
                this.eraseChildren();
            }
            childNodes.sort(this.treeObj.oncompare);
            for (; i >= 0; -- i)
            {
                childNodes[i].orderIndex = i;  // orderIndex
            }
            if (expanded)
            {
                this.expand();
            }
        }
    },

    setDropEffect: function(posPreviousSibling)
    {
        var srcNodeObj = Tree.nodeDragged, tgtTreeObj = this.treeObj, dropEffect = tgtTreeObj._10, evtVal;
        Tree.captureEvent();
        if (srcNodeObj)
        {
            if (tgtTreeObj == srcNodeObj.treeObj && dropEffect != "none" && (srcNodeObj == this || srcNodeObj.isAncestorOf(this)))  // drag inside tree
            {
                dropEffect = "none";
            }
            if (dropEffect != "none")
            {
                dropEffect = tgtTreeObj.fireEvent("dragging", dropEffect, srcNodeObj, tgtTreeObj, this, posPreviousSibling == undefined ? "lastChild" : posPreviousSibling ? "previousSibling" : "nextSibling");
            }
            if (dropEffect == "none")
            {
                Tree.dragEndOnSibling();
            }
        }
        else
        {
            dropEffect = "none";
        }
        return event.dataTransfer.dropEffect = dropEffect;
    },

    destructor: function()
    {
        this.erase();
        this.parentNode = null;
        this.treeObj = null;
    }
}
