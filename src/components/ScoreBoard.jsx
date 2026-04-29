import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { USER_COLORS } from '../lib/utils'

const PERIODS = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: '7 days' },
  { key: 'monthly', label: '30 days' },
]

export function ScoreBoard({ scores }) {
  const [expanded, setExpanded] = useState(false)
  const [period, setPeriod] = useState('daily')

  if (!scores?.length) return null

  const totals = scores.map((s) => s[period])
  const maxScore = Math.max(...totals, 1)

  return (
    <div className="px-4">
      {/* Collapsed: inline score summary */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full py-1"
      >
        {scores.map((s, i) => {
          const color = USER_COLORS[s.profile.color] ?? USER_COLORS.yellow
          return (
            <span key={s.profile.id} className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
              <span className="font-medium" style={{ color: color.hex }}>
                {s.profile.display_name}
              </span>
              <span className="font-semibold text-text-primary tabular-nums">{s[period]}</span>
              {i < scores.length - 1 && <span className="text-text-secondary ml-1">·</span>}
            </span>
          )
        })}
        <ChevronDown
          size={14}
          className={`ml-auto text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded: period tabs + progress bars */}
      {expanded && (
        <div className="pt-2 pb-1">
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
      )}
    </div>
  )
}
