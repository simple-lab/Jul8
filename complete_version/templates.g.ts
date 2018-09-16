/// <reference path='lib/jul8.ts' />
/// <reference path='lib/jquery.d.ts' />

class ButtonGroup_d implements Jul8.View
{
    $: JQuery;
    left: JQuery;
    middle: JQuery;
    right: JQuery;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('ButtonGroup');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$, false);
        this.left = s.C('left');
        this.middle = s.C('middle');
        this.right = s.C('right');
    }
}

class AppTitle_d implements Jul8.View
{
    $: JQuery;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('AppTitle');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$, false);
    }
}

class TodosGroup_d implements Jul8.View
{
    $: JQuery;
    inputContent: JQuery;
    addBtn: JQuery;
    todosList: JQuery;
    clearAll: JQuery;
    listOf_TodoItem: Jul8.ViewList<TodosGroup_TodoItem_d>;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('TodosGroup');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$, false);
        this.inputContent = s.C('inputContent');
        this.addBtn = s.C('addBtn');
        this.todosList = s.C('todosList');
        this.clearAll = s.C('clearAll');
        this.listOf_TodoItem = s.L<TodosGroup_TodoItem_d>('TodoItem');
    }
}

class TodosGroup_TodoItem_d implements Jul8.View
{
    $: JQuery;
    todoCheckBtn: JQuery;
    todoCheckState: JQuery;
    todoContent: JQuery;
    todoRemoveBtn: JQuery;
    
    constructor($: JQuery)
    {
        this.$ = $;
        let s = new Jul8.Scanner(this.$, true);
        this.j8fields = s.fields;
        this.todoCheckBtn = s.C('todoCheckBtn');
        this.todoCheckState = s.C('todoCheckState');
        this.todoContent = s.C('todoContent');
        this.todoRemoveBtn = s.C('todoRemoveBtn');
    }
    
    private j8fields: Jul8.Fields;
    set(data: todoModel): void
    {
        data.content;
        this.j8fields.set(data);
    }
}
