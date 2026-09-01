"""
FastAPI serving layer for Model 1 (Payment Behaviour Prediction Engine).

Also exposes:

    Model 2:
        POST /simulate

    Model 3:
        GET  /detect-anomalies/closed
        GET  /detect-anomalies/open

    Model 4:
        POST /extract/invoice

    Model 5:
        POST /explain/invoices

    Model 6:
        POST /narrate/invoice
        GET  /narrate/languages

    Model 7:
        POST /recommendations

    Model 8:
        POST /risk-graph

Model 2/7/8 used to be called in-process by the (now-retired) Python
backend gateway - they're exposed here as plain HTTP endpoints instead so
the gateway (backend/, now Node/Express) never needs to import any
AI_models Python code directly, only call it over HTTP like it already
does for Model 1/4/5.

Model 3 used to be a SECOND server on port 8002 that you had to remember
to start by hand - and when you forgot, /risk-graph silently fail-softed
to anomaly_type "normal" everywhere, so Model 3's findings just never
reached the UI. It's mounted here now: one process, one port, nothing
optional to forget before a demo.

Run from the app/ directory:

    uv run uvicorn main:app --reload --port 8000

Or:

    uvicorn main:app --reload --port 8000
"""

import os
from datetime import date
from pathlib import Path
from typing import Literal

import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile
from pydantic import BaseModel

from model1_inference import (
    Model1Artifacts,
    predict_payment_window,
)

from model5_shap import (
    Model5Artifacts,
    explain_invoice,
)

from ocr_extraction import extract_invoice

from simulation.monte_carlo import simulate_cashflow
from risk_graph.build_risk_graph import build_risk_graph
from model_7 import rank_recovery_options

from api.anomaly_api import router as anomaly_router

# Model 6 builds its Groq client at import time, which raises if GROQ_API_KEY
# is unset. Narration is the one optional model here - every other endpoint
# works without it - so an absent key degrades /narrate/invoice to a 503
# rather than stopping the whole server from booting.
try:
    from model6_explanation import (
        narrate_invoice as narrate_explanation,
        SUPPORTED_LANGUAGES,
        DEFAULT_LANGUAGE,
    )
    MODEL6_IMPORT_ERROR = None
except Exception as exc:  # noqa: BLE001 - surfaced via /health and the route
    narrate_explanation = None
    SUPPORTED_LANGUAGES = {}
    DEFAULT_LANGUAGE = "en"
    MODEL6_IMPORT_ERROR = repr(exc)
    print(f"[main] Model 6 narration unavailable: {exc!r}")


# ============================================================
# PATHS
# ============================================================

# Resolve paths relative to THIS file.
#
# This means the API behaves consistently regardless of where
# uvicorn is launched from.
BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = Path(
    os.environ.get(
        "MODEL1_MODEL_DIR",
        BASE_DIR / "models",
    )
)

RAW_INVOICES_PATH = Path(
    os.environ.get(
        "MODEL1_DATA_PATH",
        BASE_DIR / "data" / "raw" / "invoices.csv",
    )
)

# Models 3 and 5 both live on THIS app now, so /risk-graph reaches them by
# calling this same process over HTTP - the pattern already used below for
# /predict/open-invoices and /explain/invoices. Sync `def` endpoints run in
# the threadpool, so a self-call is served on another thread rather than
# deadlocking the one waiting on it.
MODEL3_URL = os.environ.get(
    "MODEL3_URL",
    f"http://127.0.0.1:{os.environ.get('PORT', 8000)}/detect-anomalies/open",
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="MSME Cash-Flow AI - Model 1 API",
)

# Model 3 (anomaly detection). Its own /health is deliberately left behind
# on its standalone app - this app already has one.
app.include_router(anomaly_router)


# ============================================================
# GLOBAL MODEL ARTIFACTS
# ============================================================

# Model 1 artifacts.
#
# Loaded ONCE during startup.
artifacts: Model1Artifacts | None = None


# Model 5 SHAP artifacts.
#
# Uses the EXACT SAME Model1Artifacts instance.
shap_artifacts: Model5Artifacts | None = None


# ============================================================
# STARTUP
# ============================================================

