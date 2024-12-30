class SDK {
    constructor() {
        this.name = "SDK";
        this.id = null;

        $('<div/>', {
            text: 'Div text',
            class: 'className'
        }).appendTo('#parentDiv');
    }
}