# Thematical Dashboard

A lightweight, client-side dashboard application built with vanilla JavaScript and Materialize CSS.

## Features

- **Multiple Dashboards**: Create and manage multiple thematic dashboards in tabs.
- **Widgets**:
  - **HTML Widget**: Render custom HTML content.
  - **RSS Widget**: Fetch and display RSS feeds (powered by rss2json).
- **Persistence**: automatically saves your setup to browser's LocalStorage.
- **Import/Export**: Export your configuration to JSON and import it back.
- **Responsive Design**: Works on desktop and mobile.

## Usage

1. **New Dashboard**: Click "New Dashboard" in the navigation bar.
2. **Add Widget**: Click the floating red "+" button to add a widget to the current dashboard.
3. **Export**: Click "Export" to download your configuration.
4. **Import**: Click "Import" to load a configuration file.

## Tech Stack

- **HTML5**
- **CSS3** (Materialize CSS)
- **JavaScript** (ES Modules)
- **No Backend**: Runs entirely in the browser.

## Running Locally

Since this project uses ES Modules, you need to serve it over HTTP (not `file://`).

```bash
python3 -m http.server
```

Then open `http://localhost:8000` in your browser.
