export class BaseWidget {
    constructor(id, title, config) {
        this.id = id;
        this.title = title || 'Untitled Widget';
        this.config = config || {};
    }

    render(container) {
        throw new Error("Method 'render' must be implemented.");
    }

    // Helper to create the standard card structure
    createCardElement() {
        const col = document.createElement('div');
        col.className = 'col s12 m6 l4'; // Responsive grid

        const card = document.createElement('div');
        card.className = 'card blue-grey darken-1 widget-card';

        const cardContent = document.createElement('div');
        cardContent.className = 'card-content white-text';

        const cardTitle = document.createElement('span');
        cardTitle.className = 'card-title';
        cardTitle.textContent = this.title;

        // Delete button
        const deleteBtn = document.createElement('i');
        deleteBtn.className = 'material-icons right cursor-pointer';
        deleteBtn.textContent = 'close';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.onclick = () => {
             // Dispatch a custom event for the dashboard manager to catch
             const event = new CustomEvent('widget-delete', { detail: { widgetId: this.id }, bubbles: true });
             col.dispatchEvent(event);
        };
        cardTitle.appendChild(deleteBtn);

        const widgetBody = document.createElement('div');
        widgetBody.className = 'widget-body';

        cardContent.appendChild(cardTitle);
        cardContent.appendChild(widgetBody);
        card.appendChild(cardContent);
        col.appendChild(card);

        return { col, widgetBody };
    }
}
