# Developer Test — Feed Table

A responsive React app that fetches data from an API and displays it in a clean, paginated table using `@tanstack/react-table` and `@tanstack/react-query`.

## Features
- **Server-side pagination** via POST `/api/developer/QueryFeed`
- **Smart caching** with React Query for better performance and request deduplication
- **Responsive design** - works great on desktop, tablet, and mobile
- **Automatic URL detection** - URLs are clickable and open in new tabs
- **Smart object formatting** - nested objects display cleanly (e.g., "Type - SubType")
- **Dynamic columns** - automatically inferred from API data
- **Sticky headers** - column headers stay visible while scrolling
- **Page size selector** - choose 25, 50, or 100 rows per page
- **Navigation controls** - First/Previous/Next/Last page buttons with keyboard accessibility
- **Jump to page** - quick navigation input field
- **Info display** - shows current rows, columns, and page counts
- **Centered loading spinner** - stays visible regardless of scroll position
- **Error notifications** - prominent banner with clear error messages
- **Row range display** - shows "showing 1-50 of 19,080 total records"

## Tech Stack
- React 18
- Vite 5
- @tanstack/react-table v8
- @tanstack/react-query v5

## Getting Started
```bash
npm install
npm run dev
```
Open `http://localhost:5173`.

Note: In this repo we disabled React StrictMode in `src/main.jsx` to avoid double-mount aborts in dev.

## Deployment

### Netlify
The app is configured to deploy on Netlify with a serverless function proxy to handle CORS and HTTPS/HTTP mixed content issues.

**Configuration files:**
- `netlify.toml` - Build settings and redirects
- `netlify/functions/feed-proxy.js` - Serverless function that proxies API requests

The proxy ensures secure HTTPS connections in production while the API only supports HTTP.

### Local Development
```bash
npm run dev  # Runs on http://localhost:5173
```

## API

### Endpoint
- **URL**: `/api/developer/QueryFeed`
- **Development**: Proxied via Vite to `http://130.61.77.93:50940`
- **Production**: Proxied via Netlify Function to `http://130.61.77.93:50940`
- **Method**: POST
- **Headers**:
  - `DeveloperKey: usearch-dev-2025`
  - `Content-Type: application/json`

### Request Body
```json
{
  "pageNumber": 1,
  "pageSize": 50
}
```

### Response Format
The API returns data in this format:
```json
{
  "Items": [...],
  "PageNumber": 1,
  "PageSize": 50,
  "TotalItems": 19080
}
```

The table automatically:
- Extracts data from `Items`, `items`, or `data` arrays
- Detects total records from `TotalItems`, `totalItems`, `totalRecords`, etc.
- Calculates total pages automatically
- Renders all keys as columns with automatic URL detection

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

## Optimizations

### Performance
- **Memoized event handlers** with `useCallback` to prevent unnecessary re-renders
- **Memoized column generation** with `useMemo`
- **React Query caching** with 5-second stale time for smooth pagination
- **Request deduplication** and automatic retry handling
- **Abort controller** support for cancelled requests

### Code Quality
- **Zero unnecessary dependencies** - removed lodash, using native `Array.isArray()`
- **Modular helper functions** - extracted utilities for API parsing, URL detection, and object formatting
- **Responsive design** - mobile-first CSS with proper breakpoints
- **Accessibility** - ARIA labels, semantic HTML, and keyboard navigation
- **Error boundaries** - graceful error handling with user-friendly messages

## UI/UX Features

### Table Display
- **Sticky headers** - stay visible while scrolling vertically
- **Max height** - table scrolls at 600px with smooth touch scrolling
- **Text overflow** - long content truncated with ellipsis (max 300px per cell)
- **Hover effects** - smooth row highlight on hover
- **Clickable URLs** - automatic detection with proper styling and new tab opening
- **Nested object formatting** - displays structured data cleanly (e.g., "Value1 - Value2")

### Pagination
- **Info bar** - displays current page rows, total columns, and page count
- **Visual feedback** - buttons highlight blue on hover with smooth transitions
- **Smart navigation** - buttons auto-disable when unavailable
- **Row range** - shows "showing 1-50 of 19,080 total records"
- **Page format** - clear "Page 1 of 382" display
- **Responsive controls** - stacks vertically on mobile for easy touch access

### Responsive
- **Desktop** - full-width layout (max 1800px)
- **Tablet** - optimized spacing and controls
- **Mobile** - stacked pagination controls, smaller fonts

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers with touch support
- Requires JavaScript enabled

## Notes
- `.gitignore` excludes `node_modules` and build artifacts
- React StrictMode disabled in `src/main.jsx` to avoid double-mount in dev
- Modern, clean UI with professional styling
- Optimized for wide screens (max-width: 1800px) for MacBook Pro and similar displays
- Loading spinner uses fixed positioning to stay centered during scroll

