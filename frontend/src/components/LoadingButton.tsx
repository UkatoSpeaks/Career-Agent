import type { ButtonHTMLAttributes } from 'react'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'filled' | 'outline'
}

export default function LoadingButton({
  loading,
  variant = 'filled',
  disabled,
  children,
  className = '',
  ...rest
}: LoadingButtonProps) {
  const base =
    'inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    variant === 'filled'
      ? 'bg-accent text-white hover:bg-accent-hover'
      : 'border-[1.5px] border-accent text-accent hover:bg-accent-tint'

  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
