import { useMemo } from 'react'
import { rankSuggestions } from '../lib/utils'

/**
 * Returns top-N suggested chores based on historical patterns.
 */
export function useSuggestions(historicalLogs = [], allChores = [], limit = 5) {
  return useMemo(() => {
    if (!historicalLogs.length || !allChores.length) return []

    const now = new Date()
    const ranked = rankSuggestions(historicalLogs, now.getDay(), now.getHours())

    const choreMap = Object.fromEntries(allChores.map((c) => [c.id, c]))

    return ranked
      .map((r) => choreMap[r.chore_id])
      .filter(Boolean)
      .slice(0, limit)
  }, [historicalLogs, allChores, limit])
}
