import React from 'react';

export default function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  error = '',
  required = false,
  helperText = '',
  className = '',
  disabled = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[#111c2d]">
          {label} {required && <span className="text-[#ba1a1a]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`appearance-none w-full h-10 pl-3 pr-8 rounded-xl bg-[#f0f3ff] text-sm text-[#111c2d] border cursor-pointer transition-all focus:outline-none focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 disabled:cursor-not-allowed ${
            error ? 'border-[#ba1a1a]' : 'border-[#c5c5d3]/40'
          }`}
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        <span className="material-symbols-outlined absolute right-2.5 text-[18px] text-[#757682] pointer-events-none">
          arrow_drop_down
        </span>
      </div>
      {error ? (
        <span className="text-xs text-[#ba1a1a] font-medium flex items-center gap-1 mt-0.5">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-[#444651] mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}
