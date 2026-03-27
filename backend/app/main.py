from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.vehicle import Vehicle
from app.models.route import VehicleRoute, ServiceZone  # noqa: F401 — register models
from app.services.seed_service import seed_demo_data
from app.services.simulation_service import SimulationEngine


settings = get_settings()
simulation = SimulationEngine()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create tables
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)

    # Auto-seed if DB is empty
    db = SessionLocal()
    try:
        vehicle_count = db.query(Vehicle).count()
        if settings.seed_on_startup or vehicle_count == 0:
            seed_demo_data(db, reset=(vehicle_count == 0))
            print(f"[Startup] Seeded demo data ({vehicle_count} existing vehicles)")
    finally:
        db.close()

    # Train ML models if not present, then load registry
    try:
        from app.ml.train import ensure_models_trained
        from app.ml.model_registry import registry
        ensure_models_trained()
        registry.load()
        print("[Startup] ML models ready")
    except Exception as e:
        print(f"[Startup] ML model training skipped: {e}")

    # Start simulation
    if settings.simulation_enabled:
        await simulation.start(
            tick_interval=settings.simulation_tick_interval,
            day_minutes=settings.simulation_day_minutes,
        )
        print(f"[Startup] Simulation started (tick={settings.simulation_tick_interval}s, day={settings.simulation_day_minutes}min)")

    yield

    # Shutdown
    if settings.simulation_enabled:
        await simulation.stop()
        print("[Shutdown] Simulation stopped")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="GovTech fleet monitoring and optimization backend for hokimiyat transport oversight.",
    lifespan=lifespan,
)

app.state.simulation = simulation

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
