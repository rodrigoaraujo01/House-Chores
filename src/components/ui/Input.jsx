export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-main">{label}</label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-2xl bg-muted border border-transparent outline-none text-text-main placeholder-warm-gray focus:border-primary focus:bg-white transition-colors ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-main">{label}</label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-2xl bg-muted border border-transparent outline-none text-text-main focus:border-primary focus:bg-white transition-colors appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
