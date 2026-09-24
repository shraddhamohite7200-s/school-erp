import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon = 'inbox',
  title = 'No records found',
  description = 'There are no items matching the criteria or added yet.',
  actionText = null,
  onAction = null,
  actionIcon = 'add',
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#c5c5d3]/40 my-3">
      <div className="w-14 h-14 rounded-2xl bg-[#f0f3ff] text-[#1e3a8a] flex items-center justify-center mb-3.5 shadow-2xs">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#111c2d] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#444651] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="md" icon={actionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
