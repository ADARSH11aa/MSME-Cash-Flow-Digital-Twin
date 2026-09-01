"""
Model 3 - Anomaly & Volatility Detection API.

Two endpoints, since closed and open invoices use different feature sets
(features_closed.py vs features_open.py - see those files for why).

Normally served as part of main.py's single-server app (port 8000), which
does `include_router(router)` - Model 3 no longer needs a second terminal
and a second port just to enrich the risk graph.

Still runnable standalone (the `app` below) for isolated testing:
    python -m uvicorn api.anomaly_api:app --port 8002

Either way the open-invoices endpoint calls Model 1's live API over HTTP,
so Model 1's server must be up - which, when mounted into main.py, means
the same process calling itself (exactly what /risk-graph already does for
Models 1 and 5).

Invoke-RestMethod -Uri "http://127.0.0.1:8000/detect-anomalies/closed" -Method Get
Invoke-RestMethod -Uri "http://127.0.0.1:8000/detect-anomalies/open" -Method Get
"""
import os
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, FastAPI, HTTPException, Query
from pydantic import BaseModel

from anomaly.features_closed import build_closed_invoice_features, FEATURE_COLUMNS as CLOSED_COLS
from anomaly.features_open import build_open_invoice_features, FEATURE_COLUMNS as OPEN_COLS
from anomaly.isolation_forest_detector import detect_anomalies
from anomaly.anomaly_explainer import add_anomaly_types, CLOSED_INVOICE_RULES, OPEN_INVOICE_RULES
from simulation.model1_client import load_model1_predictions

# Resolved from THIS file, not the cwd, and honouring the same env var
# main.py uses - otherwise these endpoints only find invoices.csv when
# uvicorn happens to be launched from AI_models/, which stops being true
# the moment they're mounted into someone else's app.
BASE_DIR = Path(__file__).resolve().parent.parent

RAW_INVOICES_PATH = str(
    Path(os.environ.get("MODEL1_DATA_PATH", BASE_DIR / "data" / "raw" / "invoices.csv"))
)

# Same-process self-call by default, tracking main.py's PORT the way its
# own /risk-graph self-calls do. Kept overridable per-request so the
# standalone app on 8002 can still point at a Model 1 on another port.
MODEL1_API_URL = os.environ.get(
    "MODEL1_API_URL",
    f"http://127.0.0.1:{os.environ.get('PORT', 8000)}/predict/open-invoices",
)

router = APIRouter(tags=["Model 3 - Anomaly Detection"])


class AnomalyResult(BaseModel):
    invoice_id: str
    anomaly_score: float
    anomaly_type: str


@router.get("/detect-anomalies/closed", response_model=list[AnomalyResult])
def detect_closed_anomalies(contamination: float = Query(0.05, ge=0.01, le=0.5)):
    """
    Flags unusual CLOSED invoices - real, already-observed payment behaviour
    (unusual amounts, unusual delay vs. that customer's own history).
    Returns only the flagged invoices, sorted most-anomalous first.
    """
    try:
        raw = pd.read_csv(RAW_INVOICES_PATH)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"{RAW_INVOICES_PATH} not found")

    features = build_closed_invoice_features(raw)
    result = detect_anomalies(features, CLOSED_COLS, contamination=contamination)
    result = add_anomaly_types(result, CLOSED_INVOICE_RULES)

    flagged = result[result["anomaly_flag"]]
    return [
        AnomalyResult(invoice_id=row.invoice_id, anomaly_score=row.anomaly_score, anomaly_type=row.anomaly_type)
        for row in flagged.itertuples(index=False)
    ]


@router.get("/detect-anomalies/open", response_model=list[AnomalyResult])
def detect_open_anomalies(
    contamination: float = Query(0.05, ge=0.01, le=0.5),
    model1_api_url: str = MODEL1_API_URL,
):
    """
    Flags unusual OPEN invoices - unusual amounts, or already past their
    own Model 1 P90 prediction (reuses the same signal Model 2's
    overdue-invoice handling uses).
    Returns only the flagged invoices, sorted most-anomalous first.
    """
    try:
        predictions = load_model1_predictions(
            api_url=model1_api_url, raw_invoices_path=RAW_INVOICES_PATH
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Could not get predictions from Model 1's API: {e}",
        )

    try:
        raw = pd.read_csv(RAW_INVOICES_PATH)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"{RAW_INVOICES_PATH} not found")

    features = build_open_invoice_features(predictions, raw)
    result = detect_anomalies(features, OPEN_COLS, contamination=contamination)
    result = add_anomaly_types(result, OPEN_INVOICE_RULES)

    flagged = result[result["anomaly_flag"]]
    return [
        AnomalyResult(invoice_id=row.invoice_id, anomaly_score=row.anomaly_score, anomaly_type=row.anomaly_type)
        for row in flagged.itertuples(index=False)
    ]


# ============================================================
# STANDALONE APP
# ============================================================
#
# Only used when this module is served directly (port 8002). main.py
# imports `router` above instead, so nothing here runs in the normal
# single-server setup - including this /health, which would otherwise
# collide with main.py's own.

app = FastAPI(title="Model 3 - Anomaly Detection API")


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(router)