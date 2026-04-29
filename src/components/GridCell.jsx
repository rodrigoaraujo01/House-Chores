import { getCellState, CELL_STYLES } from '../lib/utils'

export function GridCell({ rodrigoCount, maianaCount, onClick, isToday, isPast }) {
  const state = getCellState(rodrigoCount, maianaCount)
  const total = rodrigoCount + maianaCount

  return (
    <button
      onClick={onClick}
      className={`
        relative w-9 h-9 rounded-xl transition-all active:scale-90
        ${CELL_STYLES[state]}
        ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
      `}
      title={`Rodrigo: ${rodrigoCount} · Maiana: ${maianaCount}`}
    >
      {total > 2 && (
        <span className="absolute -top-1.5 -right-1.5 bg-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm text-text-main leading-none">
          {total}
        </span>
      )}
    </button>
  )
}
