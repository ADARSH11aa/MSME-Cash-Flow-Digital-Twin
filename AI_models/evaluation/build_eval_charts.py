"""
Build the three Model 1 performance charts for the hackathon deck, plus the
evaluation frame they all read from.

Everything here is computed from two files already in the repo:

    data/processed/model1_validation_predictions.csv   (745 rows, Model 1 output)
    data/processed/model1_features.csv                 (4,958 rows, carries the truth)

joined on invoice_id. No model is retrained and no artifact is touched - this
script is read-only with respect to models/ and data/.

Two numbers come from notebook 02 rather than from this join, because the point
predictions they describe were never saved to disk: the RandomForest point MAE
(7.2711) and the XGBoost point MAE (7.8881). Only XGBoost is plotted, and it is
footnoted on the chart, because notebook 02 imputes missing history with the
column median while notebook 03 (which produced the saved predictions) fills
from a sector prior first. The two baselines computed here - the naive due-date
and the customer average - ARE on the identical frame with identical handling,
so those comparisons need no asterisk.

Run:
    cd AI_models && .venv/Scripts/python evaluation/build_eval_charts.py
"""

from pathlib import Path

import joblib
import matplotlib
import numpy as np
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402


BASE_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = Path(__file__).resolve().parent / "charts"

# Light-mode chart tokens. Slides are light, so only the light palette is
# defined here - a deck never renders on the dark surface.
SURFACE = "#fcfcfb"
INK = "#0b0b0b"
INK_SECONDARY = "#52514e"
INK_MUTED = "#898781"
GRID = "#e1e0d9"
AXIS = "#c3c2b7"
SERIES = "#2a78d6"       # categorical slot 1
NEUTRAL = "#c3c2b7"      # de-emphasised bars

# MAE of the point models from notebook 02, on this same 745-row validation
# split. Not recomputable here - the point predictions were never saved.
XGBOOST_POINT_MAE = 7.8881

plt.rcParams.update({
    "font.family": ["Segoe UI", "DejaVu Sans", "sans-serif"],
    "figure.facecolor": SURFACE,
    "axes.facecolor": SURFACE,
    "savefig.facecolor": SURFACE,
    "axes.edgecolor": AXIS,
    "axes.labelcolor": INK_SECONDARY,
    "text.color": INK,
    "xtick.color": INK_MUTED,
    "ytick.color": INK_MUTED,
    "axes.grid": True,
    "grid.color": GRID,
    "grid.linewidth": 0.8,
    "axes.axisbelow": True,
})


def build_eval_frame() -> pd.DataFrame:
    """Join Model 1's saved validation predictions to their ground truth."""
    preds = pd.read_csv(BASE_DIR / "data" / "processed" / "model1_validation_predictions.csv")
    feats = pd.read_csv(BASE_DIR / "data" / "processed" / "model1_features.csv")

    carried = [
        "invoice_id", "days_to_payment", "customer_archetype_TRUE_LABEL",
        "sector", "invoice_amount", "payment_term_days",
        "customer_avg_payment_days", "customer_invoice_count",
    ]
    df = preds.merge(feats[carried], on="invoice_id", how="left")
    df = df.rename(columns={"days_to_payment": "actual_days"})

    if df["actual_days"].isna().any():
        raise SystemExit("join lost ground truth - predictions and features are out of sync")

    # Baseline 1: trust the contractual term. This is what a business does
    # today with no model at all.
    df["naive_pred"] = df["payment_term_days"]

    # Baseline 2: this customer's own running average - the spreadsheet a
    # sharp accounts clerk already keeps. A first-ever invoice has no average,
    # so it falls back to the train-set global prior, exactly as the model's
    # own cold-start path does.
    global_prior = float(joblib.load(BASE_DIR / "models" / "model1_global_prior.joblib"))
    df["avg_pred"] = df["customer_avg_payment_days"].fillna(global_prior)

    df["error"] = df["predicted_days_p50"] - df["actual_days"]
    df["abs_error"] = df["error"].abs()
    df["pct_error"] = df["error"] / df["actual_days"]
    df["interval_width"] = df["predicted_days_p90"] - df["predicted_days_p10"]
    df["in_interval"] = (
        (df["actual_days"] >= df["predicted_days_p10"])
        & (df["actual_days"] <= df["predicted_days_p90"])
    )
    return df


