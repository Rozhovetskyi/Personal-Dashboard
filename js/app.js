// Main App Logic
(function() {
    function initApp() {
        // Initialize Dashboard Manager
        App.DashboardManager.init();

        // Initial Render
        renderUI();

        // Initialize Materialize components that are static
        M.Modal.init(document.querySelectorAll('.modal'), {});
        // M.FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {}); // Removed
        M.FormSelect.init(document.querySelectorAll('select'), {});

        // Event Listeners
        setupEventListeners();
    }

    function renderUI() {
        renderTabs();
        renderWidgets();
    }

    function renderTabs() {
        const tabsContainer = document.getElementById('dashboard-tabs');
        tabsContainer.innerHTML = '';

        const dashboards = App.DashboardManager.getDashboards();
        const activeDashboard = App.DashboardManager.getActiveDashboard();

        dashboards.forEach(dashboard => {
            const li = document.createElement('li');
            li.className = 'tab col s3';

            const a = document.createElement('a');
            a.href = `#${dashboard.id}`;
            a.textContent = dashboard.name;
            a.onclick = (e) => {
                e.preventDefault();
                App.DashboardManager.setActiveDashboard(dashboard.id);
                renderWidgets(); // Re-render widgets for the new dashboard
            };

            if (activeDashboard && dashboard.id === activeDashboard.id) {
                a.className = 'active';
            }

            li.appendChild(a);
            tabsContainer.appendChild(li);
        });

        // Re-init tabs to make the indicator work
        const tabsInstance = M.Tabs.init(tabsContainer, {});
    }

    function renderWidgets() {
        const contentContainer = document.getElementById('dashboard-content');
        contentContainer.innerHTML = '';

        const activeDashboard = App.DashboardManager.getActiveDashboard();
        if (!activeDashboard) {
            contentContainer.innerHTML = '<p class="center-align grey-text">No dashboard selected. Create one!</p>';
            return;
        }

        // Add a header for the dashboard with buttons
        const headerRow = document.createElement('div');
        headerRow.className = 'col s12 valign-wrapper';
        headerRow.style.marginBottom = '20px';
        headerRow.style.justifyContent = 'space-between';

        const title = document.createElement('h5');
        title.textContent = activeDashboard.name;
        title.className = 'left';
        title.style.margin = '0';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'right';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '10px';

        // Add Widget Dropdown Trigger
        const addWidgetBtn = document.createElement('button');
        addWidgetBtn.className = 'btn-outlined waves-effect dropdown-trigger';
        addWidgetBtn.innerHTML = '<i class="material-icons left">add</i>Add Widget';
        addWidgetBtn.setAttribute('aria-label', 'Add new widget');
        addWidgetBtn.setAttribute('data-target', 'add-widget-dropdown');

        // Add Widget Dropdown Structure
        let dropdown = document.getElementById('add-widget-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('ul');
            dropdown.id = 'add-widget-dropdown';
            dropdown.className = 'dropdown-content';

            const types = [
                { type: 'html', label: 'HTML Widget', icon: 'code' },
                { type: 'rss', label: 'RSS Feed', icon: 'rss_feed' },
                { type: 'google-news', label: 'Google News', icon: 'public' }
            ];

            types.forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#!';
                a.className = 'valign-wrapper';
                a.innerHTML = `<i class="material-icons">${item.icon}</i>${item.label}`;
                a.onclick = (e) => {
                    e.preventDefault();
                    openAddWidgetModal(item.type);
                };
                li.appendChild(a);
                dropdown.appendChild(li);
            });
            document.body.appendChild(dropdown);
        }

        // Delete Dashboard Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-outlined danger waves-effect';
        deleteBtn.innerHTML = '<i class="material-icons left">delete</i>Delete Dashboard';
        deleteBtn.setAttribute('aria-label', 'Delete current dashboard');
        deleteBtn.onclick = () => {
            if (confirm(`Are you sure you want to delete "${activeDashboard.name}"?`)) {
                App.DashboardManager.removeDashboard(activeDashboard.id);
                renderUI();
            }
        };

        buttonsContainer.appendChild(addWidgetBtn);
        buttonsContainer.appendChild(deleteBtn);

        headerRow.appendChild(title);
        headerRow.appendChild(buttonsContainer);
        contentContainer.appendChild(headerRow);

        // Initialize Dropdown after adding to DOM
        M.Dropdown.init(addWidgetBtn, {
            constrainWidth: false,
            coverTrigger: false
        });

        if (activeDashboard.widgets.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'col s12 center-align grey-text';
            emptyMsg.innerHTML = '<p>No widgets yet. Click + to add one.</p>';
            contentContainer.appendChild(emptyMsg);
            return;
        }

        activeDashboard.widgets.forEach(widgetData => {
            try {
                const widget = App.WidgetRegistry.createWidget(
                    widgetData.type,
                    widgetData.id,
                    widgetData.title,
                    widgetData.config
                );
                widget.render(contentContainer);
            } catch (e) {
                console.error('Failed to render widget:', e);
            }
        });
    }

    function setupEventListeners() {
        // New Dashboard
        const modalAddDashboard = M.Modal.getInstance(document.getElementById('modal-add-dashboard'));
        document.getElementById('btn-add-dashboard').addEventListener('click', () => {
            document.getElementById('new-dashboard-name').value = '';
            modalAddDashboard.open();
        });

        document.getElementById('confirm-add-dashboard').addEventListener('click', () => {
            const name = document.getElementById('new-dashboard-name').value.trim();
            if (name) {
                App.DashboardManager.addDashboard(name);
                renderUI();
            }
        });

        // Add/Edit Widget Confirmation
        document.getElementById('confirm-add-widget').addEventListener('click', (e) => {
            const modal = document.getElementById('modal-add-widget');
            const type = modal.getAttribute('data-selected-type');
            const widgetId = modal.getAttribute('data-widget-id');
            if (!type) return;

            const title = document.getElementById('widget-title').value.trim();
            let config = {};

            if (type === 'html') {
                config.content = document.getElementById('html-content').value;
            } else if (type === 'rss') {
                config.url = document.getElementById('rss-url').value.trim();
                config.maxItems = document.getElementById('rss-max-items').value;
                config.filterDays = document.getElementById('rss-filter-days').value;
                config.showDescription = document.getElementById('rss-show-desc').checked;
            } else if (type === 'google-news') {
                config.query = document.getElementById('google-news-query').value.trim();
                config.maxItems = document.getElementById('google-news-max-items').value;
                config.filterDays = document.getElementById('google-news-filter-days').value;
                config.showDescription = document.getElementById('google-news-show-desc').checked;
            }

            if (widgetId) {
                const activeDashboard = App.DashboardManager.getActiveDashboard();
                if (activeDashboard) {
                    App.DashboardManager.updateWidget(activeDashboard.id, widgetId, title, config);
                }
                modal.removeAttribute('data-widget-id');
                document.getElementById('confirm-add-widget').textContent = 'Add';
            } else {
                App.DashboardManager.addWidgetToCurrent(type, title, config);
            }
            renderWidgets();
        });

        // Import / Export
        document.getElementById('btn-export').addEventListener('click', (e) => {
            e.preventDefault();
            App.DashboardManager.exportState();
        });

        document.getElementById('btn-import').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('file-import').click();
        });

        document.getElementById('file-import').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            App.Storage.importState(file)
                .then(newState => {
                    if (App.DashboardManager.importState(newState)) {
                        M.toast({html: 'Import successful!'});
                        renderUI();
                    } else {
                        M.toast({html: 'Invalid import file.'});
                    }
                })
                .catch(err => {
                    console.error(err);
                    M.toast({html: 'Error importing file.'});
                });

            // Reset input
            e.target.value = '';
        });

        // Widget Delete (Event Delegation)
        document.getElementById('dashboard-content').addEventListener('widget-delete', (e) => {
            const widgetId = e.detail.widgetId;
            const activeDashboard = App.DashboardManager.getActiveDashboard();
            if (activeDashboard && confirm('Delete this widget?')) {
                App.DashboardManager.removeWidget(activeDashboard.id, widgetId);
                renderWidgets();
            }
        });

        // Widget Edit (Event Delegation)
        document.getElementById('dashboard-content').addEventListener('widget-edit', (e) => {
            const widgetId = e.detail.widgetId;
            const activeDashboard = App.DashboardManager.getActiveDashboard();
            if (!activeDashboard) return;

            const widget = activeDashboard.widgets.find(w => w.id === widgetId);
            if (!widget) return;

            openAddWidgetModal(widget.type);

            const modalEl = document.getElementById('modal-add-widget');
            modalEl.setAttribute('data-widget-id', widgetId);

            // Update title to indicate editing
            const typeLabel = widget.type === 'html' ? 'HTML Widget' : (widget.type === 'rss' ? 'RSS Feed' : 'Google News');
            modalEl.querySelector('h4').textContent = `Edit ${typeLabel}`;
            document.getElementById('confirm-add-widget').textContent = 'Save';

            // Populate fields
            document.getElementById('widget-title').value = widget.title || '';
            M.updateTextFields(); // Materialize helper to update labels

            if (widget.type === 'html') {
                document.getElementById('html-content').value = widget.config.content || '';
                M.textareaAutoResize(document.getElementById('html-content'));
            } else if (widget.type === 'rss') {
                document.getElementById('rss-url').value = widget.config.url || '';
                document.getElementById('rss-max-items').value = widget.config.maxItems || '';
                document.getElementById('rss-filter-days').value = widget.config.filterDays || '';
                document.getElementById('rss-show-desc').checked = widget.config.showDescription !== false;
            } else if (widget.type === 'google-news') {
                document.getElementById('google-news-query').value = widget.config.query || '';
                document.getElementById('google-news-max-items').value = widget.config.maxItems || '';
                document.getElementById('google-news-filter-days').value = widget.config.filterDays || '';
                document.getElementById('google-news-show-desc').checked = widget.config.showDescription !== false;
            }
        });
    }

    function openAddWidgetModal(type) {
        const modalAddWidget = M.Modal.getInstance(document.getElementById('modal-add-widget'));
        const modalEl = document.getElementById('modal-add-widget');

        // Store selected type
        modalEl.setAttribute('data-selected-type', type);

        // Ensure we clear any previous edit state
        modalEl.removeAttribute('data-widget-id');
        document.getElementById('confirm-add-widget').textContent = 'Add';

        // Reset inputs
        document.getElementById('widget-title').value = '';
        document.getElementById('html-content').value = '';
        document.getElementById('rss-url').value = '';
        document.getElementById('google-news-query').value = '';
        document.getElementById('rss-max-items').value = '';
        document.getElementById('rss-filter-days').value = '';
        document.getElementById('rss-show-desc').checked = true;
        document.getElementById('google-news-max-items').value = '';
        document.getElementById('google-news-filter-days').value = '';
        document.getElementById('google-news-show-desc').checked = true;

        // Show relevant config
        document.querySelectorAll('.widget-config').forEach(el => el.style.display = 'none');
        if (type === 'html') {
            document.getElementById('config-html').style.display = 'block';
        } else if (type === 'rss') {
            document.getElementById('config-rss').style.display = 'block';
        } else if (type === 'google-news') {
            document.getElementById('config-google-news').style.display = 'block';
        }

        // Update modal title
        const typeLabel = type === 'html' ? 'HTML Widget' : (type === 'rss' ? 'RSS Feed' : 'Google News');
        modalEl.querySelector('h4').textContent = `Add ${typeLabel}`;

        modalAddWidget.open();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
