import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { X, Trash2, Plus, Clock } from 'lucide-react'
import { USER_COLORS } from '../lib/utils'

function toDatetimeLocal(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function ChoreDetailSheet({ open, onClose, chore, day, logs = [], profiles = [], currentUserId, onLog, onDeleteLog }) {
  const [loggedAt, setLoggedAt] = useState(() => toDatetimeLocal(new Date()))

  useEffect(() => {
    if (open) setLoggedAt(toDatetimeLocal(new Date()))
  }, [open])

  if (!chore || !day) return null

  const colorMap = Object.fromEntries(profiles.map((p) => [p.id, USER_COLORS[p.color] ?? USER_COLORS.yellow]))
  const nameMap = Object.fromEntries(profiles.map((p) => [p.id, p.display_name]))

  const currentProfile = profiles.find((p) => p.id === currentUserId)
  const colorInfo = currentProfile ? (USER_COLORS[currentProfile.color] ?? USER_COLORS.yellow) : USER_COLORS.yellow

  return (
    <>
      <div className={`backdrop ${open ? 'open' : ''} z-40`} onClick={onClose} />

      <div
        className="bottom-sheet z-50 flex flex-col"
        style={{ transform: open ? 'translateY(0)' : 'translateY(100%)', maxHeight: '70vh' }}
      >
        <div className="sheet-handle" />

        <div className="flex items-start justify-between px-4 pb-3">
          <div>
            <h3 className="text-base font-semibold text-text-main">{chore.name}</h3>
            <p className="text-xs text-warm-gray">
              {format(day, 'EEEE, d MMMM')} · {chore.weight}pt{chore.weight !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-warm-gray hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {logs.length === 0 ? (
            <p className="text-sm text-warm-gray text-center py-4">No logs for this day</p>
          ) : (
            <div className="space-y-2 mb-4">
              {logs.map((log) => {
                const color = colorMap[log.user_id]
                const name = nameMap[log.user_id] ?? 'Unknown'
                const isOwn = log.user_id === currentUserId
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between bg-muted rounded-2xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color?.hex ?? '#ccc' }}
                      />
                      <div>
                        <p className="text-sm font-medium text-text-main">{name}</p>
                        <p className="text-xs text-warm-gray">
                          {format(parseISO(log.logged_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => onDeleteLog(log)}
                        className="p-1.5 rounded-lg text-warm-gray hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Log again with datetime picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-warm-gray flex items-center gap-1">
              <Clock size={12} />
              When
            </label>
            <input
              type="datetime-local"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-muted text-sm text-text-main outline-none focus:bg-white border border-warm-border focus:border-primary transition-colors"
            />
            <button
              onClick={() => onLog({ chore_id: chore.id, user_id: currentUserId, logged_at: new Date(loggedAt).toISOString() })}
              className="w-full py-3 rounded-2xl text-sm font-medium text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: colorInfo.hex }}
            >
              <Plus size={16} />
              Log as {currentProfile?.display_name}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
