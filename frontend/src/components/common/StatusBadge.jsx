import React from 'react';

export default function StatusBadge({ status, label = null, size = 'sm', showDot = true, icon = null }) {
  const norm = String(status || '').toLowerCase().trim();

  let styles = 'bg-[#f0f3ff] text-[#444651] border-[#c5c5d3]/40';
  let dotColor = 'bg-[#757682]';

  if (['active', 'paid', 'clear', 'present', 'cleared', 'verified'].includes(norm)) {
    styles = 'bg-[#85f8c4]/40 text-[#006c4a] border-[#85f8c4]';
    dotColor = 'bg-[#006c4a]';
  } else if (['pending', 'partial', 'due', 'warning'].includes(norm)) {
    styles = 'bg-[#ffdcc3] text-[#442100] border-[#fc922b]/40';
    dotColor = 'bg-[#442100]';
  } else if (['absent', 'inactive', 'overdue', 'critical', 'danger', 'failed'].includes(norm)) {
    styles = 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30';
    dotColor = 'bg-[#ba1a1a]';
  }

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs tabular-nums select-none ${
        sizeClasses[size] || sizeClasses.sm
      } ${styles}`}
    >
      {showDot && !icon && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      <span>{label || status}</span>
    </span>
  );
}
