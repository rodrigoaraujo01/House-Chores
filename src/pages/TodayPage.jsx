import { useMemo, useState } from 'react'
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import toast from 'react-hot-toast'
import { Trash2, Pencil, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useChores } from '../hooks/useChores'
import { useMonthLogs, useHistoricalLogs, useAddLog, useDeleteLog, useUpdateLog } from '../hooks/useLogs'
import { useProfiles } from '../hooks/useProfiles'
import { useScores } from '../hooks/useScores'
import { useSuggestions } from '../hooks/useSuggestions'
import { Layout } from '../components/Layout'
import { ScoreBoard } from '../components/ScoreBoard'
import { PageLoader } from '../components/LoadingSpinner'
import { USER_COLORS } from '../lib/utils'

function toDatetimeLocal(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function TodayPage() {
  const now = new Date()
  const { profile } = useAuth()
  const { data: chores = [] } = useChores()
  const { data: profiles = [] } = useProfiles()
  const { data: logs = [], isLoading } = useMonthLogs(now.getFullYear(), now.getMonth())
  const { data: historicalLogs = [] } = useHistoricalLogs()
  const addLog = useAddLog()
  const deleteLog = useDeleteLog()
  const updateLog = useUpdateLog()

  const [editingLogId, setEditingLogId] = useState(null)
  const [editingAt, setEditingAt] = useState('')

  const scores = useScores(logs, profiles, chores)
  const suggestions = useSuggestions(historicalLogs, chores, 8)

  const choreMap = useMemo(() => Object.fromEntries(chores.map((c) => [c.id, c])), [chores])

  const todayLogs = useMemo(() =>
    logs
      .filter((l) =>
        isWithinInterval(parseISO(l.logged_at), {
          start: startOfDay(now),
          end: endOfDay(now),
        })
      )
      .sort((a, b) => a.logged_at.localeCompare(b.logged_at)),
    [logs]
  )

  const byUser = useMemo(() =>
    profiles.map((p) => {
      const userLogs = todayLogs.filter((l) => l.user_id === p.id)
      const score = userLogs.reduce((s, l) => s + (choreMap[l.chore_id]?.weight ?? 1), 0)
      return { profile: p, logs: userLogs, score: Math.round(score * 10) / 10 }
    }),
    [profiles, todayLogs, choreMap]
  )

  async function handleDeleteLog(log) {
    try {
      await deleteLog.mutateAsync({ id: log.id })
      toast.success('Log removed')
    } catch {
      toast.error('Failed to remove log')
    }
  }

  async function handleSaveEdit(log) {
    try {
      await updateLog.mutateAsync({ id: log.id, logged_at: new Date(editingAt).toISOString() })
      toast.success('Log updated')
      setEditingLogId(null)
    } catch {
      toast.error('Failed to update log')
    }
  }

  async function handleQuickLog(chore) {
    if (!profile) return
    try {
      await addLog.mutateAsync({ chore_id: chore.id, user_id: profile.id, logged_at: new Date().toISOString() })
      toast.success(`${chore.name} logged! +${chore.weight ?? 1}pt`)
    } catch {
      toast.error('Failed to log chore')
    }
  }

  if (isLoading && logs.length === 0) return <PageLoader />

  return (
    <Layout>
      <div className="px-4 pt-safe">
        <div className="pt-3 pb-3">
          <h1 className="text-lg font-semibold text-text-primary">Today</h1>
          <p className="text-text-secondary text-sm mt-0.5">{format(now, 'EEEE, d MMMM')}</p>
        </div>
      </div>

      {/* Score board */}
      <ScoreBoard scores={scores} />

      <div className="hairline mx-4 mb-4" />

      {/* Quick log card */}
      {suggestions.length > 0 && (
        <>
          <div className="px-4 mb-3">
            <h2 className="section-label mb-3">Quick log</h2>
            <div className="grid grid-cols-4 gap-2">
              {suggestions.map((chore) => (
                <button
                  key={chore.id}
                  onClick={() => handleQuickLog(chore)}
                  className="flex flex-col items-center justify-center rounded-xl bg-surface border border-border-line py-2.5 px-1 gap-1 active:scale-95 transition-transform"
                >
                  <span className="text-[11px] font-medium text-text-primary text-center leading-tight line-clamp-2">
                    {chore.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="hairline mx-4 mb-4" />
        </>
      )}

      {/* Today's overview */}
      <div className="px-4 pb-4">
        <h2 className="section-label mb-3">Logged today</h2>

        {todayLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-5xl mb-4">🛋️</span>
            <p className="text-text-secondary text-sm">Nothing logged yet today.</p>
            <p className="text-text-secondary text-xs mt-1">Tap + or use Quick log above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {byUser.map(({ profile: p, logs: userLogs, score }) => {
              const color = USER_COLORS[p.color] ?? USER_COLORS.yellow
              if (!userLogs.length) return (
                <div key={p.id} className="py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                    <span className="font-semibold text-sm" style={{ color: color.hex }}>{p.display_name}</span>
                    <span className="text-text-secondary text-xs ml-auto">0 pts</span>
                  </div>
                  <p className="text-xs text-text-secondary pl-5">Nothing yet today</p>
                  <div className="hairline mt-3" />
                </div>
              )
              return (
                <div key={p.id} className="py-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                      <span className="font-semibold text-sm" style={{ color: color.hex }}>{p.display_name}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: color.hex }}>
                      {score} pt{score !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-0">
                    {userLogs.map((log, i) => {
                      const chore = choreMap[log.chore_id]
                      const isEditing = editingLogId === log.id
                      return (
                        <div key={log.id} className={`py-2.5 ${i < userLogs.length - 1 ? 'hairline' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.hex }} />
                              <span className="text-sm text-text-primary truncate">{chore?.name ?? '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className="text-xs text-text-secondary tabular-nums">{chore?.weight ?? 1}pt</span>
                              <span className="text-xs text-text-secondary tabular-nums">{format(parseISO(log.logged_at), 'HH:mm')}</span>
                              {isEditing ? (
                                <button
                                  onClick={() => setEditingLogId(null)}
                                  className="text-xs text-text-secondary font-medium px-1"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setEditingLogId(log.id); setEditingAt(toDatetimeLocal(parseISO(log.logged_at))) }}
                                  className="p-1 rounded-lg text-text-secondary hover:text-accent hover:bg-surface transition-colors"
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteLog(log)}
                                className="p-1 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          {isEditing && (
                            <div className="mt-2 flex items-center gap-2 pl-3">
                              <input
                                type="datetime-local"
                                value={editingAt}
                                onChange={(e) => setEditingAt(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-xl bg-surface text-sm text-text-primary outline-none border border-border-line focus:border-accent transition-colors"
                              />
                              <button
                                onClick={() => handleSaveEdit(log)}
                                className="p-2 rounded-xl text-white active:scale-95 transition-transform"
                                style={{ backgroundColor: color.hex }}
                              >
                                <Check size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="hairline mt-3" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
