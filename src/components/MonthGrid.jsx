import { useState, useMemo } from 'react'
import { format, parseISO, getDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GridCell } from './GridCell'
import { getMonthDays, formatDay } from '../lib/utils'

const COL_W = 19

export function MonthGrid({ logs = [], chores = [], categories = [], profiles = [], onCellClick, year, month, onMonthChange }) {
  const [activeCategoryId, setActiveCategoryId] = useState('all')

  const days = useMemo(() => getMonthDays(year, month), [year, month])

  const activeChores = useMemo(() => chores.filter((c) => c.is_active !== false), [chores])

  const filteredChores = useMemo(() => {
    if (activeCategoryId === 'all') return activeChores
    if (activeCategoryId === 'none') return activeChores.filter((c) => !c.category_id)
    return activeChores.filter((c) => c.category_id === activeCategoryId)
  }, [activeChores, activeCategoryId])

  const grouped = useMemo(() => {
    const groups = []
    const byCat = {}

    filteredChores.forEach((chore) => {
      const catId = chore.category_id || '_none'
      if (!byCat[catId]) byCat[catId] = []
      byCat[catId].push(chore)
    })

    categories.forEach((cat) => {
      if (byCat[cat.id]) {
        groups.push({ cat, chores: byCat[cat.id] })
      }
    })
    if (byCat._none) {
      groups.push({ cat: { id: '_none', name: 'Other', emoji: '📌' }, chores: byCat._none })
    }

    return groups
  }, [filteredChores, categories])

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

  const allChoresFlat = grouped.flatMap((g) => g.chores)

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
      {allChoresFlat.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
          No chores in this category
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto px-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table style={{ borderCollapse: 'collapse' }}>
            <thead>
              {/* Category group labels */}
              {grouped.length > 1 && (
                <tr>
                  {grouped.map((g) => (
                    <th
                      key={g.cat.id}
                      colSpan={g.chores.length}
                      style={{ padding: '0 0 2px', textAlign: 'center' }}
                    >
                      <span className="text-[9px] font-normal text-text-secondary uppercase tracking-[0.06em]">
                        {g.cat.emoji} {g.cat.name}
                      </span>
                    </th>
                  ))}
                </tr>
              )}

              {/* Chore name headers — vertical text */}
              <tr>
                <th style={{ width: 14, minWidth: 14 }} />
                {allChoresFlat.map((chore) => (
                  <th
                    key={chore.id}
                    style={{ width: COL_W, minWidth: COL_W, height: 72, padding: 0, verticalAlign: 'bottom' }}
                  >
                    <div
                      className="flex justify-center"
                      style={{ height: 72, overflow: 'hidden' }}
                    >
                      <span
                        className="text-[11px] font-normal text-text-secondary whitespace-nowrap"
                        style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                          maxHeight: 68,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: `${COL_W}px`,
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
              {days.map((day, dayIdx) => {
                const { dayNum, isToday, isWeekend, isoDate } = formatDay(day)
                const isMonday = getDay(day) === 1 && dayIdx > 0

                return (
                  <tr
                    key={isoDate}
                    style={isMonday ? { borderTop: '1px solid #EDEDE8' } : undefined}
                  >
                    <td style={{ width: 14, minWidth: 14, padding: '0 2px 0 0', textAlign: 'right', verticalAlign: 'middle', height: 19, maxHeight: 19 }}>
                      <span className={`${isToday ? 'text-accent' : isWeekend ? 'text-text-secondary/40' : 'text-text-secondary/60'}`} style={{ fontSize: 9, lineHeight: '19px', display: 'block' }}>
                        {dayNum}
                      </span>
                    </td>
                    {allChoresFlat.map((chore) => {
                      const key = `${isoDate}:${chore.id}`
                      const data = cellData[key] ?? { rc: 0, mc: 0, logs: [] }
                      return (
                        <td
                          key={chore.id}
                          style={{ padding: '0', width: COL_W, textAlign: 'center', verticalAlign: 'middle' }}
                        >
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
