# Backend

FastAPI service for API endpoints and database-backed domain logic.

## Configuration

The service reads runtime settings from environment variables:

- `APP_NAME` - API display name used in generated docs.
- `ENVIRONMENT` - one of `development`, `test`, `staging`, or `production`.
- `FRONTEND_ORIGIN` - local frontend origin allowed by CORS. Defaults to `http://localhost:5173`.
- `ALLOWED_CORS_ORIGIN` - deployed public origin injected by the platform.
- `SELF_URL` - deployed public service URL, also allowed by CORS when present.
- `CORS_ALLOW_CREDENTIALS` - whether CORS permits cookies and credentials. Defaults to `true`.
- `DATABASE_URL` - PostgreSQL connection string for SQLAlchemy and Alembic.

## Local Development

```bash
python3 -m pip install -r requirements-dev.txt
export DATABASE_URL="$(cat /workspace/.database_url)"
export FRONTEND_ORIGIN="http://localhost:5173"
python3 -m uvicorn app.main:app --app-dir . --host 0.0.0.0 --port 8080 --reload
```

## Migrations

Run Alembic migrations from the repository root:

```bash
export DATABASE_URL="$(cat /workspace/.database_url)"
alembic -c backend/alembic.ini upgrade head
```

## Seeds

Seed the repeatable exercise library from the repository root:

```bash
export DATABASE_URL="$(cat /workspace/.database_url)"
PYTHONPATH=backend python3 -m app.seeds.seed_exercises
```

Seed the repeatable food and price catalog from the repository root:

```bash
export DATABASE_URL="$(cat /workspace/.database_url)"
PYTHONPATH=backend python3 -m app.seeds.seed_foods
```
