import { getCellState, CELL_STYLES } from '../lib/utils'

export function GridCell({ rodrigoCount, maianaCount, onClick, isToday }) {
  const state = getCellState(rodrigoCount, maianaCount)

  return (
    <button
      onClick={onClick}
      className={`w-3 h-3 rounded-full transition-all active:scale-90 ${CELL_STYLES[state]}`}
      style={isToday ? { boxShadow: '0 0 0 1.5px #D4856A' } : undefined}
    />
  )
}
