type todoModel = {
    content: string;
}

class TodoApp {

    private templateHolder: Jul8.TemplateHolder;
    private parentNode: JQuery;

    private appTitle: AppTitle_d;
    private todosGroup: TodosGroup_d;

    constructor(templateHolder: Jul8.TemplateHolder, parentNode: JQuery) {
        this.templateHolder = templateHolder;
        this.parentNode = parentNode;
        
        // 앱 타이틀을 추가합니다.
        this.appTitle = new AppTitle_d(templateHolder, parentNode);

        // TodosGroup을 추가합니다.
        this.todosGroup = new TodosGroup_d(templateHolder, parentNode);

        // TodosGroup의 [+]버튼에 클릭 이벤트를 바인딩합니다.
        this.todosGroup.addBtn.click(() => this.addTodoList());

        // clearAll 버튼에 클릭 이벤트를 바인딩 합니다.
        this.todosGroup.clearAll.click(() => this.clearAll_TodoList());
    }

    // TODO 리스트를 추가합니다.
    addTodoList(): void {

        let todoStr: string = this.todosGroup.inputContent.val();

        if (todoStr.length <= 0) return;

        let list = this.todosGroup.listOf_TodoItem.add(TodosGroup_TodoItem_d);

        this.todosGroup.inputContent.val("");
        list.set({ content: todoStr });

        // TODO 리스트의 체크박스를 클릭해 상태를 변경합니다.
        list.todoCheckBtn.click(() => {
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

        // 현재 TODO 리스트를 제거합니다.
        list.todoRemoveBtn.click(() => {
            this.todosGroup.listOf_TodoItem.remove(list); // 혹은 list.$.remove();
        });
    }

    // 모든 TODO 리스트를 제거합니다.
    clearAll_TodoList(): void {
        this.todosGroup.todosList.html("");
    }
}