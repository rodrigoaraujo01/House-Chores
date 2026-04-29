export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl bg-surface border border-border-line outline-none text-text-primary placeholder-text-secondary focus:border-accent transition-colors ${error ? 'border-red-400' : ''} ${className}`}
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
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-xl bg-surface border border-border-line outline-none text-text-primary focus:border-accent transition-colors appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
