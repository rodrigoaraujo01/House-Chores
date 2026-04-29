import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Plus, Clock } from 'lucide-react'
import { USER_COLORS } from '../lib/utils'

function toDatetimeLocal(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function LogChoreSheet({ open, onClose, chores = [], categories = [], suggestions = [], profile, profiles = [], todayLogs = [], onLog }) {
  const [search, setSearch] = useState('')
  const [logging, setLogging] = useState(null)
  const [loggedAt, setLoggedAt] = useState(() => toDatetimeLocal(new Date()))
  const [selectedUserId, setSelectedUserId] = useState(profile?.id)

  useEffect(() => {
    if (!open) {
      setSearch('')
    } else {
      setLoggedAt(toDatetimeLocal(new Date()))
      setSelectedUserId(profile?.id)
    }
  }, [open, profile?.id])

  const selectedProfile = profiles.find((p) => p.id === selectedUserId) ?? profile
  const colorInfo = USER_COLORS[selectedProfile?.color] ?? USER_COLORS.yellow

  const todayCounts = {}
  todayLogs.forEach((l) => {
    if (l.user_id === selectedUserId) {
      todayCounts[l.chore_id] = (todayCounts[l.chore_id] ?? 0) + 1
    }
  })

  const filtered = search.trim()
    ? chores.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : chores

  const grouped = categories.reduce((acc, cat) => {
    const list = filtered.filter((c) => c.category_id === cat.id)
    if (list.length) acc.push({ cat, chores: list })
    return acc
  }, [])
  const uncategorized = filtered.filter((c) => !c.category_id)
  if (uncategorized.length) grouped.push({ cat: { id: 'none', name: 'Other', emoji: '📌' }, chores: uncategorized })

  async function handleLog(chore) {
    if (!selectedProfile) return
    setLogging(chore.id)
    try {
      await onLog({
        chore_id: chore.id,
        user_id: selectedProfile.id,
        logged_at: new Date(loggedAt).toISOString(),
      })
    } finally {
      setLogging(null)
    }
  }

  const suggestedFiltered = suggestions.filter(
    (c) => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className={`backdrop ${open ? 'open' : ''} z-40`} onClick={onClose} />

      <div
        className="bottom-sheet z-50 flex flex-col"
        style={{ transform: open ? 'translateY(0)' : 'translateY(100%)', maxHeight: '85vh' }}
      >
        <div className="sheet-handle" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="text-base font-semibold text-text-primary">Log a chore</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-text-secondary hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        {/* User switcher */}
        {profiles.length > 1 && (
          <div className="px-4 pb-3 flex gap-2">
            {profiles.map((p) => {
              const ci = USER_COLORS[p.color] ?? USER_COLORS.yellow
              const active = p.id === selectedUserId
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedUserId(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={
                    active
                      ? { backgroundColor: ci.hex, color: '#fff' }
                      : { backgroundColor: 'var(--color-surface, #F0ECE8)', color: ci.hex, border: `1.5px solid ${ci.hex}` }
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : ci.hex }}
                  />
                  {p.display_name}
                </button>
              )
            })}
          </div>
        )}

        {/* Date/time picker */}
        <div className="px-4 pb-3">
          <label className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
            <Clock size={12} />
            When
          </label>
          <input
            type="datetime-local"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface text-sm text-text-primary outline-none border border-border-line focus:border-accent transition-colors"
          />
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="Search chores…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface text-sm text-text-primary placeholder-text-secondary outline-none border border-transparent focus:border-accent transition-colors"
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {!search.trim() && suggestedFiltered.length > 0 && (
            <section>
              <h4 className="section-label mb-2 flex items-center gap-1">
                <span>✨</span>
                <span>Suggested</span>
              </h4>
              <div>
                {suggestedFiltered.map((chore, i) => (
                  <ChoreRow
                    key={chore.id}
                    chore={chore}
                    count={todayCounts[chore.id] ?? 0}
                    loading={logging === chore.id}
                    onLog={() => handleLog(chore)}
                    colorHex={colorInfo.hex}
                    showDivider={i < suggestedFiltered.length - 1}
                  />
                ))}
              </div>
            </section>
          )}

          {grouped.map(({ cat, chores: list }) => (
            <section key={cat.id}>
              <h4 className="section-label mb-2 flex items-center gap-1">
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </h4>
              <div>
                {list.map((chore, i) => (
                  <ChoreRow
                    key={chore.id}
                    chore={chore}
                    count={todayCounts[chore.id] ?? 0}
                    loading={logging === chore.id}
                    onLog={() => handleLog(chore)}
                    colorHex={colorInfo.hex}
                    showDivider={i < list.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-text-secondary text-sm py-8">No chores found</p>
          )}
        </div>
      </div>
    </>
  )
}

function ChoreRow({ chore, count, loading, onLog, colorHex, showDivider }) {
  return (
    <div className={`flex items-center justify-between py-3 ${showDivider ? 'hairline' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{chore.name}</p>
        <p className="text-xs text-text-secondary">
          {chore.weight}pt{chore.weight !== 1 ? 's' : ''}
          {count > 0 && (
            <span className="ml-2 font-medium" style={{ color: colorHex }}>
              ✓ {count}× today
            </span>
          )}
        </p>
      </div>
      <button
        onClick={onLog}
        disabled={loading}
        className="ml-3 w-8 h-8 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-60"
        style={{ backgroundColor: colorHex }}
      >
        {loading
          ? <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          : <Plus size={16} />
        }
      </button>
    </div>
  )
}
