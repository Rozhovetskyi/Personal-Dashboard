(function() {
    class HtmlWidget extends App.BaseWidget {
        constructor(id, title, config) {
            super(id, title, config);
        }

        render(container) {
            const { col, widgetBody } = this.createCardElement();

            const contentDiv = document.createElement('div');
            contentDiv.className = 'html-widget-content';
            contentDiv.innerHTML = this.config.content || '<p>No content</p>';

            widgetBody.appendChild(contentDiv);
            container.appendChild(col);
        }
    }

    App.Widgets.HtmlWidget = HtmlWidget;
})();
