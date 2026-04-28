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

  // Identify user IDs by color
  const rodrigoProfile = profiles.find((p) => p.color === 'yellow')
  const maianaProfile = profiles.find((p) => p.color === 'green')

  // Build a lookup: { 'isoDate:choreId' -> { rc, mc } }
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

  const today = new Date()

  return (
    <div className="flex flex-col h-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-2 rounded-xl text-warm-gray hover:bg-muted active:bg-warm-border transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-semibold text-text-main">
          {format(new Date(year, month), 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => onMonthChange(1)}
          className="p-2 rounded-xl text-warm-gray hover:bg-muted active:bg-warm-border transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
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

      {/* Grid */}
      {filteredChores.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-warm-gray text-sm">
          No chores in this category
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-auto px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '4px' }}>
            <thead>
              <tr>
                {/* Day column header */}
                <th
                  className="sticky left-0 z-20 bg-cream"
                  style={{ minWidth: 52, width: 52, verticalAlign: 'bottom', paddingBottom: 6 }}
                >
                  <span className="text-[11px] font-medium text-warm-gray">Day</span>
                </th>

                {/* Chore column headers */}
                {filteredChores.map((chore) => (
                  <th
                    key={chore.id}
                    style={{ width: 40, minWidth: 40, height: 80, padding: 0, verticalAlign: 'bottom' }}
                  >
                    <div className="flex items-end justify-center pb-1" style={{ height: 80 }}>
                      <span
                        className="text-[11px] font-medium text-warm-gray whitespace-nowrap"
                        style={{
                          display: 'inline-block',
                          transformOrigin: 'left bottom',
                          transform: 'translateX(10px) rotate(-50deg)',
                          maxWidth: 90,
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
                const { dayNum, dayName, isToday, isWeekend, isoDate } = formatDay(day)
                return (
                  <tr
                    key={isoDate}
                    className={isToday ? 'bg-primary/5' : isWeekend ? 'bg-muted/30' : ''}
                  >
                    {/* Day cell */}
                    <td
                      className="sticky left-0 z-10 sticky-col"
                      style={{
                        background: isToday ? 'rgb(252 240 232)' : isWeekend ? 'rgb(248 245 242)' : '#FBF7F4',
                        minWidth: 52,
                        width: 52,
                        paddingRight: 6,
                      }}
                    >
                      <div className="text-right leading-none py-0.5">
                        <span
                          className={`text-sm font-${isToday ? 'bold' : 'normal'} ${
                            isToday ? 'text-primary' : 'text-text-main'
                          }`}
                        >
                          {dayNum}
                        </span>
                        <span className="text-[10px] text-warm-gray block">{dayName}</span>
                      </div>
                    </td>

                    {/* Chore cells */}
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
