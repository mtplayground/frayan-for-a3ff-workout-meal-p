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
python3 -m pip install -r backend/requirements.txt
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
```

This builds the frontend and checks backend Python syntax.
