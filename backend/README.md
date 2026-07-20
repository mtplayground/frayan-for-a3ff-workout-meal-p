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

## Local Development

```bash
python3 -m pip install -r requirements.txt
export DATABASE_URL="$(cat /workspace/.database_url)"
export FRONTEND_ORIGIN="http://localhost:5173"
python3 -m uvicorn app.main:app --app-dir . --host 0.0.0.0 --port 8080 --reload
```
