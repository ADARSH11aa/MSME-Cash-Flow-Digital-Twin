import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import cn from '@/lib/cn';

/**
 * Toasts for save confirmations and recalculation notices — chiefly the
 * "Saved. Forecast recalculating…" message that follows an invoice correction
 * (PRD 3.3).
 *
 * Rendered into an aria-live region so a screen-reader user hears that the
 * forecast changed; a purely visual toast would hide the one piece of feedback
 * confirming their edit took effect.
 */

const ToastContext = createContext(null);

/** @returns {{ toast: (options: { title: string, description?: string, tone?: string, duration?: number }) => void }} */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, tone = 'success', duration = 4000 }) => {
      const id = ++idRef.current;
      setToasts((current) => [...current, { id, title, description, tone }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      // Polite: a save confirmation should not interrupt what is being read.
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout={!prefersReduced}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: prefersReduced ? 0.01 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto"
          >
            <ToastCard {...t} onDismiss={() => onDismiss(t.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ title, description, tone, onDismiss }) {
  const { Icon, accent, spin } = {
    success: { Icon: CheckCircle2, accent: 'text-lime', spin: false },
    pending: { Icon: Loader2, accent: 'text-info', spin: true },
    warning: { Icon: AlertTriangle, accent: 'text-caution', spin: false },
    info: { Icon: Info, accent: 'text-info', spin: false },
  }[tone] ?? { Icon: Info, accent: 'text-info', spin: false };

  return (
    <div className="flex items-start gap-3 border border-edge-dark bg-surface-2 p-4 shadow-card-dark">
      <Icon
        className={cn('mt-0.5 h-4 w-4 shrink-0', accent, spin && 'animate-spin')}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-body-md text-chalk-hi">{title}</p>
        {description ? <p className="mt-0.5 text-body-sm text-chalk-lo">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-label-xs uppercase text-chalk-lo transition-colors hover:text-chalk-hi"
      >
        Dismiss
      </button>
    </div>
  );
}

export default ToastProvider;
