"""
Model 1 inference logic - shared between the training notebook and the FastAPI serving layer.

This module has NO training code. It only knows how to:

  1. Build customer-history features for a NEW invoice given past closed invoices.
  2. Build the exact model matrix used by the trained model.
  3. Run the saved RF quantile-forest model to get P10/P50/P90 days-to-payment.
  4. Apply the cold-start / sector-prior fallback consistently.

Keeping this in one file means Model 1 prediction and Model 5 SHAP explanation
use exactly the same feature-building logic.
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd


MIN_HISTORY_FOR_CONFIDENCE = 3

# Shrinkage strength for customers with SOME but not enough history. A
# customer with a single closed invoice used to have that one observation
# treated as fully representative of their behaviour; now it is blended
# toward the sector prior with weight count / (count + k). With k = 3 that
# is 25% own-history at 1 invoice and 40% at 2, rising to full weight once
# the customer clears MIN_HISTORY_FOR_CONFIDENCE.
#
# Applied ONLY to sub-threshold customers, deliberately: the model was
# trained on un-shrunk features, so shrinking established customers too
# would introduce train/serve skew for the cases the model already handles
# well. This narrows the gap only where the input was demonstrably noisy.
COLD_START_SHRINKAGE_K = 3.0

# Cold-start P10/P90 come from the spread of the trained forest's trees,
# which measures uncertainty for a customer the model has actually seen.
# When the features are really sector averages standing in for an unknown
# customer, the true uncertainty is wider than that spread implies, so the
# interval (not just the "low" confidence label) has to say so.
#
# 1.6 is a judgement call, not a calibrated figure - there is no held-out
# set of cold-start invoices in this dataset to fit it against. Revisit it
# once real cold-start outcomes exist to measure coverage on.
COLD_START_INTERVAL_WIDENING = 1.6

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

QUANTILES = {
    "p10": 0.10,
    "p50": 0.50,
    "p90": 0.90,
}


class Model1Artifacts:
    """
    Loaded once at API startup and reused across requests.
    """

    def __init__(self, model_dir: Path):
        self.preprocessor = joblib.load(
            model_dir / "model1_preprocessor.joblib"
        )

        self.rf_model = joblib.load(
            model_dir / "model1_rf_quantile.joblib"
        )

        self.sector_priors = joblib.load(
            model_dir / "model1_sector_priors.joblib"
        )

        self.global_prior = joblib.load(
            model_dir / "model1_global_prior.joblib"
        )

        # Filled by refresh_customer_stats()
        self.customer_stats = None

        # Per-sector spread of days-to-payment, used as the stand-in for
        # customer_payment_std when a customer has too little history to
        # have a meaningful one of their own. Unlike the mean priors above
        # these are not saved artifacts - they are recomputed from live
        # closed history on every refresh, so they track the current data.
        self.sector_std_priors = {}
        self.global_std_prior = 0.0

    def refresh_customer_stats(self, closed_history_df: pd.DataFrame):
        """
        Rebuild the per-customer history lookup table from all currently
        closed invoices.

        This should be called:
          - at API startup
          - after new invoices are marked as closed/paid
        """

        # A brand-new or very small business may have zero closed invoices
        # yet, and "days_to_payment" is an optional column (config.py's
        # REQUIRED_INVOICE_COLUMNS doesn't demand it) - a CSV that never
        # tracked it, or that has no closed rows at all, would otherwise
        # crash the whole reload with a KeyError instead of just letting
        # every customer fall back to the sector/global prior via
        # is_cold_start in build_model_matrix.
        if closed_history_df.empty or "days_to_payment" not in closed_history_df.columns:
            self.customer_stats = pd.DataFrame(columns=[
                "customer_avg_payment_days", "customer_recent_avg_payment_days",
                "customer_payment_std", "previous_payment_days",
                "customer_invoice_count", "payment_behavior_trend",
            ]).rename_axis("cust_number")
            return

        closed_history_df = closed_history_df.sort_values(
            ["cust_number", "issue_date"]
        )

        stats = closed_history_df.groupby("cust_number").agg(
            customer_avg_payment_days=(
                "days_to_payment",
                "mean",
            ),
            customer_recent_avg_payment_days=(
                "days_to_payment",
                lambda x: x.tail(3).mean(),
            ),
            customer_payment_std=(
                "days_to_payment",
                "std",
            ),
            previous_payment_days=(
                "days_to_payment",
                "last",
            ),
            customer_invoice_count=(
                "days_to_payment",
                "count",
            ),
        )

        stats["payment_behavior_trend"] = (
            stats["customer_recent_avg_payment_days"]
            - stats["customer_avg_payment_days"]
        )

        self.customer_stats = stats

        # Sector spread priors. A sector needs at least two closed invoices
        # for std() to return anything but NaN, hence the dropna.
        if "sector" in closed_history_df.columns:
            self.sector_std_priors = (
                closed_history_df.groupby("sector")["days_to_payment"]
                .std()
                .dropna()
                .to_dict()
            )

        global_std = closed_history_df["days_to_payment"].std()
        self.global_std_prior = (
            float(global_std) if pd.notna(global_std) else 0.0
        )


def build_model_matrix(
    invoice_rows: pd.DataFrame,
    artifacts: Model1Artifacts,
):
    """
    Build the exact feature frame and transformed matrix used by Model 1.

    Parameters
    ----------
    invoice_rows:
        DataFrame containing NEW invoices. At minimum:

            invoice_id
            cust_number
            sector
            invoice_amount
            payment_term_days
            issue_date

    artifacts:
        Loaded Model1Artifacts instance.

    Returns
    -------
    frame:
        DataFrame containing the original invoice information plus all
        engineered customer-history features.

    X:
        Preprocessed matrix actually passed into the RandomForest model.

    IMPORTANT:
    This function is shared by Model 1 prediction and Model 5 SHAP.
    """

    if artifacts.customer_stats is None:
        raise RuntimeError(
            "call artifacts.refresh_customer_stats(...) before building "
            "the model matrix"
        )

    # Make a copy so the caller's DataFrame is never modified.
    invoice_rows = invoice_rows.copy()

    # Ensure dates are in datetime format.
    if "issue_date" in invoice_rows.columns:
        invoice_rows["issue_date"] = pd.to_datetime(
            invoice_rows["issue_date"]
        )

    # ---------------------------------------------------------
    # 1. Attach historical customer statistics
    # ---------------------------------------------------------

    frame = invoice_rows.merge(
        artifacts.customer_stats,
        on="cust_number",
        how="left",
        suffixes=("", "_hist"),
    )

    # ---------------------------------------------------------
    # 2. Determine cold-start status
    # ---------------------------------------------------------

    frame["is_cold_start"] = (
        frame["customer_invoice_count"].isna()
        | (
            frame["customer_invoice_count"]
            < MIN_HISTORY_FOR_CONFIDENCE
        )
    )

    # ---------------------------------------------------------
    # 3. Sector/global fallback
    # ---------------------------------------------------------

    sector_fill = (
        frame["sector"]
        .map(artifacts.sector_priors)
        .fillna(artifacts.global_prior)
    )

    history_columns = [
        "customer_avg_payment_days",
        "customer_recent_avg_payment_days",
        "previous_payment_days",
    ]

    # No history at all - the prior is all there is to go on.
    for col in history_columns:
        frame[col] = frame[col].fillna(sector_fill)

    # Some history, but not enough to trust on its own: blend toward the
    # sector prior rather than treating one or two observations as the
    # customer's settled behaviour. See COLD_START_SHRINKAGE_K.
    observed_count = frame["customer_invoice_count"].fillna(0)
    thin_history = (observed_count > 0) & (
        observed_count < MIN_HISTORY_FOR_CONFIDENCE
    )

    if thin_history.any():
        own_weight = observed_count / (observed_count + COLD_START_SHRINKAGE_K)
        for col in history_columns:
            blended = (
                own_weight * frame[col] + (1 - own_weight) * sector_fill
            )
            frame.loc[thin_history, col] = blended[thin_history]

    # Standard deviation used to be filled with zero, which reads to the
    # model as "this customer pays like clockwork" - the most confident
    # signal available, handed to the customer we know least about. The
    # sector's own spread is the honest stand-in. Note this also catches
    # customers with exactly one closed invoice, whose std() is NaN.
    sector_std_fill = (
        frame["sector"]
        .map(artifacts.sector_std_priors)
        .fillna(artifacts.global_std_prior)
    )
    frame["customer_payment_std"] = (
        frame["customer_payment_std"].fillna(sector_std_fill)
    )

    # No recent-vs-average movement means no observed trend.
    frame["payment_behavior_trend"] = (
        frame["payment_behavior_trend"].fillna(0)
    )

    # No history means zero observed invoices.
    frame["customer_invoice_count"] = (
        frame["customer_invoice_count"].fillna(0)
    )

    # ---------------------------------------------------------
    # 4. Build exact model input
    # ---------------------------------------------------------

    X = artifacts.preprocessor.transform(
        frame[FEATURE_COLUMNS]
    )

    return frame, X


def rf_quantile_predict(
    rf_model,
    X,
    quantiles=QUANTILES,
) -> pd.DataFrame:
    """
    Generate P10/P50/P90 from the distribution of predictions
    across individual Random Forest trees.

    X must already be preprocessed.
    """

    all_tree_preds = np.array(
        [
            tree.predict(X)
            for tree in rf_model.estimators_
        ]
    )

    percentiles = np.percentile(
        all_tree_preds,
        [q * 100 for q in quantiles.values()],
        axis=0,
    )

    return pd.DataFrame(
        percentiles.T,
        columns=list(quantiles.keys()),
    )


def predict_payment_window(
    invoice_rows: pd.DataFrame,
    artifacts: Model1Artifacts,
) -> pd.DataFrame:
    """
    Predict P10/P50/P90 days-to-payment for one or more invoices.

    Historical features are generated automatically from
    artifacts.customer_stats.
    """

    frame, X = build_model_matrix(
        invoice_rows,
        artifacts,
    )

    preds = rf_quantile_predict(
        artifacts.rf_model,
        X,
    )

    out = frame[
        [
            "invoice_id",
            "cust_number",
            "issue_date",
        ]
    ].copy()

    p10 = preds["p10"].values
    p50 = preds["p50"].values
    p90 = preds["p90"].values

    # Widen the interval where the features were priors rather than this
    # customer's own history, so the band reflects that uncertainty instead
    # of only the "low" confidence label doing so. P50 is left alone - the
    # central estimate is the model's best guess either way; it is the
    # confidence around it that was overstated.
    is_cold_start = frame["is_cold_start"].to_numpy()
    p10 = np.where(
        is_cold_start,
        p50 - (p50 - p10) * COLD_START_INTERVAL_WIDENING,
        p10,
    )
    p90 = np.where(
        is_cold_start,
        p50 + (p90 - p50) * COLD_START_INTERVAL_WIDENING,
        p90,
    )
    # An invoice cannot be paid before it is issued.
    p10 = np.clip(p10, 0, None)

    out["predicted_days_p10"] = (
        np.round(p10)
        .astype(int)
    )

    out["predicted_days_p50"] = (
        np.round(p50)
        .astype(int)
    )

    out["predicted_days_p90"] = (
        np.round(p90)
        .astype(int)
    )

    out["confidence"] = np.where(
        frame["is_cold_start"],
        "low",
        "normal",
    )

    return out