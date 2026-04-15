# Smart Search Frontend ⚡

The React + TypeScript frontend for the Smart Search platform. Provides a fast, AI-feel product discovery UI with real-time debounced search, advanced filters, relevance-scored results, and search suggestions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| HTTP | Native `fetch` API |

---

## Prerequisites

- Node.js `>= 18`
- npm `>= 9` (or pnpm / yarn)
- Smart Search API running on `http://localhost:3000` (see [backend README](../smart-search-api/README.md))

---

## Local Setup

```bash
# 1. From the repo root, navigate to the frontend
cd smart-search-app/smart-search-frontend

# 2. Install dependencies
npm install

# 3. Copy environment template and set your API URL
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

---

## Environment Variables

> ⚠️ **Never commit `.env.local` or any file containing real secrets.**

Create `.env.local` (already in `.gitignore`):

```dotenv
# URL of the Rails API — change for staging/production
VITE_API_URL=http://localhost:3000
```

All environment variables exposed to the browser **must** be prefixed with `VITE_`.
Do **not** place API keys, tokens, or secrets here — Vite bundles these into the client JS and they become publicly visible.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across all source files |

---

## Features

### 🔎 Real-time Search
- **300 ms debounce** — searches fire automatically as you type without hammering the API
- Manual search via the **Search** button or `Enter` key
- **Clear All** resets query, category, and price filters in one click

### 🧠 Advanced Query Syntax
| Syntax | Example |
|---|---|
| Exact phrase | `"noise cancelling"` |
| Field target | `title:iphone category:electronics` |
| Boolean | `laptop AND gaming` |
| Exclude | `-refurbished` |

### 🎛️ Filters
- **Category** dropdown (populated dynamically from the API)
- **Min / Max price** range inputs
- **Sort by** — Relevance · Price ↑ · Price ↓ · Popularity

### 💡 Suggestions
Related search terms are returned by the API (powered by Redis) and shown as clickable chips below the search bar.

### 📦 Results Grid
- Responsive 1 / 2 / 3 column card grid
- Category badge with colour coding
- **Match score** pill (e.g. *98% match*)
- Highlighted query terms inside title and description (`<mark>` tags)
- Star rating derived from `popularity_score`
- Formatted price in USD
- Heart (save) and View action buttons per card

### ⚡ UX Details
- **Loading skeleton** — 6 pulsing placeholder cards during fetch
- **Error banner** — displayed if the API call fails
- **Empty state** — helpful message with prompt to adjust filters
- **Welcome state** — shown before any search is performed

---

## Project Structure

```
src/
├── App.tsx        # Main app component (search logic + UI)
├── App.css        # Component-level styles
├── index.css      # Global styles, Tailwind base, scrollbar
└── main.tsx       # React root entry point
```

---

## Connecting to the API

The frontend calls `http://localhost:3000/api/search` (or `VITE_API_URL`).
Make sure the Rails API has CORS configured to allow your frontend origin — see `smart-search-api/config/initializers/cors.rb`.

For production, set `VITE_API_URL` to your deployed API URL and update the CORS whitelist accordingly.

---

## Security

| Topic | Guidance |
|---|---|
| Environment secrets | Never put tokens/keys in `VITE_*` vars — they ship in the JS bundle |
| `dangerouslySetInnerHTML` | Used only for API-returned highlighted text. The API escapes user input before injecting `<mark>` tags. |
| CORS | The API restricts allowed origins — update `cors.rb` for production domains |
| Dependencies | Run `npm audit` regularly and keep packages up to date |

---

## Production Build

```bash
npm run build
# Output → dist/
```

Serve `dist/` with any static host (Nginx, Vercel, Netlify, GitHub Pages, etc.).
Set the `VITE_API_URL` environment variable on your hosting platform to point to the production Rails API.