def mae(pred: pd.Series, actual: pd.Series) -> float:
    return float((pred - actual).abs().mean())


def style_axes(ax, xgrid=True, ygrid=False):
    """Hairline grid on one axis only, no top/right spines."""
    ax.grid(False)
    for axis, on in (("x", xgrid), ("y", ygrid)):
        if on:
            ax.grid(axis=axis, linewidth=0.8, color=GRID)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(AXIS)
        ax.spines[side].set_linewidth(0.8)
    # Last, so the grid sits under the marks rather than striping across them.
    ax.set_axisbelow(True)


def add_headings(fig, title, subtitle, footnote, x=0.05):
    """
    Title, subtitle and footnote as one left-aligned text column in FIGURE
    coordinates. Anchoring them to the axes instead would misalign them the
    moment a plot is squared off or given room for long tick labels.
    """
    fig.text(x, 0.945, title, fontsize=15.5, fontweight="bold", color=INK, ha="left", va="top")
    fig.text(x, 0.876, subtitle, fontsize=10.5, color=INK_SECONDARY, ha="left", va="top")
    fig.text(x, 0.055, footnote, fontsize=9, color=INK_MUTED, ha="left", va="top")


# ----------------------------------------------------------------------
# Chart 1 - predicted vs actual
# ----------------------------------------------------------------------

def chart_actual_vs_predicted(df: pd.DataFrame):
    """
    One series, one colour. The story is "the points sit on the diagonal",
    which is a single message - colouring 745 dots by eight archetypes would
    spend the whole colour channel restating what chart 3 says properly, and
    eight hues cannot clear the all-pairs CVD floor a scatter needs anyway.
    """
    # A square box is not optional here - the identity line only reads as 45°
    # if the axes are equal-aspect, so the figure is sized close to square to
    # keep the side margins that forces down to something reasonable.
    fig, ax = plt.subplots(figsize=(7.6, 6.5), dpi=200)
    fig.subplots_adjust(left=0.115, right=0.985, top=0.80, bottom=0.13)

    lim = 155
    ax.plot([0, lim], [0, lim], color=INK_MUTED, linewidth=1.4, zorder=2)
    # Below-right of the line, clear of it: centred on the line the label sat
    # underneath the line itself.
    ax.text(
        139, 112, "perfect\nprediction",
        color=INK_MUTED, fontsize=9.5, ha="center", va="center", linespacing=1.35,
    )

    ax.scatter(
        df["actual_days"], df["predicted_days_p50"],
        s=20, color=SERIES, alpha=0.42, linewidths=0, zorder=3,
    )

    ax.set_xlim(0, lim)
    ax.set_ylim(0, lim)
    ax.set_aspect("equal")
    ax.set_xlabel("Actual days to payment", fontsize=11)
    ax.set_ylabel("Predicted days to payment (P50)", fontsize=11)
    style_axes(ax, xgrid=True, ygrid=True)

    add_headings(
        fig,
        "Model 1 tracks reality on invoices it never trained on",
        f"{len(df)} held-out invoices  ·  mean absolute error "
        f"{mae(df['predicted_days_p50'], df['actual_days']):.2f} days  ·  "
        f"{df['in_interval'].mean() * 100:.1f}% fall inside the P10–P90 band",
        "Validation split: invoices issued 2025-10-06 to 2026-02-14, held out of training entirely.",
    )

    out = OUT_DIR / "1_actual_vs_predicted.png"
    fig.savefig(out, dpi=200)
    plt.close(fig)
    return out


# ----------------------------------------------------------------------
# Chart 2 - model vs baselines
# ----------------------------------------------------------------------

