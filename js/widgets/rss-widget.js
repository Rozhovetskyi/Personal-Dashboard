(function() {
    class RssWidget extends App.BaseWidget {
        constructor(id, title, config) {
            super(id, title, config);
        }

        async render(container) {
            const { col, widgetBody } = this.createCardElement();
            container.appendChild(col); // Append first to show loading state

            const contentDiv = document.createElement('div');
            contentDiv.className = 'rss-widget-content';
            contentDiv.innerHTML = '<div class="progress"><div class="indeterminate"></div></div>';
            widgetBody.appendChild(contentDiv);

            const rssUrl = this.config.url;
            if (!rssUrl) {
                contentDiv.innerHTML = '<p class="red-text">No RSS URL provided.</p>';
                return;
            }

            try {
                // Using rss2json to handle CORS and XML parsing
                const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.status === 'ok') {
                    contentDiv.innerHTML = ''; // Clear loading
                    const list = document.createElement('div');

                    let items = data.items;
                    if (this.config.maxItems && !isNaN(this.config.maxItems)) {
                        items = items.slice(0, parseInt(this.config.maxItems));
                    }

                    items.forEach(item => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'rss-item';

                        const itemLink = document.createElement('a');
                        itemLink.className = 'rss-item-link';
                        itemLink.href = item.link;
                        itemLink.target = '_blank';
                        itemLink.textContent = item.title;

                        itemDiv.appendChild(itemLink);

                        // Handle showDescription - Default to true for backward compatibility
                        if (this.config.showDescription !== false) {
                            const itemDesc = document.createElement('p');
                            itemDesc.className = 'rss-item-description';
                            // descriptions often contain HTML
                            // truncate description
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = item.description;
                            itemDesc.textContent = tempDiv.textContent.substring(0, 100) + '...';
                            itemDiv.appendChild(itemDesc);
                        }

                        list.appendChild(itemDiv);
                    });
                    contentDiv.appendChild(list);
                } else {
                    throw new Error('Failed to load RSS feed');
                }

            } catch (error) {
                console.error('RSS Widget Error:', error);
                contentDiv.innerHTML = `<p class="red-text">Error loading feed: ${error.message}</p>`;
            }
        }
    }

    App.Widgets.RssWidget = RssWidget;
})();
