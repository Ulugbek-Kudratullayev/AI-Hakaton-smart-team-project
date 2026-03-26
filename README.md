# AI Hackathon Workspace

This workspace is split into two apps:

- `frontend/`: Next.js dashboard UI
- `backend/`: FastAPI fleet intelligence backend for Hokimiyat Transport Nazorati AI

## Backend Quick Start

```powershell
cd backend
..\.venv312\Scripts\python.exe -m pip install -r requirements.txt
..\.venv312\Scripts\python.exe scripts\demo_setup.py
..\.venv312\Scripts\python.exe -m uvicorn app.main:app --reload
```

Swagger will be available at `http://127.0.0.1:8000/docs`.

Backend details are documented in [backend/README.md](/d:/Ulugbek/AI%20Hackathon/backend/README.md).
