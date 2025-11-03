# Developer Test — Feed Table

A small React app that calls an API and renders a paginated table using `@tanstack/react-table`.

## Features
- Server-side pagination via POST `/api/developer/QueryFeed`
- Page size selector (25 / 50 / 100)
- Navigation: « ‹ › » + "Page X of Y"
- Jump to page input + Go button
- Dynamic columns inferred from API data
- Visible rows/columns count and total rows (when provided)
- Loading overlay + error/empty states
- Vite proxy for API calls in development

## Tech Stack
- React 18
- Vite 5
- @tanstack/react-table v8
- Lodash (isArray)

## Getting Started
```bash
npm install
npm run dev
```
Open `http://localhost:5173`.

Note: In this repo we disabled React StrictMode in `src/main.jsx` to avoid double-mount aborts in dev.

## API
- Endpoint (proxied): `/api/developer/QueryFeed`
- Real host is configured in `vite.config.js` proxy to `http://130.61.77.93:50940`
- Method: POST
- Headers:
  - `DeveloperKey: usearch-dev-2025`
  - `Content-Type: application/json`
- Body example:
```json
{
  "pageNumber": 1,
  "pageSize": 50
}
```

The table will render all keys present in each item. If the response includes `totalRecords` and/or `totalPages`, they are used for footer display and navigation.

## Build
```bash
npm run build
npm run preview
```

## Project Structure
```
src/
  App.jsx
  main.jsx
  components/FeedTable.jsx
  styles.css
vite.config.js
```

## Notes
- `.gitignore` excludes `node_modules` and build artifacts.
- The pagination bar is a compact, professional data-grid style footer.

