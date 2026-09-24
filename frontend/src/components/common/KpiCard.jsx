import React from 'react';

export default function KpiCard({
  title,
  value,
  icon,
  badgeText = null,
  badgeType = 'neutral',
  subtext = null,
  sparkline = false,
  highlightColor = 'text-[#111c2d]',
  iconBg = 'bg-[#f0f3ff]',
  iconColor = 'text-[#1e3a8a]',
  onClick,
}) {
  const badgeColors = {
    success: 'bg-[#85f8c4]/40 text-[#006c4a]',
    primary: 'bg-[#dce1ff] text-[#00236f]',
    warning: 'bg-[#ffdcc3] text-[#442100]',
    danger: 'bg-[#ffdad6] text-[#ba1a1a]',
    neutral: 'bg-[#f0f3ff] text-[#444651]',
  };

  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between p-4 sm:p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs hover:shadow-md transition-all duration-200 group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-[#444651] font-semibold">
            {title}
          </span>
          <span className={`text-2xl sm:text-3xl font-bold font-numeric ${highlightColor}`}>
            {value}
          </span>
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>

      <div className="mt-3.5 pt-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          {badgeText && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                badgeColors[badgeType] || badgeColors.neutral
              }`}
            >
              {badgeType === 'success' && (
                <span className="material-symbols-outlined text-[13px]">trending_up</span>
              )}
              {badgeText}
            </span>
          )}

          {sparkline && (
            <svg className="w-16 h-5 text-[#006c4a]" fill="none" viewBox="0 0 60 20">
              <path
                d="M2 17 L14 13 L26 15 L38 8 L50 11 L58 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {subtext && (
          <span className="text-xs text-[#444651] truncate">{subtext}</span>
        )}
      </div>
    </div>
  );
}
