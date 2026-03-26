# Hokimiyat Transport Nazorati AI Backend

Production-style FastAPI backend and intelligence layer for a GovTech fleet oversight MVP focused on hokimiyat agricultural, municipal, and service transport in Uzbekistan.

## Architecture Summary

- FastAPI application with modular layers under `app/`
- SQLAlchemy ORM with Alembic migration support
- JWT auth with four roles: `admin`, `dispatcher`, `mechanic`, `viewer`
- Deterministic intelligence modules for efficiency, anomaly detection, maintenance risk, and task recommendations
- Demo-first seed generation for a visually rich Uzbekistan fleet story

## Main Entities

- `User`
- `Vehicle`
- `Driver`
- `Task`
- `DailyLog`
- `MaintenanceRecord`
- `Alert`

## API Surface

### Auth
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Fleet operations
- `GET /api/v1/vehicles`
- `POST /api/v1/vehicles`
- `GET /api/v1/vehicles/{id}`
- `PATCH /api/v1/vehicles/{id}`
- `GET /api/v1/drivers`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/{id}`
- `POST /api/v1/tasks/{id}/assign`
- `GET /api/v1/logs/daily`
- `POST /api/v1/logs/daily`
- `GET /api/v1/maintenance`
- `POST /api/v1/maintenance`
- `GET /api/v1/alerts`

### Analytics and recommendations
- `GET /api/v1/analytics/dashboard`
- `GET /api/v1/analytics/vehicles/{id}/efficiency`
- `GET /api/v1/analytics/vehicles/{id}/anomalies`
- `GET /api/v1/analytics/vehicles/{id}/maintenance-risk`
- `GET /api/v1/recommendations/tasks/{id}/vehicles`

## Intelligence Modules

### Efficiency scoring
The score is implemented in [app/ml/scoring.py](/d:/Ulugbek/AI%20Hackathon/backend/app/ml/scoring.py).
It returns `0-100` using weighted normalized components:

- active utilization
- idle penalty
- task productivity
- distance utilization against a vehicle-type baseline
- fuel efficiency against liters-per-km baselines
- assignment completion ratio

Weights are configurable in `EfficiencyScoringConfig`.

### Anomaly detection
The detector is implemented in [app/ml/anomaly.py](/d:/Ulugbek/AI%20Hackathon/backend/app/ml/anomaly.py).
It flags:

- high fuel overuse versus type baseline
- excessive idle time
- low output with high consumption
- unusual movement or route mismatch patterns

### Maintenance risk
The risk model is implemented in [app/ml/maintenance.py](/d:/Ulugbek/AI%20Hackathon/backend/app/ml/maintenance.py).
Inputs:

- days since last service
- kilometers over service threshold
- vehicle age
- recent anomaly count

### Recommendation engine
The ranking logic is implemented in [app/ml/recommendation.py](/d:/Ulugbek/AI%20Hackathon/backend/app/ml/recommendation.py).
It ranks top vehicles based on:

- type compatibility
- distance to task
- current status
- maintenance risk penalty
- recent workload balance
- fuel efficiency bonus

## Seeded Demo Data

The demo seed generates:

- 24 vehicles
- 16 drivers
- 34 tasks
- 35 days of daily logs per vehicle
- maintenance history
- recent open alerts
- Uzbekistan-oriented regions, districts, and locations

## Quick Start

Run these commands from the repo root:

```powershell
cd backend
..\.venv312\Scripts\python.exe -m pip install -r requirements.txt
..\.venv312\Scripts\python.exe scripts\demo_setup.py
..\.venv312\Scripts\python.exe -m uvicorn app.main:app --reload
```

If you prefer your own environment, create and activate a venv inside `backend/` and run the same commands with that interpreter.

Swagger: `http://127.0.0.1:8000/docs`

## PowerShell Demo Helper

```powershell
cd backend
.\scripts\run_demo.ps1
```

## Docker Demo

```powershell
cd backend
docker compose up --build
```

## Demo Credentials

- `admin / Admin123!`
- `dispatcher / Dispatch123!`
- `mechanic / Mechanic123!`
- `viewer / Viewer123!`

## Demo Flow

1. Login and authorize in Swagger.
2. Open `/analytics/dashboard` for the fleet overview.
3. Drill into `/vehicles` and then a vehicle analytics trio: efficiency, anomalies, maintenance risk.
4. Show `/tasks` and `/recommendations/tasks/{id}/vehicles` for explainable assignment ranking.
5. Show `/alerts` to close the oversight story.

## Developer Files

- API bootstrap: [app/main.py](/d:/Ulugbek/AI%20Hackathon/backend/app/main.py)
- Seed service: [app/services/seed_service.py](/d:/Ulugbek/AI%20Hackathon/backend/app/services/seed_service.py)
- Request examples: [scripts/demo_requests.http](/d:/Ulugbek/AI%20Hackathon/backend/scripts/demo_requests.http)
- Initial migration: [alembic/versions/0001_initial.py](/d:/Ulugbek/AI%20Hackathon/backend/alembic/versions/0001_initial.py)

## Tests

Run from `backend/`:

```powershell
..\.venv312\Scripts\python.exe -m pytest -q
```
