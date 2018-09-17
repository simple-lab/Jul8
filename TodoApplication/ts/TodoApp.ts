// 반드시 j8-model마다 type aliases를 선언해줘야 합니다.
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

        // 여기에 뷰(View)를 추가합니다.
    }
}