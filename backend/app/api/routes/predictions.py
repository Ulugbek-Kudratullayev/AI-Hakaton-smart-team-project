"""AI prediction endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.vehicle import Vehicle
from app.services.prediction_service import (
    fleet_risk_ranking,
    forecast_breakdown,
    fuel_anomaly_probability,
)

router = APIRouter()


@router.get("/vehicles/{vehicle_id}/breakdown-forecast")
def get_breakdown_forecast(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).get(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return forecast_breakdown(db, vehicle)


@router.get("/vehicles/{vehicle_id}/fuel-anomaly-probability")
def get_fuel_anomaly_probability(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).get(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return fuel_anomaly_probability(db, vehicle)


@router.get("/fleet/risk-ranking")
def get_fleet_risk_ranking(db: Session = Depends(get_db)):
    return fleet_risk_ranking(db)
