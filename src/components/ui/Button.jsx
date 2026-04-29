export function Button({ children, variant = 'primary', size = 'md', type = 'button', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-primary text-white shadow-sm hover:bg-primary-dark',
    secondary: 'bg-muted text-text-main hover:bg-warm-border',
    ghost: 'text-warm-gray hover:bg-muted',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    rodrigo: 'bg-rodrigo text-text-main shadow-sm',
    maiana: 'bg-maiana text-white shadow-sm',
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
