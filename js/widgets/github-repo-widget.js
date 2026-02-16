(function() {
    class GithubRepoWidget extends App.Widgets.RssWidget {
        constructor(id, title, config) {
            super(id, title, config);
        }

        async render(container) {
            const repoUrl = this.config.repoUrl;
            const updateType = this.config.updateType; // 'releases', 'commits', 'tags'

            if (!repoUrl) {
                const { col, widgetBody } = this.createCardElement();
                container.appendChild(col);
                widgetBody.innerHTML = '<div class="rss-widget-content"><p class="red-text">No Repository URL provided.</p></div>';
                return;
            }

            // Parse repo URL
            // Expected format: https://github.com/{user}/{repo} or just {user}/{repo}
            let user, repo;
            try {
                // Remove trailing slash
                const cleanUrl = repoUrl.replace(/\/$/, '');
                if (cleanUrl.startsWith('http')) {
                    const urlObj = new URL(cleanUrl);
                    const parts = urlObj.pathname.split('/').filter(p => p);
                    if (parts.length >= 2) {
                        user = parts[0];
                        repo = parts[1];
                    }
                } else {
                    const parts = cleanUrl.split('/').filter(p => p);
                    if (parts.length >= 2) {
                        user = parts[0];
                        repo = parts[1];
                    }
                }
            } catch (e) {
                console.error('Error parsing GitHub URL', e);
            }

            if (!user || !repo) {
                 const { col, widgetBody } = this.createCardElement();
                 container.appendChild(col);
                 widgetBody.innerHTML = '<div class="rss-widget-content"><p class="red-text">Invalid Repository URL.</p></div>';
                 return;
            }

            // Construct Atom URL
            let atomUrl = '';
            if (updateType === 'releases') {
                atomUrl = `https://github.com/${user}/${repo}/releases.atom`;
            } else if (updateType === 'commits') {
                atomUrl = `https://github.com/${user}/${repo}/commits.atom`;
            } else if (updateType === 'tags') {
                atomUrl = `https://github.com/${user}/${repo}/tags.atom`;
            } else {
                // Default to releases if not specified
                atomUrl = `https://github.com/${user}/${repo}/releases.atom`;
            }

            this.config.url = atomUrl;
            await super.render(container);
        }
    }

    App.Widgets.GithubRepoWidget = GithubRepoWidget;
})();
