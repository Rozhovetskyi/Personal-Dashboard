// Main App Logic
(function() {
    let grid = null;

    function initApp() {
        // Initialize Dashboard Manager
        App.DashboardManager.init();

        // Initial Render
        renderUI();

        // Initialize Materialize components that are static
        M.Modal.init(document.querySelectorAll('.modal'), {});
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
        const dashboards = App.DashboardManager.getDashboards();
        const activeDashboard = App.DashboardManager.getActiveDashboard();

        // Only rebuild tabs if the number of tabs or their names/ids don't match the DOM
        // Simpler: Just rebuild if the count differs or strict check.
        // For now, let's just clear and rebuild ONLY if the count/IDs mismatch,
        // OR simply update the active class if they exist.

        // However, simplest fix for the visual glitch is to just rebuild them
        // BUT handle the click without re-rendering the tabs themselves if possible.
        // Let's go with: Rebuild only if we add/remove dashboards.

        // Check if we need to rebuild
        const currentTabCount = tabsContainer.querySelectorAll('li.tab').length;
        if (currentTabCount === dashboards.length) {
            // Just update active state
            updateTabActiveState();
            return;
        }

        tabsContainer.innerHTML = '';

        dashboards.forEach(dashboard => {
            const li = document.createElement('li');
            li.className = 'tab col s3';

            const a = document.createElement('a');
            a.href = `#${dashboard.id}`;
            a.textContent = dashboard.name;
            a.setAttribute('data-dashboard-id', dashboard.id);

            a.onclick = (e) => {
                e.preventDefault();
                const id = dashboard.id;
                App.DashboardManager.setActiveDashboard(id);

                // Manually update active state instead of re-rendering tabs
                updateTabActiveState();
                renderWidgets();
            };

            li.appendChild(a);
            tabsContainer.appendChild(li);
        });

        // M.Tabs.init causes issues with our manual content rendering
        // We will handle active state manually.
        updateTabActiveState();
    }

    function updateTabActiveState() {
        const activeDashboard = App.DashboardManager.getActiveDashboard();
        if (!activeDashboard) return;

        const tabsContainer = document.getElementById('dashboard-tabs');
        const links = tabsContainer.querySelectorAll('a');

        links.forEach(a => {
            if (a.getAttribute('data-dashboard-id') === activeDashboard.id) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
    }

    function renderWidgets() {
        const contentContainer = document.getElementById('dashboard-content');

        // Destroy existing grid if any
        if (grid) {
            grid.destroy(true); // true removes elements from DOM, but we clear innerHTML anyway
            grid = null;
        }
        contentContainer.innerHTML = '';

        const activeDashboard = App.DashboardManager.getActiveDashboard();
        if (!activeDashboard) {
            contentContainer.innerHTML = '<p class="center-align grey-text" style="margin-top: 50px;">No dashboard selected. Create one!</p>';
            return;
        }

        // 1. Controls Area (Add Widget)
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'dashboard-controls';

        const addBtn = document.createElement('a');
        addBtn.className = 'waves-effect waves-light btn-add-widget';
        addBtn.innerHTML = '<i class="material-icons">add</i> Add Widget';
        addBtn.onclick = (e) => {
            e.preventDefault();
            openAddWidgetModal();
        };
        controlsDiv.appendChild(addBtn);
        contentContainer.appendChild(controlsDiv);

        // 2. Grid Container
        const gridElement = document.createElement('div');
        gridElement.className = 'grid';
        contentContainer.appendChild(gridElement);

        // 3. Render Widgets
        if (activeDashboard.widgets.length > 0) {
            activeDashboard.widgets.forEach(widgetData => {
                try {
                    const item = document.createElement('div');
                    item.className = 'item';
                    item.setAttribute('data-id', widgetData.id);

                    const itemContent = document.createElement('div');
                    itemContent.className = 'item-content';
                    item.appendChild(itemContent);

                    // Create widget instance
                    const widget = App.WidgetRegistry.createWidget(
                        widgetData.type,
                        widgetData.id,
                        widgetData.title,
                        widgetData.config
                    );

                    // Render into itemContent
                    widget.render(itemContent);

                    // Cleanup any unwanted wrappers from base-widget if necessary
                    // (We modified base-widget to remove .col classes, so this should be clean)

                    gridElement.appendChild(item);
                } catch (e) {
                    console.error('Failed to render widget:', e);
                }
            });
        }

        // 4. Initialize Muuri
        grid = new Muuri(gridElement, {
            dragEnabled: true,
            layout: {
                fillGaps: false
            },
            dragStartPredicate: (item, e) => {
                // Prevent drag if clicking on the delete button
                if (e.target.closest('.cursor-pointer')) {
                    return false;
                }
                // Start drag if clicking on card title
                if (e.target.matches('.card-title') || e.target.closest('.card-title')) {
                    return true;
                }
                return false;
            }
        });

        // Handle Drag Reorder
        grid.on('dragEnd', function () {
            const order = grid.getItems().map(item => item.getElement().getAttribute('data-id'));
            App.DashboardManager.reorderWidgets(activeDashboard.id, order);
        });

        // Refresh layout on image load
        const images = gridElement.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => grid.refreshItems().layout());
        });

        // 5. Footer (Delete Dashboard)
        const footerDiv = document.createElement('div');
        footerDiv.className = 'dashboard-footer';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-dashboard waves-effect';
        deleteBtn.innerHTML = 'Delete Dashboard';
        deleteBtn.onclick = () => {
             if (confirm(`Are you sure you want to delete "${activeDashboard.name}"?`)) {
                App.DashboardManager.removeDashboard(activeDashboard.id);
                renderUI();
            }
        };
        footerDiv.appendChild(deleteBtn);
        contentContainer.appendChild(footerDiv);
    }

    function openAddWidgetModal() {
        const modalAddWidget = M.Modal.getInstance(document.getElementById('modal-add-widget'));
        const activeDashboard = App.DashboardManager.getActiveDashboard();

        if (!activeDashboard) {
            M.toast({html: 'Please create or select a dashboard first.'});
            return;
        }

        // Reset form
        document.getElementById('widget-type-select').value = '';
        document.getElementById('widget-title').value = '';
        document.getElementById('html-content').value = '';
        document.getElementById('rss-url').value = '';
        document.getElementById('google-news-query').value = '';
        document.querySelectorAll('.widget-config').forEach(el => el.style.display = 'none');
        M.FormSelect.init(document.querySelectorAll('select'));

        modalAddWidget.open();
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

        // Add Widget Button Logic is now handled in renderWidgets -> openAddWidgetModal
        // But we keep the modal confirm logic here.

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
                // Instead of full re-render, we could use grid.remove(), but re-render is safer for sync
                renderWidgets();
            }
        });

        // Window Resize Handler for Muuri
        window.addEventListener('resize', () => {
            if (grid) {
                grid.refreshItems().layout();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
