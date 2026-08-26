import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAdmin();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-2 duration-200 ${
              isSuccess
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/40 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10 dark:shadow-emerald-950/30'
                : isError
                ? 'bg-white/95 dark:bg-slate-900/95 border-rose-500/40 text-rose-900 dark:text-rose-100 shadow-rose-500/10 dark:shadow-rose-950/30'
                : isWarning
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-500/40 text-amber-900 dark:text-amber-100 shadow-amber-500/10 dark:shadow-amber-950/30'
                : 'bg-white/95 dark:bg-slate-900/95 border-blue-500/40 text-blue-900 dark:text-blue-100 shadow-blue-500/10 dark:shadow-blue-950/30'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words">{toast.description}</p>
              )}
            </div>

            <button
              id={`close-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 -mr-1 -mt-1 rounded-lg transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
