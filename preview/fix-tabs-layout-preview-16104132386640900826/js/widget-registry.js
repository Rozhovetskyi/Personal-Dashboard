(function() {
    App.WidgetRegistry = {
        createWidget: (type, id, title, config) => {
            let WidgetClass;
            if (type === 'html') {
                WidgetClass = App.Widgets.HtmlWidget;
            } else if (type === 'rss') {
                WidgetClass = App.Widgets.RssWidget;
            } else if (type === 'google-news') {
                WidgetClass = App.Widgets.GoogleNewsWidget;
            }

            if (!WidgetClass) {
                throw new Error(`Unknown widget type: ${type}`);
            }
            return new WidgetClass(id, title, config);
        },

        getAvailableTypes: () => {
            return ['html', 'rss', 'google-news'];
        }
    };
})();
