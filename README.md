# Pawchive

A desktop-style dark media archive browser for browsing, organizing, and downloading creator posts from public archive sites (pawchive.st and compatible kemono-style APIs).

## Features

- **Scanner** — paste any `pawchive.st/patreon/user/{id}` (or fanbox, gumroad) URL and archive all posts with one click
- **Posts** — two-column list/detail browser with per-media selection and author filtering
- **Author quick-bar** — recently scanned creators as clickable chips; a green dot appears when re-scanning finds new posts
- **Download tracking** — queue individual or all media, saved state remembered per item, organized into author subfolders
- **Library** — browse all saved assets
- **Persistent data** — everything stored in PostgreSQL; re-opening picks up exactly where you left off

---

## Running locally (Docker — recommended)

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose).  Works on Windows, macOS, and Linux.

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/archiver.git
cd archiver

# 2. Configure (optional — defaults work out of the box)
cp .env.example .env
# Edit .env if you want to change the port or set a custom DB password

# 3. Start everything
docker compose up --build

# 4. Open in your browser
#    http://localhost:3000
```

All data lives in a Docker volume (`postgres_data`) so it survives container restarts and updates.

### Updating to a new version

```bash
git pull
docker compose up --build
```

The migrate service runs automatically on every start and applies any schema changes.

### Stopping

```bash
docker compose down          # stop but keep data
docker compose down -v       # stop AND delete all data (fresh start)
```

---

## Running locally without Docker (advanced)

Requires: Node.js 24, pnpm 10, PostgreSQL 15+.

> **Note:** The workspace is configured for Linux native binaries. On macOS or Windows you may need to remove the esbuild/rollup platform overrides in `pnpm-workspace.yaml` before `pnpm install` will succeed.

```bash
pnpm install
export DATABASE_URL=postgres://user:pass@localhost:5432/pawchive
pnpm --filter @workspace/db run push      # create/migrate DB
PORT=5000 pnpm --filter @workspace/api-server run dev &
BASE_PATH=/ PORT=3001 pnpm --filter @workspace/pawchive run dev &
```

API runs on :5000, frontend on :3001. The Vite dev server proxies `/api` automatically via the Replit shared proxy config — for standalone use you may need to add a vite proxy entry.

---

## Pushing to GitHub

From the Replit shell (or your local terminal after cloning):

```bash
git remote add origin https://github.com/<your-username>/archiver.git
git push -u origin main
```

After the first push, future updates from Replit:

```bash
git push origin main
```

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Postgres connection string |
| `PORT` | ✅ (API) | — | Port for the API server |
| `SESSION_SECRET` | — | random | Secret for session signing |
| `DB_PASSWORD` | Docker only | `pawchive` | Postgres password in compose |

---

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS, shadcn/ui, TanStack Query, wouter
- **Backend:** Express 5, Drizzle ORM, PostgreSQL
- **Monorepo:** pnpm workspaces, TypeScript 5.9, OpenAPI codegen (Orval)
