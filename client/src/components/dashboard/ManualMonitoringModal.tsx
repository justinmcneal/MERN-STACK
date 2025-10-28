import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, X } from 'lucide-react';

interface ManualMonitoringModalProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string | null;
  canDismiss?: boolean;
}

const ManualMonitoringModal: React.FC<ManualMonitoringModalProps> = ({
  isOpen,
  value,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  canDismiss = true
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700/60 bg-slate-900/90 p-8 shadow-2xl">
        {canDismiss && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-slate-800/70 p-2 text-slate-400 transition hover:text-white"
            aria-label="Close manual monitoring dialog"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15">
            <Clock className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">How long can you monitor trades?</h2>
            <p className="mt-1 text-sm text-slate-300">
              Tell us how many minutes you plan to monitor opportunities manually before letting our automations take over.
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Manual monitoring duration (minutes)</span>
            <input
              type="number"
              min={1}
              max={1440}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              placeholder="e.g. 45"
              required
            />
            <span className="mt-2 block text-xs text-slate-400">Enter a value between 1 and 1440 minutes (24 hours).</span>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {canDismiss && (
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-slate-600/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800/60 sm:w-auto"
              >
                Maybe later
              </button>
            )}
            <button
              type="submit"
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition sm:w-auto ${
                isSubmitting
                  ? 'cursor-wait bg-slate-700 text-slate-300'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save monitoring time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ManualMonitoringModal;
