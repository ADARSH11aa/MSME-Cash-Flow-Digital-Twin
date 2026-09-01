"""
Slide charts for the two robustness follow-ups: the one-time held-out test
score, and the rolling-origin time-series CV. Same visual language as
build_eval_charts.py (chart 1-3) so all six sit together in one deck.

Reads only the CSVs already produced by evaluate_test_set.py and
rolling_time_series_cv.py - no model is touched and nothing is recomputed.

Run:
    cd AI_models && .venv/Scripts/python evaluation/build_robustness_charts.py
"""

from pathlib import Path

import matplotlib
import numpy as np
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

BASE_DIR = Path(__file__).resolve().parent.parent
EVAL_DIR = Path(__file__).resolve().parent
OUT_DIR = EVAL_DIR / "charts"

SURFACE = "#fcfcfb"
INK = "#0b0b0b"
INK_SECONDARY = "#52514e"
INK_MUTED = "#898781"
GRID = "#e1e0d9"
AXIS = "#c3c2b7"
SERIES = "#2a78d6"
SERIES_2 = "#d67a2a"
NEUTRAL = "#c3c2b7"
WARN = "#c0392b"

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


def style_axes(ax, xgrid=True, ygrid=False):
    ax.grid(False)
    for axis, on in (("x", xgrid), ("y", ygrid)):
        if on:
            ax.grid(axis=axis, linewidth=0.8, color=GRID)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(AXIS)
        ax.spines[side].set_linewidth(0.8)
    ax.set_axisbelow(True)


def add_headings(fig, title, subtitle, footnote, x=0.05):
    fig.text(x, 0.945, title, fontsize=15.5, fontweight="bold", color=INK, ha="left", va="top")
    fig.text(x, 0.876, subtitle, fontsize=10.5, color=INK_SECONDARY, ha="left", va="top")
    fig.text(x, 0.055, footnote, fontsize=9, color=INK_MUTED, ha="left", va="top")


# ----------------------------------------------------------------------
# Chart 4 - validation vs test, side by side
# ----------------------------------------------------------------------

def chart_test_vs_validation(report: pd.DataFrame):
    val = report.loc["validation"]
    test = report.loc["test (FINAL, one-time)"]

    fig, axes = plt.subplots(1, 2, figsize=(11.0, 5.6), dpi=200, gridspec_kw={"wspace": 0.32})
    fig.subplots_adjust(left=0.09, right=0.97, top=0.78, bottom=0.16)

    # Panel 1: MAE
    ax = axes[0]
    labels = ["Validation\n(745 invoices)", "Test\n(740 invoices, first look)"]
    values = [val["mae"], test["mae"]]
    ax.bar(labels, values, width=0.55, color=[NEUTRAL, SERIES], zorder=3)
    for i, v in enumerate(values):
        ax.text(i, v + 0.15, f"{v:.2f}d", ha="center", fontsize=12,
                 fontweight="bold" if i == 1 else "normal", color=INK if i == 1 else INK_SECONDARY)
    ax.set_ylim(0, max(values) * 1.3)
    ax.set_ylabel("Mean absolute error (days)", fontsize=10.5)
    ax.set_title("Point accuracy holds up", fontsize=11.5, color=INK, loc="left", fontweight="bold", pad=10)
    style_axes(ax, xgrid=False, ygrid=True)

    # Panel 2: coverage
    ax = axes[1]
    values = [val["coverage_p10_p90"] * 100, test["coverage_p10_p90"] * 100]
    ax.axhline(80, color=INK_MUTED, linewidth=1.4, linestyle=(0, (5, 4)), zorder=2)
    ax.bar(labels, values, width=0.55, color=[NEUTRAL, SERIES], zorder=3)
    for i, v in enumerate(values):
        ax.text(i, v + 1.5, f"{v:.1f}%", ha="center", fontsize=12,
                 fontweight="bold" if i == 1 else "normal", color=INK if i == 1 else INK_SECONDARY)
    ax.set_xlim(-0.6, 1.6)
    ax.text(-0.5, 82, "80% target", fontsize=9, color=INK_MUTED, va="bottom", ha="left")
    ax.set_ylim(0, 100)
    ax.set_ylabel("Actuals inside P10–P90 band", fontsize=10.5)
    ax.set_title("Uncertainty band stays calibrated", fontsize=11.5, color=INK, loc="left", fontweight="bold", pad=10)
    style_axes(ax, xgrid=False, ygrid=True)

    add_headings(
        fig,
        "The held-out test set was scored, exactly once — the model did not degrade",
        "Same model, same artifacts, same pipeline. Test error is not worse than validation error, "
        "and the 80% band still covers what it claims to.",
        "Test split: invoices issued 2026-02-15 onward, untouched until this single, final evaluation.",
    )

    out = OUT_DIR / "4_test_vs_validation.png"
    fig.savefig(out, dpi=200)
    plt.close(fig)
    return out


