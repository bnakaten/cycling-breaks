# Tour Standzeit (cycling-breaks)

A web application for detecting and visualizing stop times (breaks) during cycling tours from GPX track data. Upload GPX files or connect your Strava account to identify pauses, view them on an interactive map, and get detailed statistics.

## Features

- **GPX Analysis** — Upload GPX files and automatically detect stops/breaks using distance, speed, or hybrid detection methods
- **Strava Integration** — Connect your Strava account to load activities directly without manual file export
- **Interactive Map** — Leaflet-based map showing your route, start/end markers, and detected stop locations with popup details
- **Statistics Dashboard** — Total stop time, stop ratio, route distance/duration, and filtered outlier count
- **Sortable Stop List** — Table of all detected stops sortable by index, time, duration, scatter radius, or point count, synced with the map
- **Configurable Detection** — Adjustable minimum stop duration (1–60 min), maximum scatter radius (5–50 m), detection strategy, outlier filtering, and short movement tolerance
- **Local Timezone Display** — Break times are shown in the local timezone at the track location, not browser time or UTC
- **Account Management** — Delete your account and all associated data with automatic Strava deauthorization
- **Demo Data** — Try the app instantly with built-in sample GPX data (no file needed)

## Prerequisites

- Node.js 26.x
- Yarn (v4) — automatically bootstrapped via `.yarn/releases/`
- A Strava API application (for Strava features)

## Setup

### 1. Install dependencies

```bash
yarn install --immutable
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

**Required for Strava features:**

| Variable | Description |
|---|---|
| `STRAVA_CLIENT_ID` | Your Strava API application client ID |
| `STRAVA_CLIENT_SECRET` | Your Strava API application client secret |
| `STRAVA_REDIRECT_URI` | OAuth callback URL (e.g. `http://localhost:3000/api/auth/strava/callback`) |

**Optional:**

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `cycling-breaks-dev-secret-change-in-production` | Secret for signing auth tokens |
| `DB_PATH` | `data/app.db` | Path to the SQLite database file |

> **Alternative:** You can also configure Strava credentials at runtime via the Strava configuration form in the app UI. Env vars take precedence if set.

### 3. Set up a Strava API application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create an application with the callback URL matching `STRAVA_REDIRECT_URI`
3. Copy the Client ID and Client Secret to your `.env` file

### 4. Run the development server

```bash
yarn dev
```

This starts both the Express backend and the Vite frontend dev server. Open [http://localhost:3000](http://localhost:3000).

## Usage

### Load demo data

Click the **"Load demo data"** button on the home page to see the app in action with sample GPX data (a Munich walking tour with simulated stops).

### Analyze a GPX file

1. Drag and drop a `.gpx` file onto the upload area, or click to browse
2. Adjust detection settings if desired:
   - **Minimum stop duration** — how long a pause must be to count
   - **Maximum scatter radius** — how far GPS points can drift while still being considered "stopped"
   - **Detection method** — `Hybrid` (default, best for most data), `Distance`, or `Speed`
   - **Advanced**: GPS outlier filtering, short movement tolerance
3. Click **"Analyze GPX"**

### Connect with Strava

1. Click **"Connect with Strava"** in the header
2. Authorize the app on Strava's OAuth page
3. After connecting, use the **"Load Strava Activity"** tab in the upload form to select and analyze your recent activities

### View results

- **Map** — Route shown in blue, start (green) and end (red) markers, stops as rose-colored circles. Click a stop to highlight it.
- **Stats** — Cards showing total stop time, stop ratio (with progress bar), number of stops, and route overview
- **Stop list** — Table of all detected stops. Click a row to zoom to that stop on the map, or click the column headers to sort.

### Delete your account

Click the **"Delete"** button in the user menu (trash icon) to permanently delete your account, all associated data, and revoke the app's Strava access.

## Production build

```bash
yarn build
yarn start
```

The build bundles the server with esbuild and the frontend with Vite. The production server serves static files from `dist/` and handles the API.

## Privacy

GPX files uploaded for analysis are processed entirely in memory and **never stored on disk**. When you delete your account, all associated data is permanently removed from the database and the Strava access token is revoked.

See the Privacy Policy page in the app for full details.

## Tech stack

- **Backend**: Express, sql.js (SQLite/WASM), jsonwebtoken, Strava OAuth2
- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Leaflet
- **Build**: esbuild (server), Vite (client), Yarn 4

## License

GPL-3.0-or-later — see [LICENSE](../LICENSE)
