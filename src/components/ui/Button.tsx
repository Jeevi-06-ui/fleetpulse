import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors rounded-fleet focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] transition-transform';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-fleet-primary text-fleet-navy-900 hover:bg-fleet-primary-hover font-semibold shadow-sm',
    secondary:
      'bg-fleet-navy-800 text-white hover:bg-fleet-navy-700 dark:bg-fleet-panel-dark dark:hover:bg-fleet-navy-600 border border-slate-700',
    outline:
      'border border-slate-300 dark:border-fleet-border-dark text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-fleet-navy-800',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
    ghost:
      'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-fleet-navy-800',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
