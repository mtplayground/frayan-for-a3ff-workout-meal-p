# Backend

FastAPI service for API endpoints and database-backed domain logic.

## Local Development

```bash
python3 -m pip install -r requirements.txt
export DATABASE_URL="$(cat /workspace/.database_url)"
python3 -m uvicorn app.main:app --app-dir . --host 0.0.0.0 --port 8080 --reload
```
