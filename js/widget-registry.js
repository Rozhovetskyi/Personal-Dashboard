import { HtmlWidget } from './widgets/html-widget.js';
import { RssWidget } from './widgets/rss-widget.js';

const registry = {
    'html': HtmlWidget,
    'rss': RssWidget
};

export const WidgetRegistry = {
    createWidget: (type, id, title, config) => {
        const WidgetClass = registry[type];
        if (!WidgetClass) {
            throw new Error(`Unknown widget type: ${type}`);
        }
        return new WidgetClass(id, title, config);
    },

    getAvailableTypes: () => {
        return Object.keys(registry);
    }
};
