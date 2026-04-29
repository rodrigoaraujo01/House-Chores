import { useState, useMemo } from 'react'
import { format, parseISO, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GridCell } from './GridCell'
import { getMonthDays, formatDay } from '../lib/utils'

export function MonthGrid({ logs = [], chores = [], categories = [], profiles = [], onCellClick, year, month, onMonthChange }) {
  const [activeCategoryId, setActiveCategoryId] = useState('all')

  const days = useMemo(() => getMonthDays(year, month), [year, month])

  const filteredChores = useMemo(() => {
    const active = chores.filter((c) => c.is_active !== false)
    if (activeCategoryId === 'all') return active
    if (activeCategoryId === 'none') return active.filter((c) => !c.category_id)
    return active.filter((c) => c.category_id === activeCategoryId)
  }, [chores, activeCategoryId])

  const rodrigoProfile = profiles.find((p) => p.color === 'yellow')
  const maianaProfile = profiles.find((p) => p.color === 'green')

  const cellData = useMemo(() => {
    const map = {}
    logs.forEach((log) => {
      const d = parseISO(log.logged_at)
      const key = `${format(d, 'yyyy-MM-dd')}:${log.chore_id}`
      if (!map[key]) map[key] = { rc: 0, mc: 0, logs: [] }
      if (log.user_id === rodrigoProfile?.id) map[key].rc++
      else if (log.user_id === maianaProfile?.id) map[key].mc++
      map[key].logs.push(log)
    })
    return map
  }, [logs, rodrigoProfile, maianaProfile])

  return (
    <div className="flex flex-col h-full">
      {/* Category filter */}
      <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto scrollbar-hide">
        <CategoryPill
          active={activeCategoryId === 'all'}
          onClick={() => setActiveCategoryId('all')}
          label="All"
          emoji="✨"
        />
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            active={activeCategoryId === cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            label={cat.name}
            emoji={cat.emoji}
          />
        ))}
        <CategoryPill
          active={activeCategoryId === 'none'}
          onClick={() => setActiveCategoryId('none')}
          label="Other"
          emoji="📌"
        />
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-1.5 rounded-lg text-text-secondary hover:bg-surface active:bg-border-line transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-sm font-medium text-text-primary">
          {format(new Date(year, month), 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => onMonthChange(1)}
          className="p-1.5 rounded-lg text-text-secondary hover:bg-surface active:bg-border-line transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      {filteredChores.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
          No chores in this category
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '4px' }}>
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-20 bg-page"
                  style={{ minWidth: 28, width: 28, verticalAlign: 'bottom', paddingBottom: 4 }}
                />
                {filteredChores.map((chore) => (
                  <th
                    key={chore.id}
                    style={{ width: 16, minWidth: 16, height: 60, padding: 0, verticalAlign: 'bottom' }}
                  >
                    <div className="flex items-end justify-center pb-1" style={{ height: 60 }}>
                      <span
                        className="text-[10px] font-normal text-text-secondary whitespace-nowrap"
                        style={{
                          display: 'inline-block',
                          transformOrigin: 'left bottom',
                          transform: 'translateX(8px) rotate(-55deg)',
                          maxWidth: 70,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={chore.name}
                      >
                        {chore.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {days.map((day) => {
                const { dayNum, isToday, isWeekend, isoDate } = formatDay(day)
                return (
                  <tr key={isoDate}>
                    <td
                      className="sticky left-0 z-10 bg-page"
                      style={{ minWidth: 28, width: 28, paddingRight: 4 }}
                    >
                      <div className="text-right leading-none py-px">
                        <span
                          className={`text-[11px] font-medium ${
                            isToday ? 'text-accent' : isWeekend ? 'text-text-secondary/50' : 'text-text-secondary'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>
                    </td>

                    {filteredChores.map((chore) => {
                      const key = `${isoDate}:${chore.id}`
                      const data = cellData[key] ?? { rc: 0, mc: 0, logs: [] }
                      return (
                        <td key={chore.id} style={{ padding: 0, verticalAlign: 'middle' }}>
                          <GridCell
                            rodrigoCount={data.rc}
                            maianaCount={data.mc}
                            isToday={isToday}
                            onClick={() => onCellClick({ day, chore, logs: data.logs ?? [] })}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CategoryPill({ active, onClick, label, emoji }) {
  return (
    <button
      onClick={onClick}
      className={`pill whitespace-nowrap flex-shrink-0 ${active ? 'pill-active' : 'pill-inactive'}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
