"""
Train sklearn models and save to disk.
"""

from __future__ import annotations

import os
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from app.db.session import SessionLocal


MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

ANOMALY_CLF_PATH = MODELS_DIR / "anomaly_clf.joblib"
ANOMALY_SCALER_PATH = MODELS_DIR / "anomaly_scaler.joblib"
MAINTENANCE_REG_PATH = MODELS_DIR / "maintenance_reg.joblib"
MAINTENANCE_SCALER_PATH = MODELS_DIR / "maintenance_scaler.joblib"
FUEL_LR_PATH = MODELS_DIR / "fuel_lr.joblib"
FUEL_SCALER_PATH = MODELS_DIR / "fuel_scaler.joblib"


def models_exist() -> bool:
    return ANOMALY_CLF_PATH.exists() and MAINTENANCE_REG_PATH.exists() and FUEL_LR_PATH.exists()


def train_all(db_session=None):
    from app.ml.dataset import generate_anomaly_dataset, generate_maintenance_dataset

    db = db_session or SessionLocal()
    own_session = db_session is None
    try:
        # --- Anomaly Classifier ---
        print("[ML Train] Generating anomaly dataset...")
        X_anom, y_bin, y_type = generate_anomaly_dataset(db)
        print(f"[ML Train] Anomaly dataset: {len(X_anom)} samples, {int(y_bin.sum())} anomalies")

        if len(X_anom) > 10:
            scaler_anom = StandardScaler()
            X_scaled = scaler_anom.fit_transform(X_anom)

            X_train, X_test, y_train, y_test = train_test_split(
                X_scaled, y_bin, test_size=0.2, random_state=42, stratify=y_bin if y_bin.sum() >= 2 else None
            )

            clf = GradientBoostingClassifier(
                n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42
            )
            clf.fit(X_train, y_train)
            acc = clf.score(X_test, y_test)
            print(f"[ML Train] Anomaly classifier accuracy: {acc:.3f}")

            joblib.dump(clf, ANOMALY_CLF_PATH)
            joblib.dump(scaler_anom, ANOMALY_SCALER_PATH)

            # --- Fuel anomaly LR (sub-type) ---
            fuel_mask = (y_type == 1)
            y_fuel = fuel_mask.astype(int)
            if y_fuel.sum() >= 2:
                scaler_fuel = StandardScaler()
                X_fuel_scaled = scaler_fuel.fit_transform(X_anom)

                lr = LogisticRegression(max_iter=500, random_state=42)
                lr.fit(X_fuel_scaled, y_fuel)
                print(f"[ML Train] Fuel anomaly LR trained ({int(y_fuel.sum())} positive samples)")

                joblib.dump(lr, FUEL_LR_PATH)
                joblib.dump(scaler_fuel, FUEL_SCALER_PATH)
            else:
                # Create dummy models
                _save_dummy_fuel()
        else:
            print("[ML Train] Not enough data for anomaly model, creating dummy")
            _save_dummy_anomaly()
            _save_dummy_fuel()

        # --- Maintenance Regressor ---
        print("[ML Train] Generating maintenance dataset...")
        X_maint, y_maint = generate_maintenance_dataset(db)
        print(f"[ML Train] Maintenance dataset: {len(X_maint)} samples")

        if len(X_maint) > 5:
            scaler_maint = StandardScaler()
            X_m_scaled = scaler_maint.fit_transform(X_maint)

            reg = GradientBoostingRegressor(
                n_estimators=80, max_depth=3, learning_rate=0.1, random_state=42
            )
            reg.fit(X_m_scaled, y_maint)
            r2 = reg.score(X_m_scaled, y_maint)
            print(f"[ML Train] Maintenance regressor R2 on train: {r2:.3f}")

            joblib.dump(reg, MAINTENANCE_REG_PATH)
            joblib.dump(scaler_maint, MAINTENANCE_SCALER_PATH)
        else:
            print("[ML Train] Not enough data for maintenance model, creating dummy")
            _save_dummy_maintenance()

        print("[ML Train] All models saved to", MODELS_DIR)

    finally:
        if own_session:
            db.close()


def _save_dummy_anomaly():
    from sklearn.dummy import DummyClassifier
    clf = DummyClassifier(strategy="constant", constant=0)
    clf.fit([[0]*10], [0])
    scaler = StandardScaler()
    scaler.fit([[0]*10])
    joblib.dump(clf, ANOMALY_CLF_PATH)
    joblib.dump(scaler, ANOMALY_SCALER_PATH)


def _save_dummy_fuel():
    from sklearn.dummy import DummyClassifier
    clf = DummyClassifier(strategy="constant", constant=0)
    clf.fit([[0]*10], [0])
    scaler = StandardScaler()
    scaler.fit([[0]*10])
    joblib.dump(clf, FUEL_LR_PATH)
    joblib.dump(scaler, FUEL_SCALER_PATH)


def _save_dummy_maintenance():
    from sklearn.dummy import DummyRegressor
    reg = DummyRegressor(strategy="mean")
    reg.fit([[0]*8], [50.0])
    scaler = StandardScaler()
    scaler.fit([[0]*8])
    joblib.dump(reg, MAINTENANCE_REG_PATH)
    joblib.dump(scaler, MAINTENANCE_SCALER_PATH)


def ensure_models_trained():
    """Train models if they don't exist yet."""
    if not models_exist():
        print("[ML Train] Models not found, training...")
        train_all()
    else:
        print("[ML Train] Models already exist, skipping training")
