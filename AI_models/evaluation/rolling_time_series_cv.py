"""
Rolling-origin (expanding-window) time-series cross-validation for Model 1.

The single fixed train/validation/test split used everywhere else in this
project (notebooks 02/03, model1_inference.py) answers "how good is the
model on THIS one split." It cannot answer "would this result hold up if the
split had landed a few months earlier or later" - that needs multiple splits.

This script retrains fresh copies of the exact same pipeline (median-impute +
one-hot -> RandomForestRegressor(n_estimators=200, random_state=42)) across
several expanding-window folds carved ONLY out of the train+validation region
(issue_date < 2026-02-15). The held-out test set is never touched here - it
stays reserved for the one-time evaluation in evaluate_test_set.py. Each fold:

    train  = everything before the fold's validation window
    validate on a fixed 3-month window
    (sector/global priors for cold-start fill are computed from that fold's
    own training data only, exactly like notebook 03 - never from the fold's
    validation window)

Run:
    cd AI_models && .venv/Scripts/python evaluation/rolling_time_series_cv.py
"""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).resolve().parent.parent

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
NUMERIC_FEATURES = [c for c in FEATURE_COLUMNS if c != "sector"]
TARGET = "days_to_payment"

# Non-overlapping 3-month validation windows, each with an expanding training
# window that starts at the dataset's actual first invoice (2024-02-14).
# Kept entirely inside train+val (issue_date < 2026-02-15) so the reserved
# test set is never opened by this script.
FOLDS = [
    ("2025-02-01", "2025-04-30"),
    ("2025-05-01", "2025-07-31"),
    ("2025-08-01", "2025-10-31"),
    ("2025-11-01", "2026-01-31"),
]


def apply_sector_prior(frame: pd.DataFrame, sector_priors: pd.Series, global_prior: float) -> pd.DataFrame:
    frame = frame.copy()
    sector_fill = frame["sector"].map(sector_priors).fillna(global_prior)
    for col in ["customer_avg_payment_days", "customer_recent_avg_payment_days", "previous_payment_days"]:
        frame[col] = frame[col].fillna(sector_fill)
    frame["customer_payment_std"] = frame["customer_payment_std"].fillna(0)
    frame["payment_behavior_trend"] = frame["payment_behavior_trend"].fillna(0)
    return frame


def run_fold(df: pd.DataFrame, val_start: str, val_end: str) -> dict:
    train_df = df[df["issue_date"] < val_start].copy()
    val_df = df[(df["issue_date"] >= val_start) & (df["issue_date"] <= val_end)].copy()

    sector_priors = train_df.groupby("sector")[TARGET].mean()
    global_prior = float(train_df[TARGET].mean())

    train_df = apply_sector_prior(train_df, sector_priors, global_prior)
    val_df = apply_sector_prior(val_df, sector_priors, global_prior)

    preprocessor = ColumnTransformer([
        ("num", Pipeline([("imputer", SimpleImputer(strategy="median"))]), NUMERIC_FEATURES),
        ("cat", Pipeline([("encoder", OneHotEncoder(handle_unknown="ignore"))]), ["sector"]),
    ])
    X_train = preprocessor.fit_transform(train_df[FEATURE_COLUMNS])
    X_val = preprocessor.transform(val_df[FEATURE_COLUMNS])

    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, train_df[TARGET])
    point_pred = model.predict(X_val)

    all_tree_preds = np.array([tree.predict(X_val) for tree in model.estimators_])
    p10, p90 = np.percentile(all_tree_preds, [10, 90], axis=0)

    y_val = val_df[TARGET].values
    naive_pred = val_df["payment_term_days"].values
    # customer_avg_payment_days is already sector-prior-filled above, exactly
    # like the "customer's own running average" baseline used everywhere else.
    avg_pred = val_df["customer_avg_payment_days"].values

    return {
        "val_window": f"{val_start} -> {val_end}",
        "n_train": len(train_df),
        "n_val": len(val_df),
        "mae": mean_absolute_error(y_val, point_pred),
        "rmse": mean_squared_error(y_val, point_pred) ** 0.5,
        "coverage_p10_p90": float(((y_val >= p10) & (y_val <= p90)).mean()),
        "naive_due_date_mae": mean_absolute_error(y_val, naive_pred),
        "customer_avg_mae": mean_absolute_error(y_val, avg_pred),
    }


def main():
    df = pd.read_csv(BASE_DIR / "data" / "processed" / "model1_features.csv")
    df["issue_date"] = pd.to_datetime(df["issue_date"])
    df = df[df["issue_date"] < "2026-02-15"]  # train+val region only - test stays untouched

    rows = [run_fold(df, start, end) for start, end in FOLDS]
    report = pd.DataFrame(rows)

    pd.set_option("display.width", 200)
    print(report.to_string(index=False))
    print()
    print(f"MAE across folds:      mean {report['mae'].mean():.3f}  std {report['mae'].std():.3f}  "
          f"min {report['mae'].min():.3f}  max {report['mae'].max():.3f}")
    print(f"Coverage across folds: mean {report['coverage_p10_p90'].mean() * 100:.1f}%  "
          f"std {report['coverage_p10_p90'].std() * 100:.1f}pp")
    improvement = (report["naive_due_date_mae"] - report["mae"]) / report["naive_due_date_mae"] * 100
    print(f"Improvement over naive due-date baseline per fold: "
          f"{', '.join(f'{v:.0f}%' for v in improvement)}  "
          f"(mean {improvement.mean():.0f}%)")
    vs_avg = (report["customer_avg_mae"] - report["mae"]) / report["customer_avg_mae"] * 100
    print(f"Improvement over customer's-own-average baseline per fold: "
          f"{', '.join(f'{v:.0f}%' for v in vs_avg)}  "
          f"(mean {vs_avg.mean():.0f}%) - the harder, more honest comparison.")

    out_path = Path(__file__).resolve().parent / "model1_rolling_cv_report.csv"
    report.to_csv(out_path, index=False)
    print(f"\nwrote {out_path}")


if __name__ == "__main__":
    main()
