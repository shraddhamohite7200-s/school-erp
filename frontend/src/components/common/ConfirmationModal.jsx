import React from 'react';
import Button from './Button';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed? This action may affect active school records.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111c2d]/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#c5c5d3]/40 overflow-hidden p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                : 'bg-[#e7eeff] text-[#1e3a8a]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDanger ? 'warning' : 'help'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-[#111c2d] leading-snug">{title}</h3>
            <p className="text-xs sm:text-sm text-[#444651] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#c5c5d3]/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
