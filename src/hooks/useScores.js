import { useMemo } from 'react'
import { isWithinInterval, subDays, startOfDay, endOfDay, parseISO } from 'date-fns'
import { computeScore } from '../lib/utils'

/**
 * Given all logs for the month and a set of profiles,
 * returns daily / 7-day / 30-day scores per user.
 */
export function useScores(logs = [], profiles = []) {
  return useMemo(() => {
    if (!logs.length || !profiles.length) {
      return profiles.map((p) => ({
        profile: p,
        daily: 0,
        weekly: 0,
        monthly: 0,
      }))
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfDay(subDays(now, 6))
    const monthStart = startOfDay(subDays(now, 29))

    return profiles.map((p) => {
      const todayLogs = logs.filter((l) =>
        l.user_id === p.id &&
        isWithinInterval(parseISO(l.logged_at), { start: todayStart, end: todayEnd })
      )
      const weekLogs = logs.filter((l) =>
        l.user_id === p.id &&
        isWithinInterval(parseISO(l.logged_at), { start: weekStart, end: todayEnd })
      )
      // monthly uses all logs in the current query window (month)
      const monthLogs = logs.filter((l) =>
        l.user_id === p.id &&
        isWithinInterval(parseISO(l.logged_at), { start: monthStart, end: todayEnd })
      )

      const sum = (arr) => arr.reduce((s, l) => s + (l.chores?.weight ?? 1), 0)

      return {
        profile: p,
        daily: Math.round(sum(todayLogs) * 10) / 10,
        weekly: Math.round(sum(weekLogs) * 10) / 10,
        monthly: Math.round(sum(monthLogs) * 10) / 10,
      }
    })
  }, [logs, profiles])
}
