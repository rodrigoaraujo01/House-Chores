import { useState } from 'react'
import { USER_COLORS } from '../lib/utils'

const PERIODS = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: '7 days' },
  { key: 'monthly', label: '30 days' },
]

export function ScoreBoard({ scores }) {
  const [period, setPeriod] = useState('daily')

  if (!scores?.length) return null

  const totals = scores.map((s) => s[period])
  const maxScore = Math.max(...totals, 1)

  return (
    <div className="px-4 pb-3">
      {/* Period tabs */}
      <div className="flex gap-1 mb-3">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
              period === p.key
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:bg-surface'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        {scores.map((s) => {
          const color = USER_COLORS[s.profile.color] ?? USER_COLORS.yellow
          const score = s[period]
          const pct = Math.round((score / maxScore) * 100)

          return (
            <div key={s.profile.id}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-text-secondary">{s.profile.display_name}</span>
                <span className="text-xs font-semibold text-text-primary tabular-nums">
                  {score} pts
                </span>
              </div>
              <div className="score-bar-bg">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color.hex }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
