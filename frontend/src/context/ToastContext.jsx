/**
 * Toast Notification Context
 * Shows top-right floating toasts matching the Stitch design system
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl shadow-lg border transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
              toast.type === 'error'
                ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/20'
                : toast.type === 'warning'
                ? 'bg-[#ffdcc3] text-[#442100] border-[#fc922b]/30'
                : 'bg-[#82f5c1] text-[#006c4a] border-[#006c4a]/20'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]">
                {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check_circle'}
              </span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md hover:bg-black/10 transition-colors"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