# ----------------------------------------------------------------------
# Chart 5 - rolling-origin CV stability
# ----------------------------------------------------------------------

def chart_rolling_cv(cv: pd.DataFrame):
    fig, axes = plt.subplots(1, 2, figsize=(12.0, 5.8), dpi=200, gridspec_kw={"wspace": 0.28})
    fig.subplots_adjust(left=0.08, right=0.97, top=0.78, bottom=0.20)

    x = np.arange(len(cv))
    fold_labels = [w.split(" -> ")[0][:7] for w in cv["val_window"]]

    # Panel 1: MAE per fold
    ax = axes[0]
    ax.bar(x, cv["mae"], width=0.55, color=SERIES, zorder=3)
    mean_mae = cv["mae"].mean()
    ax.axhline(mean_mae, color=INK_MUTED, linewidth=1.4, linestyle=(0, (5, 4)), zorder=2)
    ax.text(len(cv) - 0.3, mean_mae + 0.15, f"mean {mean_mae:.2f}d", fontsize=9.5, color=INK_MUTED, ha="right")
    for xi, v in zip(x, cv["mae"]):
        ax.text(xi, v + 0.15, f"{v:.1f}", ha="center", fontsize=10.5, color=INK_SECONDARY)
    ax.set_xticks(x)
    ax.set_xticklabels(fold_labels, fontsize=10)
    ax.set_ylim(0, cv["mae"].max() * 1.25)
    ax.set_ylabel("MAE (days)", fontsize=10.5)
    ax.set_xlabel("Validation window start (rolling, retrained each fold)", fontsize=9.5)
    ax.set_title("Accuracy is stable across 4 independent time windows", fontsize=11.5,
                 color=INK, loc="left", fontweight="bold", pad=10)
    style_axes(ax, xgrid=False, ygrid=True)

    # Panel 2: coverage per fold
    ax = axes[1]
    cov = cv["coverage_p10_p90"] * 100
    ax.axhline(80, color=INK_MUTED, linewidth=1.4, linestyle=(0, (5, 4)), zorder=2)
    ax.scatter(x, cov, s=130, color=SERIES, zorder=4)
    ax.plot(x, cov, color=SERIES, linewidth=1.4, alpha=0.5, zorder=3)
    for xi, v in zip(x, cov):
        ax.text(xi, v + 1.8, f"{v:.0f}%", ha="center", fontsize=10.5, color=INK_SECONDARY)
    ax.set_xticks(x)
    ax.set_xticklabels(fold_labels, fontsize=10)
    ax.set_xlim(-0.4, len(cv) - 0.15)
    # Placed in the empty lower band, well clear of every point and its
    # value label (all of which sit at y >= 78.5).
    ax.text((len(cv) - 1) / 2, 73.5, "dashed line = 80% target", fontsize=9,
             color=INK_MUTED, ha="center", va="center")
    ax.set_ylim(70, 90)
    ax.set_ylabel("Actuals inside P10–P90 band", fontsize=10.5)
    ax.set_xlabel("Validation window start (rolling, retrained each fold)", fontsize=9.5)
    ax.set_title("Calibration doesn't drift fold to fold", fontsize=11.5,
                 color=INK, loc="left", fontweight="bold", pad=10)
    style_axes(ax, xgrid=False, ygrid=True)

    add_headings(
        fig,
        "One split wasn't a fluke: 4 rolling time-series folds, retrained from scratch each time",
        f"MAE {cv['mae'].mean():.2f} ± {cv['mae'].std():.2f} days, coverage {cov.mean():.0f}% "
        f"± {cov.std():.1f}pp across expanding-window folds spanning Feb 2025 – Jan 2026.",
        "Each fold trains on everything before its window and validates on a fresh 3-month slice; "
        "the reserved test set is never opened here.",
    )

    out = OUT_DIR / "5_rolling_cv_stability.png"
    fig.savefig(out, dpi=200)
    plt.close(fig)
    return out


