export function Button({ children, variant = 'primary', size = 'md', type = 'button', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-dark',
    secondary: 'bg-surface text-text-primary hover:bg-border-line',
    ghost: 'text-text-secondary hover:bg-surface',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
