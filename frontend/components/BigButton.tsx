'use client';
import clsx from 'clsx';

interface BigButtonProps {
  label: string;
  icon?: string;
  onClick?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white',
  danger:  'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white',
  ghost:   'bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white',
};

const sizes = {
  sm: 'py-3 px-4 text-sm',
  md: 'py-5 px-6 text-base',
  lg: 'py-7 px-6 text-lg',
};

export default function BigButton({
  label,
  icon,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  className,
}: BigButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'w-full rounded-2xl font-semibold transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'active:scale-[0.97] select-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Executando...
        </span>
      ) : (
        <span className="flex flex-col items-center gap-1">
          {icon && <span className="text-3xl leading-none">{icon}</span>}
          <span>{label}</span>
        </span>
      )}
    </button>
  );
}
