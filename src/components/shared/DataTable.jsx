import { ArrowDown, ArrowUp, ChevronsUpDown, Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import cn from '@/lib/cn';

/**
 * Sortable data table with an optional inline-editable cell mode, used for the
 * invoice list and correction table (PRD 3.3) and the recommendation
 * comparison table (PRD 3.6).
 *
 * Sorting is exposed through aria-sort and a real <button> in the header, so
 * the column order is announced rather than being a mouse-only affordance.
 * Cells inherit tabular numerals from the base layer's `table` rule.
 *
 * @param {{
 *   columns: Array<{
 *     key: string,
 *     header: string,
 *     sortable?: boolean,
 *     align?: 'left'|'right',
 *     editable?: boolean,
 *     width?: string,
 *     render?: (row: object) => React.ReactNode,
 *     sortValue?: (row: object) => number|string,
 *   }>,
 *   rows: Array<object>,
 *   rowKey?: (row: object) => string,
 *   onCellEdit?: (rowKey: string, columnKey: string, value: string) => void,
 *   onLight?: boolean,
 *   caption?: string,
 *   className?: string,
 * }} props
 */
export default function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  onCellEdit,
  onLight = false,
  caption,
  className,
}) {
  const [sort, setSort] = useState({ key: null, direction: 'asc' });

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const column = columns.find((c) => c.key === sort.key);
    const read = column?.sortValue ?? ((row) => row[sort.key]);

    return [...rows].sort((a, b) => {
      const av = read(a);
      const bv = read(b);
      if (av === bv) return 0;
      const result = av > bv ? 1 : -1;
      return sort.direction === 'asc' ? result : -result;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  return (
    // Horizontal scroll is contained to the table, so a wide financial table
    // never makes the whole page scroll sideways on mobile (PRD Section 7).
    <div
      className={cn(
        'w-full overflow-x-auto border',
        onLight ? 'border-edge-light bg-light-card' : 'border-edge-dark bg-surface',
        className,
      )}
    >
      <table className="w-full min-w-[640px] border-collapse text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}

        <thead>
          <tr className={cn('border-b', onLight ? 'border-edge-light' : 'border-edge-dark')}>
            {columns.map((column) => {
              const isSorted = sort.key === column.key;
              const SortIcon = !isSorted
                ? ChevronsUpDown
                : sort.direction === 'asc'
                  ? ArrowUp
                  : ArrowDown;

              return (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={cn(
                    'px-4 py-3 text-label-xs uppercase',
                    column.align === 'right' && 'text-right',
                    onLight ? 'text-ink-lo' : 'text-chalk-lo',
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        'inline-flex items-center gap-1.5 uppercase transition-colors',
                        column.align === 'right' && 'flex-row-reverse',
                        onLight ? 'hover:text-ink-hi' : 'hover:text-chalk-hi',
                        isSorted && (onLight ? 'text-ink-hi' : 'text-chalk-hi'),
                      )}
                    >
                      {column.header}
                      <SortIcon className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(
                'border-b transition-colors last:border-b-0',
                onLight
                  ? 'border-edge-light hover:bg-light'
                  : 'border-edge-dark hover:bg-surface-2',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-body-sm',
                    column.align === 'right' && 'text-right',
                    onLight ? 'text-ink-hi' : 'text-chalk-hi',
                  )}
                >
                  {column.editable && onCellEdit ? (
                    <EditableCell
                      value={row[column.key]}
                      display={column.render ? column.render(row) : row[column.key]}
                      onSave={(next) => onCellEdit(rowKey(row), column.key, next)}
                      onLight={onLight}
                    />
                  ) : column.render ? (
                    column.render(row)
                  ) : (
                    row[column.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 ? (
        <p
          className={cn(
            'px-4 py-8 text-center text-body-sm',
            onLight ? 'text-ink-lo' : 'text-chalk-lo',
          )}
        >
          Nothing to show yet.
        </p>
      ) : null}
    </div>
  );
}

/**
 * Click-to-edit cell for invoice correction (PRD 3.3). Enter commits, Escape
 * reverts — both are wired explicitly so keyboard users are not forced to
 * mouse over to the tick button.
 */
function EditableCell({ value, display, onSave, onLight }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));

  const commit = () => {
    setEditing(false);
    if (draft !== String(value ?? '')) onSave(draft);
  };

  const cancel = () => {
    setDraft(String(value ?? ''));
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          'w-full border-b border-dashed text-left transition-colors',
          onLight
            ? 'border-edge-light hover:border-ink-lo hover:text-ink-hi'
            : 'border-edge-dark hover:border-chalk-lo hover:text-lime',
        )}
        title="Click to correct this value"
      >
        {display}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        onBlur={commit}
        aria-label="Corrected value"
        className={cn(
          'w-full min-w-0 border px-2 py-1 text-body-sm tabular',
          onLight
            ? 'border-ink-lo bg-light-card text-ink-hi'
            : 'border-lime bg-void text-chalk-hi',
        )}
      />
      <button type="button" onMouseDown={commit} aria-label="Save correction" className="text-lime">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" onMouseDown={cancel} aria-label="Cancel edit" className="text-chalk-lo">
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}
