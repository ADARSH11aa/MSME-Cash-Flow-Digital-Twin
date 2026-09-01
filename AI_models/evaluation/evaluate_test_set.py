"""
Final, one-time evaluation of Model 1 on the held-out TEST split.

Notebook 02/03 both carve out train_df / validation_df / test_df on the same
issue_date cutoffs, but only ever scored validation_df - test_df was built
(X_test / X_test_p exist in both notebooks) and then never touched again. All
previously reported numbers (7.27 MAE, 80% coverage, etc.) are validation-set
numbers, not test-set numbers.

This script closes that gap: it loads the ALREADY-SAVED, ALREADY-SHIPPED
model1_*.joblib artifacts (the exact model in models/, trained on train_df
only) and scores them on test_df exactly once, using the identical
preprocessing recipe notebook 03 used for validation (sector-prior fill
computed from train_df, computed once and saved - never refit here).

No model is retrained and no artifact is touched. Run this once, record the
result, and do not re-run it against a changed test set - that would turn a
held-out test set into a second validation set through repeated peeking.

Run:
    cd AI_models && .venv/Scripts/python evaluation/evaluate_test_set.py
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_pinball_loss, mean_squared_error

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
OUT_DIR = Path(__file__).resolve().parent

FEATURE_COLUMNS = [
    "customer_avg_payment_days",
    "customer_recent_avg_payment_days",
    "customer_invoice_count",
    "customer_payment_std",
    "payment_behavior_trend",
    "previous_payment_days",
    "invoice_amount",
    "payment_term_days",
    "sector",
]

# Same cutoffs as notebook 02/03 - do not change these to "improve" the split.
TRAIN_END = "2025-10-05"
VAL_START, VAL_END = "2025-10-06", "2026-02-14"
TEST_START = "2026-02-15"

MIN_HISTORY_FOR_CONFIDENCE = 3
QUANTILES = {"p10": 0.10, "p50": 0.50, "p90": 0.90}


def apply_sector_prior(frame: pd.DataFrame, sector_priors: pd.Series, global_prior: float) -> pd.DataFrame:
    """Identical to notebook 03's apply_sector_prior. sector_priors/global_prior
    come from the saved artifacts, i.e. computed on train_df only - never refit
    here, so nothing about the test set leaks into the fill values."""
    frame = frame.copy()
    sector_fill = frame["sector"].map(sector_priors).fillna(global_prior)
    for col in ["customer_avg_payment_days", "customer_recent_avg_payment_days", "previous_payment_days"]:
        frame[col] = frame[col].fillna(sector_fill)
    frame["customer_payment_std"] = frame["customer_payment_std"].fillna(0)
    frame["payment_behavior_trend"] = frame["payment_behavior_trend"].fillna(0)
    return frame


def rf_quantile_predict(rf_model, X) -> pd.DataFrame:
    all_tree_preds = np.array([tree.predict(X) for tree in rf_model.estimators_])
    percentiles = np.percentile(all_tree_preds, [q * 100 for q in QUANTILES.values()], axis=0)
    return pd.DataFrame(percentiles.T, columns=list(QUANTILES.keys()))


def score(name: str, df: pd.DataFrame, preds: pd.DataFrame, y: pd.Series) -> dict:
    mae = mean_absolute_error(y, preds["p50"])
    rmse = mean_squared_error(y, preds["p50"]) ** 0.5
    coverage = ((y.values >= preds["p10"]) & (y.values <= preds["p90"])).mean()
    bias = float((preds["p50"].values - y.values).mean())
    pinball = {
        q: mean_pinball_loss(y, preds[q], alpha=alpha)
        for q, alpha in QUANTILES.items()
    }
    return {
        "split": name,
        "n": len(df),
        "mae": mae,
        "rmse": rmse,
        "coverage_p10_p90": coverage,
        "bias": bias,
        **{f"pinball_{q}": v for q, v in pinball.items()},
    }


def main():
    df = pd.read_csv(BASE_DIR / "data" / "processed" / "model1_features.csv")
    df["issue_date"] = pd.to_datetime(df["issue_date"])

    train_df = df[df["issue_date"] <= TRAIN_END].copy()
    val_df = df[(df["issue_date"] >= VAL_START) & (df["issue_date"] <= VAL_END)].copy()
    test_df = df[df["issue_date"] >= TEST_START].copy()

    preprocessor = joblib.load(MODEL_DIR / "model1_preprocessor.joblib")
    rf_model = joblib.load(MODEL_DIR / "model1_rf_quantile.joblib")
    sector_priors = joblib.load(MODEL_DIR / "model1_sector_priors.joblib")
    global_prior = float(joblib.load(MODEL_DIR / "model1_global_prior.joblib"))

    naive_mae = {}
    avg_mae = {}
    results = []
    for name, split_df in (("train (sanity check only)", train_df), ("validation", val_df), ("test (FINAL, one-time)", test_df)):
        filled = apply_sector_prior(split_df, sector_priors, global_prior)
        X = preprocessor.transform(filled[FEATURE_COLUMNS])
        preds = rf_quantile_predict(rf_model, X)
        y = filled["days_to_payment"]
        results.append(score(name, filled, preds, y))

        naive_pred = filled["payment_term_days"]
        avg_pred = filled["customer_avg_payment_days"]  # already sector-prior-filled above
        naive_mae[name] = mean_absolute_error(y, naive_pred)
        avg_mae[name] = mean_absolute_error(y, avg_pred)

    report = pd.DataFrame(results).set_index("split")
    report["naive_due_date_mae"] = pd.Series(naive_mae)
    report["customer_avg_mae"] = pd.Series(avg_mae)

    pd.set_option("display.float_format", lambda v: f"{v:.4f}")
    print(report.T)
    print()
    print("Test vs. validation MAE gap:", f"{report.loc['test (FINAL, one-time)', 'mae'] - report.loc['validation', 'mae']:+.3f} days")
    print("Test vs. validation coverage gap:", f"{(report.loc['test (FINAL, one-time)', 'coverage_p10_p90'] - report.loc['validation', 'coverage_p10_p90']) * 100:+.1f} pp")

    out_path = OUT_DIR / "model1_test_set_report.csv"
    report.to_csv(out_path)
    print(f"\nwrote {out_path}")
    print(
        "\nNOTE: this test set has now been scored. Re-running this script after "
        "changing the model or features turns the test set into a second "
        "validation set - retrain, then request a fresh, final look instead of "
        "iterating against this number."
    )


if __name__ == "__main__":
    main()
