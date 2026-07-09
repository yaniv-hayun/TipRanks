# TipRanks Autocomplete API

A full-stack autocomplete search application that returns relevant results for **stocks** and **experts** (analysts, bloggers, insiders).

**Tech Stack**: NestJS (TypeScript) backend + React (Vite + MUI) frontend

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Run Locally

```bash
# 1. Clone the repo
git clone <repo-url> && cd TipRanks

# 2. Start the backend (NestJS API on port 9000)
cd backend
npm install
npm run start:dev

# 3. In a separate terminal, start the frontend (Vite dev server on port 3000)
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Run Tests

```bash
# Backend unit + integration tests
cd backend && npm run test

# Backend E2E tests (full API endpoint tests)
cd backend && npm run test:e2e

# Frontend component + hook tests
cd frontend && npm run test
```

---

## Deployment (Docker & Cloud Hosting)

Both the backend and frontend are Dockerized using multi-stage builds. They can be deployed to any container hosting platform (like Render, Fly.io, or Railway) directly from GitHub.

### 1. Deploy the Backend (e.g., to Render Web Service)
1. Create a new **Web Service** on Render connected to your GitHub repository.
2. Select the `backend` directory as the **Root Directory**.
3. Render will automatically detect the `backend/Dockerfile` and build the image.
4. Add Environment Variable: `FRONTEND_URL` = `https://your-frontend-url.onrender.com` (to allow CORS).
5. Deploy. The backend will expose port `9000`.

### 2. Deploy the Frontend (e.g., to Render Web Service)
1. Create another **Web Service** on Render connected to the same repository.
2. Select the `frontend` directory as the **Root Directory**.
3. Render will use `frontend/Dockerfile` to build the React app and serve it via Nginx.
4. Add Environment Variable: `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com` (so the React app knows where the API lives).
5. Deploy. The frontend will expose port `3000` via Nginx.

---

## Architecture & Design Decisions

### Data Storage: In-Memory with Pre-Computed Normalization

Both JSON files (~100 stocks + ~100 experts ≈ 200 records) are loaded into memory at application startup from `backend/src/db/`. Each record's searchable fields are **normalized once** at startup and stored alongside the original data. At query time, only the user's input is normalized — the data is never re-processed.

**Why not a database?** The dataset is tiny (< 100KB). In-memory search is sub-millisecond. Any database would add network overhead for zero benefit. The `SearchEngine` service is designed as a pluggable interface for easy migration to Elasticsearch or PostgreSQL if the dataset grows.

### Data Normalization Issues Identified

The source JSON contains several search-hostile patterns that required normalization:

| Issue | Example | Solution |
|-------|---------|----------|
| `&` (ampersand) in names | `"Johnson & Johnson"` | Replaced with `" and "` |
| Dotted tickers | `"BRK.A"`, `"BRK.B"` | Secondary clean key: `"brka"` |
| Colon tickers | `"JP:3350"`, `"GB:AZN"` | Index the suffix after `:` as separate search key |
| Accented characters | `"Nestlé"` | Strip diacritics via Unicode NFD |
| Apostrophes/periods in names | `"L'Oreal SA"`, `"Amazon.Com, Inc."` | Strip punctuation |
| Double spaces | `"Agricultural Bank of China  Class H"` | Collapse whitespace |
| Titles/suffixes in expert names | `"Dr. Paul Nunzio De Santis"`, `"Scott Chan CFA"` | Handled naturally by normalization |

### Search Algorithm: 3-Tier Matching

| Tier | Priority | Condition |
|------|----------|-----------|
| 1 — Exact | Highest | Query exactly matches a normalized field |
| 2 — Prefix | Medium | Normalized field starts with the query |
| 3 — Substring | Lowest | Normalized field contains the query |

**Tie-breaking**: Stocks sorted by market cap (largest first); experts sorted alphabetically.

### Result Mixing Rule: 5/5 Split with Fallback

- Up to 5 stocks + 5 experts = 10 results max
- If one type has fewer than 5 matches, remaining slots go to the other type
- Final results interleaved by match tier (best matches first regardless of type)

### Frontend

- **MUI (Material UI)** for component library
- **300ms debounce** on search input
- **Client-side grouping** — API returns interleaved results; frontend groups them under "Stocks" / "Experts" headers
- **Match highlighting** — query substring highlighted in results

---

## API Reference

### `GET /api/autocomplete?query={text}`

**Parameters:**
- `query` (string, optional) — Search text, max 100 characters

**Response:** Array of up to 10 results:

```json
[
  { "type": "stock",  "ticker": "AAPL", "name": "Apple Inc", "marketCap": 3900351316097 },
  { "type": "expert", "name": "Andrew Bary", "expertType": "blogger" }
]
```

---

## Project Structure

```
TipRanks/
├── backend/                 # NestJS API (Dockerized)
│   ├── Dockerfile           # Backend multi-stage build
│   ├── src/
│   │   ├── db/              # Source JSON data
│   │   ├── autocomplete/    # Controller, service, DTOs
│   │   ├── search/          # Search engine, normalizer, interfaces
│   │   └── data/            # Data loader (JSON → pre-normalized index)
│   └── test/                # Unit + E2E tests
├── frontend/                # React + Vite + MUI (Dockerized)
│   ├── Dockerfile           # Frontend multi-stage build (Node -> Nginx)
│   ├── nginx.conf           # Nginx server configuration
│   ├── src/
│   │   ├── components/      # SearchBox, ResultList, ResultItem, HighlightedText
│   │   ├── hooks/           # useAutocomplete (debounced search)
│   │   ├── __tests__/       # Component + hook tests
│   │   └── types/           # Shared TypeScript types
│   └── vite.config.ts       # Proxy + Vitest config
└── README.md
```

---

## Assumptions

1. **Dataset is static** — loaded once at startup, no runtime updates
2. **Expert search is by name only** (not by firm), per spec
3. **Expert type** is exposed as lowercase `expertType` (not the raw `type` field)
4. **International tickers** (e.g., `JP:3350`) are searchable by their suffix
5. **No authentication** required for the autocomplete endpoint