def load_models():
    """
    Loads Model 1's trained artifacts and refreshes customer_stats from
    RAW_INVOICES_PATH. Runs once at startup, and again on-demand via
    POST /reload-data whenever invoices.csv is replaced (e.g. a CSV
    upload from the backend gateway) - without this, a new file on disk
    would only affect /predict/open-invoices' per-request invoice list,
    not the customer-history features baked in at startup.
    """

    global artifacts
    global shap_artifacts

    # --------------------------------------------------------
    # Load Model 1
    # --------------------------------------------------------

    artifacts = Model1Artifacts(
        MODEL_DIR
    )

    # --------------------------------------------------------
    # Load historical invoice data
    # --------------------------------------------------------

    raw = pd.read_csv(
        RAW_INVOICES_PATH
    )

    raw["issue_date"] = pd.to_datetime(
        raw["issue_date"]
    )

    # --------------------------------------------------------
    # Build customer history
    # --------------------------------------------------------

    closed_history = raw[
        raw["status"] == "closed"
    ].copy()

    artifacts.refresh_customer_stats(
        closed_history
    )

    # --------------------------------------------------------
    # Initialize Model 5
    #
    # IMPORTANT:
    #
    # We pass the SAME Model1Artifacts object.
    #
    # Therefore Model 5 uses:
    #   - same preprocessor
    #   - same RandomForest
    #   - same feature configuration
    #   - same customer statistics
    #
    # Nothing is retrained or reloaded.
    # --------------------------------------------------------

    shap_artifacts = Model5Artifacts(
        artifacts
    )


@app.on_event("startup")
def _startup():
    load_models()


@app.post("/reload-data")
def reload_data():
    """
    Re-runs load_models() against whatever is currently at
    RAW_INVOICES_PATH. Call this after replacing invoices.csv on disk -
    otherwise customer-history features stay frozen from server startup.
    """
    load_models()
    raw = pd.read_csv(RAW_INVOICES_PATH)
    return {
        "status": "reloaded",
        "row_count": len(raw),
        "customer_count": raw["cust_number"].nunique(),
    }


# ============================================================
# REQUEST / RESPONSE SCHEMAS
# ============================================================

class InvoiceInput(BaseModel):
    invoice_id: str
    cust_number: str
    sector: str
    invoice_amount: float
    payment_term_days: int
    issue_date: date


class NarrateRequest(BaseModel):
    invoice_id: str
    language: str = DEFAULT_LANGUAGE


class PredictionOutput(BaseModel):
    invoice_id: str
    customer_id: str
    p10_payment_days: int
    p50_payment_days: int
    p90_payment_days: int
    confidence: Literal[
        "normal",
        "low",
    ]


class SimulateRequest(BaseModel):
    predictions: list[dict]
    opening_cash: float
    daily_expense: float
    horizon_days: int = 90
    n_sims: int = 3000
    min_buffer: float = 0


class RiskGraphRequest(BaseModel):
    opening_cash: float
    daily_expense: float
    horizon_days: int = 90
    min_buffer: float = 0
    max_focus_invoices: int | None = 12


class RecommendationsRequest(BaseModel):
    overdue_invoice_value: float


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "model_loaded": artifacts is not None,
        "shap_loaded": shap_artifacts is not None,
    }


# ============================================================
# MODEL 2 - MONTE CARLO CASH-FLOW SIMULATION
# ============================================================

@app.post("/simulate")
def simulate(request: SimulateRequest):
    """
    Runs Model 2's Monte Carlo forecast over a caller-supplied predictions
    frame - the caller (the Node gateway) may pass a shocked copy of
    /predict/open-invoices' output for what-if scenarios, so this endpoint
    never re-reads invoices.csv itself.
    """
    predictions = pd.DataFrame(request.predictions)

    forecast, summary = simulate_cashflow(
        predictions,
        opening_cash=request.opening_cash,
        daily_expense=request.daily_expense,
        horizon_days=request.horizon_days,
        n_sims=request.n_sims,
        min_buffer=request.min_buffer,
    )

    return {
        "forecast": forecast.to_dict("records"),
        "summary": summary,
    }


# ============================================================
# MODEL 7 - RECOVERY OPTION RANKING
# ============================================================

