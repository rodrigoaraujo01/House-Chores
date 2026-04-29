import { useMemo } from 'react'
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { useMonthLogs } from '../hooks/useLogs'
import { useProfiles } from '../hooks/useProfiles'
import { useChores } from '../hooks/useChores'
import { Layout } from '../components/Layout'
import { PageLoader } from '../components/LoadingSpinner'
import { USER_COLORS } from '../lib/utils'

export function DailyOverviewPage() {
  const now = new Date()
  const { data: logs = [], isLoading } = useMonthLogs(now.getFullYear(), now.getMonth())
  const { data: profiles = [] } = useProfiles()
  const { data: chores = [] } = useChores()

  const choreMap = useMemo(() => Object.fromEntries(chores.map((c) => [c.id, c])), [chores])

  const todayLogs = useMemo(() =>
    logs.filter((l) =>
      isWithinInterval(parseISO(l.logged_at), {
        start: startOfDay(now),
        end: endOfDay(now),
      })
    ).sort((a, b) => a.logged_at.localeCompare(b.logged_at)),
    [logs]
  )

  const byUser = useMemo(() => {
    return profiles.map((p) => {
      const userLogs = todayLogs.filter((l) => l.user_id === p.id)
      const score = userLogs.reduce((s, l) => s + (choreMap[l.chore_id]?.weight ?? 1), 0)
      return { profile: p, logs: userLogs, score: Math.round(score * 10) / 10 }
    })
  }, [profiles, todayLogs, choreMap])

  if (isLoading && logs.length === 0) return <PageLoader />

  return (
    <Layout>
      <div className="px-4 pt-safe">
        <div className="pt-3 pb-4">
          <h1 className="text-lg font-semibold text-text-primary">Today's Overview</h1>
          <p className="text-text-secondary text-sm mt-0.5">{format(now, 'EEEE, d MMMM')}</p>
        </div>

        {todayLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">🛋️</span>
            <p className="text-text-secondary text-sm">Nothing logged yet today.</p>
            <p className="text-text-secondary text-xs mt-1">Tap + to log your first chore!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {byUser.map(({ profile, logs: userLogs, score }) => {
              const color = USER_COLORS[profile.color] ?? USER_COLORS.yellow
              if (!userLogs.length) return (
                <div key={profile.id} className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                    <span className="font-semibold" style={{ color: color.hex }}>{profile.display_name}</span>
                    <span className="text-text-secondary text-sm ml-auto">0 pts</span>
                  </div>
                  <p className="text-xs text-text-secondary pl-5">Nothing yet today</p>
                  <div className="hairline mt-4" />
                </div>
              )
              return (
                <div key={profile.id} className="py-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                      <span className="font-semibold" style={{ color: color.hex }}>{profile.display_name}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: color.hex }}>
                      {score} pt{score !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-0">
                    {userLogs.map((log, i) => {
                      const chore = choreMap[log.chore_id]
                      return (
                        <div key={log.id} className={`flex items-center justify-between py-2.5 ${i < userLogs.length - 1 ? 'hairline' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-sm text-text-primary">{chore?.name ?? '—'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-secondary tabular-nums">
                            <span>{chore?.weight ?? 1}pt</span>
                            <span>{format(parseISO(log.logged_at), 'HH:mm')}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="hairline mt-3" />
                </div>
              )
            })}

            {/* Total comparison */}
            {byUser.length === 2 && (
              <div className="py-3">
                <h3 className="section-label mb-3">Today's tally</h3>
                <div className="flex items-center gap-3">
                  {byUser.map(({ profile, score }, i) => {
                    const color = USER_COLORS[profile.color] ?? USER_COLORS.yellow
                    const totalScore = byUser.reduce((s, u) => s + u.score, 0)
                    const pct = totalScore > 0 ? Math.round((score / totalScore) * 100) : 50
                    return (
                      <div key={profile.id} className={`flex-1 ${i === 1 ? 'text-right' : ''}`}>
                        <span className="text-xs text-text-secondary">{profile.display_name}</span>
                        <p className="text-lg font-bold tabular-nums" style={{ color: color.hex }}>
                          {score}
                        </p>
                        <p className="text-xs text-text-secondary">{pct}%</p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-surface flex">
                  {byUser.map(({ profile, score }) => {
                    const color = USER_COLORS[profile.color] ?? USER_COLORS.yellow
                    const total = byUser.reduce((s, u) => s + u.score, 0)
                    const pct = total > 0 ? (score / total) * 100 : 50
                    return (
                      <div
                        key={profile.id}
                        style={{ width: `${pct}%`, backgroundColor: color.hex }}
                        className="h-full transition-all duration-500"
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
