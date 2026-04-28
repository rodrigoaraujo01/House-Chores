import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { X, Check, Plus, Minus } from 'lucide-react'
import { USER_COLORS } from '../lib/utils'

export function LogChoreSheet({ open, onClose, chores = [], categories = [], suggestions = [], profile, todayLogs = [], onLog }) {
  const [search, setSearch] = useState('')
  const [logging, setLogging] = useState(null) // chore id being logged

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const colorInfo = USER_COLORS[profile?.color] ?? USER_COLORS.yellow

  // Count how many times current user logged each chore today
  const todayCounts = {}
  todayLogs.forEach((l) => {
    if (l.user_id === profile?.id) {
      todayCounts[l.chore_id] = (todayCounts[l.chore_id] ?? 0) + 1
    }
  })

  const filtered = search.trim()
    ? chores.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : chores

  // Group by category
  const grouped = categories.reduce((acc, cat) => {
    const choreList = filtered.filter((c) => c.category_id === cat.id)
    if (choreList.length) acc.push({ cat, chores: choreList })
    return acc
  }, [])
  const uncategorized = filtered.filter((c) => !c.category_id)
  if (uncategorized.length) grouped.push({ cat: { id: 'none', name: 'Other', emoji: '📌' }, chores: uncategorized })

  async function handleLog(chore) {
    if (!profile) return
    setLogging(chore.id)
    try {
      await onLog({ chore_id: chore.id, user_id: profile.id })
    } finally {
      setLogging(null)
    }
  }

  const suggestedFiltered = suggestions.filter(
    (c) => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Backdrop */}
      <div className={`backdrop ${open ? 'open' : ''} z-40`} onClick={onClose} />

      {/* Sheet */}
      <div
        className={`bottom-sheet z-50 flex flex-col`}
        style={{
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '82vh',
        }}
      >
        <div className="sheet-handle" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div>
            <h3 className="text-base font-semibold text-text-main">Log a chore</h3>
            <p className="text-xs text-warm-gray">
              Logging as{' '}
              <span style={{ color: colorInfo.hex }} className="font-medium">
                {profile?.display_name}
              </span>
              {' · '}{format(new Date(), 'HH:mm')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-warm-gray hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="Search chores…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-muted text-sm text-text-main placeholder-warm-gray outline-none focus:bg-white border border-transparent focus:border-primary transition-colors"
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {/* Suggestions */}
          {!search.trim() && suggestedFiltered.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wide mb-2">
                ✨ Suggested for you
              </h4>
              <div className="space-y-2">
                {suggestedFiltered.map((chore) => (
                  <ChoreRow
                    key={chore.id}
                    chore={chore}
                    count={todayCounts[chore.id] ?? 0}
                    loading={logging === chore.id}
                    onLog={() => handleLog(chore)}
                    colorHex={colorInfo.hex}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All chores grouped by category */}
          {grouped.map(({ cat, chores: list }) => (
            <section key={cat.id}>
              <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </h4>
              <div className="space-y-2">
                {list.map((chore) => (
                  <ChoreRow
                    key={chore.id}
                    chore={chore}
                    count={todayCounts[chore.id] ?? 0}
                    loading={logging === chore.id}
                    onLog={() => handleLog(chore)}
                    colorHex={colorInfo.hex}
                  />
                ))}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-warm-gray text-sm py-8">No chores found</p>
          )}
        </div>
      </div>
    </>
  )
}

function ChoreRow({ chore, count, loading, onLog, colorHex }) {
  return (
    <div className="flex items-center justify-between bg-muted rounded-2xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-main truncate">{chore.name}</p>
        <p className="text-xs text-warm-gray">
          {chore.weight}pt{chore.weight !== 1 ? 's' : ''}
          {count > 0 && (
            <span className="ml-2" style={{ color: colorHex }}>
              ✓ {count}× today
            </span>
          )}
        </p>
      </div>
      <button
        onClick={onLog}
        disabled={loading}
        className="ml-3 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform disabled:opacity-60"
        style={{ backgroundColor: colorHex }}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
        ) : (
          <Plus size={18} />
        )}
      </button>
    </div>
  )
}
