const STORAGE_KEY = 'dashboard_app_state';

export const Storage = {
    saveState: (state) => {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem(STORAGE_KEY, serializedState);
            console.log('State saved to localStorage');
        } catch (e) {
            console.error('Error saving state to localStorage:', e);
        }
    },

    loadState: () => {
        try {
            const serializedState = localStorage.getItem(STORAGE_KEY);
            if (serializedState === null) {
                return null;
            }
            return JSON.parse(serializedState);
        } catch (e) {
            console.error('Error loading state from localStorage:', e);
            return null;
        }
    },

    exportState: (state) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "dashboard_config.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    importState: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonObj = JSON.parse(event.target.result);
                    resolve(jsonObj);
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
};
