/**
 * Reshapes Model 8's causal graph into the frontend's narrower styling model.
 *
 * Model 8 (AI_models/risk_graph/build_risk_graph.py) returns 5 node types
 * (customer, invoice, buffer, obligation, expense), typed edges
 * (delays/contributes_to/reduces/breaches keyed source/target), and no
 * severity concept at all. The frontend's RiskGraph component expects
 * exactly 3 node types (customer/event/outcome), a severity (high/medium/low)
 * that drives real styling, and edges keyed from/to.
 *
 * Severity is derived here, not relabeled - thresholds chosen to be
 * consistent with AI_models' own anomaly rules (e.g. days_past_own_p90 > 30
 * = "severely_overdue" in anomaly/anomaly_explainer.py).
 */

const TYPE_MAP = {
  customer: 'customer',
  invoice: 'event',
  expense: 'event',
  buffer: 'outcome',
  obligation: 'outcome',
};

function severityFromProbability(prob) {
  if (prob >= 0.7) return 'high';
  if (prob >= 0.3) return 'medium';
  return 'low';
}

function severityFromDaysOverdue(days, anomalyType = null) {
  let severity;
  if (days >= 30) severity = 'high';
  else if (days >= 10) severity = 'medium';
  else severity = 'low';
  if (anomalyType && anomalyType !== 'normal' && severity === 'low') severity = 'medium';
  return severity;
}

function severityFromShare(value, maxValue) {
  if (maxValue <= 0) return 'low';
  const share = value / maxValue;
  if (share >= 0.66) return 'high';
  if (share >= 0.33) return 'medium';
  return 'low';
}

/** graph: Model 8's {nodes, edges, summary} object. Returns the frontend's
 * {nodes: [{id,label,type,severity}], edges: [{from,to,label}]}. */
export function adaptRiskGraph(graph) {
  const { nodes, edges } = graph;

  const customerOfInvoice = new Map();
  for (const e of edges) {
    if (e.type === 'delays') customerOfInvoice.set(e.target, e.source);
  }

  const invoiceAmounts = new Map();
  for (const n of nodes) {
    if (n.type === 'invoice') invoiceAmounts.set(n.id, n.invoice_amount ?? 0);
  }

  const customerExposure = new Map();
  for (const [invoiceId, amount] of invoiceAmounts) {
    const custId = customerOfInvoice.get(invoiceId);
    if (custId) {
      customerExposure.set(custId, (customerExposure.get(custId) ?? 0) + amount);
    }
  }
  const maxExposure = customerExposure.size ? Math.max(0, ...customerExposure.values()) : 0;

  const bufferNode = nodes.find((n) => n.type === 'buffer');
  const maxBreachProb = bufferNode?.max_breach_probability ?? 0.0;

  const outNodes = nodes.map((n) => {
    const nodeType = TYPE_MAP[n.type];
    let severity;
    if (n.type === 'invoice') {
      severity = severityFromDaysOverdue(n.days_past_own_p90, n.anomaly_type);
    } else if (n.type === 'customer') {
      severity = severityFromShare(customerExposure.get(n.id) ?? 0, maxExposure);
    } else if (n.type === 'buffer' || n.type === 'obligation') {
      severity = severityFromProbability(maxBreachProb);
    } else {
      severity = 'medium'; // expense - a constant drain, not independently rankable
    }
    return {
      id: n.id,
      label: n.label,
      type: nodeType,
      severity,
      // Model 1's cold-start flag: "low" means this invoice's P10/50/90
      // leaned on a sector/global prior instead of this customer's own
      // payment history (too few closed invoices to trust yet).
      confidence: n.type === 'invoice' ? (n.confidence ?? 'normal') : undefined,
    };
  });

  const outEdges = edges.map((e) => {
    let label = null;
    if (e.type === 'delays') {
      label = `${e.weight} days overdue`;
      if (e.shap_top_feature) label += ` (driven by ${e.shap_top_feature})`;
    } else if (e.type === 'reduces') {
      label = 'reduces cash buffer';
    } else if (e.type === 'breaches') {
      label = `${Math.round(e.weight * 100)}% breach probability`;
    }
    return { from: e.source, to: e.target, label };
  });

  return { nodes: outNodes, edges: outEdges };
}
