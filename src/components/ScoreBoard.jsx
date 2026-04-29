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
    <div className="bg-white rounded-3xl p-4 shadow-card mx-4">
      {/* Period tabs */}
      <div className="flex gap-1 mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              period === p.key
                ? 'bg-primary text-white'
                : 'text-warm-gray hover:bg-muted'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Scores */}
      <div className="space-y-3">
        {scores.map((s) => {
          const colorKey = s.profile.color
          const color = USER_COLORS[colorKey] ?? USER_COLORS.yellow
          const score = s[period]
          const pct = Math.round((score / maxScore) * 100)

          return (
            <div key={s.profile.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-sm font-medium text-text-main">
                    {s.profile.display_name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-text-main tabular-nums">
                  {score} pts
                </span>
              </div>
              <div className="score-bar-bg">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color.hex,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
