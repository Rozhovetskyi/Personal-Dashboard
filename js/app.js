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

        // Add Widget Button
        const addWidgetBtn = document.createElement('button');
        addWidgetBtn.className = 'btn-outlined waves-effect';
        addWidgetBtn.innerHTML = '<i class="material-icons left">add</i>Add Widget';
        addWidgetBtn.setAttribute('aria-label', 'Add new widget');
        addWidgetBtn.onclick = () => {
            // Re-using the logic from the old FAB, but we need to trigger the modal opening
            const modalAddWidget = M.Modal.getInstance(document.getElementById('modal-add-widget'));

            // Reset form logic
            document.getElementById('widget-type-select').value = '';
            document.getElementById('widget-title').value = '';
            document.getElementById('html-content').value = '';
            document.getElementById('rss-url').value = '';
            document.querySelectorAll('.widget-config').forEach(el => el.style.display = 'none');
            M.FormSelect.init(document.querySelectorAll('select')); // Re-init select

            modalAddWidget.open();
        };

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

        // Add Widget - Logic moved to inline click handler in renderWidgets because button is dynamic now.
        // However, we still need the modal instance available, which is handled via ID lookup.

        // Widget Type Change
        document.getElementById('widget-type-select').addEventListener('change', (e) => {
            document.querySelectorAll('.widget-config').forEach(el => el.style.display = 'none');
            const type = e.target.value;
            if (type === 'html') {
                document.getElementById('config-html').style.display = 'block';
            } else if (type === 'rss') {
                document.getElementById('config-rss').style.display = 'block';
            } else if (type === 'google-news') {
                document.getElementById('config-google-news').style.display = 'block';
            }
        });

        document.getElementById('confirm-add-widget').addEventListener('click', () => {
            const type = document.getElementById('widget-type-select').value;
            const title = document.getElementById('widget-title').value.trim();
            let config = {};

            if (!type) return;

            if (type === 'html') {
                config.content = document.getElementById('html-content').value;
            } else if (type === 'rss') {
                config.url = document.getElementById('rss-url').value.trim();
            } else if (type === 'google-news') {
                config.query = document.getElementById('google-news-query').value.trim();
            }

            App.DashboardManager.addWidgetToCurrent(type, title, config);
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
