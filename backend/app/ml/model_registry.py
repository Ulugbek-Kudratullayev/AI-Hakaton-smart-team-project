"""
Model registry — loads trained sklearn models and provides inference methods.
Falls back to rule-based functions when models are not available.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from app.ml.config import FUEL_L_PER_KM_BASELINE
from app.models.enums import VehicleType


MODELS_DIR = Path(__file__).parent / "models"


class ModelRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def load(self):
        """Load all models from disk."""
        import joblib

        self.anomaly_clf = None
        self.anomaly_scaler = None
        self.maintenance_reg = None
        self.maintenance_scaler = None
        self.fuel_lr = None
        self.fuel_scaler = None

        try:
            p = MODELS_DIR / "anomaly_clf.joblib"
            if p.exists():
                self.anomaly_clf = joblib.load(p)
                self.anomaly_scaler = joblib.load(MODELS_DIR / "anomaly_scaler.joblib")
        except Exception as e:
            print(f"[ModelRegistry] Failed to load anomaly model: {e}")

        try:
            p = MODELS_DIR / "maintenance_reg.joblib"
            if p.exists():
                self.maintenance_reg = joblib.load(p)
                self.maintenance_scaler = joblib.load(MODELS_DIR / "maintenance_scaler.joblib")
        except Exception as e:
            print(f"[ModelRegistry] Failed to load maintenance model: {e}")

        try:
            p = MODELS_DIR / "fuel_lr.joblib"
            if p.exists():
                self.fuel_lr = joblib.load(p)
                self.fuel_scaler = joblib.load(MODELS_DIR / "fuel_scaler.joblib")
        except Exception as e:
            print(f"[ModelRegistry] Failed to load fuel model: {e}")

        self._loaded = True
        has_anomaly = self.anomaly_clf is not None
        has_maint = self.maintenance_reg is not None
        has_fuel = self.fuel_lr is not None
        print(f"[ModelRegistry] Loaded — anomaly={has_anomaly}, maintenance={has_maint}, fuel={has_fuel}")

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def predict_anomaly(self, features: list[float]) -> dict[str, Any]:
        """Predict anomaly from daily log features."""
        if self.anomaly_clf is None or self.anomaly_scaler is None:
            return {"model": "rule_based", "is_anomaly": False, "probability": 0.0}

        X = np.array([features], dtype=np.float32)
        X_scaled = self.anomaly_scaler.transform(X)
        pred = int(self.anomaly_clf.predict(X_scaled)[0])

        proba = 0.0
        if hasattr(self.anomaly_clf, "predict_proba"):
            probas = self.anomaly_clf.predict_proba(X_scaled)[0]
            proba = float(probas[1]) if len(probas) > 1 else 0.0

        return {
            "model": "ml",
            "is_anomaly": pred == 1,
            "probability": round(proba, 4),
        }

    def predict_maintenance_risk(self, features: list[float]) -> dict[str, Any]:
        """Predict maintenance risk score."""
        if self.maintenance_reg is None or self.maintenance_scaler is None:
            return {"model": "rule_based", "risk_score": 50.0, "risk_level": "medium"}

        X = np.array([features], dtype=np.float32)
        X_scaled = self.maintenance_scaler.transform(X)
        score = float(self.maintenance_reg.predict(X_scaled)[0])
        score = max(0, min(100, score))

        if score >= 75:
            level = "high"
        elif score >= 45:
            level = "medium"
        else:
            level = "low"

        return {
            "model": "ml",
            "risk_score": round(score, 2),
            "risk_level": level,
        }

    def predict_fuel_anomaly(self, features: list[float]) -> dict[str, Any]:
        """Predict fuel anomaly probability."""
        if self.fuel_lr is None or self.fuel_scaler is None:
            return {"model": "rule_based", "probability": 0.0}

        X = np.array([features], dtype=np.float32)
        X_scaled = self.fuel_scaler.transform(X)

        proba = 0.0
        if hasattr(self.fuel_lr, "predict_proba"):
            probas = self.fuel_lr.predict_proba(X_scaled)[0]
            proba = float(probas[1]) if len(probas) > 1 else 0.0

        return {
            "model": "ml",
            "probability": round(proba, 4),
        }


# Singleton instance
registry = ModelRegistry()