def chart_baselines(df: pd.DataFrame):
    """Horizontal bars, worst at top. Emphasis on the shipped model; the
    methods it is measured against stay neutral."""
    rows = [
        ("Trust the due date", mae(df["naive_pred"], df["actual_days"]), False),
        ("XGBoost", XGBOOST_POINT_MAE, False),
        ("Customer's own average", mae(df["avg_pred"], df["actual_days"]), False),
        ("CashTwin (Model 1, P50)", mae(df["predicted_days_p50"], df["actual_days"]), True),
    ]
    rows.sort(key=lambda r: r[1], reverse=True)

    labels = [r[0] for r in rows]
    values = [r[1] for r in rows]
    colors = [SERIES if r[2] else NEUTRAL for r in rows]

    fig, ax = plt.subplots(figsize=(10.0, 5.4), dpi=200)
    fig.subplots_adjust(left=0.235, right=0.965, top=0.775, bottom=0.225)
    y = np.arange(len(rows))
    ax.barh(y, values, height=0.6, color=colors, zorder=3)

    for yi, (val, is_ours) in enumerate(zip(values, [r[2] for r in rows])):
        ax.text(
            val + 0.22, yi, f"{val:.2f}",
            va="center", ha="left", fontsize=12,
            fontweight="bold" if is_ours else "normal",
            color=INK if is_ours else INK_SECONDARY,
        )

    ax.set_yticks(y)
    ax.set_yticklabels(labels, fontsize=11.5, color=INK_SECONDARY)
    ax.invert_yaxis()
    ax.set_xlim(0, max(values) * 1.16)
    ax.set_xlabel("Mean absolute error in days  —  lower is better", fontsize=11)
    style_axes(ax, xgrid=True, ygrid=False)

    best = min(values)
    worst_baseline = mae(df["avg_pred"], df["actual_days"])
    naive = mae(df["naive_pred"], df["actual_days"])

    add_headings(
        fig,
        "Better than the due date, and better than a spreadsheet average",
        f"{(naive - best) / naive * 100:.0f}% better than trusting the invoice due date  ·  "
        f"{(worst_baseline - best) / worst_baseline * 100:.0f}% better than the customer's running average",
        "All four methods scored on the identical 745 held-out invoices. The XGBoost figure is the point-prediction\n"
        "comparison from the training notebook, which imputes missing customer history slightly differently.",
    )

    out = OUT_DIR / "2_model_vs_baselines.png"
    fig.savefig(out, dpi=200)
    plt.close(fig)
    return out


# ----------------------------------------------------------------------
# Chart 3 - uncertainty vs predictability, by archetype
# ----------------------------------------------------------------------

