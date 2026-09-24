import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  required = false,
  icon = null,
  helperText = '',
  className = '',
  disabled = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#111c2d]">
          {label} {required && <span className="text-[#ba1a1a]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#757682] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full h-10 ${
            icon ? 'pl-9 pr-3' : 'px-3'
          } rounded-xl bg-[#f0f3ff] text-sm text-[#111c2d] placeholder:text-[#757682] border transition-all focus:outline-none focus:bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 disabled:bg-[#f0f3ff]/50 disabled:cursor-not-allowed ${
            error ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : 'border-[#c5c5d3]/40'
          }`}
          {...props}
        />
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
