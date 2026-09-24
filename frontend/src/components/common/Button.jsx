import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 cursor-pointer focus:outline-none select-none disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-sm gap-2',
    lg: 'h-11 px-5 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#1e3a8a] hover:bg-[#00236f] text-white shadow-sm active:scale-[0.99] font-semibold',
    secondary:
      'bg-[#f0f3ff] hover:bg-[#e7eeff] text-[#111c2d] border border-[#c5c5d3]/40 shadow-sm',
    outline:
      'bg-white hover:bg-[#f0f3ff] text-[#111c2d] border border-[#c5c5d3] shadow-sm',
    danger:
      'bg-[#ba1a1a] hover:bg-[#93000a] text-white shadow-sm',
    success:
      'bg-[#006c4a] hover:bg-[#005137] text-white shadow-sm',
    ghost:
      'bg-transparent hover:bg-[#f0f3ff] text-[#444651]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}
