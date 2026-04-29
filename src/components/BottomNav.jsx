import { NavLink } from 'react-router-dom'
import { CalendarDays, Sun, Settings, Plus } from 'lucide-react'

export function BottomNav({ onLogPress }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-page border-t border-border-line safe-bottom">
      <div className="flex items-center h-14 max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around flex-1">
          <NavItem to="/" icon={<CalendarDays size={20} />} label="Month" />
          <NavItem to="/overview" icon={<Sun size={20} />} label="Today" />
          <NavItem to="/manage" icon={<Settings size={20} />} label="Manage" />
        </div>
        <button
          onClick={onLogPress}
          className="ml-3 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Log chore"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-colors ${
          isActive ? 'text-accent' : 'text-text-secondary'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  )
}
