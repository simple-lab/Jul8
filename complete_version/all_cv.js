var Jul8;
(function (Jul8) {
    var ViewList = (function () {
        function ViewList($, tmpl) {
            this.list = [];
            this.root = $;
            this.tmpl = tmpl;
        }
        ViewList.prototype.add = function (type) {
            var newNode = this.tmpl.clone();
            var child = new type(newNode);
            this.list.push(child);
            this.length = this.list.length;
            this.root.append(newNode);
            return child;
        };
        ViewList.prototype.remove = function (child) {
            var idx = this.list.indexOf(child);
            if (idx >= 0) {
                this.list.splice(idx, 1);
                this.length = this.list.length;
                child.$.remove();
            }
        };
        ViewList.prototype.removeAt = function (idx) {
            if (idx < 0) {
                idx = this.list.length + idx;
            }
            var child = this.list[idx];
            this.list.splice(idx, 1);
            this.length = this.list.length;
            child.$.remove();
        };
        ViewList.prototype.empty = function () {
            this.list = [];
            this.length = 0;
            this.root.empty();
        };
        ViewList.prototype.getAt = function (idx) {
            return this.list[idx];
        };
        ViewList.prototype.forEach = function (callbackfn, thisArg) {
            this.list.forEach(callbackfn, thisArg);
        };
        return ViewList;
    }());
    Jul8.ViewList = ViewList;
    var pattern = /({{[^}]+}})/g;
    var Fields = (function () {
        function Fields() {
            this.attrs = [];
            this.nodes = [];
        }
        Fields.prototype.set = function (data) {
            for (var _i = 0, _a = this.attrs; _i < _a.length; _i++) {
                var a = _a[_i];
                var newValue = this.replace(a.origValue, data);
                if (a.replacedLocalName) {
                    if (a.attr.namespaceURI !== null) {
                        a.attr = document.createAttributeNS(a.attr.namespaceURI, a.replacedLocalName);
                        a.attr.value = newValue;
                        a.elem.setAttributeNodeNS(a.attr);
                    }
                    else {
                        a.attr = document.createAttribute(a.replacedLocalName);
                        a.attr.value = newValue;
                        a.elem.setAttributeNode(a.attr);
                    }
                    a.elem = null;
                    a.replacedLocalName = null;
                }
                else {
                    if (a.attr.value !== newValue) {
                        a.attr.value = newValue;
                    }
                }
            }
            for (var _b = 0, _c = this.nodes; _b < _c.length; _b++) {
                var e = _c[_b];
                var newText = this.replace(e.origText, data);
                if (e.node.textContent !== newText) {
                    e.node.textContent = newText;
                }
            }
        };
        Fields.prototype.replace = function (text, data) {
            var list = text.split(pattern);
            for (var i = 0; i < list.length; ++i) {
                var word = list[i];
                if (word.substring(0, 2) === "{{" && word.substring(word.length - 2) === "}}") {
                    var fname = word.substr(2, word.length - 4).trim();
                    if (data[fname] !== undefined) {
                        list[i] = data[fname];
                    }
                    else {
                        console.error('(Jul8) field not found: [' + fname + ']');
                    }
                }
            }
            return list.join('');
        };
        return Fields;
    }());
    Jul8.Fields = Fields;
    ;
    var Scanner = (function () {
        function Scanner(root, scanFields) {
            var _this = this;
            this.controls = {};
            this.lists = {};
            this.scanListItem(root.get(0));
            root.find('[j8-control]').each(function (i, v) {
                var cid = v.getAttribute('j8-control');
                v.removeAttribute('j8-control');
                if (_this.controls[cid]) {
                    console.error('(Jul8) duplicate control id: [' + cid + ']');
                }
                _this.controls[cid] = $(v);
            });
            if (scanFields) {
                this.fields = new Fields();
                this.visitNode(root.get(0));
            }
        }
        Scanner.prototype.scanListItem = function (baseElem) {
            for (var i = 0; i < baseElem.childNodes.length; ++i) {
                var elem = baseElem.childNodes[i];
                if (elem.nodeType !== elem.ELEMENT_NODE)
                    continue;
                if (elem.hasAttribute('j8-listItem')) {
                    var itemId = elem.getAttribute('j8-listItem');
                    elem.removeAttribute('j8-listItem');
                    elem.removeAttribute('j8-model');
                    if (this.lists[itemId]) {
                        console.error('(Jul8) duplicate listItem id: [' + itemId + ']');
                    }
                    var j = $(elem);
                    var p = j.parent();
                    j.detach();
                    this.lists[itemId] = { list: p, itemTemplate: j };
                }
                else {
                    this.scanListItem(elem);
                }
            }
        };
        Scanner.prototype.visitNode = function (node) {
            var childNodes = node.childNodes;
            if (childNodes.length > 0) {
                for (var i = 0; i < childNodes.length; ++i) {
                    this.visitNode(childNodes[i]);
                }
            }
            else {
                if (node.textContent.search(pattern) >= 0) {
                    var n = { node: node, origText: node.textContent };
                    this.fields.nodes.push(n);
                }
            }
            var elem = node;
            if (elem.attributes) {
                var replacedAttrs = [];
                var removedAttrs = [];
                for (var i = 0; i < elem.attributes.length; ++i) {
                    var attr = elem.attributes[i];
                    var replacedLocalName = null;
                    if (attr.localName.substring(0, 8) === 'j8-attr-') {
                        replacedLocalName = attr.localName.substring(8);
                    }
                    if (attr.value.search(pattern) >= 0) {
                        var localName = replacedLocalName || attr.localName;
                        if (localName === 'style') {
                            console.error("(Jul8) can't use {{ ... }} notation in `style` attribute.");
                        }
                        if (localName === 'class') {
                            console.error("(Jul8) can't use {{ ... }} notation in `class` attribute.");
                        }
                        var a = { elem: elem, attr: attr, replacedLocalName: replacedLocalName, origValue: attr.value };
                        this.fields.attrs.push(a);
                        if (replacedLocalName) {
                            removedAttrs.push(attr);
                        }
                    }
                    else if (replacedLocalName) {
                        replacedAttrs.push({ name: replacedLocalName, attr: attr });
                    }
                }
                for (var _i = 0, replacedAttrs_1 = replacedAttrs; _i < replacedAttrs_1.length; _i++) {
                    var _a = replacedAttrs_1[_i], name_1 = _a.name, attr = _a.attr;
                    elem.removeAttributeNode(attr);
                    if (attr.namespaceURI !== null) {
                        elem.setAttributeNS(attr.namespaceURI, name_1, attr.value);
                    }
                    else {
                        elem.setAttribute(name_1, attr.value);
                    }
                }
                for (var _b = 0, removedAttrs_1 = removedAttrs; _b < removedAttrs_1.length; _b++) {
                    var attr = removedAttrs_1[_b];
                    elem.removeAttributeNode(attr);
                }
            }
        };
        Scanner.prototype.C = function (controlId) {
            var ctl = this.controls[controlId];
            if (ctl === undefined) {
                console.error('(Jul8) no such control: [' + controlId + ']');
            }
            return ctl;
        };
        Scanner.prototype.L = function (listItemId) {
            var it = this.lists[listItemId];
            if (it === undefined) {
                console.error('(Jul8) no such listItem: [' + listItemId + ']');
            }
            return new ViewList(it.list, it.itemTemplate);
        };
        return Scanner;
    }());
    Jul8.Scanner = Scanner;
    var TemplateHolder = (function () {
        function TemplateHolder() {
            this.templates = {};
        }
        TemplateHolder.prototype.addTemplateString = function (content) {
            var beginMarker = '$(TemplateBegin)';
            var endMarker = '$(TemplateEnd)';
            var beginPos = content.indexOf(beginMarker);
            var endPos = content.indexOf(endMarker);
            var contentBody = content.substring(beginPos + beginMarker.length, endPos);
            this.addTemplateRoot($(contentBody));
        };
        TemplateHolder.prototype.addTemplateRoot = function (root) {
            var _this = this;
            root.find('[j8-template]').each(function (i, v) {
                var j = $(v);
                j.detach();
                var tid = v.getAttribute('j8-template');
                v.removeAttribute('j8-template');
                _this.templates[tid] = j;
            });
        };
        TemplateHolder.prototype.cloneTemplate = function (templateId) {
            var t = this.templates[templateId];
            if (t === undefined) {
                console.error('(Jul8) no such template: [' + templateId + ']');
            }
            return t.clone();
        };
        return TemplateHolder;
    }());
    Jul8.TemplateHolder = TemplateHolder;
})(Jul8 || (Jul8 = {}));
var ButtonGroup_d = (function () {
    function ButtonGroup_d(templateHolder, parentNode) {
        this.$ = templateHolder.cloneTemplate('ButtonGroup');
        if (parentNode) {
            parentNode.append(this.$);
        }
        var s = new Jul8.Scanner(this.$, false);
        this.left = s.C('left');
        this.middle = s.C('middle');
        this.right = s.C('right');
    }
    return ButtonGroup_d;
}());
var AppTitle_d = (function () {
    function AppTitle_d(templateHolder, parentNode) {
        this.$ = templateHolder.cloneTemplate('AppTitle');
        if (parentNode) {
            parentNode.append(this.$);
        }
        var s = new Jul8.Scanner(this.$, false);
    }
    return AppTitle_d;
}());
var TodosGroup_d = (function () {
    function TodosGroup_d(templateHolder, parentNode) {
        this.$ = templateHolder.cloneTemplate('TodosGroup');
        if (parentNode) {
            parentNode.append(this.$);
        }
        var s = new Jul8.Scanner(this.$, false);
        this.inputContent = s.C('inputContent');
        this.addBtn = s.C('addBtn');
        this.todosList = s.C('todosList');
        this.clearAll = s.C('clearAll');
        this.listOf_TodoItem = s.L('TodoItem');
    }
    return TodosGroup_d;
}());
var TodosGroup_TodoItem_d = (function () {
    function TodosGroup_TodoItem_d($) {
        this.$ = $;
        var s = new Jul8.Scanner(this.$, true);
        this.j8fields = s.fields;
        this.todoCheckBtn = s.C('todoCheckBtn');
        this.todoCheckState = s.C('todoCheckState');
        this.todoContent = s.C('todoContent');
        this.todoRemoveBtn = s.C('todoRemoveBtn');
    }
    TodosGroup_TodoItem_d.prototype.set = function (data) {
        data.content;
        this.j8fields.set(data);
    };
    return TodosGroup_TodoItem_d;
}());
$(document).ready(function () {
    new Main();
});
var Main = (function () {
    function Main() {
        var _this = this;
        this.appNode = $("#app");
        $.get("jul8config.json", function (config) {
            var templatePath = config.build[0].source;
            $.get(templatePath, function (data) {
                var virtualDOM = document.createDocumentFragment();
                $(virtualDOM).append(data);
                _this.jul8 = new Jul8.TemplateHolder();
                _this.jul8.addTemplateRoot($(virtualDOM));
                new TodoApp(_this.jul8, _this.appNode);
            });
        });
    }
    return Main;
}());
var TodoApp = (function () {
    function TodoApp(templateHolder, parentNode) {
        var _this = this;
        this.templateHolder = templateHolder;
        this.parentNode = parentNode;
        this.appTitle = new AppTitle_d(templateHolder, parentNode);
        this.todosGroup = new TodosGroup_d(templateHolder, parentNode);
        this.todosGroup.addBtn.click(function () { return _this.addTodoList(); });
        this.todosGroup.clearAll.click(function () { return _this.clearAll_TodoList(); });
    }
    TodoApp.prototype.addTodoList = function () {
        var _this = this;
        var todoStr = this.todosGroup.inputContent.val();
        if (todoStr.length <= 0)
            return;
        var list = this.todosGroup.listOf_TodoItem.add(TodosGroup_TodoItem_d);
        this.todosGroup.inputContent.val("");
        list.set({ content: todoStr });
        list.todoCheckBtn.click(function () {
            if (list.todoCheckState.prop("checked") == true) {
                list.todoCheckBtn.children().eq(1).show();
                list.todoCheckBtn.children().eq(2).hide();
                list.todoContent.removeClass("checkedTodo");
                list.todoCheckState.prop("checked", false);
            }
            else {
                list.todoCheckBtn.children().eq(1).hide();
                list.todoCheckBtn.children().eq(2).show();
                list.todoContent.addClass("checkedTodo");
                list.todoCheckState.prop("checked", true);
            }
        });
        list.todoRemoveBtn.click(function () {
            _this.todosGroup.listOf_TodoItem.remove(list);
        });
    };
    TodoApp.prototype.clearAll_TodoList = function () {
        this.todosGroup.todosList.html("");
    };
    return TodoApp;
}());
//# sourceMappingURL=all.js.map