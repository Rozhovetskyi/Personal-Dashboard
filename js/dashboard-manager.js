(function() {
    const DEFAULT_STATE = {
        dashboards: [],
        activeDashboardId: null
    };

    class DashboardManager {
        constructor() {
            this.state = DEFAULT_STATE;
        }

        init() {
            const loadedState = App.Storage.loadState();
            if (loadedState && loadedState.dashboards && loadedState.dashboards.length > 0) {
                this.state = loadedState;
            } else {
                // Create a default dashboard if none exists
                this.addDashboard('Main Dashboard');
            }
        }

        save() {
            App.Storage.saveState(this.state);
        }

        getDashboards() {
            return this.state.dashboards;
        }

        getActiveDashboard() {
            if (!this.state.activeDashboardId) return null;
            return this.state.dashboards.find(d => d.id === this.state.activeDashboardId);
        }

        setActiveDashboard(id) {
            if (this.state.dashboards.find(d => d.id === id)) {
                this.state.activeDashboardId = id;
                this.save();
            }
        }

        addDashboard(name) {
            const newDashboard = {
                id: App.Utils.generateUUID(),
                name: name,
                widgets: []
            };
            this.state.dashboards.push(newDashboard);
            this.state.activeDashboardId = newDashboard.id; // Switch to new dashboard
            this.save();
            return newDashboard;
        }

        removeDashboard(id) {
            this.state.dashboards = this.state.dashboards.filter(d => d.id !== id);
            if (this.state.activeDashboardId === id) {
                // If we deleted the active one, switch to the first one available or null
                this.state.activeDashboardId = this.state.dashboards.length > 0 ? this.state.dashboards[0].id : null;
            }
            this.save();
        }

        addWidgetToCurrent(type, title, config) {
            const activeDashboard = this.getActiveDashboard();
            if (activeDashboard) {
                const newWidget = {
                    id: App.Utils.generateUUID(),
                    type: type,
                    title: title,
                    config: config
                };
                activeDashboard.widgets.push(newWidget);
                this.save();
                return newWidget;
            }
            return null;
        }

        removeWidget(dashboardId, widgetId) {
            const dashboard = this.state.dashboards.find(d => d.id === dashboardId);
            if (dashboard) {
                dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId);
                this.save();
            }
        }

        importState(newState) {
            // Basic validation could go here
            if (newState && Array.isArray(newState.dashboards)) {
                this.state = newState;
                // Ensure activeDashboardId is valid
                if (!this.state.dashboards.find(d => d.id === this.state.activeDashboardId)) {
                     this.state.activeDashboardId = this.state.dashboards.length > 0 ? this.state.dashboards[0].id : null;
                }
                this.save();
                return true;
            }
            return false;
        }

        exportState() {
            App.Storage.exportState(this.state);
        }
    }

    App.DashboardManager = new DashboardManager();
})();
