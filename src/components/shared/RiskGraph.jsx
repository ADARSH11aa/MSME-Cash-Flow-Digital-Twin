import { useMemo } from 'react';
import cn from '@/lib/cn';

/**
 * The causal risk graph (PRD 3.4.5 / concept doc §8): a vertical chain showing
 * how a customer's payment delay propagates into a liquidity gap.
 *
 * Hand-rolled SVG rather than a charting library, per PRD 2.5 — this is a
 * causal diagram, not a plot, and the nodes need to be individually clickable
 * so each one can route to the records behind it.
 *
 * Laid out in ranks derived from the edges (a simple longest-path layering),
 * so adding a node to the mock data does not require hand-positioning it.
 *
 * @param {{
 *   nodes: Array<{ id: string, label: string, type: 'customer'|'event'|'outcome', severity: 'low'|'medium'|'high' }>,
 *   edges: Array<{ from: string, to: string, label?: string }>,
 *   onNodeClick?: (node: object) => void,
 *   className?: string,
 * }} props
 */
export default function RiskGraph({ nodes, edges, onNodeClick, className }) {
  const layout = useMemo(() => computeLayout(nodes, edges), [nodes, edges]);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      {/* Sized to the layout's own width and centered, so the diagram sits in
          the middle of a wide card instead of hugging the left edge. */}
      <div
        className="relative mx-auto"
        style={{ height: layout.height, width: layout.width }}
      >
        {/* Edges are drawn in an SVG layer behind the nodes; the nodes
            themselves stay as real DOM buttons so they are focusable and
            readable by assistive tech without extra ARIA plumbing. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <defs>
            <marker
              id="risk-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-onDark)" />
            </marker>
          </defs>

          {layout.edges.map((edge, i) => (
            <g key={`${edge.from}-${edge.to}-${i}`}>
              <path
                d={edge.path}
                fill="none"
                stroke="var(--border-onDark)"
                strokeWidth="1.5"
                markerEnd="url(#risk-arrow)"
              />
              {edge.label ? (
                <text
                  x={edge.labelX}
                  y={edge.labelY}
                  fill="var(--text-onDark-lo)"
                  fontSize="10"
                  letterSpacing="0.08em"
                  textAnchor="middle"
                  className="uppercase"
                >
                  {edge.label}
                </text>
              ) : null}
            </g>
          ))}
        </svg>

        <ol className="relative m-0 list-none p-0">
          {layout.nodes.map((node) => (
            <li
              key={node.id}
              className="absolute"
              style={{
                left: node.x,
                top: node.y,
                width: NODE_WIDTH,
                transform: 'translateX(-50%)',
              }}
            >
              <RiskNode node={node} onClick={onNodeClick} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function RiskNode({ node, onClick }) {
  const severityStyle = {
    low: 'border-edge-dark bg-surface-2 text-chalk-hi',
    medium: 'border-caution/50 bg-caution-8 text-chalk-hi',
    high: 'border-risk/60 bg-risk-8 text-chalk-hi',
  }[node.severity];

  const severityLabel = { low: 'Low', medium: 'Watch', high: 'High risk' }[node.severity];
  const severityText = { low: 'text-chalk-lo', medium: 'text-caution', high: 'text-risk' }[
    node.severity
  ];

  const typeLabel = { customer: 'Customer', event: 'Event', outcome: 'Outcome' }[node.type];

  return (
    <button
      type="button"
      onClick={() => onClick?.(node)}
      className={cn(
        'w-full border px-3 py-2.5 text-left transition-all duration-200',
        'hover:shadow-card-dark',
        severityStyle,
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-label-xs uppercase text-chalk-lo">{typeLabel}</span>
        {/* Severity always carries a word, never just the border color. */}
        <span className={cn('text-label-xs uppercase', severityText)}>{severityLabel}</span>
      </span>
      <span className="mt-1 block text-body-sm leading-snug">{node.label}</span>
    </button>
  );
}

const NODE_WIDTH = 220;
// Sized for a two-line node label — the longest the risk graph produces. The
// rank gap has to clear the edge labels that sit at the midpoint between ranks.
const NODE_HEIGHT = 76;
const RANK_GAP = 58;
const COLUMN_GAP = 24;

/**
 * Assign each node a rank (its longest distance from a root) and spread nodes
 * that share a rank across the available width.
 */
function computeLayout(nodes, edges) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const rank = new Map(nodes.map((n) => [n.id, 0]));

  // Relax ranks repeatedly; the graph is tiny and acyclic, so a bounded number
  // of passes settles it without needing a full topological sort.
  for (let pass = 0; pass < nodes.length; pass += 1) {
    let changed = false;
    for (const edge of edges) {
      const next = (rank.get(edge.from) ?? 0) + 1;
      if (next > (rank.get(edge.to) ?? 0)) {
        rank.set(edge.to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const ranks = new Map();
  for (const node of nodes) {
    const r = rank.get(node.id) ?? 0;
    if (!ranks.has(r)) ranks.set(r, []);
    ranks.get(r).push(node);
  }

  const maxRank = Math.max(...ranks.keys(), 0);
  const widestRank = Math.max(...[...ranks.values()].map((r) => r.length), 1);
  const width = widestRank * NODE_WIDTH + (widestRank - 1) * COLUMN_GAP;

  const positioned = new Map();
  const laidOut = [];

  for (const [r, rankNodes] of ranks) {
    const rowWidth = rankNodes.length * NODE_WIDTH + (rankNodes.length - 1) * COLUMN_GAP;
    const startX = (width - rowWidth) / 2 + NODE_WIDTH / 2;

    rankNodes.forEach((node, i) => {
      const x = startX + i * (NODE_WIDTH + COLUMN_GAP);
      const y = r * (NODE_HEIGHT + RANK_GAP);
      positioned.set(node.id, { x, y });
      laidOut.push({ ...node, x, y });
    });
  }

  const routedEdges = edges
    .map((edge) => {
      const from = positioned.get(edge.from);
      const to = positioned.get(edge.to);
      if (!from || !to || !byId.has(edge.from) || !byId.has(edge.to)) return null;

      const x1 = from.x;
      const y1 = from.y + NODE_HEIGHT;
      const x2 = to.x;
      const y2 = to.y;
      const midY = (y1 + y2) / 2;

      return {
        ...edge,
        // Vertical cubic so edges between offset columns curve rather than
        // cutting diagonally across neighbouring nodes.
        path: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`,
        labelX: (x1 + x2) / 2,
        labelY: midY + 3,
      };
    })
    .filter(Boolean);

  return {
    nodes: laidOut,
    edges: routedEdges,
    height: (maxRank + 1) * NODE_HEIGHT + maxRank * RANK_GAP,
    width,
  };
}