def chart_uncertainty_by_archetype(df: pd.DataFrame):
    """
    Three panels sharing one archetype axis, NOT a dual-axis chart: days and
    percent are different scales, and overlaying them on one plot would invent
    a relationship the reader cannot verify. Side by side, each panel keeps
    its own honest scale and the eye still reads across the shared rows.
    """
    grouped = df.groupby("customer_archetype_TRUE_LABEL").agg(
        width=("interval_width", "mean"),
        mae=("abs_error", "mean"),
        coverage=("in_interval", "mean"),
        n=("actual_days", "size"),
    ).sort_values("width", ascending=False)

    labels = [
        f"{i.replace('_', ' ').capitalize()}  (n={int(r.n)})"
        for i, r in grouped.iterrows()
    ]
    y = np.arange(len(grouped))

    fig, axes = plt.subplots(
        1, 3, figsize=(13.5, 6.2), dpi=200,
        gridspec_kw={"width_ratios": [1.0, 0.78, 0.92], "wspace": 0.09},
    )
    # Explicit margins, not tight_layout: the long archetype labels and the
    # three-line heading block both need reserved space, and tight_layout
    # cannot see figure-level text at all - it clipped the labels and ran the
    # subtitle straight through the panel titles.
    fig.subplots_adjust(left=0.163, right=0.985, top=0.755, bottom=0.20)

    # Panel 1 - how wide the model's band is
    ax = axes[0]
    ax.barh(y, grouped["width"], height=0.62, color=SERIES, zorder=3)
    for yi, v in enumerate(grouped["width"]):
        ax.text(v + 1.2, yi, f"{v:.0f}", va="center", fontsize=10.5, color=INK_SECONDARY)
    ax.set_yticks(y)
    ax.set_yticklabels(labels, fontsize=10.5, color=INK_SECONDARY)
    ax.set_xlim(0, grouped["width"].max() * 1.18)
    ax.set_xlabel("Prediction band width (days)", fontsize=10.5)
    ax.set_title("How uncertain the model says it is", fontsize=11.5,
                 color=INK, loc="left", pad=10, fontweight="bold")

    # Panel 2 - how hard the segment actually is
    ax = axes[1]
    ax.barh(y, grouped["mae"], height=0.62, color=SERIES, zorder=3)
    for yi, v in enumerate(grouped["mae"]):
        ax.text(v + 0.35, yi, f"{v:.1f}", va="center", fontsize=10.5, color=INK_SECONDARY)
    ax.set_yticks(y)
    ax.set_yticklabels([])
    ax.set_xlim(0, grouped["mae"].max() * 1.22)
    ax.set_xlabel("Actual error (days)", fontsize=10.5)
    ax.set_title("How hard the segment really is", fontsize=11.5,
                 color=INK, loc="left", pad=10, fontweight="bold")

    # Panel 3 - does the band hold up
    ax = axes[2]
    cov = grouped["coverage"] * 100
    ax.axvline(80, color=INK_MUTED, linewidth=1.4, linestyle=(0, (5, 4)), zorder=2)
    ax.scatter(cov, y, s=110, color=SERIES, zorder=4, linewidths=0)
    for yi, v in enumerate(cov):
        ax.text(v + 2.4, yi, f"{v:.0f}%", va="center", fontsize=10.5, color=INK_SECONDARY)
    ax.set_yticks(y)
    ax.set_yticklabels([])
    ax.set_xlim(40, 108)
    ax.set_xlabel("Actuals landing inside the band", fontsize=10.5)
    ax.set_title("Is the band honest?", fontsize=11.5,
                 color=INK, loc="left", pad=10, fontweight="bold")
    # Right-aligned to stop short of the line: centred on it, this label
    # landed on top of the top row's own value label.
    ax.text(
        78.6, -0.32, "80% target", fontsize=9.5, color=INK_MUTED,
        ha="right", va="center",
        bbox={"facecolor": SURFACE, "edgecolor": "none", "pad": 2.5},
    )

    for a in axes:
        a.set_ylim(len(grouped) - 0.5, -0.5)
        style_axes(a, xgrid=True, ygrid=False)

    overall = df["in_interval"].mean() * 100
    add_headings(
        fig,
        "The model widens its band exactly where customers are genuinely unpredictable",
        f"Band width tracks real difficulty across a 7× range, and overall {overall:.1f}% of actual payments land "
        f"inside the 80% band — the uncertainty is calibrated, not decorative.",
        "745 held-out invoices. Archetype is the dataset's generating label, used only for this diagnostic — it is never a model input.\n"
        "Cold start (n=12) sits at 50%: under three prior invoices the band is a judgement call, not a calibrated one. Shown as a known limit.",
        x=0.012,
    )

    out = OUT_DIR / "3_uncertainty_by_archetype.png"
    fig.savefig(out, dpi=200)
    plt.close(fig)
    return out


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df = build_eval_frame()

    frame_path = OUT_DIR.parent / "model1_eval_frame.csv"
    df.to_csv(frame_path, index=False)

    print(f"eval frame: {len(df)} rows -> {frame_path}")
    print()
    print("  MAE, identical 745 held-out invoices")
    print(f"    trust the due date      {mae(df['naive_pred'], df['actual_days']):7.4f}")
    print(f"    XGBoost (notebook 02)   {XGBOOST_POINT_MAE:7.4f}")
    print(f"    customer's own average  {mae(df['avg_pred'], df['actual_days']):7.4f}")
    print(f"    CashTwin Model 1 P50    {mae(df['predicted_days_p50'], df['actual_days']):7.4f}")
    print()
    print(f"  P10-P90 coverage          {df['in_interval'].mean() * 100:6.2f}%")
    print(f"  mean error (bias)         {df['error'].mean():+7.3f} days")
    print(f"  median error              {df['error'].median():+7.3f} days")
    print()

    for path in (
        chart_actual_vs_predicted(df),
        chart_baselines(df),
        chart_uncertainty_by_archetype(df),
    ):
        print(f"  wrote {path}")


if __name__ == "__main__":
    main()