@app.post("/recommendations")
def recommendations(request: RecommendationsRequest):
    return rank_recovery_options({"overdue_invoice_value": request.overdue_invoice_value})


# ============================================================
# MODEL 8 - CAUSAL RISK GRAPH
# ============================================================

@app.post("/risk-graph")
def risk_graph(request: RiskGraphRequest):
    return build_risk_graph(
        opening_cash=request.opening_cash,
        daily_expense=request.daily_expense,
        horizon_days=request.horizon_days,
        raw_invoices_path=str(RAW_INVOICES_PATH),
        model1_api_url=f"http://127.0.0.1:{os.environ.get('PORT', 8000)}/predict/open-invoices",
        model3_api_url=MODEL3_URL,
        model5_api_url=f"http://127.0.0.1:{os.environ.get('PORT', 8000)}/explain/invoices",
        min_buffer=request.min_buffer,
        scope="overdue",
        max_focus_invoices=request.max_focus_invoices,
    )


# ============================================================
# MODEL 1
# ============================================================

@app.post(
    "/predict/invoices",
    response_model=list[PredictionOutput],
)
def predict_invoices(
    invoices: list[InvoiceInput],
):
    """
    Predict P10/P50/P90 days-to-payment for arbitrary invoices.

    This endpoint can be used for:
        - new invoices
        - corrected OCR invoices
        - batch invoices
        - live correction demo
    """

    if artifacts is None:
        raise HTTPException(
            status_code=503,
            detail="model not loaded yet",
        )

    df = pd.DataFrame(
        [
            inv.model_dump()
            for inv in invoices
        ]
    )

    df["issue_date"] = pd.to_datetime(
        df["issue_date"]
    )

    result = predict_payment_window(
        df,
        artifacts,
    )

    return [
        PredictionOutput(
            invoice_id=row.invoice_id,
            customer_id=row.cust_number,
            p10_payment_days=row.predicted_days_p10,
            p50_payment_days=row.predicted_days_p50,
            p90_payment_days=row.predicted_days_p90,
            confidence=row.confidence,
        )
        for row in result.itertuples()
    ]


# ============================================================
# MODEL 1 - OPEN INVOICES
# ============================================================

@app.get(
    "/predict/open-invoices",
    response_model=list[PredictionOutput],
)
def predict_open_invoices():
    """
    Predict every currently open/disputed_open invoice.

    Model 2 can call this endpoint to obtain the current
    outstanding receivables forecast.
    """

    if artifacts is None:
        raise HTTPException(
            status_code=503,
            detail="model not loaded yet",
        )

    raw = pd.read_csv(
        RAW_INVOICES_PATH
    )

    raw["issue_date"] = pd.to_datetime(
        raw["issue_date"]
    )

    open_invoices = raw[
        raw["status"].isin(
            [
                "open",
                "disputed_open",
            ]
        )
    ].copy()

    result = predict_payment_window(
        open_invoices,
        artifacts,
    )

    return [
        PredictionOutput(
            invoice_id=row.invoice_id,
            customer_id=row.cust_number,
            p10_payment_days=row.predicted_days_p10,
            p50_payment_days=row.predicted_days_p50,
            p90_payment_days=row.predicted_days_p90,
            confidence=row.confidence,
        )
        for row in result.itertuples()
    ]


# ============================================================
# REFRESH CUSTOMER HISTORY
# ============================================================

@app.post(
    "/admin/refresh-customer-stats"
)
def refresh_customer_stats():
    """
    Rebuild customer payment history after invoices are marked
    paid/closed.

    Model 5 automatically uses the refreshed Model1Artifacts
    because it references the same object.
    """

    if artifacts is None:
        raise HTTPException(
            status_code=503,
            detail="model not loaded yet",
        )

    raw = pd.read_csv(
        RAW_INVOICES_PATH
    )

    raw["issue_date"] = pd.to_datetime(
        raw["issue_date"]
    )

    closed_history = raw[
        raw["status"] == "closed"
    ].copy()

    artifacts.refresh_customer_stats(
        closed_history
    )

    return {
        "status": "refreshed",
        "customers": len(
            artifacts.customer_stats
        ),
    }


# ============================================================
# MODEL 5 - SHAP EXPLANATION
# ============================================================

