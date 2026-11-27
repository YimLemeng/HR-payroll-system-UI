import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]/40 select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 font-semibold',
    md: 'text-sm px-4 py-2 gap-2 font-semibold',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-bold',
  };

  const variantStyles = {
    primary: 'bg-[#3c8dbc] hover:bg-[#367fa9] text-white shadow-xs border border-[#367fa9]',
    secondary: 'bg-[#f4f4f4] hover:bg-[#e7e7e7] text-slate-700 border border-slate-300',
    danger: 'bg-[#dd4b39] hover:bg-[#d73925] text-white shadow-xs border border-[#d73925]',
    outline: 'bg-[#f4f4f4] hover:bg-[#e7e7e7] text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0 text-current" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
