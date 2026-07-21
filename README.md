# frayan-for-a3ff-workout-meal-p

Monorepo for a React single-page frontend and FastAPI backend.

## Repository Layout

- `frontend/` - React SPA source and Vite tooling.
- `backend/` - FastAPI application source and Python project metadata.
- `.plan` - Architecture plan and implementation dependency map for the issue sequence.

## Prerequisites

- Node.js 20 or newer
- npm 9 or newer
- Python 3.11 or newer
- PostgreSQL connection string in `DATABASE_URL`

## Local Development

Install JavaScript dependencies:

```bash
npm install
```

Install backend dependencies in your preferred Python environment:

```bash
python3 -m pip install -r backend/requirements-dev.txt
```

Run both services:

```bash
export DATABASE_URL="$(cat /workspace/.database_url)"
npm run dev
```

Run one service at a time:

```bash
npm run dev:frontend
npm run dev:backend
```

The backend listens on `0.0.0.0:8080`. The Vite frontend listens on `0.0.0.0:5173` and proxies API requests under `/api` to the backend.

## Validation

```bash
npm run build
npm run lint
npm run format:check
```

This builds the frontend, checks backend Python syntax, and runs the configured linters and
formatters in check mode.

## Self-Hosted Deployment

The app can run on a bare host without Docker or CI/CD. Deploy the frontend as static files and run
the backend as a FastAPI service. All runtime configuration comes from environment variables; start
from `.env.example` and set real values for the host you are deploying to.

### Environment

Backend runtime variables:

- `DATABASE_URL` - required PostgreSQL connection string. The app rejects non-PostgreSQL URLs.
- `APP_NAME` - API display name used by FastAPI docs.
- `ENVIRONMENT` - `development`, `test`, `staging`, or `production`.
- `BACKEND_HOST` - host used by the provided backend start command. Use `0.0.0.0` on servers.
- `BACKEND_PORT` - backend port. Defaults to `8080` in project scripts.
- `FRONTEND_ORIGIN` - public origin serving `frontend/dist`, for example `https://planner.example.com`.
- `ALLOWED_CORS_ORIGIN` - optional additional browser origin allowed by CORS.
- `SELF_URL` - optional public backend URL, also allowed by CORS when present.
- `CORS_ALLOW_CREDENTIALS` - set to `true` when browser requests should include credentials.

Frontend build-time variable:

- `VITE_API_BASE_URL` - public API base URL baked into the static frontend bundle, for example
  `https://api.planner.example.com/api`. If the frontend and backend share one origin with `/api`
  routed to FastAPI, leave this as `/api`.

### Bare Host Runbook

Install dependencies once:

```bash
npm ci
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r backend/requirements.txt
```

Export environment variables:

```bash
set -a
. ./.env
set +a
```

Run database migrations and seed the exercise and food libraries:

```bash
alembic -c backend/alembic.ini upgrade head
PYTHONPATH=backend python3 -m app.seeds.seed_exercises
PYTHONPATH=backend python3 -m app.seeds.seed_foods
```

Build the frontend static bundle:

```bash
VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}" npm run build:frontend
```

Serve `frontend/dist` with a static web server such as nginx, Caddy, Apache, or a process manager
running a static file server. Configure SPA fallback so unknown non-API paths return
`frontend/dist/index.html`.

Run the FastAPI service:

```bash
python3 -m uvicorn app.main:app \
  --app-dir backend \
  --host "${BACKEND_HOST:-0.0.0.0}" \
  --port "${BACKEND_PORT:-8080}"
```

If the frontend and API share one public origin, route `/api/*` to the FastAPI service and serve all
other paths from `frontend/dist`. If they use separate origins, set `VITE_API_BASE_URL` to the public
API origin plus `/api` before building the frontend, and set `FRONTEND_ORIGIN` to the public frontend
origin before starting the backend.

### Smoke Checks

After deployment, verify the backend health route:

```bash
curl -fsS "${SELF_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}}/api/health"
```

Then open the frontend in a browser and confirm that changing the input panel populates the workout,
meal prep, and budget cards without CORS or network errors.