@app.post(
    "/explain/invoices"
)
def explain_invoices(
    invoices: list[InvoiceInput],
):
    """
    Generate a complete numerical SHAP explanation for
    each invoice.

    The endpoint returns:

        invoice_id
        base_value
        predicted_value
        contributions[]

    Every contribution contains:

        feature
        value
        shap_value
        direction

    No top-N truncation is performed.
    """

    if artifacts is None:
        raise HTTPException(
            status_code=503,
            detail="model not loaded yet",
        )

    if shap_artifacts is None:
        raise HTTPException(
            status_code=503,
            detail="SHAP explainer not loaded yet",
        )

    # Convert Pydantic objects to DataFrame.
    df = pd.DataFrame(
        [
            inv.model_dump()
            for inv in invoices
        ]
    )

    df["issue_date"] = pd.to_datetime(
        df["issue_date"]
    )

    # Model 5 uses the SAME Model 1 artifacts.
    explanations = explain_invoice(
        df,
        shap_artifacts,
    )

    return explanations


# ============================================================
# MODEL 6 - LLM NARRATION
# ============================================================

@app.get("/narrate/languages")
def narrate_languages():
    """Languages /narrate/invoice can render an explanation in."""
    return {
        "available": narrate_explanation is not None,
        "default": DEFAULT_LANGUAGE,
        "languages": SUPPORTED_LANGUAGES,
    }


@app.post("/narrate/invoice")
def narrate_invoice_endpoint(request: NarrateRequest):
    """
    Plain-language explanation of ONE invoice's prediction.

    Chains Model 1 (for the confidence flag) and Model 5 (for the SHAP
    contributions) and hands both to Model 6. The LLM sees only those
    numbers - it never reads the invoice database or the model itself, and
    a numeric-fidelity check in model6_explanation.py rejects any response
    that mentions a number it was not given.

    Per-invoice and on demand by design: narration is the one place in this
    pipeline that costs an external API call, so it is never run in bulk
    across the whole invoice list.
    """

    if narrate_explanation is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model 6 narration is unavailable - check GROQ_API_KEY is set "
                f"in AI_models/.env. Import error: {MODEL6_IMPORT_ERROR}"
            ),
        )

    if artifacts is None or shap_artifacts is None:
        raise HTTPException(status_code=503, detail="model not loaded yet")

    raw = pd.read_csv(RAW_INVOICES_PATH)
    match = raw[raw["invoice_id"] == request.invoice_id]

    if match.empty:
        raise HTTPException(
            status_code=404,
            detail=f"invoice {request.invoice_id} not found in {RAW_INVOICES_PATH.name}",
        )

    invoice = match.head(1).copy()
    invoice["issue_date"] = pd.to_datetime(invoice["issue_date"])

    explanation = explain_invoice(invoice, shap_artifacts)[0]
    confidence = predict_payment_window(invoice, artifacts)["confidence"].iloc[0]

    result = narrate_explanation(
        explanation,
        confidence=confidence,
        language=request.language,
    )

    return {
        "invoice_id": request.invoice_id,
        "confidence": confidence,
        # "llm" vs "fallback" is surfaced deliberately - a demo showing
        # deterministic template text should say so rather than pass it off
        # as model-generated prose.
        **result,
    }


# ============================================================
# MODEL 4 - OCR EXTRACTION
# ============================================================

@app.post(
    "/extract/invoice"
)
async def extract_invoice_endpoint(
    file: UploadFile,
):
    """
    Upload a PDF or image invoice.

    Returns extracted invoice fields and confidence scores.

    The frontend can allow the user to correct the extracted
    values and then send the corrected invoice to:

        /predict/invoices

    and/or:

        /explain/invoices
    """

    allowed_ext = {
        "pdf",
        "png",
        "jpg",
        "jpeg",
    }

    ext = (
        (file.filename or "")
        .lower()
        .rsplit(".", 1)[-1]
    )

    if ext not in allowed_ext:
        raise HTTPException(
            status_code=400,
            detail=f"unsupported file type: .{ext}",
        )

    file_bytes = await file.read()

    try:

        result = extract_invoice(
            file_bytes,
            file.filename,
        )

    except Exception as e:

        raise HTTPException(
            status_code=422,
            detail=f"extraction failed: {e}",
        )

    return result