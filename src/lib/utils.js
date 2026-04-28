import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isWeekend,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
} from 'date-fns'

// ─── Color helpers ──────────────────────────────────────────────────────────

export const USER_COLORS = {
  yellow: {
    bg: 'bg-rodrigo',
    bgLight: 'bg-rodrigo-light',
    text: 'text-rodrigo-dark',
    hex: '#F97316',
    label: 'Rodrigo',
  },
  green: {
    bg: 'bg-maiana',
    bgLight: 'bg-maiana-light',
    text: 'text-maiana-dark',
    hex: '#52B788',
    label: 'Maiana',
  },
}

/**
 * Returns cell color key based on per-user log counts for a given (day, chore).
 * @param {number} rc rodrigo count
 * @param {number} mc maiana count
 * @returns {'empty'|'rodrigo'|'maiana'|'both'}
 */
export function getCellState(rc, mc) {
  if (rc === 0 && mc === 0) return 'empty'
  if (rc > 0 && mc === 0) return 'rodrigo'
  if (mc > 0 && rc === 0) return 'maiana'
  if (rc === mc) return 'both'
  return rc > mc ? 'rodrigo' : 'maiana'
}

export const CELL_STYLES = {
  empty: 'bg-muted border border-warm-border',
  rodrigo: 'bg-rodrigo shadow-sm',
  maiana: 'bg-maiana shadow-sm',
  both: 'bg-both shadow-sm',
}

// ─── Date helpers ───────────────────────────────────────────────────────────

export function getMonthDays(year, month) {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  return eachDayOfInterval({ start, end })
}

export function formatDay(date) {
  return {
    dayNum: format(date, 'd'),
    dayName: format(date, 'EEE'),
    isToday: isToday(date),
    isWeekend: isWeekend(date),
    isoDate: format(date, 'yyyy-MM-dd'),
  }
}

export function dayRange(date) {
  return {
    from: startOfDay(date).toISOString(),
    to: endOfDay(date).toISOString(),
  }
}

export function last7DaysRange() {
  return {
    from: startOfDay(subDays(new Date(), 6)).toISOString(),
    to: endOfDay(new Date()).toISOString(),
  }
}

export function last30DaysRange() {
  return {
    from: startOfDay(subDays(new Date(), 29)).toISOString(),
    to: endOfDay(new Date()).toISOString(),
  }
}

// ─── Score helpers ──────────────────────────────────────────────────────────

/**
 * Compute score for a user within a set of logs.
 * Score = sum(chore.weight) for all logs by that user.
 */
export function computeScore(logs, userId) {
  return logs
    .filter((l) => l.user_id === userId)
    .reduce((sum, l) => sum + (l.chores?.weight ?? 1), 0)
}

// ─── Suggestion helpers ─────────────────────────────────────────────────────

/**
 * Rank chores by historical frequency on the given day-of-week and hour window.
 * Returns sorted array of { chore_id, score }.
 */
export function rankSuggestions(historicalLogs, dayOfWeek, currentHour) {
  const dayFreq = {}
  const timeFreq = {}

  historicalLogs.forEach((log) => {
    const d = parseISO(log.logged_at)
    if (d.getDay() === dayOfWeek) {
      dayFreq[log.chore_id] = (dayFreq[log.chore_id] ?? 0) + 1
    }
    const h = d.getHours()
    if (Math.abs(h - currentHour) <= 2) {
      timeFreq[log.chore_id] = (timeFreq[log.chore_id] ?? 0) + 1
    }
  })

  const allIds = new Set([...Object.keys(dayFreq), ...Object.keys(timeFreq)])
  return Array.from(allIds)
    .map((id) => ({
      chore_id: id,
      score: (dayFreq[id] ?? 0) * 0.6 + (timeFreq[id] ?? 0) * 0.4,
    }))
    .sort((a, b) => b.score - a.score)
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function truncate(str, len = 8) {
  return str.length > len ? str.slice(0, len - 1) + '…' : str
}
