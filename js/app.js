import { dashboardManager } from './dashboard-manager.js';
import { WidgetRegistry } from './widget-registry.js';
import { Storage } from './storage.js';

function initApp() {
    // Initialize Dashboard Manager
    dashboardManager.init();

    // Initial Render
    renderUI();

    // Initialize Materialize components that are static
    M.Modal.init(document.querySelectorAll('.modal'), {});
    M.FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {});
    M.FormSelect.init(document.querySelectorAll('select'), {});

    // Event Listeners
    setupEventListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function renderUI() {
    renderTabs();
    renderWidgets();
}

function renderTabs() {
    const tabsContainer = document.getElementById('dashboard-tabs');
    tabsContainer.innerHTML = '';

    const dashboards = dashboardManager.getDashboards();
    const activeDashboard = dashboardManager.getActiveDashboard();

    dashboards.forEach(dashboard => {
        const li = document.createElement('li');
        li.className = 'tab col s3';

        const a = document.createElement('a');
        a.href = `#${dashboard.id}`;
        a.textContent = dashboard.name;
        a.onclick = (e) => {
            e.preventDefault();
            dashboardManager.setActiveDashboard(dashboard.id);
            renderWidgets(); // Re-render widgets for the new dashboard
        };

        if (activeDashboard && dashboard.id === activeDashboard.id) {
            a.className = 'active';
        }

        // Add a small delete icon if it's not the only dashboard?
        // Or maybe a context menu? For simplicity, let's keep it simple for now.
        // Adding a delete button in the tab might break the materialize tabs behavior or looks.
        // Let's add a "Delete Dashboard" button somewhere else or just let it be for now.
        // Actually, user requirement: "Each dashboard is a separate tab can be added".
        // Deletion is usually expected. I'll add a way to delete current dashboard maybe.

        li.appendChild(a);
        tabsContainer.appendChild(li);
    });

    // Re-init tabs to make the indicator work
    const tabsInstance = M.Tabs.init(tabsContainer, {});
}

function renderWidgets() {
    const contentContainer = document.getElementById('dashboard-content');
    contentContainer.innerHTML = '';

    const activeDashboard = dashboardManager.getActiveDashboard();
    if (!activeDashboard) {
        contentContainer.innerHTML = '<p class="center-align grey-text">No dashboard selected. Create one!</p>';
        return;
    }

    // Add a header for the dashboard with a delete button
    const headerRow = document.createElement('div');
    headerRow.className = 'col s12 valign-wrapper';
    headerRow.style.marginBottom = '20px';

    const title = document.createElement('h5');
    title.textContent = activeDashboard.name;
    title.className = 'left';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-flat red-text right waves-effect';
    deleteBtn.textContent = 'Delete Dashboard';
    deleteBtn.onclick = () => {
        if (confirm(`Are you sure you want to delete "${activeDashboard.name}"?`)) {
            dashboardManager.removeDashboard(activeDashboard.id);
            renderUI();
        }
    };

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.flexGrow = 1;

    headerRow.appendChild(title);
    headerRow.appendChild(spacer);
    headerRow.appendChild(deleteBtn);
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
            const widget = WidgetRegistry.createWidget(
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
            dashboardManager.addDashboard(name);
            renderUI();
        }
    });

    // Add Widget
    const modalAddWidget = M.Modal.getInstance(document.getElementById('modal-add-widget'));
    document.getElementById('btn-add-widget').addEventListener('click', () => {
        const activeDashboard = dashboardManager.getActiveDashboard();
        if (!activeDashboard) {
            M.toast({html: 'Please create or select a dashboard first.'});
            return;
        }
        // Reset form
        document.getElementById('widget-type-select').value = '';
        document.getElementById('widget-title').value = '';
        document.getElementById('html-content').value = '';
        document.getElementById('rss-url').value = '';
        document.querySelectorAll('.widget-config').forEach(el => el.style.display = 'none');
        M.FormSelect.init(document.querySelectorAll('select')); // Re-init select

        modalAddWidget.open();
    });

    // Widget Type Change
    document.getElementById('widget-type-select').addEventListener('change', (e) => {
        document.querySelectorAll('.widget-config').forEach(el => el.style.display = 'none');
        const type = e.target.value;
        if (type === 'html') {
            document.getElementById('config-html').style.display = 'block';
        } else if (type === 'rss') {
            document.getElementById('config-rss').style.display = 'block';
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
        }

        dashboardManager.addWidgetToCurrent(type, title, config);
        renderWidgets();
    });

    // Import / Export
    document.getElementById('btn-export').addEventListener('click', (e) => {
        e.preventDefault();
        dashboardManager.exportState();
    });

    document.getElementById('btn-import').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('file-import').click();
    });

    document.getElementById('file-import').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Storage.importState(file)
            .then(newState => {
                if (dashboardManager.importState(newState)) {
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
        const activeDashboard = dashboardManager.getActiveDashboard();
        if (activeDashboard && confirm('Delete this widget?')) {
            dashboardManager.removeWidget(activeDashboard.id, widgetId);
            renderWidgets();
        }
    });
}
