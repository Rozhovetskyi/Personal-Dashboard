import { BaseWidget } from './base-widget.js';

export class HtmlWidget extends BaseWidget {
    constructor(id, title, config) {
        super(id, title, config);
    }

    render(container) {
        const { col, widgetBody } = this.createCardElement();

        const contentDiv = document.createElement('div');
        contentDiv.className = 'html-widget-content';
        // Sanitize? The requirement says "renders it", implying trust or simple iframe.
        // For simplicity and "no backend", innerHTML is the way, but dangerous.
        // Assuming the user is trusting their own config.
        contentDiv.innerHTML = this.config.content || '<p>No content</p>';

        widgetBody.appendChild(contentDiv);
        container.appendChild(col);
    }
}
