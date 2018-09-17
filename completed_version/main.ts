/// <reference path='templates.g.ts' />
$(document).ready(() => {
    new Main();
});

class Main {

    public jul8: Jul8.TemplateHolder;
    public appNode: JQuery = $("#app");

    constructor() {

        // jul8config.json을 읽어 존재하는 템플릿을 확인합니다.
        $.get("/jul8config.json", (config: any) => {

            // Jul8-Quick-Start에서는 하나의 템플릿만 사용하여 흐름을 파악합니다.
            let templatePath: string = config.build[0].source;

            $.get(templatePath, (data) => {

                let virtualDOM: DocumentFragment = document.createDocumentFragment();
                $(virtualDOM).append(data);

                this.jul8 = new Jul8.TemplateHolder();
                this.jul8.addTemplateRoot($(virtualDOM));

                new TodoApp(this.jul8, this.appNode);
            });
        });
    }
}