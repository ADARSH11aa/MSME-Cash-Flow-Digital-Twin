/**
 * Reshapes Model 7's ranked, numeric-only output into the frontend's
 * narrative Recommendation cards.
 *
 * Model 7 (AI_models/model_7.py) knows cost/speed/liquidity/risk/debt scores
 * and a strategy name - it has no concept of "goal" copy, bullet-point
 * "features", or a UI category, because those are product/UX decisions, not
 * ranking inputs. This static COPY table is that missing UI layer, keyed by
 * Model 7's exact strategy names so a change there fails loudly instead of
 * silently showing a card with no copy.
 *
 * isRecommended follows Model 7's actual #1-ranked result.
 */
import { roundHalfEven, formatThousands } from '../lib/round.js';

const COPY = {
  'Supplier Payment Extension': {
    id: 'rec-supplier',
    category: 'commercial',
    goal: 'Ask your supplier for extra time on the invoices driving this shortfall.',
    features: [
      'No financing cost at all',
      'Uses a supplier relationship you already have',
      'Reversible — nothing is committed',
    ],
  },
  'Early Customer Payment': {
    id: 'rec-discount',
    category: 'internal',
    goal: 'Offer your largest overdue customers a discount to settle immediately.',
    features: [
      'No debt taken on',
      'You keep control of the offer',
      'Can be withdrawn any time',
    ],
  },
  'Invoice Financing': {
    id: 'rec-invoice-finance',
    category: 'invoice_finance',
    goal: 'Convert approved invoices into cash before they are due.',
    features: [
      'Requires lender data-sharing consent',
      'Cost rises the longer the customer takes',
      'Does not fix the underlying delay',
    ],
  },
  'Working Capital Facility': {
    id: 'rec-working-capital',
    category: 'working_capital',
    goal: 'Open a standing facility to absorb future timing gaps.',
    features: [
      'Slowest to arrange of the options',
      'Ongoing interest whether drawn or not',
      'Requires lender data-sharing consent',
    ],
  },
  'Combined Strategy': {
    id: 'rec-combined',
    category: 'working_capital',
    goal: 'Blend a supplier extension, a customer discount, and partial financing.',
    features: [
      'Spreads risk across several smaller actions',
      'Faster than a single working-capital facility alone',
      'Still involves some financing cost',
    ],
  },
};

function capitalize(s) {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * The statutory option, which Model 7 cannot rank because it does not know
 * the law exists.
 *
 * It belongs on this page and belongs first: it costs nothing, adds no debt,
 * needs no counterparty's consent, and the money is already the supplier's by
 * statute. Without it the page ranks a paid discount above a free
 * entitlement, which is exactly backwards for a product whose stated premise
 * is "actions that cost nothing come first".
 *
 * It is deliberately NOT given isRecommended. Model 7 ranks on speed and
 * liquidity as well as cost, and an MSEFC reference takes months - quietly
 * overriding the model's pick with a slower option would be a product
 * decision disguised as a ranking.
 *
 * exposure: statutoryExposure()'s output, or null when the business is not a
 * "supplier" under Section 2(n) and has no claim to offer.
 */
export function statutoryRecommendation(exposure) {
  if (!exposure?.eligibility?.isSupplier) return null;
  const { totals, limitation, taxLeverage } = exposure;
  if (!totals || totals.interestOwed <= 0) return null;

  const features = [
    'No cost, no debt, and no lender consent needed',
    `Applies to ${totals.msefcEligibleCustomers} buyers already past the statutory date`,
    // Section 18(5) puts a 90-day outer limit on an MSEFC reference, which is
    // the honest counterweight to "free": it is the slowest option here.
    'Slower than the others — an MSEFC reference runs to 90 days',
  ];

  if (limitation?.expiringSoonCount > 0) {
    features.push(
      `${limitation.expiringSoonCount} of these claims are time-barred within ${limitation.warningWindowDays} days`,
    );
  }

  if (taxLeverage) {
    features.push(
      `Your buyers cannot deduct these bills until paid — ${taxLeverage.daysUntilFiscalYearEnd} days to ${taxLeverage.fiscalYearEndsOn}`,
    );
  }

  return {
    id: 'rec-statutory-interest',
    strategy: 'Statutory Interest Claim',
    category: 'legal',
    illustrativeCost: 0,
    recoveryTimeDays: 90,
    liquidityImpact: `Recovers ₹${formatThousands(totals.interestOwed)} you are already owed under Section 16`,
    isRecommended: false,
    goal: 'Invoice the interest the MSMED Act already entitles you to, and refer buyers who still will not pay.',
    features,
    risk: 'Low — the entitlement is statutory, but pursuing it strains the customer relationship',
    // Not immediateInflow: unlike the other options this does not pull
    // forward money already in the book, it claims money never billed, and
    // it lands at the end of an MSEFC reference rather than today. The
    // simulator injects it as a synthetic invoice paying on that day - see
    // scenarioShocks.js.
    shocks: { statutoryClaim: { amount: totals.interestOwed, days: 90 } },
  };
}

/** ranked: rankRecoveryOptions()'s output list, already sorted best-first.
 * overdueInvoiceValue: same figure passed into Model 7, used to turn its
 * percentage gap_reduction into a rupee amount for liquidityImpact/shocks. */
export function adaptRecommendations(ranked, overdueInvoiceValue) {
  return ranked.map((r) => {
    const copy = COPY[r.strategy];
    if (!copy) {
      throw new Error(`No recommendation copy configured for strategy "${r.strategy}"`);
    }
    const recoveredAmount = roundHalfEven((overdueInvoiceValue * r.liquidity.gap_reduction_pct) / 100, 2);

    return {
      id: copy.id,
      strategy: r.strategy,
      category: copy.category,
      illustrativeCost: r.cost.amount,
      recoveryTimeDays: r.recovery.days,
      liquidityImpact: `Frees an estimated ₹${formatThousands(recoveredAmount)} across the breach window`,
      isRecommended: r.rank === 1,
      goal: copy.goal,
      features: copy.features,
      risk: `${capitalize(r.risk.level)} — ${r.explanation}`,
      shocks: { immediateInflow: recoveredAmount },
    };
  });
}
