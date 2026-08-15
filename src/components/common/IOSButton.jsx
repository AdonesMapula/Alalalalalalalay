import React from 'react';
import { Loader2 } from 'lucide-react';

export const IOSButton = ({
  children,
  onClick,
  variant = 'primary', // primary | secondary | tertiary | destructive | ghost | outline
  size = 'md', // sm | md | lg
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  type = 'button',
  fullWidth = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full cursor-pointer select-none transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base font-bold gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#093a96] text-white hover:bg-[#072d75] shadow-sm shadow-blue-900/15',
    secondary: 'bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] border border-slate-200',
    tertiary: 'bg-white text-[#093a96] border border-[#093a96]/20 hover:bg-blue-50/50 shadow-xs',
    outline: 'bg-transparent text-[#0f172a] border border-slate-300 hover:bg-slate-50',
    destructive: 'bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-sm shadow-red-500/20',
    ghost: 'bg-transparent text-[#093a96] hover:bg-blue-50/70',
    ai: 'bg-gradient-to-r from-[#093a96] via-[#1d4ed8] to-[#4338ca] text-white shadow-md shadow-blue-900/20 hover:opacity-95',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
