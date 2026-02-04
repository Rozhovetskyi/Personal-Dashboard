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

## Tech Stack

- **HTML5**
- **CSS3** (Materialize CSS)
- **JavaScript** (No build step, no modules)
- **No Backend**: Runs entirely in the browser.

## Deployment & Hosting

### GitHub Pages

This repository is configured to automatically deploy to GitHub Pages.

- **URL**: `https://<your-username>.github.io/<repository-name>/`
- **Setup**:
  1. Go to your repository settings on GitHub.
  2. Navigate to "Pages" in the sidebar.
  3. Under "Build and deployment", ensure the source is set to "GitHub Actions".
  4. The included workflow `.github/workflows/static.yml` will handle the rest on every push to the main branch.

### Local Execution

You can run this application locally without any server:
1. Clone the repository.
2. Open `index.html` directly in your web browser.
