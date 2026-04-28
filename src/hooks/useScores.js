import { useMemo } from 'react'
import { isWithinInterval, subDays, startOfDay, endOfDay, parseISO } from 'date-fns'

export function useScores(logs = [], profiles = [], chores = []) {
  return useMemo(() => {
    const weightMap = Object.fromEntries(chores.map((c) => [c.id, c.weight ?? 1]))

    if (!profiles.length) return []

    const now = new Date()
    const todayStart  = startOfDay(now)
    const todayEnd    = endOfDay(now)
    const weekStart   = startOfDay(subDays(now, 6))
    const monthStart  = startOfDay(subDays(now, 29))

    function sum(arr) {
      return arr.reduce((s, l) => s + (weightMap[l.chore_id] ?? 1), 0)
    }

    return profiles.map((p) => {
      const mine = logs.filter((l) => l.user_id === p.id)

      const daily   = sum(mine.filter((l) => isWithinInterval(parseISO(l.logged_at), { start: todayStart,  end: todayEnd })))
      const weekly  = sum(mine.filter((l) => isWithinInterval(parseISO(l.logged_at), { start: weekStart,   end: todayEnd })))
      const monthly = sum(mine.filter((l) => isWithinInterval(parseISO(l.logged_at), { start: monthStart,  end: todayEnd })))

      return {
        profile: p,
        daily:   Math.round(daily   * 10) / 10,
        weekly:  Math.round(weekly  * 10) / 10,
        monthly: Math.round(monthly * 10) / 10,
      }
    })
  }, [logs, profiles, chores])
}
