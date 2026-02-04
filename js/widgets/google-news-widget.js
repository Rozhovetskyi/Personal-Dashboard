(function() {
    // Ensure RssWidget is available
    if (!App.Widgets.RssWidget) {
        console.error('RssWidget not found. GoogleNewsWidget cannot be initialized.');
        return;
    }

    class GoogleNewsWidget extends App.Widgets.RssWidget {
        constructor(id, title, config) {
            super(id, title, config);
        }

        async render(container) {
            // Construct Google News RSS URL from query if not already set (or override it)
            // The logic here is that we use the query to set the URL,
            // then let the parent RssWidget handle the fetching/rendering.
            if (this.config.query) {
                // Using hl=en-US&gl=US&ceid=US:en for standard English results,
                // but for simplicity just 'q' parameter works well globally usually.
                this.config.url = `https://news.google.com/rss/search?q=${encodeURIComponent(this.config.query)}`;
            } else {
                // Fallback or error handled by parent if URL is missing
            }

            await super.render(container);
        }
    }

    App.Widgets.GoogleNewsWidget = GoogleNewsWidget;
})();