# ----------------------------------------------------------------------
# Chart 6 - the honest baseline comparison
# ----------------------------------------------------------------------

def chart_honest_baseline(cv: pd.DataFrame):
    """
    The one chart that isn't flattering, and the most defensible one to show
    a jury: the model clearly beats trusting the due date, but only edges out
    a customer's own running average - and loses to it outright in one fold.
    """
    fig, ax = plt.subplots(figsize=(11.5, 6.0), dpi=200)
    fig.subplots_adjust(left=0.09, right=0.97, top=0.775, bottom=0.16)

    fold_labels = [w.split(" -> ")[0][:7] for w in cv["val_window"]]
    x = np.arange(len(cv))
    width = 0.26

    ax.bar(x - width, cv["naive_due_date_mae"], width=width, color=NEUTRAL, zorder=3, label="Trust the due date")
    ax.bar(x, cv["customer_avg_mae"], width=width, color=SERIES_2, zorder=3, label="Customer's own average")
    ax.bar(x + width, cv["mae"], width=width, color=SERIES, zorder=3, label="CashTwin Model 1")

    for xi, row in zip(x, cv.itertuples()):
        ax.text(xi - width, row.naive_due_date_mae + 0.2, f"{row.naive_due_date_mae:.1f}",
                 ha="center", fontsize=9, color=INK_SECONDARY)
        ax.text(xi, row.customer_avg_mae + 0.2, f"{row.customer_avg_mae:.1f}",
                 ha="center", fontsize=9, color=INK_SECONDARY)
        ax.text(xi + width, row.mae + 0.2, f"{row.mae:.1f}",
                 ha="center", fontsize=9.5, fontweight="bold", color=INK)

    # Flag the one fold where the model lost to the customer-average baseline -
    # centred directly above that fold's own blue bar, not offset into a
    # neighbouring group where it could be misread as pointing elsewhere.
    worse = cv["mae"] > cv["customer_avg_mae"]
    for xi, is_worse in zip(x, worse):
        if is_worse:
            bar_top = cv.loc[xi, "mae"]
            ax.annotate(
                "model loses here", xy=(xi + width, bar_top + 0.25),
                xytext=(xi + width, bar_top + 2.3),
                fontsize=9.5, color=WARN, ha="center", va="bottom", fontweight="bold",
                arrowprops={"arrowstyle": "-", "color": WARN, "linewidth": 1.2},
            )

    ax.set_xticks(x)
    ax.set_xticklabels(fold_labels, fontsize=10.5)
    ax.set_ylabel("Mean absolute error (days) — lower is better", fontsize=10.5)
    ax.set_ylim(0, cv["naive_due_date_mae"].max() * 1.28)
    ax.legend(loc="upper right", frameon=False, fontsize=10)
    style_axes(ax, xgrid=False, ygrid=True)

    mean_vs_naive = ((cv["naive_due_date_mae"] - cv["mae"]) / cv["naive_due_date_mae"] * 100).mean()
    mean_vs_avg = ((cv["customer_avg_mae"] - cv["mae"]) / cv["customer_avg_mae"] * 100).mean()

    add_headings(
        fig,
        "A fair comparison: clearly better than the due date, only slightly ahead of a sharp clerk's spreadsheet",
        f"{mean_vs_naive:.0f}% lower error than trusting the contractual due date, on average — but only "
        f"{mean_vs_avg:.0f}% lower than the customer's own running average, and worse than it in one of four folds.",
        "Same 4 rolling folds as the stability chart. Shown deliberately unflattering: the gain over a "
        "spreadsheet-literate accounts clerk is real but modest, not the headline number.",
    )

    out = OUT_DIR / "6_honest_baseline_comparison.png"
    fig.savefig(out, dpi=200)
    plt.close(fig)
    return out


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    report = pd.read_csv(EVAL_DIR / "model1_test_set_report.csv", index_col=0)
    cv = pd.read_csv(EVAL_DIR / "model1_rolling_cv_report.csv")

    for path in (
        chart_test_vs_validation(report),
        chart_rolling_cv(cv),
        chart_honest_baseline(cv),
    ):
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
