import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl flex items-start gap-3 transform animate-in slide-in-from-bottom-5 duration-200"
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5 text-rose-500" />
              ) : (
                <Info className="w-5 h-5 text-[#007AFF]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#1C1C1E]">{toast.title}</h4>
              <p className="text-xs text-[#8E8E93] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const IOSSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        w-12 h-7 rounded-full p-0.5 cursor-pointer ios-spring transition-colors duration-200 ease-in-out relative
        ${checked ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div
        className={`
          w-6 h-6 rounded-full bg-white shadow-md transform ios-spring
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};

export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 shimmer-effect ${className}`}>
      <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-200 rounded-lg w-full" />
      {lines > 2 && <div className="h-4 bg-slate-200 rounded-lg w-5/6" />}
      {lines > 3 && <div className="h-4 bg-slate-200 rounded-lg w-2/3" />}
    </div>
  );
};
