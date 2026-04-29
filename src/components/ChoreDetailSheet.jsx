import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { X, Trash2, Plus, Clock, Pencil, Check } from 'lucide-react'
import { USER_COLORS } from '../lib/utils'

function toDatetimeLocal(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function ChoreDetailSheet({ open, onClose, chore, day, logs = [], profiles = [], currentUserId, onLog, onDeleteLog, onEditLog }) {
  const [loggedAt, setLoggedAt] = useState(() => toDatetimeLocal(new Date()))
  const [editingLogId, setEditingLogId] = useState(null)
  const [editingAt, setEditingAt] = useState('')

  useEffect(() => {
    if (open) {
      setLoggedAt(toDatetimeLocal(new Date()))
      setEditingLogId(null)
    }
  }, [open])

  if (!chore || !day) return null

  const colorMap = Object.fromEntries(profiles.map((p) => [p.id, USER_COLORS[p.color] ?? USER_COLORS.yellow]))
  const nameMap = Object.fromEntries(profiles.map((p) => [p.id, p.display_name]))

  const currentProfile = profiles.find((p) => p.id === currentUserId)
  const colorInfo = currentProfile ? (USER_COLORS[currentProfile.color] ?? USER_COLORS.yellow) : USER_COLORS.yellow

  function startEdit(log) {
    setEditingLogId(log.id)
    setEditingAt(toDatetimeLocal(parseISO(log.logged_at)))
  }

  function cancelEdit() {
    setEditingLogId(null)
  }

  async function saveEdit(log) {
    await onEditLog({ id: log.id, logged_at: new Date(editingAt).toISOString() })
    setEditingLogId(null)
  }

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
            <h3 className="text-base font-semibold text-text-primary">{chore.name}</h3>
            <p className="text-xs text-text-secondary">
              {format(day, 'EEEE, d MMMM')} · {chore.weight}pt{chore.weight !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-secondary hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {logs.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">No logs for this day</p>
          ) : (
            <div className="mb-4">
              {logs.map((log, i) => {
                const color = colorMap[log.user_id]
                const name = nameMap[log.user_id] ?? 'Unknown'
                const isEditing = editingLogId === log.id
                return (
                  <div key={log.id} className={`py-3 ${i < logs.length - 1 ? 'hairline' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color?.hex ?? '#ccc' }}
                        />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{name}</p>
                          <p className="text-xs text-text-secondary">
                            {format(parseISO(log.logged_at), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!isEditing && (
                          <button
                            onClick={() => startEdit(log)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-surface transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {isEditing && (
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface transition-colors text-xs font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteLog(log)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={editingAt}
                          onChange={(e) => setEditingAt(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-surface text-sm text-text-primary outline-none border border-border-line focus:border-accent transition-colors"
                        />
                        <button
                          onClick={() => saveEdit(log)}
                          className="p-2 rounded-xl bg-accent text-white active:scale-95 transition-transform"
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Log again with datetime picker */}
          <div className="space-y-2 pt-2 border-t border-border-line">
            <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
              <Clock size={12} />
              When
            </label>
            <input
              type="datetime-local"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface text-sm text-text-primary outline-none border border-border-line focus:border-accent transition-colors"
            />
            <button
              onClick={() => onLog({ chore_id: chore.id, user_id: currentUserId, logged_at: new Date(loggedAt).toISOString() })}
              className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
