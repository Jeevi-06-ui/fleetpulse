import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'available' | 'assigned' | 'inTransit' | 'maintenance' | 'inactive' | 'danger' | 'neutral' | 'warning' | 'primary';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantClasses = {
    available: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    assigned: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30',
    inTransit: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 font-medium',
    maintenance: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    inactive: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    warning: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30',
    neutral: 'bg-slate-200 dark:bg-fleet-navy-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-fleet-border-dark',
    primary: 'bg-fleet-primary/15 text-fleet-primary-dark dark:text-fleet-primary border border-fleet-primary/40 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
